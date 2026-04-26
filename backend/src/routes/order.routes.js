// TODO [PROVISIONAL-1]: scope and access control to be confirmed with supervisor
import express from "express";
import { z } from "zod";
import { Order } from "../models/Order.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const createOrderSchema = z.object({
  supplierId: z.string().min(1),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        orderedQty: z.number().int().positive(),
      })
    )
    .min(1),
  notes: z.string().optional().default(""),
});

const updateOrderSchema = z.object({
  status: z.enum(["ordered", "received", "cancelled"]),
});

// GET /api/orders
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("supplierId", "name")
      .populate("items.medicineId", "name")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  })
);

// POST /api/orders
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(createOrderSchema),
  auditLog({ action: "CREATE_ORDER", entity: "Order", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const order = await Order.create({ ...req.body, createdBy: req.user.sub });
    res.status(201).json(order);
  })
);

// PATCH /api/orders/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("pharmacist"),
  validate(updateOrderSchema),
  auditLog({ action: "UPDATE_ORDER", entity: "Order", getId: (req) => req.params.id }),
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) throw new ApiError(404, "Order not found");
    res.json(order);
  })
);

export default router;
