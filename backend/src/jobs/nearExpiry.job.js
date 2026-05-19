import cron from "node-cron";
import Batch from "../models/Batch.model.js";
import User from "../models/User.model.js";
import logger from "../utils/logger.js";

let nearExpiryTask = null;

export const runNearExpiryCheck = async () => {
  logger.info("Near-expiry job started");

  try {
    const pharmacists = await User.find({
      role: "pharmacist",
      isActive: true,
    }).select("pharmacyId expiryThresholdDays");

    if (pharmacists.length === 0) {
      logger.info("Near-expiry job - no pharmacies found");
      return;
    }

    let totalNearExpiry = 0;

    for (const pharmacist of pharmacists) {
      const pharmacyId = pharmacist.pharmacyId;
      const thresholdDays = pharmacist.expiryThresholdDays || 30;
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

      const nearExpiryBatches = await Batch.find({
        pharmacyId,
        isActive: true,
        remainingQty: { $gt: 0 },
        expiryDate: {
          $gt: new Date(),
          $lte: thresholdDate,
        },
      }).populate("medicineId", "name");

      if (nearExpiryBatches.length > 0) {
        logger.warn(
          `Near-expiry job - pharmacy ${pharmacyId} - ` +
            `${nearExpiryBatches.length} batches expiring within ${thresholdDays} days:`
        );

        nearExpiryBatches.forEach((batch) => {
          const daysRemaining = Math.ceil(
            (new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
          );

          logger.warn(
            `  -> ${batch.medicineId?.name || "Unknown"} | ` +
              `Batch: ${batch.batchNumber} | ` +
              `Expires in ${daysRemaining} day(s) | ` +
              `Remaining: ${batch.remainingQty} units`
          );
        });

        totalNearExpiry += nearExpiryBatches.length;
      } else {
        logger.info(`Near-expiry job - pharmacy ${pharmacyId} - no batches near expiry`);
      }
    }

    logger.info(
      `Near-expiry job completed - ${totalNearExpiry} total near-expiry batches across all pharmacies`
    );
  } catch (err) {
    logger.error(`Near-expiry job failed: ${err.message}`);
  }
};

export const startNearExpiryJob = () => {
  if (nearExpiryTask) {
    return nearExpiryTask;
  }

  nearExpiryTask = cron.schedule("0 8 * * *", runNearExpiryCheck, {
    timezone: "Africa/Casablanca",
  });

  logger.info("Near-expiry job scheduled - runs daily at 08:00 (Casablanca time)");
  return nearExpiryTask;
};

export default {
  runNearExpiryCheck,
  startNearExpiryJob,
};
