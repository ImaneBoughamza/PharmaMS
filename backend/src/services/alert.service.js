import { Medicine } from "../models/Medicine.model.js";
import { Batch } from "../models/Batch.model.js";

const EXPIRY_WARNING_DAYS = 30;

/**
 * Returns medicines whose total available stock is at or below minStockLevel.
 */
export async function getLowStockAlerts() {
  const medicines = await Medicine.find({ isActive: true }).lean();

  const alerts = [];
  for (const med of medicines) {
    const batches = await Batch.find({
      medicineId: med._id,
      remainingQty: { $gt: 0 },
    }).lean();
    const totalStock = batches.reduce((s, b) => s + b.remainingQty, 0);
    if (totalStock <= med.minStockLevel) {
      alerts.push({ medicine: med, totalStock, minStockLevel: med.minStockLevel });
    }
  }
  return alerts;
}

/**
 * Returns batches expiring within `days` days that still have stock.
 */
export async function getNearExpiryBatches(days = EXPIRY_WARNING_DAYS) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return Batch.find({
    expiryDate: { $lte: cutoff, $gt: new Date() },
    remainingQty: { $gt: 0 },
  })
    .populate("medicineId", "name genericName category")
    .sort({ expiryDate: 1 })
    .lean();
}
