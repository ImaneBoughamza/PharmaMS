import Sale from "../models/Sale.model.js";
import Reservation from "../models/Reservation.model.js";
import Delivery from "../models/Delivery.model.js";
import AuditLog from "../models/AuditLog.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncController, pagination, paginatedResponse, buildDateFilter } from "./controllerUtils.js";

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { start, end: new Date() };
};

export const list = asyncController(async (req, res) => {
  const { page, limit } = pagination(req.query);
  const date = buildDateFilter(req.query);
  const base = { pharmacyId: req.user.pharmacyId };
  if (date) base.createdAt = date;

  const [sales, reservations, deliveries] = await Promise.all([
    !req.query.type || req.query.type === "sale"
      ? Sale.find(base)
          .populate("cashierId", "fullName role")
          .populate("items.medicineId", "name category")
          .populate("items.batchId", "batchNumber")
          .populate("parapharmacyItems.productId", "name brand category")
          .lean()
      : [],
    !req.query.type || req.query.type === "reservation" ? Reservation.find(base).lean() : [],
    !req.query.type || req.query.type === "delivery" ? Delivery.find(base).populate("receivedBy", "fullName").lean() : [],
  ]);

  const merged = [
    ...sales.map((sale) => {
      const medicineItems = sale.items.map((item) => ({
        productName: item.medicineId?.name || item.medicineName || "Medicine",
        productType: "medicine",
        batchNumber: item.batchId?.batchNumber,
        qty: item.qty,
        unitPrice: item.unitPrice,
      }));
      const parapharmacyItems = sale.parapharmacyItems.map((item) => ({
        productName: item.productId?.name || "Parapharmacy product",
        productType: "parapharmacy",
        qty: item.qty,
        unitPrice: item.unitPrice,
      }));
      return {
        _id: sale._id,
        _type: "sale",
        type: "sale",
        reference: sale.invoice?.receiptNumber,
        receiptNumber: sale.invoice?.receiptNumber,
        createdAt: sale.createdAt,
        date: sale.createdAt,
        amount: sale.totalAmount,
        status: sale.approvalStatus === "voided" ? "voided" : "completed",
        staff: sale.cashierId,
        staffName: sale.cashierId?.fullName || "Staff",
        cashierName: sale.cashierId?.fullName || "Staff",
        paymentMethod: sale.paymentMethod === "card" ? "Card" : "Cash",
        productTypes: [
          ...(medicineItems.length ? ["medicine"] : []),
          ...(parapharmacyItems.length ? ["parapharmacy"] : []),
        ],
        items: [...medicineItems, ...parapharmacyItems],
        voidReason: sale.voidReason,
      };
    }),
    ...reservations.map((reservation) => ({
      _id: reservation._id,
      _type: "reservation",
      type: "reservation",
      reference: reservation.confirmationCode,
      confirmationCode: reservation.confirmationCode,
      createdAt: reservation.createdAt,
      date: reservation.createdAt,
      amount: 0,
      status: reservation.status,
      staffName: "Customer",
      productTypes: ["medicine"],
      items: reservation.items || [],
    })),
    ...deliveries.map((delivery) => ({
      _id: delivery._id,
      _type: "delivery",
      type: "delivery",
      reference: delivery.reference || delivery._id,
      createdAt: delivery.deliveryDate || delivery.createdAt,
      date: delivery.deliveryDate || delivery.createdAt,
      amount: 0,
      status: "received",
      staff: delivery.receivedBy,
      staffName: delivery.receivedBy?.fullName || "Staff",
      productTypes: [
        ...(delivery.medicineItems?.length ? ["medicine"] : []),
        ...(delivery.parapharmacyItems?.length ? ["parapharmacy"] : []),
      ],
      itemCount: (delivery.medicineItems?.length || 0) + (delivery.parapharmacyItems?.length || 0),
      medicineItems: delivery.medicineItems || [],
      parapharmacyItems: delivery.parapharmacyItems || [],
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const start = (page - 1) * limit;
  paginatedResponse(res, merged.slice(start, start + limit), merged.length, page, limit);
});

export const summary = asyncController(async (req, res) => {
  const date = buildDateFilter(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (date) filter.createdAt = date;

  const [sales, reservations, deliveries] = await Promise.all([
    Sale.find(filter).lean(),
    Reservation.find(filter).lean(),
    Delivery.find(filter).lean(),
  ]);

  const nonVoided = sales.filter((sale) => sale.approvalStatus !== "voided");
  res.status(200).json({
    success: true,
    data: {
      sales: {
        totalRevenue: nonVoided.reduce((sum, sale) => sum + sale.totalAmount, 0),
        medicineSubtotal: nonVoided.reduce((sum, sale) => sum + (sale.invoice?.medicineSubtotal || 0), 0),
        parapharmacySubtotal: nonVoided.reduce((sum, sale) => sum + (sale.invoice?.parapharmacySubtotal || 0), 0),
        cashCount: nonVoided.filter((sale) => sale.paymentMethod === "cash").length,
        cardCount: nonVoided.filter((sale) => sale.paymentMethod === "card").length,
        voidedCount: sales.length - nonVoided.length,
      },
      reservations: reservations.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {}),
      deliveries: { total: deliveries.length },
    },
  });
});

export const getReconciliation = asyncController(async (req, res) => {
  const { start, end } = todayRange();
  const filter = { pharmacyId: req.user.pharmacyId, createdAt: { $gte: start, $lte: end } };
  const [sales, reservations, deliveries, closed] = await Promise.all([
    Sale.find(filter).lean(),
    Reservation.find(filter).lean(),
    Delivery.find(filter).lean(),
    AuditLog.findOne({ pharmacyId: req.user.pharmacyId, action: "DAY_CLOSED", createdAt: { $gte: start, $lte: end } }),
  ]);
  const completed = sales.filter((sale) => sale.approvalStatus !== "voided");
  const totalRevenue = completed.reduce((sum, sale) => sum + sale.totalAmount, 0);
  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      cashRevenue: completed.filter((sale) => sale.paymentMethod === "cash").reduce((sum, sale) => sum + sale.totalAmount, 0),
      cardRevenue: completed.filter((sale) => sale.paymentMethod === "card").reduce((sum, sale) => sum + sale.totalAmount, 0),
      voidedCount: sales.length - completed.length,
      voidedAmount: sales.filter((sale) => sale.approvalStatus === "voided").reduce((sum, sale) => sum + sale.totalAmount, 0),
      saleCount: completed.length,
      reservationsByStatus: reservations.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {}),
      deliveriesCount: deliveries.length,
      expectedRevenue: totalRevenue,
      recordedRevenue: totalRevenue,
      discrepancy: 0,
      isClosed: Boolean(closed),
    },
  });
});

export const closeDay = asyncController(async (req, res) => {
  const { start, end } = todayRange();
  const existing = await AuditLog.findOne({ pharmacyId: req.user.pharmacyId, action: "DAY_CLOSED", createdAt: { $gte: start, $lte: end } });
  if (existing) throw ApiError.conflict("Today has already been closed");
  const sales = await Sale.find({ pharmacyId: req.user.pharmacyId, createdAt: { $gte: start, $lte: end }, approvalStatus: { $ne: "voided" } });
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  req.auditLog = { action: "DAY_CLOSED", entity: "system", entityId: null, payload: { date: start, totalRevenue, closedBy: req.user.userId } };
  res.status(200).json({ success: true, message: "Day closed successfully", data: { timestamp: new Date() } });
});
