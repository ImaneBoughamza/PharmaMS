import mongoose from "mongoose";
import Batch from "../models/Batch.model.js";
import Medicine from "../models/Medicine.model.js";
import ParapharmacyBatch from "../models/ParapharmacyBatch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { allocateParapharmacyFIFO } from "../services/fifo.service.js";
import { asyncController } from "./controllerUtils.js";

const getThresholdDays = async (userId) => {
  const user = await User.findById(userId).select("expiryThresholdDays");
  return user?.expiryThresholdDays || 30;
};

export const alerts = asyncController(async (req, res) => {
  const medicines = await Medicine.find({ pharmacyId: req.user.pharmacyId, isActive: true }).lean();
  const medicineAlerts = [];
  for (const medicine of medicines) {
    const batches = await Batch.find({ pharmacyId: req.user.pharmacyId, medicineId: medicine._id, isActive: true });
    const totalStock = batches.reduce((sum, batch) => sum + batch.remainingQty, 0);
    if (totalStock < medicine.minStockLevel) {
      medicineAlerts.push({ ...medicine, totalStock });
    }
  }

  const parapharmacy = await ParapharmacyProduct.find({
    pharmacyId: req.user.pharmacyId,
    isActive: true,
    $expr: { $lt: ["$stockQty", "$minStockLevel"] },
  }).lean();

  res.status(200).json({
    success: true,
    data: { medicines: medicineAlerts, parapharmacy, total: medicineAlerts.length + parapharmacy.length },
  });
});

export const expiryAlerts = asyncController(async (req, res) => {
  const thresholdDays = await getThresholdDays(req.user.userId);
  const now = new Date();
  const until = new Date(Date.now() + thresholdDays * 24 * 60 * 60 * 1000);

  const batches = await Batch.find({
    pharmacyId: req.user.pharmacyId,
    expiryDate: { $gt: now, $lte: until },
    remainingQty: { $gt: 0 },
    isActive: true,
  }).populate("medicineId", "name genericName unit").sort({ expiryDate: 1 });

  res.status(200).json({ success: true, data: batches });
});

export const configureExpiryThreshold = asyncController(async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, { expiryThresholdDays: req.body.thresholdDays });
  req.auditLog = {
    action: "EXPIRY_THRESHOLD_CONFIGURED",
    entity: "users",
    entityId: req.user.userId,
    payload: { thresholdDays: req.body.thresholdDays },
  };
  res.status(200).json({ success: true, data: { thresholdDays: req.body.thresholdDays } });
});

export const adjust = asyncController(async (req, res) => {
  const amount = req.body.adjustmentType === "add" ? req.body.quantity : -req.body.quantity;
  let updatedStock = null;

  if (req.body.productType === "medicine") {
    if (!req.body.batchId) throw ApiError.badRequest("batchId is required for medicine stock adjustment");
    const filter = { _id: req.body.batchId, pharmacyId: req.user.pharmacyId };
    if (amount < 0) filter.remainingQty = { $gte: req.body.quantity };

    const update =
      amount > 0
        ? { $inc: { remainingQty: req.body.quantity, initialQty: req.body.quantity } }
        : { $inc: { remainingQty: -req.body.quantity } };

    const batch = await Batch.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!batch) {
      const exists = await Batch.exists({ _id: req.body.batchId, pharmacyId: req.user.pharmacyId });
      if (!exists) throw ApiError.notFound("Batch not found");
      throw ApiError.badRequest("Insufficient batch stock");
    }
    updatedStock = batch;
  } else {
    const product = await ParapharmacyProduct.findOne({ _id: req.body.productId, pharmacyId: req.user.pharmacyId });
    if (!product) throw ApiError.notFound("Parapharmacy product not found");
    if (amount < 0 && product.stockQty < req.body.quantity) throw ApiError.badRequest("Insufficient product stock");

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        if (amount > 0) {
          await ParapharmacyBatch.create(
            [
              {
                pharmacyId: req.user.pharmacyId,
                productId: product._id,
                batchNumber: `ADJ-${Date.now().toString(36).toUpperCase()}`,
                receivedAt: new Date(),
                purchasePrice: product.purchasePrice,
                salePrice: product.salePrice,
                initialQty: req.body.quantity,
                remainingQty: req.body.quantity,
                source: "stock-adjustment",
              },
            ],
            { session }
          );
          await ParapharmacyProduct.updateOne(
            { _id: product._id, pharmacyId: req.user.pharmacyId },
            { $inc: { stockQty: req.body.quantity } },
            { session }
          );
        } else {
          await allocateParapharmacyFIFO(product._id, req.user.pharmacyId, req.body.quantity, session);
        }
      });
    } finally {
      session.endSession();
    }

    updatedStock = await ParapharmacyProduct.findOne({
      _id: req.body.productId,
      pharmacyId: req.user.pharmacyId,
    }).lean();
  }

  req.auditLog = {
    action: "STOCK_ADJUSTED",
    entity: req.body.productType === "medicine" ? "batches" : "parapharmacyProducts",
    entityId: req.body.batchId || req.body.productId,
    payload: req.body,
  };
  res.status(200).json({
    success: true,
    message: "Stock adjusted",
    data: {
      productType: req.body.productType,
      productId: req.body.productId,
      batchId: req.body.batchId || null,
      stock: updatedStock,
    },
  });
});

export const returnBatch = asyncController(async (req, res) => {
  const batch = await Batch.findOne({ _id: req.body.batchId, pharmacyId: req.user.pharmacyId });
  if (!batch) throw ApiError.notFound("Batch not found");
  if (req.body.returnQty > batch.remainingQty) throw ApiError.badRequest("Return quantity exceeds remaining stock");
  batch.remainingQty -= req.body.returnQty;
  await batch.save();

  req.auditLog = {
    action: "BATCH_RETURNED",
    entity: "batches",
    entityId: batch._id,
    payload: { batchId: batch._id, returnQty: req.body.returnQty, reason: req.body.reason },
  };
  res.status(200).json({ success: true, message: "Batch marked for return" });
});
