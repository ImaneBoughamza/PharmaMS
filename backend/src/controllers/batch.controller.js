import Batch from "../models/Batch.model.js";
import Medicine from "../models/Medicine.model.js";
import Sale from "../models/Sale.model.js";
import Reservation from "../models/Reservation.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

export const create = asyncController(async (req, res) => {
  const medicine = await Medicine.findOne({
    _id: req.body.medicineId,
    pharmacyId: req.user.pharmacyId,
    isActive: true,
  });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  const duplicate = await Batch.findOne({
    pharmacyId: req.user.pharmacyId,
    medicineId: req.body.medicineId,
    batchNumber: req.body.batchNumber,
  });
  if (duplicate) throw ApiError.conflict("Batch number already exists for this medicine");

  if (new Date(req.body.expiryDate) <= new Date()) {
    throw ApiError.badRequest("Expiry date must be in the future");
  }

  const batch = await Batch.create({
    pharmacyId: req.user.pharmacyId,
    medicineId: req.body.medicineId,
    deliveryId: null,
    batchNumber: req.body.batchNumber,
    expiryDate: req.body.expiryDate,
    purchasePrice: req.body.purchasePrice,
    salePrice: req.body.salePrice,
    initialQty: req.body.receivedQty,
    remainingQty: req.body.receivedQty,
  });

  req.auditLog = {
    action: "BATCH_REGISTERED",
    entity: "batches",
    entityId: batch._id,
    payload: { medicineId: batch.medicineId, batchNumber: batch.batchNumber },
  };

  res.status(201).json({ success: true, data: batch });
});

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const now = new Date();
  const filter = { pharmacyId: req.user.pharmacyId };

  if (req.query.medicineId) filter.medicineId = req.query.medicineId;
  if (req.query.status === "deactivated") filter.isActive = false;
  if (req.query.status === "active") Object.assign(filter, { isActive: true, expiryDate: { $gt: now } });
  if (req.query.status === "expired") filter.expiryDate = { $lt: now };
  if (req.query.status === "near-expiry") {
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    Object.assign(filter, { isActive: true, remainingQty: { $gt: 0 }, expiryDate: { $gt: now, $lte: until } });
  }

  const [batches, total] = await Promise.all([
    Batch.find(filter)
      .populate("medicineId", "name genericName unit")
      .sort(req.query.sort || { expiryDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Batch.countDocuments(filter),
  ]);

  paginatedResponse(res, batches, total, page, limit);
});

export const history = asyncController(async (req, res) => {
  const batch = await Batch.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  }).populate("medicineId", "name unit");
  if (!batch) throw ApiError.notFound("Batch not found");

  const sales = await Sale.find({
    pharmacyId: req.user.pharmacyId,
    "items.batchId": batch._id,
  }).select("items invoice createdAt cashierId");

  const reservations = await Reservation.find({
    pharmacyId: req.user.pharmacyId,
    "items.productId": batch.medicineId._id ?? batch.medicineId,
    status: "completed",
  }).select("confirmationCode items updatedAt");

  const historyItems = [
    ...sales.flatMap((sale) =>
      sale.items
        .filter((item) => item.batchId.toString() === batch._id.toString())
        .map((item) => ({
          type: "sale",
          reference: sale.invoice?.receiptNumber,
          qty: item.qty,
          date: sale.createdAt,
        }))
    ),
    ...reservations.map((reservation) => ({
      type: "reservation",
      reference: reservation.confirmationCode,
      qty: reservation.items
        .filter((item) => item.productId.toString() === String(batch.medicineId._id ?? batch.medicineId))
        .reduce((sum, item) => sum + item.qty, 0),
      date: reservation.updatedAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({ success: true, data: { batch, history: historyItems } });
});

export const deactivate = asyncController(async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!batch) throw ApiError.notFound("Batch not found");
  if (batch.remainingQty < batch.initialQty) {
    throw ApiError.badRequest("Cannot deactivate a batch that has been partially consumed");
  }

  batch.isActive = false;
  await batch.save();

  req.auditLog = { action: "BATCH_DEACTIVATED", entity: "batches", entityId: batch._id };
  res.status(200).json({ success: true, message: "Batch deactivated" });
});
