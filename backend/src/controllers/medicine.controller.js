import Medicine from "../models/Medicine.model.js";
import Batch from "../models/Batch.model.js";
import Supplier from "../models/Supplier.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

const stockSummary = async (medicine) => {
  const batches = await Batch.find({
    pharmacyId: medicine.pharmacyId,
    medicineId: medicine._id,
    isActive: true,
    remainingQty: { $gt: 0 },
  }).sort({ expiryDate: 1 });

  return {
    totalStock: batches.reduce((sum, batch) => sum + batch.remainingQty, 0),
    nearestExpiry: batches[0]?.expiryDate ?? null,
    activeBatches: batches.length,
  };
};

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === "deactivated") filter.isActive = false;
  else if (req.query.status !== "all") filter.isActive = true;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const medicines = await Medicine.find(filter)
    .populate("supplierId", "name")
    .sort(req.query.sort || { name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  let data = await Promise.all(
    medicines.map(async (medicine) => ({
      ...medicine,
      stock: await stockSummary(medicine),
    }))
  );

  if (req.query.stock === "low") {
    data = data.filter((medicine) => medicine.stock.totalStock < medicine.minStockLevel);
  }

  const total = req.query.stock === "low" ? data.length : await Medicine.countDocuments(filter);
  paginatedResponse(res, data, total, page, limit);
});

export const getById = asyncController(async (req, res) => {
  const medicine = await Medicine.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  }).populate("supplierId", "name").lean();

  if (!medicine) throw ApiError.notFound("Medicine not found");

  const batches = await Batch.find({
    pharmacyId: req.user.pharmacyId,
    medicineId: medicine._id,
  }).sort({ expiryDate: 1 }).lean();

  res.status(200).json({ success: true, data: { ...medicine, batches } });
});

export const create = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({
    _id: req.body.supplierId,
    pharmacyId: req.user.pharmacyId,
    isActive: true,
  });
  if (!supplier) throw ApiError.notFound("Supplier not found");

  const medicine = await Medicine.create({
    pharmacyId: req.user.pharmacyId,
    name: req.body.name,
    genericName: req.body.genericName,
    category: req.body.category,
    unit: req.body.unit,
    supplierId: req.body.supplierId,
    purchasePrice: req.body.purchasePrice,
    salePrice: req.body.salePrice,
    minStockLevel: req.body.minStockLevel,
  });

  await Batch.create({
    pharmacyId: req.user.pharmacyId,
    medicineId: medicine._id,
    deliveryId: null,
    batchNumber: req.body.initialBatch.batchNumber,
    expiryDate: req.body.initialBatch.expiryDate,
    purchasePrice: req.body.purchasePrice,
    salePrice: req.body.salePrice,
    initialQty: req.body.initialBatch.receivedQty,
    remainingQty: req.body.initialBatch.receivedQty,
  });

  req.auditLog = {
    action: "MEDICINE_REGISTERED",
    entity: "medicines",
    entityId: medicine._id,
    payload: { name: medicine.name, category: medicine.category, supplierId: medicine.supplierId },
  };

  res.status(201).json({ success: true, data: medicine });
});

export const update = asyncController(async (req, res) => {
  if (req.body.supplierId) {
    const supplier = await Supplier.findOne({
      _id: req.body.supplierId,
      pharmacyId: req.user.pharmacyId,
      isActive: true,
    });
    if (!supplier) throw ApiError.notFound("Supplier not found");
  }

  const medicine = await Medicine.findOneAndUpdate(
    { _id: req.params.id, pharmacyId: req.user.pharmacyId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!medicine) throw ApiError.notFound("Medicine not found");

  req.auditLog = {
    action: "MEDICINE_UPDATED",
    entity: "medicines",
    entityId: medicine._id,
    payload: req.body,
  };

  res.status(200).json({ success: true, data: medicine });
});

export const deactivate = asyncController(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!medicine) throw ApiError.notFound("Medicine not found");
  if (!medicine.isActive) throw ApiError.badRequest("Medicine is already deactivated");

  medicine.isActive = false;
  await medicine.save();

  req.auditLog = { action: "MEDICINE_DEACTIVATED", entity: "medicines", entityId: medicine._id };
  res.status(200).json({ success: true, message: "Medicine deactivated" });
});

export const reactivate = asyncController(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!medicine) throw ApiError.notFound("Medicine not found");
  if (medicine.isActive) throw ApiError.badRequest("Medicine is already active");

  medicine.isActive = true;
  await medicine.save();

  req.auditLog = { action: "MEDICINE_REACTIVATED", entity: "medicines", entityId: medicine._id };
  res.status(200).json({ success: true, data: medicine });
});
