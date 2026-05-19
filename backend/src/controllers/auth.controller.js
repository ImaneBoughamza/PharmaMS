import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import AuditLog from "../models/AuditLog.model.js";
import ApiError from "../utils/ApiError.js";
import { getRedis } from "../config/redis.js";
import { asyncController } from "./controllerUtils.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  pharmacyId: user.pharmacyId,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const signAccessToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      sub: user._id.toString(),
      pharmacyId: user.pharmacyId.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      sub: user._id.toString(),
      pharmacyId: user.pharmacyId.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

export const register = asyncController(async (req, res) => {
  const existingPharmacist = await User.findOne({ role: "pharmacist" });
  if (existingPharmacist) {
    throw ApiError.conflict("A pharmacy account already exists");
  }

  const pharmacyId = new mongoose.Types.ObjectId();
  const passwordHash = await User.hashPassword(req.body.password);

  const user = await User.create({
    pharmacyId,
    fullName: req.body.fullName,
    email: req.body.email,
    passwordHash,
    role: "pharmacist",
  });

  res.status(201).json({
    success: true,
    data: sanitizeUser(user),
  });
});

export const login = asyncController(async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    pharmacyId: { $ne: null },
    isActive: true,
  }).select("+passwordHash");

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordOk = await user.comparePassword(req.body.password);
  if (!passwordOk) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  AuditLog.create({
    pharmacyId: user.pharmacyId,
    userId: user._id,
    action: "LOGIN",
    entity: "users",
    entityId: user._id,
    payload: { email: user.email, role: user.role },
  }).catch(() => {});

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const safeUser = sanitizeUser(user);

  res.status(200).json({
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    user: safeUser,
    data: {
      accessToken,
      refreshToken,
      token: accessToken,
      user: safeUser,
    },
  });
});

export const refresh = asyncController(async (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = jwt.sign(
    {
      userId: decoded.userId ?? decoded.sub,
      sub: decoded.userId ?? decoded.sub,
      pharmacyId: decoded.pharmacyId,
      role: decoded.role,
      email: decoded.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  res.status(200).json({ success: true, data: { accessToken } });
});

export const logout = asyncController(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    const decoded = jwt.decode(token);
    const ttl = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : 900;
    const redis = getRedis();
    if (redis) {
      await redis.set(`session:${token}`, "blacklisted", "EX", ttl);
    }
  }

  req.auditLog = {
    action: "LOGOUT",
    entity: "users",
    entityId: req.user.userId,
    payload: {},
  };

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const changePassword = asyncController(async (req, res) => {
  const user = await User.findById(req.user.userId).select("+passwordHash");
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const passwordOk = await user.comparePassword(req.body.currentPassword);
  if (!passwordOk) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  user.passwordHash = await User.hashPassword(req.body.newPassword);
  user.mustChangePassword = false;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated" });
});

export const me = asyncController(async (req, res) => {
  const user = await User.findOne({
    _id: req.user.userId,
    pharmacyId: req.user.pharmacyId,
  }).select("-passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  res.status(200).json({ success: true, data: sanitizeUser(user) });
});
