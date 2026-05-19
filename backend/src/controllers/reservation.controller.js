import mongoose from "mongoose";
import User from "../models/User.model.js";
import Reservation from "../models/Reservation.model.js";
import Medicine from "../models/Medicine.model.js";
import Batch from "../models/Batch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import { generateConfirmationCode } from "../utils/generateCode.js";
import { findOrCreateCustomer } from "../utils/customerHelper.js";
import * as emailService from "../services/email.service.js";
import {
  lockReservationStock,
  releaseReservationStock,
} from "../services/reservationStock.service.js";
import {
  asyncController,
  pagination,
  paginatedResponse,
  buildDateFilter,
  publicReservationFields,
} from "./controllerUtils.js";

const getPublicPharmacyId = async () => {
  const pharmacist = await User.findOne({ role: "pharmacist", isActive: true }).select("pharmacyId");
  if (!pharmacist) throw ApiError.badRequest("No pharmacy account is configured");
  return pharmacist.pharmacyId;
};

const validateItems = async (items, pharmacyId, session = null) => {
  const enriched = [];
  let prescriptionRequired = false;

  for (const item of items) {
    if (item.productType === "medicine") {
      const medicineQuery = Medicine.findOne({
        _id: item.productId,
        pharmacyId,
        isActive: true,
      });
      if (session) medicineQuery.session(session);
      const medicine = await medicineQuery;
      if (!medicine) throw ApiError.badRequest(`Medicine not found or inactive: ${item.productId}`);

      const stockQuery = Batch.aggregate([
        {
          $match: {
            medicineId: medicine._id,
            pharmacyId: new mongoose.Types.ObjectId(pharmacyId.toString()),
            isActive: true,
            remainingQty: { $gt: 0 },
          },
        },
        { $group: { _id: null, totalStock: { $sum: "$remainingQty" } } },
      ]);
      if (session) stockQuery.session(session);
      const [stock] = await stockQuery;
      const totalStock = stock?.totalStock || 0;

      if (totalStock < item.qty) {
        throw ApiError.badRequest(
          `Insufficient stock for ${medicine.name} - requested ${item.qty} but only ${totalStock} available`
        );
      }

      if (["prescription", "regulated"].includes(medicine.category)) {
        prescriptionRequired = true;
      }

      enriched.push({
        productType: "medicine",
        productId: medicine._id,
        qty: item.qty,
        name: medicine.name,
        category: medicine.category,
        salePrice: medicine.salePrice,
        unit: medicine.unit,
        type: "medicine",
      });
      continue;
    }

    const productQuery = ParapharmacyProduct.findOne({
      _id: item.productId,
      pharmacyId,
      isActive: true,
    });
    if (session) productQuery.session(session);
    const product = await productQuery;
    if (!product) throw ApiError.badRequest(`Parapharmacy product not found: ${item.productId}`);
    if (product.stockQty < item.qty) {
      throw ApiError.badRequest(
        `Insufficient stock for ${product.name} - requested ${item.qty} but only ${product.stockQty} available`
      );
    }

    enriched.push({
      productType: "parapharmacy",
      productId: product._id,
      qty: item.qty,
      name: product.name,
      brand: product.brand,
      category: product.category,
      salePrice: product.salePrice,
      type: "parapharmacy",
    });
  }

  return { enriched, prescriptionRequired };
};

const populateReservationItems = async (reservation) => {
  const object = reservation.toObject ? reservation.toObject() : reservation;
  object.items = await Promise.all(
    object.items.map(async (item) => {
      const Model = item.productType === "medicine" ? Medicine : ParapharmacyProduct;
      const product = await Model.findById(item.productId).select("name brand category salePrice unit").lean();
      return {
        productType: item.productType,
        productId: item.productId,
        qty: item.qty,
        name: product?.name || "Unknown product",
        brand: product?.brand,
        category: product?.category,
        salePrice: product?.salePrice,
        unit: product?.unit,
        product,
      };
    })
  );
  return object;
};

