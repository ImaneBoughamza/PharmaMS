import express from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Sale } from "../models/Sale.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { allocateFIFO } from "../services/fifo.service.js";
import { requireApproval, resolveApproval } from "../services/pharmacistGate.service.js";

const router = express.Router();

const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
  paymentMethod: z.enum(["cash", "card"]).optional().default("cash"),
});

const approveSchema = z.object({
  approved: z.boolean(),
});

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `REC-${year}-${rand}`;
}

// POST /api/sales
router.post(
  "/",
  requireAuth,
  validate(createSaleSchema),
  asyncHandler(async (req, res) => {
    const { items, paymentMethod } = req.body;
    const operatorRole = req.user.role;

    // Resolve medicine details and check for regulated items
    const medicineIds = items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } }).lean();
    const medMap = Object.fromEntries(medicines.map((m) => [m._id.toString(), m]));

    const hasRegulated = items.some((i) => {
      const med = medMap[i.medicineId];
      return med && med.category === "regulated";
    });

    const needsApproval = hasRegulated && operatorRole !== "pharmacist";

    const session = await mongoose.startSession();
    session.startTransaction();

    let allocations;
    try {
      allocations = [];
      for (const item of items) {
        const med = medMap[item.medicineId];
        if (!med) throw new ApiError(404, `Medicine ${item.medicineId} not found`);
        const alloc = await allocateFIFO(item.medicineId, item.qty, med.name, session);
        allocations.push(...alloc);
      }
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    const totalAmount = allocations.reduce((s, a) => s + a.qty * a.unitPrice, 0);
    const receiptNumber = generateReceiptNumber();

    const saleData = {
      cashierId: req.user.sub,
      items: allocations.map((a) => ({
        batchId: a.batchId,
        medicineId: a.medicineId,
        medicineName: a.medicineName,
        qty: a.qty,
        unitPrice: a.unitPrice,
      })),
      totalAmount,
      paymentMethod,
      approvalStatus: needsApproval ? "pending" : "not_required",
      invoice: { receiptNumber, generatedAt: new Date() },
    };

    const sale = await Sale.create(saleData);

    if (needsApproval) {
      // Trigger pharmacist gate (non-blocking — pharmacist uses PATCH /approve)
      requireApproval(sale._id).then(async (pharmacistId) => {
        await Sale.findByIdAndUpdate(sale._id, {
          approvalStatus: "approved",
          pharmacistId,
        });
      }).catch(async () => {
        await Sale.findByIdAndUpdate(sale._id, { approvalStatus: "rejected" });
      });

      return res.status(202).json({
        message: "Sale pending pharmacist approval",
        saleId: sale._id,
        approvalStatus: "pending",
      });
    }

    res.status(201).json(sale);
  })
);

// PATCH /api/sales/:id/approve - pharmacist approves or rejects
router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("pharmacist"),
  validate(approveSchema),
  asyncHandler(async (req, res) => {
    const { approved } = req.body;
    const saleId = req.params.id;

    const resolved = resolveApproval(saleId, approved, req.user.sub);

    if (!resolved) {
      // Gate already resolved (timeout or already processed) — update directly
      const sale = await Sale.findByIdAndUpdate(
        saleId,
        {
          approvalStatus: approved ? "approved" : "rejected",
          pharmacistId: approved ? req.user.sub : null,
        },
        { new: true }
      );
      if (!sale) throw new ApiError(404, "Sale not found");
      return res.json(sale);
    }

    res.json({ message: approved ? "Sale approved" : "Sale rejected", saleId });
  })
);

// GET /api/sales
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { from, to, cashierId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (cashierId) filter.cashierId = cashierId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .populate("cashierId", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Sale.countDocuments(filter),
    ]);

    res.json({ sales, total, page: parseInt(page), limit: parseInt(limit) });
  })
);

// GET /api/sales/:id/invoice
router.get(
  "/:id/invoice",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id)
      .populate("cashierId", "fullName")
      .lean();
    if (!sale) throw new ApiError(404, "Sale not found");
    if (!sale.invoice) throw new ApiError(404, "Invoice not found for this sale");
    res.json(sale);
  })
);

export default router;
