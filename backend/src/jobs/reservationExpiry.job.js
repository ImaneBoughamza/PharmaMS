import cron from "node-cron";
import mongoose from "mongoose";
import Reservation from "../models/Reservation.model.js";
import AuditLog from "../models/AuditLog.model.js";
import emailService from "../services/email.service.js";
import { releaseReservationStock } from "../services/reservationStock.service.js";
import logger from "../utils/logger.js";

let reservationExpiryTask = null;

export const runReservationExpiry = async () => {
  logger.info("Reservation expiry job started");

  try {
    const now = new Date();

    const expiredReservations = await Reservation.find({
      status: { $in: ["pending", "confirmed", "ready"] },
      expiresAt: { $lt: now },
    });

    if (expiredReservations.length === 0) {
      logger.info("Reservation expiry job - no reservations to expire");
      return;
    }

    logger.info(
      `Reservation expiry job - processing ${expiredReservations.length} expired reservations`
    );

    for (const reservation of expiredReservations) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await releaseReservationStock(reservation, reservation.pharmacyId, session);
          reservation.status = "expired";
          reservation.expiredAt = now;
          await reservation.save({ session });
        });

        await AuditLog.create({
          pharmacyId: reservation.pharmacyId,
          userId: null,
          action: "RESERVATION_EXPIRED",
          entity: "reservations",
          entityId: reservation._id,
          payload: {
            confirmationCode: reservation.confirmationCode,
            customerEmail: reservation.customerEmail,
            expiredAt: now,
          },
        });

        emailService
          .sendReservationExpired({
            customerEmail: reservation.customerEmail,
            customerName: reservation.customerName,
            confirmationCode: reservation.confirmationCode,
          })
          .catch((emailErr) => {
            logger.error(
              `Expiry email failed for ${reservation.confirmationCode}: ${emailErr.message}`
            );
          });

        logger.info(
          `Reservation expired: ${reservation.confirmationCode} - ` +
            `customer: ${reservation.customerEmail}`
        );
      } catch (reservationErr) {
        logger.error(
          `Failed to expire reservation ${reservation.confirmationCode}: ` +
            `${reservationErr.message}`
        );
      } finally {
        session.endSession();
      }
    }

    logger.info(
      `Reservation expiry job completed - ${expiredReservations.length} reservations expired`
    );
  } catch (err) {
    logger.error(`Reservation expiry job failed: ${err.message}`);
  }
};

export const startReservationExpiryJob = () => {
  if (reservationExpiryTask) {
    return reservationExpiryTask;
  }

  reservationExpiryTask = cron.schedule("*/15 * * * *", runReservationExpiry, {
    timezone: "Africa/Casablanca",
  });

  logger.info("Reservation expiry job scheduled - runs every 15 minutes");
  return reservationExpiryTask;
};

export default {
  runReservationExpiry,
  startReservationExpiryJob,
};
