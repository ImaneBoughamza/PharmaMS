import express from "express";
import { z } from "zod";
import { Supplier } from "../models/Supplier.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

// GET /api/suppliers
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };

    const suppliers = await Supplier.find(filter).sort({ name: 1 }).lean();
    res.json(suppliers);
  })
);

// POST /api/suppliers
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(supplierSchema),
  auditLog({ action: "CREATE_SUPPLIER", entity: "Supplier", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const exists = await Supplier.findOne({ name: req.body.name });
    if (exists) return res.status(409).json({ message: "Supplier with this name already exists" });

    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  })
);

// GET /api/suppliers/:id
router.get(
  "/:id",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).lean();
    if (!supplier) throw new ApiError(404, "Supplier not found");
    res.json(supplier);
  })
);

// PATCH /api/suppliers/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("pharmacist"),
  validate(supplierSchema.partial()),
  auditLog({ action: "UPDATE_SUPPLIER", entity: "Supplier", getId: (req) => req.params.id }),
  asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) throw new ApiError(404, "Supplier not found");
    res.json(supplier);
  })
);

export default router;
