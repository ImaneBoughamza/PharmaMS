import express from "express";
import { AuditLog } from "../models/AuditLog.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/audit-logs
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const { search, entity, from, to, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (entity) filter.entity = entity;
    if (search) filter.action = { $regex: search, $options: "i" };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "fullName email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  })
);

export default router;
