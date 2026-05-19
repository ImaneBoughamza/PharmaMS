import Supplier from "../models/Supplier.model.js";
import Delivery from "../models/Delivery.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.query.type && req.query.type !== "all") filter.type = req.query.type;
  if (req.query.status === "active") filter.isActive = true;
  if (req.query.status === "deactivated") filter.isActive = false;
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, "i") },
      { contact: new RegExp(req.query.search, "i") },
      { contactPerson: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
      { phone: new RegExp(req.query.search, "i") },
    ];
  }

  const sortMap = {
    "name-desc": { name: -1 },
    type: { type: 1, name: 1 },
    recent: { updatedAt: -1 },
    "name-asc": { name: 1 },
  };
  const sortObj = sortMap[req.query.sort] || { name: 1 };

  const [suppliers, total] = await Promise.all([
    Supplier.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    Supplier.countDocuments(filter),
  ]);

  const data = await Promise.all(suppliers.map(async (supplier) => {
    const lastDelivery = await Delivery.findOne({ pharmacyId: req.user.pharmacyId, supplierId: supplier._id }).sort({ deliveryDate: -1 }).select("deliveryDate").lean();
    return { ...supplier, lastDelivery: lastDelivery?.deliveryDate || null };
  }));

  paginatedResponse(res, data, total, page, limit);
});

export const create = asyncController(async (req, res) => {
  const duplicate = await Supplier.findOne({ pharmacyId: req.user.pharmacyId, name: req.body.name });
  if (duplicate) throw ApiError.conflict("Supplier name already exists");
  const supplier = await Supplier.create({ ...req.body, pharmacyId: req.user.pharmacyId });
  req.auditLog = { action: "SUPPLIER_REGISTERED", entity: "suppliers", entityId: supplier._id, payload: { name: supplier.name, type: supplier.type } };
  res.status(201).json({ success: true, data: supplier });
});

export const getById = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId }).lean();
  if (!supplier) throw ApiError.notFound("Supplier not found");
  const deliveries = await Delivery.find({ pharmacyId: req.user.pharmacyId, supplierId: supplier._id }).sort({ deliveryDate: -1 }).limit(10).lean();
  res.status(200).json({ success: true, data: { ...supplier, deliveries, returns: [] } });
});

export const update = asyncController(async (req, res) => {
  if (req.body.name) {
    const duplicate = await Supplier.findOne({ pharmacyId: req.user.pharmacyId, name: req.body.name, _id: { $ne: req.params.id } });
    if (duplicate) throw ApiError.conflict("Supplier name already exists");
  }
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, pharmacyId: req.user.pharmacyId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!supplier) throw ApiError.notFound("Supplier not found");
  req.auditLog = { action: "SUPPLIER_UPDATED", entity: "suppliers", entityId: supplier._id, payload: req.body };
  res.status(200).json({ success: true, data: supplier });
});

export const deactivate = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!supplier) throw ApiError.notFound("Supplier not found");
  supplier.isActive = false;
  await supplier.save();
  req.auditLog = { action: "SUPPLIER_DEACTIVATED", entity: "suppliers", entityId: supplier._id };
  res.status(200).json({ success: true, message: "Supplier deactivated" });
});

export const reactivate = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!supplier) throw ApiError.notFound("Supplier not found");
  supplier.isActive = true;
  await supplier.save();
  req.auditLog = { action: "SUPPLIER_REACTIVATED", entity: "suppliers", entityId: supplier._id };
  res.status(200).json({ success: true, data: supplier });
});
