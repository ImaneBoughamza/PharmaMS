import mongoose from "mongoose";
import Batch from "../models/Batch.model.js";
import ParapharmacyBatch from "../models/ParapharmacyBatch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

/**
 * Allocate medicine stock via FEFO for a single medicine.
 * Medicines are dispensed from the earliest expiring active batch first.
 *
 * @param {string} medicineId
 * @param {string} pharmacyId
 * @param {number} requestedQty
 * @param {object} session
 * @returns {Array<{ batchId: object, qty: number, unitPrice: number }>}
 */
export const allocateFIFO = async (medicineId, pharmacyId, requestedQty, session) => {
  let resolvedPharmacyId = pharmacyId;
  let resolvedQty = requestedQty;
  let resolvedSession = session;
  let medicineName = "";

  // Compatibility with the previous route signature:
  // allocateFIFO(medicineId, quantityRequested, medicineName, session)
  if (typeof pharmacyId === "number") {
    resolvedQty = pharmacyId;
    medicineName = typeof requestedQty === "string" ? requestedQty : "";
    resolvedSession = session;
    resolvedPharmacyId = null;
  }

  const query = {
    medicineId,
    isActive: true,
    expiryDate: { $gt: new Date() },
    remainingQty: { $gt: 0 },
  };

  if (resolvedPharmacyId) {
    query.pharmacyId = resolvedPharmacyId;
  }

  const batches = await Batch.find(query)
    .sort({ expiryDate: 1, createdAt: 1 })
    .session(resolvedSession);

  const totalAvailable = batches.reduce((sum, batch) => sum + batch.remainingQty, 0);

  if (totalAvailable < resolvedQty) {
    const label = medicineName || medicineId;
    throw ApiError.badRequest(
      `Insufficient stock - requested ${resolvedQty} of ${label} but only ${totalAvailable} available`
    );
  }

  const allocations = [];
  let remaining = resolvedQty;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const deductFrom = Math.min(batch.remainingQty, remaining);

    allocations.push({
      batchId: batch._id,
      qty: deductFrom,
      unitPrice: batch.salePrice,
      ...(medicineName ? { medicineName } : {}),
    });

    remaining -= deductFrom;
  }

  for (const allocation of allocations) {
    const update = await Batch.updateOne(
      {
        _id: allocation.batchId,
        isActive: true,
        remainingQty: { $gte: allocation.qty },
      },
      { $inc: { remainingQty: -allocation.qty } },
      { session: resolvedSession }
    );
    if (update.modifiedCount !== 1) {
      throw ApiError.conflict("Batch stock changed while processing the sale. Please retry.");
    }
  }

  logger.debug(`FEFO allocated ${resolvedQty} units of medicine ${medicineId}`);

  return allocations;
};

const ensureLegacyParapharmacyBatch = async (product, pharmacyId, session) => {
  const pharmacyObjectId =
    pharmacyId instanceof mongoose.Types.ObjectId
      ? pharmacyId
      : new mongoose.Types.ObjectId(pharmacyId);

  const stockInBatches = await ParapharmacyBatch.aggregate([
    {
      $match: {
        pharmacyId: pharmacyObjectId,
        productId: product._id,
        isActive: true,
      },
    },
    { $group: { _id: "$productId", total: { $sum: "$remainingQty" } } },
  ]).session(session);

  const totalBatchStock = stockInBatches[0]?.total || 0;
  const missingQty = product.stockQty - totalBatchStock;
  if (missingQty <= 0) return;
  const legacyBatchNumber = `LEGACY-${product._id.toString().slice(-8).toUpperCase()}`;

  const existingLegacy = await ParapharmacyBatch.findOne({
    pharmacyId,
    productId: product._id,
    batchNumber: legacyBatchNumber,
  }).session(session);

  if (existingLegacy) {
    await ParapharmacyBatch.updateOne(
      { _id: existingLegacy._id },
      { $inc: { initialQty: missingQty, remainingQty: missingQty }, $set: { isActive: true } },
      { session }
    );
    return;
  }

  await ParapharmacyBatch.create(
    [
      {
        pharmacyId,
        productId: product._id,
        batchNumber: legacyBatchNumber,
        receivedAt: product.createdAt || new Date(),
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        initialQty: missingQty,
        remainingQty: missingQty,
        source: "legacy",
      },
    ],
    { session }
  );
};

/**
 * Allocate parapharmacy stock from the oldest tracked batch first.
 * If a product has legacy stock but no batch ledger yet, a one-time
 * legacy batch is created inside the same transaction.
 *
 * @param {string} productId
 * @param {string} pharmacyId
 * @param {number} requestedQty
 * @param {object} session
 * @returns {Array<{ batchId: object, qty: number, unitPrice: number }>}
 */
