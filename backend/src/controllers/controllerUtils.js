import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const asyncController = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const pagination = (query, defaultLimit = 20) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || String(defaultLimit), 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const paginatedResponse = (res, data, total, page, limit) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const requireObjectId = (value, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw ApiError.badRequest(`${label} is invalid`);
  }
};

export const buildDateFilter = (query) => {
  const date = {};
  if (query.dateFrom || query.from) date.$gte = new Date(query.dateFrom || query.from);
  if (query.dateTo || query.to) date.$lte = new Date(query.dateTo || query.to);
  return Object.keys(date).length ? date : null;
};

export const publicReservationFields = (reservation) => ({
  _id: reservation._id,
  customerName: reservation.customerName,
  customerPhone: reservation.customerPhone,
  customerEmail: reservation.customerEmail,
  items: reservation.items,
  status: reservation.status,
  confirmationCode: reservation.confirmationCode,
  paymentMethod: reservation.paymentMethod,
  rejectionReason: reservation.rejectionReason,
  prescriptionUploaded: Boolean(reservation.prescriptionImage),
  prescriptionRequired: Boolean(reservation.prescriptionRequired),
  prescriptionVerified: Boolean(reservation.prescriptionVerified),
  prescriptionVerifiedAt: reservation.prescriptionVerifiedAt,
  prescriptionVerifiedBy: reservation.prescriptionVerifiedBy,
  expiresAt: reservation.expiresAt,
  confirmedAt: reservation.confirmedAt,
  readyAt: reservation.readyAt,
  cancelledAt: reservation.cancelledAt,
  expiredAt: reservation.expiredAt,
  createdAt: reservation.createdAt,
  updatedAt: reservation.updatedAt,
});
