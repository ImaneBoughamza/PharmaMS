import mongoose from "mongoose";
import Sale from "../models/Sale.model.js";
import Medicine from "../models/Medicine.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import Reservation from "../models/Reservation.model.js";
import ApiError from "../utils/ApiError.js";
import {
  allocateMedicineMultiple,
  allocateParapharmacyMultiple,
  rollbackFIFO,
  rollbackParapharmacyFIFO,
} from "../services/fifo.service.js";
import { buildSaleItemsFromReservationLocks } from "../services/reservationStock.service.js";
import {
  listPendingRequests,
  requestApproval,
  submitResponse,
} from "../services/pharmacistGate.service.js";
import { generateReceiptNumber } from "../utils/generateCode.js";
import {
  asyncController,
  pagination,
  paginatedResponse,
  buildDateFilter,
} from "./controllerUtils.js";

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.user.role === "cashier") filter.cashierId = req.user.userId;
  if (req.query.cashierId && req.user.role !== "cashier")
    filter.cashierId = req.query.cashierId;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.status) filter.approvalStatus = req.query.status;
  const date = buildDateFilter(req.query);
  if (date) filter.createdAt = date;

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate("cashierId", "fullName role")
      .populate("items.medicineId", "name genericName category unit")
      .populate("items.batchId", "batchNumber")
      .populate("parapharmacyItems.productId", "name brand category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Sale.countDocuments(filter),
  ]);
  paginatedResponse(res, sales, total, page, limit);
});

export const getById = asyncController(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  })
    .populate("cashierId", "fullName role")
    .populate("pharmacistId", "fullName")
    .populate("items.medicineId", "name unit")
    .populate("parapharmacyItems.productId", "name brand")
    .lean();
  if (!sale) throw ApiError.notFound("Sale not found");
  res.status(200).json({ success: true, data: sale });
});

export const listApprovalRequests = asyncController(async (req, res) => {
  res
    .status(200)
    .json({ success: true, data: listPendingRequests(req.user.pharmacyId) });
});

export const respondApprovalRequest = asyncController(async (req, res) => {
  const request = listPendingRequests(req.user.pharmacyId).find(
    (item) => item.requestId === req.params.requestId,
  );
  if (!request)
    throw ApiError.notFound("Approval request not found or expired");

  submitResponse(
    req.app.get("io"),
    req.params.requestId,
    req.body.approved,
    req.user.userId,
    req.body.reason || null,
  );

  req.auditLog = {
    action: req.body.approved
      ? "REGULATED_SALE_APPROVED"
      : "REGULATED_SALE_REJECTED",
    entity: "sales",
    entityId: null,
    payload: {
      requestId: req.params.requestId,
      items: request.items,
      prescriptionAttached: Boolean(request.prescriptionImage?.dataUrl),
      reason: req.body.reason || null,
    },
  };

  res
    .status(200)
    .json({
      success: true,
      message: req.body.approved ? "Sale approved" : "Sale rejected",
    });
});

