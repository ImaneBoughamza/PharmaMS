import Delivery from "../models/Delivery.model.js";
import Supplier from "../models/Supplier.model.js";
import Order from "../models/Order.model.js";
import Medicine from "../models/Medicine.model.js";
import Batch from "../models/Batch.model.js";
import ParapharmacyBatch from "../models/ParapharmacyBatch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse, buildDateFilter } from "./controllerUtils.js";

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.query.supplierId) filter.supplierId = req.query.supplierId;
  const date = buildDateFilter(req.query);
  if (date) filter.deliveryDate = date;

  const [deliveries, total] = await Promise.all([
    Delivery.find(filter).populate("supplierId", "name").populate("receivedBy", "fullName").sort({ deliveryDate: -1 }).skip(skip).limit(limit).lean(),
    Delivery.countDocuments(filter),
  ]);
  paginatedResponse(res, deliveries, total, page, limit);
});

export const create = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.body.supplierId, pharmacyId: req.user.pharmacyId, isActive: true });
  if (!supplier) throw ApiError.notFound("Supplier not found");
  if (req.body.orderId) {
    const order = await Order.findOne({ _id: req.body.orderId, pharmacyId: req.user.pharmacyId });
    if (!order) throw ApiError.notFound("Order not found");
  }

  const medicineItems = [];
  const createdBatchIds = [];
  for (const item of req.body.medicineItems || []) {
    const medicine = await Medicine.findOne({ _id: item.medicineId, pharmacyId: req.user.pharmacyId, isActive: true });
    if (!medicine) throw ApiError.notFound("Medicine not found");
    const duplicate = await Batch.findOne({ pharmacyId: req.user.pharmacyId, medicineId: item.medicineId, batchNumber: item.batchNumber });
    if (duplicate) throw ApiError.conflict("Batch number already exists for this medicine");
    const batch = await Batch.create({
      pharmacyId: req.user.pharmacyId,
      medicineId: item.medicineId,
      deliveryId: null,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
      initialQty: item.receivedQty,
      remainingQty: item.receivedQty,
    });
    createdBatchIds.push(batch._id);
    medicineItems.push({ ...item, batchId: batch._id });
  }

  const parapharmacyItems = [];
  const createdParapharmacyBatchIds = [];
  for (const [index, item] of (req.body.parapharmacyItems || []).entries()) {
    const product = await ParapharmacyProduct.findOne({ _id: item.productId, pharmacyId: req.user.pharmacyId, isActive: true });
    if (!product) throw ApiError.notFound("Parapharmacy product not found");
    await ParapharmacyProduct.updateOne({ _id: product._id }, { $inc: { stockQty: item.receivedQty } });

    const batchNumber = `PAR-${Date.now().toString(36).toUpperCase()}-${index + 1}`;
    const batch = await ParapharmacyBatch.create({
      pharmacyId: req.user.pharmacyId,
      productId: product._id,
      deliveryId: null,
      batchNumber,
      receivedAt: req.body.deliveryDate || new Date(),
      purchasePrice: item.purchasePrice,
      salePrice: product.salePrice,
      initialQty: item.receivedQty,
      remainingQty: item.receivedQty,
      source: "delivery",
    });
    createdParapharmacyBatchIds.push(batch._id);
    parapharmacyItems.push({ ...item, batchId: batch._id, batchNumber });
  }

  const delivery = await Delivery.create({
    pharmacyId: req.user.pharmacyId,
    supplierId: req.body.supplierId,
    receivedBy: req.user.userId,
    orderId: req.body.orderId || null,
    medicineItems,
    parapharmacyItems,
    deliveryDate: req.body.deliveryDate || new Date(),
    notes: req.body.notes,
  });

  await Batch.updateMany({ _id: { $in: createdBatchIds } }, { deliveryId: delivery._id });
  await ParapharmacyBatch.updateMany({ _id: { $in: createdParapharmacyBatchIds } }, { deliveryId: delivery._id });
  if (req.body.orderId) await Order.updateOne({ _id: req.body.orderId }, { status: "received" });

  req.auditLog = {
    action: "DELIVERY_RECORDED",
    entity: "deliveries",
    entityId: delivery._id,
    payload: { supplierId: delivery.supplierId, medicineItemsCount: medicineItems.length, parapharmacyItemsCount: delivery.parapharmacyItems.length },
  };
  res.status(201).json({ success: true, data: delivery });
});
