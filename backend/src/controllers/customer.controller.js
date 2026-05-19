import Customer from "../models/Customer.model.js";
import Reservation from "../models/Reservation.model.js";
import AiConsultation from "../models/AiConsultation.model.js";
import Medicine from "../models/Medicine.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, buildDateFilter, pagination, paginatedResponse } from "./controllerUtils.js";

function csvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function enrichCustomer(customer) {
  const [reservationCount, lastReservation, lastConsultation] = await Promise.all([
    Reservation.countDocuments({ customerId: customer._id }),
    Reservation.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).select("createdAt").lean(),
    AiConsultation.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).select("createdAt").lean(),
  ]);

  const lastActivity = [lastReservation?.createdAt, lastConsultation?.createdAt]
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || null;

  return {
    ...customer,
    reservationCount,
    lastActivity,
  };
}

async function enrichReservationItems(reservation) {
  const items = await Promise.all((reservation.items || []).map(async (item) => {
    const Model = item.productType === "medicine" ? Medicine : ParapharmacyProduct;
    const product = await Model.findById(item.productId).select("name brand category salePrice").lean();
    return {
      ...item,
      name: product?.name || "Unknown product",
      brand: product?.brand || "",
      category: product?.category || "",
      salePrice: product?.salePrice || 0,
    };
  }));

  return { ...reservation, items };
}

function customerFilter(query, pharmacyId) {
  const filter = { pharmacyId };

  if (query.status === "active") filter.isActive = true;
  if (query.status === "deactivated") filter.isActive = false;
  if (query.createdFrom && query.createdFrom !== "all") filter.createdFrom = query.createdFrom;

  const date = buildDateFilter({
    dateFrom: query.dateFrom || query.registeredFrom,
    dateTo: query.dateTo || query.registeredTo,
  });
  if (date) filter.createdAt = date;

  if (query.search) {
    filter.$or = [
      { fullName: new RegExp(query.search, "i") },
      { phone: new RegExp(query.search, "i") },
      { email: new RegExp(query.search, "i") },
    ];
  }

  return filter;
}

function sortCustomers(customers, sort) {
  const rows = [...customers];
  rows.sort((a, b) => {
    if (sort === "name_desc") return b.fullName.localeCompare(a.fullName);
    if (sort === "recent") return new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt);
    if (sort === "reservations") return b.reservationCount - a.reservationCount || a.fullName.localeCompare(b.fullName);
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return a.fullName.localeCompare(b.fullName);
  });
  return rows;
}

export const list = asyncController(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const filter = customerFilter(req.query, req.user.pharmacyId);
  const sort = req.query.sort || "name";
  const customers = await Customer.find(filter).lean();
  const enriched = sortCustomers(await Promise.all(customers.map(enrichCustomer)), sort);

  if (req.query.format === "csv") {
    const rows = [
      "Full Name,Phone,Email,Insurance Type,Insurance Number,Reservations,Last Activity,Status,Member Since,Created From",
      ...enriched.map((customer) => [
        customer.fullName,
        customer.phone,
        customer.email,
        customer.insuranceType || "",
        customer.insuranceNumber || "",
        customer.reservationCount,
        customer.lastActivity ? new Date(customer.lastActivity).toISOString().split("T")[0] : "",
        customer.isActive ? "Active" : "Deactivated",
        new Date(customer.createdAt).toISOString().split("T")[0],
        customer.createdFrom,
      ].map(csvField).join(",")),
    ];

    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="PharmaMS_Customers_${today}.csv"`);
    return res.send(rows.join("\n"));
  }

  const total = enriched.length;
  const data = enriched.slice((page - 1) * limit, page * limit);
  paginatedResponse(res, data, total, page, limit);
});

export const getById = asyncController(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  }).lean();
  if (!customer) throw ApiError.notFound("Customer not found");

  const resPage = Math.max(parseInt(req.query.resPage || "1", 10), 1);
  const resLimit = Math.min(Math.max(parseInt(req.query.resLimit || "5", 10), 1), 50);
  const resSkip = (resPage - 1) * resLimit;

  const [reservationRows, resTotal, consultations, stats] = await Promise.all([
    Reservation.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .skip(resSkip)
      .limit(resLimit)
      .select("confirmationCode status paymentMethod items createdAt")
      .lean(),
    Reservation.countDocuments({ customerId: customer._id }),
    AiConsultation.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("staffId", "fullName role")
      .select("staffId extractedMedicines suggestions patientNotes createdAt")
      .lean(),
    Promise.all([
      Reservation.countDocuments({ customerId: customer._id }),
      Reservation.countDocuments({ customerId: customer._id, status: { $in: ["ready", "confirmed", "completed"] } }),
      Reservation.countDocuments({ customerId: customer._id, status: { $in: ["cancelled", "expired"] } }),
      AiConsultation.countDocuments({ customerId: customer._id }),
    ]),
  ]);

  const reservations = await Promise.all(reservationRows.map(enrichReservationItems));
  const [totalReservations, completedReservations, cancelledExpired, totalConsultations] = stats;

  res.status(200).json({
    success: true,
    data: {
      customer,
      stats: {
        totalReservations,
        completedReservations,
        cancelledExpired,
        totalConsultations,
      },
      reservations: {
        data: reservations,
        total: resTotal,
        page: resPage,
        totalPages: Math.ceil(resTotal / resLimit),
      },
      consultations,
    },
  });
});

export const update = asyncController(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!customer) throw ApiError.notFound("Customer not found");

  if (req.body.email && req.body.email !== customer.email) {
    const duplicate = await Customer.findOne({
      pharmacyId: req.user.pharmacyId,
      email: req.body.email,
      _id: { $ne: customer._id },
    });
    if (duplicate) throw ApiError.conflict("This email is already linked to another customer");
  }

  const updates = {};
  ["fullName", "phone", "email", "notes", "insuranceType", "insuranceNumber"].forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updated = await Customer.findByIdAndUpdate(customer._id, { $set: updates }, { new: true, runValidators: true });
  req.auditLog = {
    action: "CUSTOMER_UPDATED",
    entity: "customers",
    entityId: customer._id,
    payload: { updatedFields: Object.keys(updates) },
  };

  res.status(200).json({ success: true, data: updated });
});

export const deactivate = asyncController(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!customer) throw ApiError.notFound("Customer not found");
  if (!customer.isActive) throw ApiError.badRequest("Customer is already deactivated");

  customer.isActive = false;
  await customer.save();

  req.auditLog = {
    action: "CUSTOMER_DEACTIVATED",
    entity: "customers",
    entityId: customer._id,
    payload: { fullName: customer.fullName, email: customer.email },
  };

  res.status(200).json({ success: true, data: { message: `${customer.fullName} deactivated` } });
});

export const reactivate = asyncController(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!customer) throw ApiError.notFound("Customer not found");
  if (customer.isActive) throw ApiError.badRequest("Customer is already active");

  customer.isActive = true;
  await customer.save();

  req.auditLog = {
    action: "CUSTOMER_REACTIVATED",
    entity: "customers",
    entityId: customer._id,
    payload: { fullName: customer.fullName, email: customer.email },
  };

  res.status(200).json({ success: true, data: customer });
});
