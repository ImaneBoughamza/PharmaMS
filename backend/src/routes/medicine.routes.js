import express from "express";
import { z } from "zod";
import { Medicine } from "../models/Medicine.model.js";
import { Batch } from "../models/Batch.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const createMedicineSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional().default(""),
  category: z.enum(["prescription", "non-prescription", "regulated"]),
  unit: z.string().optional().default("tablet"),
  minStockLevel: z.number().int().min(0).optional().default(10),
  supplierId: z.string().optional().nullable(),
  // optional initial batch
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  purchasePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  initialQty: z.number().int().positive().optional(),
});

const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  genericName: z.string().optional(),
  category: z.enum(["prescription", "non-prescription", "regulated"]).optional(),
  unit: z.string().optional(),
  minStockLevel: z.number().int().min(0).optional(),
  supplierId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/medicines
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    const medicines = await Medicine.find(filter).sort({ name: 1 }).lean();

    const result = await Promise.all(
      medicines.map(async (med) => {
        const batches = await Batch.find({ medicineId: med._id, remainingQty: { $gt: 0 } }).lean();
        const totalStock = batches.reduce((s, b) => s + b.remainingQty, 0);
        const nearExpiry = batches.some((b) => {
          const days = (new Date(b.expiryDate) - new Date()) / 86400000;
          return days <= 30;
        });
        return { ...med, totalStock, nearExpiry };
      })
    );

    res.json(result);
  })
);

// POST /api/medicines
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(createMedicineSchema),
  auditLog({ action: "CREATE_MEDICINE", entity: "Medicine", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const { batchNumber, expiryDate, purchasePrice, salePrice, initialQty, ...medData } = req.body;

    const existing = await Medicine.findOne({ name: medData.name });
    if (existing) return res.status(409).json({ message: "Medicine with this name already exists" });

    const medicine = await Medicine.create(medData);

    if (batchNumber && expiryDate && purchasePrice != null && salePrice != null && initialQty) {
      await Batch.create({
        medicineId: medicine._id,
        batchNumber,
        expiryDate: new Date(expiryDate),
        purchasePrice,
        salePrice,
        initialQty,
        remainingQty: initialQty,
      });
    }

    res.status(201).json(medicine);
  })
);

// GET /api/medicines/:id
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id).lean();
    if (!medicine) throw new ApiError(404, "Medicine not found");

    const batches = await Batch.find({ medicineId: medicine._id }).sort({ expiryDate: 1 }).lean();
    const totalStock = batches.reduce((s, b) => s + b.remainingQty, 0);

    res.json({ ...medicine, batches, totalStock });
  })
);

// PATCH /api/medicines/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("pharmacist"),
  validate(updateMedicineSchema),
  auditLog({ action: "UPDATE_MEDICINE", entity: "Medicine", getId: (req) => req.params.id }),
  asyncHandler(async (req, res) => {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) throw new ApiError(404, "Medicine not found");
    res.json(medicine);
  })
);

export default router;
