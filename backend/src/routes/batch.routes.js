import express from "express";
import { z } from "zod";
import { Batch } from "../models/Batch.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const createBatchSchema = z.object({
  medicineId: z.string().min(1),
  batchNumber: z.string().min(1),
  expiryDate: z.string().min(1),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  initialQty: z.number().int().positive(),
  deliveryId: z.string().optional().nullable(),
});

// POST /api/batches
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(createBatchSchema),
  auditLog({ action: "ADD_BATCH", entity: "Batch", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const { medicineId, expiryDate, ...rest } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) throw new ApiError(404, "Medicine not found");

    const batch = await Batch.create({
      medicineId,
      expiryDate: new Date(expiryDate),
      remainingQty: rest.initialQty,
      ...rest,
    });

    res.status(201).json(batch);
  })
);

export default router;
