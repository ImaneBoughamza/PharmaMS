import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

const sanitize = (user) => {
  const object = user.toObject ? user.toObject() : user;
  delete object.passwordHash;
  return object;
};

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === "deactivated") filter.isActive = false;
  else if (req.query.status === "active") filter.isActive = true;
  if (req.query.search) filter.$or = [
    { fullName: new RegExp(req.query.search, "i") },
    { email: new RegExp(req.query.search, "i") },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).select("-passwordHash").sort({ fullName: 1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  paginatedResponse(res, users, total, page, limit);
});

export const create = asyncController(async (req, res) => {
  if (req.body.role === "pharmacist") throw ApiError.badRequest("Cannot create additional pharmacist accounts");
  const duplicate = await User.findOne({ pharmacyId: req.user.pharmacyId, email: req.body.email });
  if (duplicate) throw ApiError.conflict("Email already exists");
  const user = await User.create({
    pharmacyId: req.user.pharmacyId,
    fullName: req.body.fullName,
    email: req.body.email,
    role: req.body.role,
    passwordHash: await User.hashPassword(req.body.password),
    mustChangePassword: true,
  });
  req.auditLog = { action: "USER_CREATED", entity: "users", entityId: user._id, payload: { fullName: user.fullName, email: user.email, role: user.role } };
  res.status(201).json({ success: true, data: sanitize(user) });
});

export const update = asyncController(async (req, res) => {
  if (req.body.role === "pharmacist") throw ApiError.badRequest("Cannot assign pharmacist role");
  if (String(req.params.id) === String(req.user.userId) && req.body.role) throw ApiError.forbidden("Cannot change your own role");
  if (req.body.email) {
    const duplicate = await User.findOne({ pharmacyId: req.user.pharmacyId, email: req.body.email, _id: { $ne: req.params.id } });
    if (duplicate) throw ApiError.conflict("Email already exists");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, pharmacyId: req.user.pharmacyId },
    { $set: req.body },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  req.auditLog = { action: "USER_MODIFIED", entity: "users", entityId: user._id, payload: req.body };
  res.status(200).json({ success: true, data: sanitize(user) });
});

export const resetPassword = asyncController(async (req, res) => {
  if (String(req.params.id) === String(req.user.userId)) {
    throw ApiError.badRequest("Use change password to update your own password");
  }
  const user = await User.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId }).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  user.passwordHash = await User.hashPassword(req.body.newPassword);
  user.mustChangePassword = true;
  await user.save();
  req.auditLog = { action: "PASSWORD_RESET", entity: "users", entityId: user._id, payload: { targetUserId: user._id } };
  res.status(200).json({ success: true, message: "Password reset - user must change on next login" });
});

export const deactivate = asyncController(async (req, res) => {
  if (String(req.params.id) === String(req.user.userId)) {
    throw ApiError.badRequest("Cannot deactivate your own account");
  }

  const user = await User.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!user) throw ApiError.notFound("User not found");
  if (!user.isActive) throw ApiError.badRequest("User is already deactivated");

  user.isActive = false;
  await user.save();

  req.auditLog = {
    action: "USER_DEACTIVATED",
    entity: "users",
    entityId: user._id,
    payload: { fullName: user.fullName, email: user.email, role: user.role },
  };

  res.status(200).json({ success: true, data: sanitize(user) });
});

export const reactivate = asyncController(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!user) throw ApiError.notFound("User not found");
  if (user.isActive) throw ApiError.badRequest("User is already active");

  user.isActive = true;
  await user.save();

  req.auditLog = {
    action: "USER_REACTIVATED",
    entity: "users",
    entityId: user._id,
    payload: { fullName: user.fullName, email: user.email, role: user.role },
  };

  res.status(200).json({ success: true, data: sanitize(user) });
});
