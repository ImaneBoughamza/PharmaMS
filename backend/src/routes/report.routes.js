import express from "express";
import { Sale } from "../models/Sale.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { Batch } from "../models/Batch.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getNearExpiryBatches } from "../services/alert.service.js";

const router = express.Router();

// GET /api/reports/sales
router.get(
  "/sales",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Monthly aggregation
    const monthlySales = await Sale.aggregate([
      { $match: { ...dateFilter, approvalStatus: { $ne: "rejected" } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          saleCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top-selling medicines
    const topMedicines = await Sale.aggregate([
      { $match: { ...dateFilter, approvalStatus: { $ne: "rejected" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicineId",
          medicineName: { $first: "$items.medicineName" },
          totalQty: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.unitPrice"] } },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    res.json({ monthlySales, topMedicines });
  })
);

// GET /api/reports/expiry
router.get(
  "/expiry",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const batches = await getNearExpiryBatches(days);
    res.json({ batches, expiryWindowDays: days });
  })
);

// GET /api/reports/stock [PROVISIONAL-3]
// TODO: confirm if this belongs here or in a separate stock report building block
router.get(
  "/stock",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({ isActive: true }).lean();

    const cutoff30 = new Date();
    cutoff30.setDate(cutoff30.getDate() + 30);

    const stockReport = await Promise.all(
      medicines.map(async (med) => {
        const batches = await Batch.find({ medicineId: med._id }).lean();
        const availableBatches = batches.filter((b) => b.remainingQty > 0);
        const totalStock = availableBatches.reduce((s, b) => s + b.remainingQty, 0);
        const totalValue = availableBatches.reduce(
          (s, b) => s + b.remainingQty * b.purchasePrice,
          0
        );
        const nearExpiryBatches = availableBatches.filter(
          (b) => new Date(b.expiryDate) <= cutoff30
        );
        const isLowStock = totalStock <= med.minStockLevel;

        return {
          medicine: med,
          totalStock,
          totalValue,
          isLowStock,
          nearExpiryBatches,
          batchCount: batches.length,
        };
      })
    );

    const totalInventoryValue = stockReport.reduce((s, r) => s + r.totalValue, 0);

    res.json({ stockReport, totalInventoryValue });
  })
);

export default router;
