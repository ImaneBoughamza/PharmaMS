import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/audit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["pharmacist", "assistant", "cashier"]),
  phone: z.string().optional().default(""),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["pharmacist", "assistant", "cashier"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/users
router.get(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    res.json(users);
  })
);

// POST /api/users
router.post(
  "/",
  requireAuth,
  requireRole("pharmacist"),
  validate(createUserSchema),
  auditLog({ action: "CREATE_USER", entity: "User", getId: (req, body) => body?._id }),
  asyncHandler(async (req, res) => {
    const { password, ...userData } = req.body;

    const exists = await User.findOne({ email: userData.email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ ...userData, passwordHash });

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
    });
  })
);

// PATCH /api/users/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("pharmacist"),
  validate(updateUserSchema),
  auditLog({ action: "UPDATE_USER", entity: "User", getId: (req) => req.params.id }),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select(
      "-passwordHash"
    );
    if (!user) throw new ApiError(404, "User not found");
    res.json(user);
  })
);

export default router;