export const allocateParapharmacyFIFO = async (productId, pharmacyId, requestedQty, session) => {
  const product = await ParapharmacyProduct.findOne({
    _id: productId,
    pharmacyId,
    isActive: true,
  }).session(session);

  if (!product) throw ApiError.notFound("Parapharmacy product not found");
  if (product.stockQty < requestedQty) {
    throw ApiError.badRequest(
      `Insufficient stock for ${product.name} - requested ${requestedQty} but only ${product.stockQty} available`
    );
  }

  await ensureLegacyParapharmacyBatch(product, pharmacyId, session);

  const batches = await ParapharmacyBatch.find({
    pharmacyId,
    productId,
    isActive: true,
    remainingQty: { $gt: 0 },
  })
    .sort({ expiryDate: 1, receivedAt: 1, createdAt: 1 })
    .session(session);

  const totalAvailable = batches.reduce((sum, batch) => sum + batch.remainingQty, 0);
  if (totalAvailable < requestedQty) {
    throw ApiError.badRequest(
      `Insufficient tracked stock for ${product.name} - requested ${requestedQty} but only ${totalAvailable} available`
    );
  }

  const allocations = [];
  let remaining = requestedQty;

  for (const batch of batches) {
    if (remaining <= 0) break;
    const deductFrom = Math.min(batch.remainingQty, remaining);
    allocations.push({ batchId: batch._id, qty: deductFrom, unitPrice: product.salePrice });
    remaining -= deductFrom;
  }

  for (const allocation of allocations) {
    const update = await ParapharmacyBatch.updateOne(
      {
        _id: allocation.batchId,
        isActive: true,
        remainingQty: { $gte: allocation.qty },
      },
      { $inc: { remainingQty: -allocation.qty } },
      { session }
    );
    if (update.modifiedCount !== 1) {
      throw ApiError.conflict("Parapharmacy stock changed while processing the sale. Please retry.");
    }
  }

  const productUpdate = await ParapharmacyProduct.updateOne(
    { _id: product._id, pharmacyId, stockQty: { $gte: requestedQty } },
    { $inc: { stockQty: -requestedQty } },
    { session }
  );
  if (productUpdate.modifiedCount !== 1) {
    throw ApiError.conflict("Parapharmacy stock changed while processing the sale. Please retry.");
  }

  logger.debug(`FIFO allocated ${requestedQty} units of parapharmacy product ${productId}`);
  return allocations;
};

/**
 * Restore batch quantities when a sale is voided.
 *
 * @param {Array<{ batchId: object, qty: number }>} allocations
 * @param {object} session
 */
export const rollbackFIFO = async (allocations, session) => {
  for (const allocation of allocations) {
    await Batch.findByIdAndUpdate(
      allocation.batchId,
      { $inc: { remainingQty: allocation.qty } },
      { session }
    );
  }

  logger.debug(`FEFO rollback - restored ${allocations.length} medicine batch allocations`);
};

export const rollbackParapharmacyFIFO = async (items, pharmacyId, session) => {
  for (const item of items) {
    for (const allocation of item.allocations || []) {
      await ParapharmacyBatch.findByIdAndUpdate(
        allocation.batchId,
        { $inc: { remainingQty: allocation.qty } },
        { session }
      );
    }

    await ParapharmacyProduct.updateOne(
      { _id: item.productId, pharmacyId },
      { $inc: { stockQty: item.qty } },
      { session }
    );
  }

  logger.debug(`FIFO rollback - restored ${items.length} parapharmacy item allocations`);
};

/**
 * Allocate FIFO for multiple medicines in one atomic transaction.
 *
 * @param {Array<{ medicineId: string, qty: number }>} items
 * @param {string} pharmacyId
 * @returns {Array<{ batchId: object, medicineId: string, qty: number, unitPrice: number }>}
 */
export const allocateMedicineMultiple = async (items, pharmacyId, session) => {
  const allAllocations = [];

  for (const item of items) {
    const allocations = await allocateFIFO(
      item.medicineId,
      pharmacyId,
      item.qty,
      session
    );

    allAllocations.push(
      ...allocations.map((allocation) => ({
        ...allocation,
        medicineId: item.medicineId,
      }))
    );
  }

  return allAllocations;
};

export const allocateMultiple = async (items, pharmacyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const allAllocations = await allocateMedicineMultiple(items, pharmacyId, session);
    await session.commitTransaction();
    return allAllocations;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const allocateParapharmacyMultiple = async (items, pharmacyId, session) => {
  const allItems = [];

  for (const item of items) {
    const allocations = await allocateParapharmacyFIFO(
      item.productId,
      pharmacyId,
      item.qty,
      session
    );

    allItems.push({
      productId: item.productId,
      qty: item.qty,
      unitPrice: allocations[0]?.unitPrice || 0,
      allocations,
    });
  }

  return allItems;
};

/**
 * Restore all batch quantities after a sale void.
 *
 * @param {Array<{ batchId: object, qty: number }>} saleItems
 */
export const restoreMultiple = async (saleItems) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await rollbackFIFO(saleItems, session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export default {
  allocateFIFO,
  allocateParapharmacyFIFO,
  rollbackFIFO,
  rollbackParapharmacyFIFO,
  allocateMedicineMultiple,
  allocateMultiple,
  allocateParapharmacyMultiple,
  restoreMultiple,
};
