import express from "express";
import { z } from "zod";
import { Delivery } from "../models/Delivery.model.js";
import { Batch } from "../models/Batch.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { Supplier } from "../models/Supplier.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const deliveryItemSchema = z.object({
  medicineId: z.string().min(1),
  batchNumber: z.string().min(1),
  expiryDate: z.string().min(1),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  quantity: z.number().int().positive(),
});

const createDeliverySchema = z.object({
  supplierId: z.string().min(1),
  invoiceNumber: z.string().optional().default(""),
  deliveryDate: z.string().optional(),
  items: z.array(deliveryItemSchema).min(1),
});

// GET /api/deliveries
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { supplierId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (supplierId) filter.supplierId = supplierId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .populate("supplierId", "name")
        .populate("receivedBy", "fullName")
        .populate("items.medicineId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Delivery.countDocuments(filter),
    ]);

    res.json({ deliveries, total, page: parseInt(page), limit: parseInt(limit) });
  })
);

// POST /api/deliveries - register delivery + create/update batches
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(createDeliverySchema),
  auditLog({ action: "CREATE_DELIVERY", entity: "Delivery", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const { supplierId, invoiceNumber, deliveryDate, items } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    // Validate all medicine IDs
    const medicineIds = items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } }).lean();
    if (medicines.length !== new Set(medicineIds).size) {
      throw new ApiError(400, "One or more medicines not found");
    }

    const delivery = await Delivery.create({
      supplierId,
      receivedBy: req.user.sub,
      invoiceNumber,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      items,
    });

    // Create a batch for each delivery item
    await Promise.all(
      items.map((item) =>
        Batch.create({
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          expiryDate: new Date(item.expiryDate),
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice,
          initialQty: item.quantity,
          remainingQty: item.quantity,
          deliveryId: delivery._id,
        })
      )
    );

    res.status(201).json(delivery);
  })
);

export default router;
