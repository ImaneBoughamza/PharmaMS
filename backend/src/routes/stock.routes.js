import express from "express";
import { z } from "zod";
import { Batch } from "../models/Batch.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getLowStockAlerts, getNearExpiryBatches } from "../services/alert.service.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const adjustSchema = z.object({
  batchId: z.string().min(1),
  adjustment: z.number().int(), // positive = add, negative = remove
  reason: z.string().min(1),
});

const returnSchema = z.object({
  batchId: z.string().min(1),
  qty: z.number().int().positive(),
  reason: z.string().optional().default(""),
});

// GET /api/stock - overview with low-stock + near-expiry alerts
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({ isActive: true }).lean();

    const stockList = await Promise.all(
      medicines.map(async (med) => {
        const batches = await Batch.find({ medicineId: med._id }).sort({ expiryDate: 1 }).lean();
        const totalStock = batches.reduce((s, b) => s + b.remainingQty, 0);
        const isLow = totalStock <= med.minStockLevel;
        const nearExpiry = batches.some((b) => {
          const days = (new Date(b.expiryDate) - new Date()) / 86400000;
          return days <= 30 && b.remainingQty > 0;
        });
        return { ...med, batches, totalStock, isLow, nearExpiry };
      })
    );

    const lowStockAlerts = await getLowStockAlerts();
    const nearExpiryBatches = await getNearExpiryBatches(30);

    res.json({ stockList, lowStockAlerts, nearExpiryBatches });
  })
);

// PATCH /api/stock/adjust - manual adjustment
router.patch(
  "/adjust",
  requireAuth,
  requireRole("pharmacist"),
  validate(adjustSchema),
  auditLog({ action: "STOCK_ADJUST", entity: "Batch", getId: (req) => req.body.batchId }),
  asyncHandler(async (req, res) => {
    const { batchId, adjustment, reason } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) throw new ApiError(404, "Batch not found");

    const newQty = batch.remainingQty + adjustment;
    if (newQty < 0) throw new ApiError(400, "Adjustment would result in negative stock");

    batch.remainingQty = newQty;
    await batch.save();

    res.json({ batch, adjustment, reason });
  })
);

// GET /api/stock/expiry - near-expiry batches
router.get(
  "/expiry",
  requireAuth,
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const batches = await getNearExpiryBatches(days);
    res.json(batches);
  })
);

// POST /api/stock/return - mark qty for supplier return (removes from stock)
router.post(
  "/return",
  requireAuth,
  requireRole("pharmacist"),
  validate(returnSchema),
  auditLog({ action: "STOCK_RETURN", entity: "Batch", getId: (req) => req.body.batchId }),
  asyncHandler(async (req, res) => {
    const { batchId, qty, reason } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) throw new ApiError(404, "Batch not found");
    if (batch.remainingQty < qty) throw new ApiError(400, "Insufficient remaining qty for return");

    batch.remainingQty -= qty;
    await batch.save();

    res.json({ batch, returnedQty: qty, reason });
  })
);

export default router;
