import express from "express";
import { z } from "zod";
import { Reservation } from "../models/Reservation.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const EXPIRES_IN_HOURS = 48;

const createReservationSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
  notes: z.string().optional().default(""),
  pickupDate: z.string().optional().nullable(),
  paymentMethod: z.enum(["cash", "card", "insurance"]).optional().default("cash"),
});

const updateReservationSchema = z.object({
  status: z.enum(["confirmed", "ready", "completed", "cancelled"]),
});

function generateCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `RES-${year}-${rand}`;
}

// GET /api/reservations (staff)
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("items.medicineId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Reservation.countDocuments(filter),
    ]);

    res.json({ reservations, total, page: parseInt(page), limit: parseInt(limit) });
  })
);

// POST /api/reservations (public — no auth)
router.post(
  "/",
  validate(createReservationSchema),
  asyncHandler(async (req, res) => {
    // Validate all medicineIds exist
    const medicineIds = req.body.items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true }).lean();
    if (medicines.length !== medicineIds.length) {
      throw new ApiError(400, "One or more medicines not found");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EXPIRES_IN_HOURS);

    const reservation = await Reservation.create({
      ...req.body,
      confirmationCode: generateCode(),
      expiresAt,
      pickupDate: req.body.pickupDate ? new Date(req.body.pickupDate) : null,
    });

    res.status(201).json({
      confirmationCode: reservation.confirmationCode,
      status: reservation.status,
      expiresAt: reservation.expiresAt,
    });
  })
);

// GET /api/reservations/track/:code (public — no auth)
router.get(
  "/track/:code",
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({ confirmationCode: req.params.code })
      .populate("items.medicineId", "name genericName")
      .lean();
    if (!reservation) throw new ApiError(404, "Reservation not found");
    res.json(reservation);
  })
);

// PATCH /api/reservations/:id (staff — pharmacist/assistant)
router.patch(
  "/:id",
  requireAuth,
  requireRole("pharmacist", "assistant"),
  validate(updateReservationSchema),
  auditLog({ action: "UPDATE_RESERVATION", entity: "Reservation", getId: (req) => req.params.id }),
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reservation) throw new ApiError(404, "Reservation not found");
    res.json(reservation);
  })
);

export default router;
