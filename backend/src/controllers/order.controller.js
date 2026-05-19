import Order from "../models/Order.model.js";
import Supplier from "../models/Supplier.model.js";
import Medicine from "../models/Medicine.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import Batch from "../models/Batch.model.js";
import ParapharmacyBatch from "../models/ParapharmacyBatch.model.js";
import Delivery from "../models/Delivery.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse, buildDateFilter } from "./controllerUtils.js";

const enrichOrders = async (orders) =>
  Promise.all(
    orders.map(async (order) => {
      const ProductModel = order.productType === "medicine" ? Medicine : ParapharmacyProduct;
      const ids = order.items.map((item) => item.productId);
      const products = await ProductModel.find({ _id: { $in: ids } }).select("name brand category").lean();
      const productMap = new Map(products.map((product) => [product._id.toString(), product]));

      return {
        ...order,
        supplier: order.supplierId,
        supplierName: order.supplierId?.name || "Unknown supplier",
        items: order.items.map((item) => {
          const product = productMap.get(item.productId.toString());
          return {
            ...item,
            product,
            productName: product?.name || "Unknown product",
          };
        }),
      };
    })
  );

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.query.productType) filter.productType = req.query.productType;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.supplierId) filter.supplierId = req.query.supplierId;
  const date = buildDateFilter(req.query);
  if (date) filter.createdAt = date;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate("supplierId", "name type").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  paginatedResponse(res, await enrichOrders(orders), total, page, limit);
});

export const create = asyncController(async (req, res) => {
  const supplier = await Supplier.findOne({
    _id: req.body.supplierId,
    pharmacyId: req.user.pharmacyId,
    isActive: true,
  });
  if (!supplier) throw ApiError.notFound("Supplier not found");

  const ProductModel = req.body.productType === "medicine" ? Medicine : ParapharmacyProduct;
  const productIds = req.body.items.map((item) => item.productId);
  const products = await ProductModel.find({
    _id: { $in: productIds },
    pharmacyId: req.user.pharmacyId,
    isActive: true,
  });
  if (products.length !== productIds.length) throw ApiError.badRequest("One or more products are invalid");

  const order = await Order.create({
    pharmacyId: req.user.pharmacyId,
    supplierId: req.body.supplierId,
    createdBy: req.user.userId,
    productType: req.body.productType,
    items: req.body.items,
    status: "ordered",
    notes: req.body.notes,
  });

  req.auditLog = {
    action: "ORDER_CREATED",
    entity: "orders",
    entityId: order._id,
    payload: { supplierId: order.supplierId, productType: order.productType, itemsCount: order.items.length },
  };
  res.status(201).json({ success: true, data: order });
});

export const update = asyncController(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, pharmacyId: req.user.pharmacyId });
  if (!order) throw ApiError.notFound("Order not found");
  if (order.status !== "ordered") throw ApiError.badRequest("Only ordered orders can be updated");

  if (req.body.status === "received") {
    const supplier = await Supplier.findOne({
      _id: order.supplierId,
      pharmacyId: req.user.pharmacyId,
      isActive: true,
    });
    if (!supplier) throw ApiError.notFound("Supplier not found");

    if (order.productType === "medicine") {
      const medicines = await Medicine.find({
        _id: { $in: order.items.map((item) => item.productId) },
        pharmacyId: req.user.pharmacyId,
        isActive: true,
      });
      const medicineMap = new Map(medicines.map((medicine) => [medicine._id.toString(), medicine]));
      if (medicines.length !== order.items.length) throw ApiError.badRequest("One or more medicines are invalid");

      const medicineItems = [];
      for (const [index, item] of order.items.entries()) {
        const medicine = medicineMap.get(item.productId.toString());
        const batchNumber = `PO-${order._id.toString().slice(-6).toUpperCase()}-${index + 1}`;
        const batch = await Batch.create({
          pharmacyId: req.user.pharmacyId,
          medicineId: medicine._id,
          deliveryId: null,
          batchNumber,
          expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
          purchasePrice: medicine.purchasePrice,
          salePrice: medicine.salePrice,
          initialQty: item.orderedQty,
          remainingQty: item.orderedQty,
        });
        medicineItems.push({
          medicineId: medicine._id,
          batchNumber,
          expiryDate: batch.expiryDate,
          receivedQty: item.orderedQty,
          purchasePrice: medicine.purchasePrice,
          salePrice: medicine.salePrice,
          batchId: batch._id,
        });
      }

      const delivery = await Delivery.create({
        pharmacyId: req.user.pharmacyId,
        supplierId: order.supplierId,
        receivedBy: req.user.userId,
        orderId: order._id,
        medicineItems,
        parapharmacyItems: [],
        deliveryDate: new Date(),
        notes: `Received from purchase order ${order._id}`,
      });

      await Batch.updateMany(
        { _id: { $in: medicineItems.map((item) => item.batchId) } },
        { deliveryId: delivery._id }
      );
    } else {
      const products = await ParapharmacyProduct.find({
        _id: { $in: order.items.map((item) => item.productId) },
        pharmacyId: req.user.pharmacyId,
        isActive: true,
      });
      const productMap = new Map(products.map((product) => [product._id.toString(), product]));
      if (products.length !== order.items.length) throw ApiError.badRequest("One or more parapharmacy products are invalid");

      const parapharmacyItems = [];
      for (const [index, item] of order.items.entries()) {
        const product = productMap.get(item.productId.toString());
        const batchNumber = `PO-PAR-${order._id.toString().slice(-6).toUpperCase()}-${index + 1}`;
        const [batch] = await ParapharmacyBatch.create([
          {
            pharmacyId: req.user.pharmacyId,
            productId: item.productId,
            deliveryId: null,
            batchNumber,
            receivedAt: new Date(),
            purchasePrice: product?.purchasePrice || 0,
            salePrice: product?.salePrice || 0,
            initialQty: item.orderedQty,
            remainingQty: item.orderedQty,
            source: "order",
          },
        ]);

        await ParapharmacyProduct.updateOne(
          { _id: item.productId, pharmacyId: req.user.pharmacyId },
          { $inc: { stockQty: item.orderedQty } }
        );

        parapharmacyItems.push({
          productId: item.productId,
          receivedQty: item.orderedQty,
          purchasePrice: product?.purchasePrice || 0,
          batchNumber,
          batchId: batch._id,
        });
      }

      const delivery = await Delivery.create({
        pharmacyId: req.user.pharmacyId,
        supplierId: order.supplierId,
        receivedBy: req.user.userId,
        orderId: order._id,
        medicineItems: [],
        parapharmacyItems,
        deliveryDate: new Date(),
        notes: `Received from purchase order ${order._id}`,
      });

      await ParapharmacyBatch.updateMany(
        { _id: { $in: parapharmacyItems.map((item) => item.batchId) } },
        { deliveryId: delivery._id }
      );
    }
  }

  order.status = req.body.status;
  await order.save();

  req.auditLog = {
    action: "ORDER_STATUS_UPDATED",
    entity: "orders",
    entityId: order._id,
    payload: { status: order.status, productType: order.productType, itemsCount: order.items.length },
  };

  const [enriched] = await enrichOrders([
    await Order.findById(order._id).populate("supplierId", "name type").lean(),
  ]);
  res.status(200).json({ success: true, data: enriched });
});
