import cron from "node-cron";
import { Reservation } from "../models/Reservation.model.js";
import { AuditLog } from "../models/AuditLog.model.js";
import logger from "../utils/logger.js";

/**
 * Every 15 minutes — expire pending reservations whose expiresAt has passed.
 */
export function startReservationExpiryJob() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();

      const expired = await Reservation.find({
        status: { $in: ["pending", "confirmed"] },
        expiresAt: { $lt: now },
      });

      if (expired.length === 0) return;

      const ids = expired.map((r) => r._id);
      await Reservation.updateMany({ _id: { $in: ids } }, { status: "expired" });

      // Write audit logs for each expired reservation
      await AuditLog.insertMany(
        expired.map((r) => ({
          userId: null,
          action: "RESERVATION_EXPIRED",
          entity: "Reservation",
          entityId: r._id.toString(),
          payload: { confirmationCode: r.confirmationCode, expiredAt: now },
        }))
      );

      logger.info(`[reservationExpiry] Expired ${expired.length} reservation(s)`);
    } catch (err) {
      logger.error(`[reservationExpiry] Job failed: ${err.message}`);
    }
  });

  logger.info("[reservationExpiry] Job scheduled — every 15 minutes");
}
