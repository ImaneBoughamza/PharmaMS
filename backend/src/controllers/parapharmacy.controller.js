import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import Supplier from "../models/Supplier.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse } from "./controllerUtils.js";

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === "deactivated") filter.isActive = false;
  else if (req.query.status !== "all") filter.isActive = true;
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.stock === "low") filter.$expr = { $lt: ["$stockQty", "$minStockLevel"] };

  const [products, total] = await Promise.all([
    ParapharmacyProduct.find(filter).populate("supplierId", "name").sort(req.query.sort || { name: 1 }).skip(skip).limit(limit).lean(),
    ParapharmacyProduct.countDocuments(filter),
  ]);
  paginatedResponse(res, products, total, page, limit);
});

export const getById = asyncController(async (req, res) => {
  const product = await ParapharmacyProduct.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  }).populate("supplierId", "name").lean();
  if (!product) throw ApiError.notFound("Parapharmacy product not found");
  res.status(200).json({ success: true, data: product });
});

export const create = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({
    _id: req.body.supplierId,
    pharmacyId: req.user.pharmacyId,
    isActive: true,
  });
  if (!supplier) throw ApiError.notFound("Supplier not found");

  const product = await ParapharmacyProduct.create({
    ...req.body,
    pharmacyId: req.user.pharmacyId,
  });

  req.auditLog = {
    action: "PARAPHARMACY_REGISTERED",
    entity: "parapharmacyProducts",
    entityId: product._id,
    payload: { name: product.name, category: product.category, supplierId: product.supplierId },
  };
  res.status(201).json({ success: true, data: product });
});

export const update = asyncController(async (req, res) => {
  if (req.body.supplierId) {
    const supplier = await Supplier.findOne({
      _id: req.body.supplierId,
      pharmacyId: req.user.pharmacyId,
      isActive: true,
    });
    if (!supplier) throw ApiError.notFound("Supplier not found");
  }

  const product = await ParapharmacyProduct.findOneAndUpdate(
    { _id: req.params.id, pharmacyId: req.user.pharmacyId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!product) throw ApiError.notFound("Parapharmacy product not found");

  req.auditLog = {
    action: "PARAPHARMACY_UPDATED",
    entity: "parapharmacyProducts",
    entityId: product._id,
    payload: req.body,
  };
  res.status(200).json({ success: true, data: product });
});

export const deactivate = asyncController(async (req, res) => {
  const product = await ParapharmacyProduct.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!product) throw ApiError.notFound("Parapharmacy product not found");
  if (!product.isActive) throw ApiError.badRequest("Product is already deactivated");
  product.isActive = false;
  await product.save();
  req.auditLog = { action: "PARAPHARMACY_DEACTIVATED", entity: "parapharmacyProducts", entityId: product._id };
  res.status(200).json({ success: true, message: "Product deactivated" });
});

export const reactivate = asyncController(async (req, res) => {
  const product = await ParapharmacyProduct.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!product) throw ApiError.notFound("Parapharmacy product not found");
  if (product.isActive) throw ApiError.badRequest("Product is already active");
  product.isActive = true;
  await product.save();
  req.auditLog = { action: "PARAPHARMACY_REACTIVATED", entity: "parapharmacyProducts", entityId: product._id };
  res.status(200).json({ success: true, data: product });
});
