// TODO [PROVISIONAL-2]: scope, filters, and access roles to be confirmed with supervisor
import express from "express";
import { Sale } from "../models/Sale.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { Delivery } from "../models/Delivery.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/transactions - unified paginated list
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { from, to, type, page = 1, limit = 20 } = req.query;

    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    const fetchSales = !type || type === "sale";
    const fetchReservations = !type || type === "reservation";
    const fetchDeliveries = !type || type === "delivery";

    const [sales, reservations, deliveries] = await Promise.all([
      fetchSales
        ? Sale.find(dateFilter).populate("cashierId", "fullName").sort({ createdAt: -1 }).lean()
        : [],
      fetchReservations
        ? Reservation.find(dateFilter).sort({ createdAt: -1 }).lean()
        : [],
      fetchDeliveries
        ? Delivery.find(dateFilter).populate("supplierId", "name").sort({ createdAt: -1 }).lean()
        : [],
    ]);

    const combined = [
      ...sales.map((s) => ({ ...s, _type: "sale" })),
      ...reservations.map((r) => ({ ...r, _type: "reservation" })),
      ...deliveries.map((d) => ({ ...d, _type: "delivery" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = combined.slice(skip, skip + parseInt(limit));

    res.json({
      transactions: paginated,
      total: combined.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  })
);

// GET /api/transactions/summary
router.get(
  "/summary",
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

    const [salesAgg, reservationCount, deliveryCount] = await Promise.all([
      Sale.aggregate([
        { $match: { ...dateFilter, approvalStatus: { $ne: "rejected" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Reservation.countDocuments(dateFilter),
      Delivery.countDocuments(dateFilter),
    ]);

    res.json({
      sales: { total: salesAgg[0]?.total ?? 0, count: salesAgg[0]?.count ?? 0 },
      reservations: { count: reservationCount },
      deliveries: { count: deliveryCount },
    });
  })
);

export default router;
