import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getOTCSuggestion } from "../services/ai.service.js";

const router = express.Router();

const suggestSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

// POST /api/ai/suggest
router.post(
  "/suggest",
  requireAuth,
  requireRole("pharmacist", "assistant"),
  validate(suggestSchema),
  asyncHandler(async (req, res) => {
    const suggestion = await getOTCSuggestion(req.body.prompt);
    res.json({ suggestion });
  })
);

export default router;