const reservationItems = (enriched) =>
  enriched.map(({ productType, productId, qty }) => ({ productType, productId, qty }));

const createConfirmationCode = async () => {
  let confirmationCode = generateConfirmationCode();
  while (await Reservation.exists({ confirmationCode })) {
    confirmationCode = generateConfirmationCode();
  }
  return confirmationCode;
};

export const products = asyncController(async (req, res) => {
  const pharmacyId = req.query.pharmacyId || (await getPublicPharmacyId());
  const [medicines, parapharmacy, stockRows] = await Promise.all([
    Medicine.find({ pharmacyId, isActive: true }).select("name genericName category salePrice unit").limit(100).lean(),
    ParapharmacyProduct.find({ pharmacyId, isActive: true, stockQty: { $gt: 0 } })
      .select("name brand category salePrice stockQty")
      .limit(100)
      .lean(),
    Batch.aggregate([
      {
        $match: {
          pharmacyId: new mongoose.Types.ObjectId(pharmacyId.toString()),
          isActive: true,
          remainingQty: { $gt: 0 },
        },
      },
      { $group: { _id: "$medicineId", stockQty: { $sum: "$remainingQty" } } },
    ]),
  ]);
  const stockByMedicine = new Map(stockRows.map((row) => [row._id.toString(), row.stockQty]));

  res.status(200).json({
    success: true,
    data: [
      ...medicines
        .filter((medicine) => (stockByMedicine.get(medicine._id.toString()) || 0) > 0)
        .map((medicine) => ({
          ...medicine,
          stockQty: stockByMedicine.get(medicine._id.toString()) || 0,
          productType: "medicine",
        })),
      ...parapharmacy.map((product) => ({ ...product, productType: "parapharmacy" })),
    ],
  });
});

