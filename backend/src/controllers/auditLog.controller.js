import AuditLog from "../models/AuditLog.model.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query, 50);
  const filter = { pharmacyId: req.user.pharmacyId };
  const from = req.query.dateFrom ? new Date(req.query.dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const to = req.query.dateTo ? new Date(req.query.dateTo) : new Date();
  filter.createdAt = { $gte: from, $lte: to };
  if (req.query.action) filter.action = req.query.action;
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.entity) filter.entity = req.query.entity;
  if (req.query.search) filter.action = new RegExp(req.query.search, "i");

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate("userId", "fullName role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  paginatedResponse(res, logs, total, page, limit);
});
