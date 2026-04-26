import cron from "node-cron";
import { getNearExpiryBatches } from "../services/alert.service.js";
import logger from "../utils/logger.js";

/**
 * Daily at 08:00 — log near-expiry batches (within 30 days).
 * In a production system this would also send notifications.
 */
export function startNearExpiryJob() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const batches = await getNearExpiryBatches(30);
      if (batches.length === 0) {
        logger.info("[nearExpiry] No near-expiry batches found.");
        return;
      }
      logger.warn(`[nearExpiry] ${batches.length} batch(es) expire within 30 days:`);
      for (const batch of batches) {
        const medicineName = batch.medicineId?.name ?? batch.medicineId;
        logger.warn(
          `  • ${medicineName} — batch ${batch.batchNumber}, expires ${new Date(batch.expiryDate).toLocaleDateString()}, qty: ${batch.remainingQty}`
        );
      }
    } catch (err) {
      logger.error(`[nearExpiry] Job failed: ${err.message}`);
    }
  });

  logger.info("[nearExpiry] Job scheduled — daily at 08:00");
}