export const submit = asyncController(async (req, res) => {
  const pharmacyId = req.query.pharmacyId || (await getPublicPharmacyId());
  const {
    customerName,
    customerPhone,
    customerEmail,
    items,
    paymentMethod,
    notes,
    prescriptionImage,
    prescriptionImageName,
    prescriptionImageType,
  } = req.body;

  const { enriched, prescriptionRequired } = await validateItems(items, pharmacyId);
  if (prescriptionRequired && !prescriptionImage) {
    throw ApiError.badRequest("A prescription image is required for prescription medicines");
  }

  const confirmationCode = await createConfirmationCode();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const session = await mongoose.startSession();
  let reservation;
  let customer;

  try {
    await session.withTransaction(async () => {
      customer = await findOrCreateCustomer(pharmacyId, {
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
      });

      const normalizedItems = reservationItems(enriched);
      const stockLocks = await lockReservationStock(normalizedItems, pharmacyId, session);
      [reservation] = await Reservation.create(
        [
          {
            pharmacyId,
            customerId: customer._id,
            customerName,
            customerPhone,
            customerEmail,
            items: normalizedItems,
            stockLocks,
            status: "pending",
            confirmationCode,
            paymentMethod: paymentMethod || "pay-on-pickup",
            notes,
            prescriptionImage: prescriptionImage || null,
            prescriptionImageName: prescriptionImageName || null,
            prescriptionImageType: prescriptionImageType || null,
            prescriptionRequired,
            prescriptionVerified: false,
            expiresAt,
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  emailService
    .sendReservationConfirmation({
      customerEmail: reservation.customerEmail,
      customerName: reservation.customerName,
      confirmationCode,
      items: enriched,
      expiresAt,
    })
    .catch(() => {});

  res.status(201).json({
    success: true,
    data: {
      confirmationCode,
      expiresAt,
      prescriptionRequired,
      message: prescriptionRequired
        ? "Reservation submitted. Please bring your original prescription at pickup."
        : "Reservation submitted successfully.",
    },
  });
});

export const trackByCode = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ confirmationCode: req.params.code })
    .populate("confirmedBy", "fullName")
    .populate("cancelledBy", "fullName")
    .populate("prescriptionVerifiedBy", "fullName role");
  if (!reservation) throw ApiError.notFound("No reservation found for this confirmation code");

  const populated = await populateReservationItems(reservation);
  res.status(200).json({ success: true, data: publicReservationFields(populated) });
});

export const track = trackByCode;

export const updateByCode = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ confirmationCode: req.params.code });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (!["pending", "confirmed"].includes(reservation.status)) {
    throw ApiError.badRequest(`Cannot update a reservation with status: ${reservation.status}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (req.body.items) {
        await releaseReservationStock(reservation, reservation.pharmacyId, session);
        const { enriched, prescriptionRequired } = await validateItems(
          req.body.items,
          reservation.pharmacyId,
          session
        );
        if (prescriptionRequired && !req.body.prescriptionImage && !reservation.prescriptionImage) {
          throw ApiError.badRequest("A prescription image is required for prescription medicines");
        }
        const nextItems = reservationItems(enriched);
        reservation.items = nextItems;
        reservation.stockLocks = await lockReservationStock(nextItems, reservation.pharmacyId, session);
        reservation.prescriptionRequired = prescriptionRequired;
        reservation.prescriptionVerified = false;
        reservation.prescriptionVerifiedAt = null;
        reservation.prescriptionVerifiedBy = null;
      }

      if (req.body.paymentMethod) reservation.paymentMethod = req.body.paymentMethod;
      if (req.body.notes !== undefined) reservation.notes = req.body.notes;
      if (req.body.prescriptionImage) {
        reservation.prescriptionImage = req.body.prescriptionImage;
        reservation.prescriptionImageName = req.body.prescriptionImageName || null;
        reservation.prescriptionImageType = req.body.prescriptionImageType || null;
        reservation.prescriptionVerified = false;
        reservation.prescriptionVerifiedAt = null;
        reservation.prescriptionVerifiedBy = null;
      }

      reservation.status = "pending";
      reservation.confirmedAt = null;
      reservation.confirmedBy = null;
      reservation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await reservation.save({ session });
    });
  } finally {
    session.endSession();
  }

  const populated = await populateReservationItems(reservation);
  emailService
    .sendReservationConfirmation({
      customerEmail: reservation.customerEmail,
      customerName: reservation.customerName,
      confirmationCode: reservation.confirmationCode,
      items: populated.items,
      expiresAt: reservation.expiresAt,
    })
    .catch(() => {});

  res.status(200).json({ success: true, data: publicReservationFields(populated) });
});

export const cancelByCode = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ confirmationCode: req.params.code });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (["expired", "cancelled"].includes(reservation.status)) {
    throw ApiError.badRequest(`Cannot cancel a reservation with status: ${reservation.status}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await releaseReservationStock(reservation, reservation.pharmacyId, session);
      reservation.status = "cancelled";
      reservation.cancelledAt = new Date();
      await reservation.save({ session });
    });
  } finally {
    session.endSession();
  }

  emailService
    .sendReservationCancelled({
      customerEmail: reservation.customerEmail,
      customerName: reservation.customerName,
      confirmationCode: reservation.confirmationCode,
    })
    .catch(() => {});

  res.status(200).json({ success: true, data: { message: "Reservation cancelled successfully" } });
});

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const {
    status,
    productType,
    paymentMethod,
    search,
    customerName,
    dateFrom,
    dateTo,
    sort = "newest",
  } = req.query;
  const filter = { pharmacyId: req.user.pharmacyId };

  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (productType) filter["items.productType"] = productType;
  if (customerName || search) {
    const term = customerName || search;
    filter.$or = [
      { customerName: new RegExp(term, "i") },
      { customerPhone: new RegExp(term, "i") },
      { confirmationCode: new RegExp(term, "i") },
    ];
  }
  const date = buildDateFilter({ dateFrom, dateTo });
  if (date) filter.createdAt = date;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    pickup: { expiresAt: 1 },
    customer: { customerName: 1 },
    status: { status: 1 },
  };

  const [reservationDocs, total] = await Promise.all([
    Reservation.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limit)
      .populate("confirmedBy", "fullName")
      .populate("cancelledBy", "fullName")
      .populate("prescriptionVerifiedBy", "fullName role")
      .populate("customerId", "fullName phone email"),
    Reservation.countDocuments(filter),
  ]);
  const reservations = await Promise.all(reservationDocs.map(populateReservationItems));
  paginatedResponse(res, reservations, total, page, limit);
});