export const create = asyncController(async (req, res) => {
  const medicineItems = req.body.items || [];
  const parapharmacyCart = req.body.parapharmacyItems || [];
  let pharmacistId = req.user.role === "pharmacist" ? req.user.userId : null;
  const session = await mongoose.startSession();
  let reservation = null;

  if (req.body.reservationId) {
    reservation = await Reservation.findOne({
      _id: req.body.reservationId,
      pharmacyId: req.user.pharmacyId,
    });
    if (!reservation) throw ApiError.notFound("Reservation not found");
    if (!["confirmed", "ready"].includes(reservation.status)) {
      throw ApiError.badRequest(
        `Cannot convert reservation with status: ${reservation.status}`,
      );
    }
    if (reservation.prescriptionRequired && !reservation.prescriptionVerified) {
      throw ApiError.badRequest(
        "Prescription must be verified before converting this reservation to a sale",
      );
    }
  }

  const medicines = medicineItems.length
    ? await Medicine.find({
        _id: { $in: medicineItems.map((item) => item.medicineId) },
        pharmacyId: req.user.pharmacyId,
        isActive: true,
      })
    : [];
  if (medicines.length !== medicineItems.length)
    throw ApiError.badRequest("One or more medicines are invalid");

  const medicineMap = new Map(
    medicines.map((medicine) => [medicine._id.toString(), medicine]),
  );
  const regulatedItems = reservation
    ? []
    : medicineItems
        .filter(
          (item) => medicineMap.get(item.medicineId)?.category === "regulated",
        )
        .map((item) => ({
          medicineName: medicineMap.get(item.medicineId).name,
          qty: item.qty,
        }));

  if (regulatedItems.length > 0 && req.user.role !== "pharmacist") {
    if (!req.body.prescriptionImage?.dataUrl) {
      throw ApiError.badRequest(
        "Prescription image is required for regulated medicine validation",
      );
    }
    pharmacistId = await requestApproval(
      req.app.get("io"),
      req.user.pharmacyId,
      regulatedItems,
      req.user.userId,
      req.body.prescriptionImage,
    );
  }

  const parapharmacyProducts = parapharmacyCart.length
    ? await ParapharmacyProduct.find({
        _id: { $in: parapharmacyCart.map((item) => item.productId) },
        pharmacyId: req.user.pharmacyId,
        isActive: true,
      })
    : [];
  if (parapharmacyProducts.length !== parapharmacyCart.length) {
    throw ApiError.badRequest("One or more parapharmacy products are invalid");
  }

  let sale;
  let receiptNumber;
  let totalAmount;
  let saleItems = [];
  let parapharmacyItems = [];

  try {
    await session.withTransaction(async () => {
      if (reservation?.stockLocks?.length) {
        const lockedItems = buildSaleItemsFromReservationLocks(reservation);
        saleItems = lockedItems.medicineItems;
        parapharmacyItems = lockedItems.parapharmacyItems;
      } else {
        const allocations = medicineItems.length
          ? await allocateMedicineMultiple(
              medicineItems,
              req.user.pharmacyId,
              session,
            )
          : [];

        saleItems = allocations.map((allocation) => ({
          batchId: allocation.batchId,
          medicineId: allocation.medicineId,
          qty: allocation.qty,
          unitPrice: allocation.unitPrice,
        }));

        parapharmacyItems = parapharmacyCart.length
          ? await allocateParapharmacyMultiple(
              parapharmacyCart,
              req.user.pharmacyId,
              session,
            )
          : [];
      }

      const medicineSubtotal = saleItems.reduce(
        (sum, item) => sum + item.qty * item.unitPrice,
        0,
      );
      const parapharmacySubtotal = parapharmacyItems.reduce(
        (sum, item) => sum + item.qty * item.unitPrice,
        0,
      );
      totalAmount = medicineSubtotal + parapharmacySubtotal;
      receiptNumber = generateReceiptNumber();

      const [createdSale] = await Sale.create(
        [
          {
            pharmacyId: req.user.pharmacyId,
            cashierId: req.user.userId,
            pharmacistId,
            items: saleItems,
            parapharmacyItems,
            totalAmount,
            paymentMethod: req.body.paymentMethod,
            approvalStatus: "approved",
            invoice: {
              receiptNumber,
              generatedAt: new Date(),
              medicineSubtotal,
              parapharmacySubtotal,
            },
          },
        ],
        { session },
      );
      sale = createdSale;

      if (reservation) {
        reservation.status = "cancelled";
        reservation.cancelledAt = new Date();
        reservation.cancelledBy = req.user.userId;
        reservation.stockLocks = [];
        await reservation.save({ session });
      }
    });
  } finally {
    session.endSession();
  }

  req.auditLog = {
    action: "SALE_COMPLETED",
    entity: "sales",
    entityId: sale._id,
    payload: {
      receiptNumber,
      totalAmount,
      paymentMethod: sale.paymentMethod,
      medicineItems: saleItems.length,
      parapharmacyItems: parapharmacyItems.length,
      reservationId: req.body.reservationId || null,
    },
  };
  res.status(201).json({ success: true, data: sale });
});

export const voidSale = asyncController(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  });
  if (!sale) throw ApiError.notFound("Sale not found");
  if (sale.approvalStatus === "voided")
    throw ApiError.badRequest("Sale already voided");
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await rollbackFIFO(sale.items, session);
      await rollbackParapharmacyFIFO(
        sale.parapharmacyItems,
        req.user.pharmacyId,
        session,
      );

      sale.approvalStatus = "voided";
      sale.voidReason = req.body.reason;
      sale.voidedBy = req.user.userId;
      sale.voidedAt = new Date();
      await sale.save({ session });
    });
  } finally {
    session.endSession();
  }

  req.auditLog = {
    action: "SALE_VOIDED",
    entity: "sales",
    entityId: sale._id,
    payload: {
      receiptNumber: sale.invoice?.receiptNumber,
      reason: req.body.reason,
      voidedBy: req.user.userId,
    },
  };
  res.status(200).json({ success: true, data: sale });
});
