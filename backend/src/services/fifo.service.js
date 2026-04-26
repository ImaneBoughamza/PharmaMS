import { Batch } from "../models/Batch.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Allocate stock using FIFO (oldest expiry first).
 * Writes batch updates inside the provided Mongoose session.
 * Returns array of { batchId, medicineId, qty, unitPrice, medicineName }.
 */
export async function allocateFIFO(medicineId, quantityRequested, medicineName, session) {
  const batches = await Batch.find({
    medicineId,
    remainingQty: { $gt: 0 },
    expiryDate: { $gt: new Date() },
  })
    .sort({ expiryDate: 1 })
    .session(session);

  const totalAvailable = batches.reduce((sum, b) => sum + b.remainingQty, 0);
  if (totalAvailable < quantityRequested) {
    throw new ApiError(
      400,
      `Insufficient stock for "${medicineName || medicineId}": available ${totalAvailable}, requested ${quantityRequested}`
    );
  }

  const allocations = [];
  let remaining = quantityRequested;

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.remainingQty, remaining);
    allocations.push({
      batchId: batch._id,
      medicineId,
      medicineName: medicineName || "",
      qty: take,
      unitPrice: batch.salePrice,
    });
    batch.remainingQty -= take;
    remaining -= take;
  }

  // Write all updates after full allocation confirmed in memory
  for (const batch of batches) {
    if (batch.isModified()) {
      await batch.save({ session });
    }
  }

  return allocations;
}