export const demand = asyncController(async (req, res) => {
  const pharmacyId = new mongoose.Types.ObjectId(req.user.pharmacyId.toString());
  const now = new Date();
  const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const aggregate = (from, to) =>
    Reservation.aggregate([
      {
        $match: {
          pharmacyId,
          createdAt: { $gte: from, $lte: to },
          status: { $nin: ["cancelled", "expired"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: { productId: "$items.productId", productType: "$items.productType" },
          count: { $sum: "$items.qty" },
        },
      },
    ]);

  const [currentData, previousData] = await Promise.all([
    aggregate(currentStart, now),
    aggregate(previousStart, currentStart),
  ]);

  const previousMap = new Map(
    previousData.map((item) => [`${item._id.productType}:${item._id.productId}`, item.count])
  );

  const trends = await Promise.all(
    currentData.map(async (item) => {
      const { productId, productType } = item._id;
      const Model = productType === "medicine" ? Medicine : ParapharmacyProduct;
      const product = await Model.findById(productId).select("name").lean();
      const previousCount = previousMap.get(`${productType}:${productId}`) || 0;
      const currentCount = item.count;
      const changePercent =
        previousCount > 0 ? Math.round(((currentCount - previousCount) / previousCount) * 100) : 100;

      return {
        productId,
        productType,
        productName: product?.name || "Unknown",
        previousCount,
        currentCount,
        changePercent,
        trend: changePercent > 5 ? "up" : changePercent < -5 ? "down" : "flat",
      };
    })
  );

  trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  res.status(200).json({ success: true, data: trends });
});

export const getById = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId })
    .populate("confirmedBy", "fullName role")
    .populate("cancelledBy", "fullName role")
    .populate("prescriptionVerifiedBy", "fullName role")
    .populate("customerId", "fullName phone email notes");
  if (!reservation) throw ApiError.notFound("Reservation not found");
  res.status(200).json({ success: true, data: await populateReservationItems(reservation) });
});

export const confirm = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.status !== "pending") {
    throw ApiError.badRequest(`Cannot confirm a reservation with status: ${reservation.status}`);
  }

  const update = {
    status: "confirmed",
    confirmedAt: new Date(),
    confirmedBy: req.user.userId,
  };
  if (reservation.prescriptionRequired) {
    update.prescriptionVerified = true;
    update.prescriptionVerifiedAt = new Date();
    update.prescriptionVerifiedBy = req.user.userId;
  }

  Object.assign(reservation, update);
  await reservation.save();

  emailService.sendReservationApproved(reservation).catch(() => {});
  req.auditLog = {
    action: "RESERVATION_CONFIRMED",
    entity: "reservations",
    entityId: reservation._id,
    payload: { confirmationCode: reservation.confirmationCode, confirmedBy: req.user.userId },
  };
  res.status(200).json({ success: true, data: reservation });
});

export const reject = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.status !== "pending") {
    throw ApiError.badRequest(`Cannot reject a reservation with status: ${reservation.status}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await releaseReservationStock(reservation, reservation.pharmacyId, session);
      Object.assign(reservation, {
        status: "cancelled",
        rejectionReason: req.body.reason,
        cancelledAt: new Date(),
        cancelledBy: req.user.userId,
      });
      await reservation.save({ session });
    });
  } finally {
    session.endSession();
  }

  emailService.sendReservationRejected({ ...reservation.toObject(), reason: req.body.reason }).catch(() => {});
  req.auditLog = {
    action: "RESERVATION_REJECTED",
    entity: "reservations",
    entityId: reservation._id,
    payload: { confirmationCode: reservation.confirmationCode, reason: req.body.reason },
  };
  res.status(200).json({ success: true, data: reservation });
});

export const markReady = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (reservation.status !== "confirmed") {
    throw ApiError.badRequest(`Cannot mark ready - current status: ${reservation.status}. Must be confirmed.`);
  }

  Object.assign(reservation, { status: "ready", readyAt: new Date() });
  await reservation.save();

  emailService.sendReservationReady(reservation).catch(() => {});
  req.auditLog = {
    action: "RESERVATION_READY",
    entity: "reservations",
    entityId: reservation._id,
    payload: { confirmationCode: reservation.confirmationCode },
  };
  res.status(200).json({ success: true, data: reservation });
});

export const cancel = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (["expired", "cancelled"].includes(reservation.status)) {
    throw ApiError.badRequest(`Cannot cancel a reservation with status: ${reservation.status}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await releaseReservationStock(reservation, reservation.pharmacyId, session);
      Object.assign(reservation, {
        status: "cancelled",
        rejectionReason: req.body.reason || reservation.rejectionReason,
        cancelledAt: new Date(),
        cancelledBy: req.user.userId,
      });
      await reservation.save({ session });
    });
  } finally {
    session.endSession();
  }

  emailService
    .sendReservationCancelled({
      customerEmail: reservation.customerEmail,
      customerName: reservation.customerName,
      confirmationCode: reservation.confirmationCode,
    })
    .catch(() => {});

  req.auditLog = {
    action: "RESERVATION_CANCELLED",
    entity: "reservations",
    entityId: reservation._id,
    payload: { confirmationCode: reservation.confirmationCode, cancelledBy: req.user.userId },
  };
  res.status(200).json({ success: true, data: reservation });
});

export const verifyPrescription = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (!reservation.prescriptionRequired) {
    throw ApiError.badRequest("This reservation does not require prescription verification");
  }

  const { verified } = req.body;
  Object.assign(reservation, {
    prescriptionVerified: verified,
    prescriptionVerifiedAt: verified ? new Date() : null,
    prescriptionVerifiedBy: verified ? req.user.userId : null,
  });
  await reservation.save();

  req.auditLog = {
    action: verified ? "PRESCRIPTION_VERIFIED" : "PRESCRIPTION_VERIFICATION_RESET",
    entity: "reservations",
    entityId: reservation._id,
    payload: { confirmationCode: reservation.confirmationCode, verifiedBy: req.user.userId },
  };
  res.status(200).json({ success: true, data: reservation });
});

export const convert = asyncController(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!reservation) throw ApiError.notFound("Reservation not found");
  if (!["confirmed", "ready"].includes(reservation.status)) {
    throw ApiError.badRequest(`Cannot convert - reservation status is: ${reservation.status}`);
  }
  if (reservation.prescriptionRequired && !reservation.prescriptionVerified) {
    throw ApiError.badRequest(
      "Prescription must be verified before converting to sale. Use PATCH /api/reservations/:id/verify-prescription first."
    );
  }

  const populated = await populateReservationItems(reservation);
  res.status(200).json({
    success: true,
    data: {
      reservationId: reservation._id,
      confirmationCode: reservation.confirmationCode,
      customerName: reservation.customerName,
      paymentMethod: reservation.paymentMethod,
      cartItems: populated.items.map((item) => ({
        productType: item.productType,
        productId: item.productId.toString(),
        name: item.name,
        category: item.category,
        qty: item.qty,
        unitPrice: item.salePrice,
      })),
    },
  });
});
