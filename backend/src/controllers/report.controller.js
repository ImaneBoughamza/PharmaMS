import Sale from "../models/Sale.model.js";
import Medicine from "../models/Medicine.model.js";
import Batch from "../models/Batch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import { asyncController, buildDateFilter } from "./controllerUtils.js";

export const salesReport = asyncController(async (req, res) => {
  const filter = { pharmacyId: req.user.pharmacyId };
  const date = buildDateFilter(req.query);
  if (date) filter.createdAt = date;
  const sales = await Sale.find(filter).populate("cashierId", "fullName").lean();
  const active = sales.filter((sale) => sale.approvalStatus !== "voided");

  const medicineTotals = new Map();
  const parapharmacyTotals = new Map();
  active.forEach((sale) => {
    sale.items.forEach((item) => medicineTotals.set(String(item.medicineId), (medicineTotals.get(String(item.medicineId)) || 0) + item.qty));
    sale.parapharmacyItems.forEach((item) => parapharmacyTotals.set(String(item.productId), (parapharmacyTotals.get(String(item.productId)) || 0) + item.qty));
  });

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: active.reduce((sum, sale) => sum + sale.totalAmount, 0),
      medicineRevenue: active.reduce((sum, sale) => sum + (sale.invoice?.medicineSubtotal || 0), 0),
      parapharmacyRevenue: active.reduce((sum, sale) => sum + (sale.invoice?.parapharmacySubtotal || 0), 0),
      cashRevenue: active.filter((sale) => sale.paymentMethod === "cash").reduce((sum, sale) => sum + sale.totalAmount, 0),
      cardRevenue: active.filter((sale) => sale.paymentMethod === "card").reduce((sum, sale) => sum + sale.totalAmount, 0),
      saleCount: active.length,
      voidedCount: sales.length - active.length,
      voidedAmount: sales.filter((sale) => sale.approvalStatus === "voided").reduce((sum, sale) => sum + sale.totalAmount, 0),
      chartData: [],
      staffBreakdown: [],
      topMedicines: [...medicineTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
      topParapharmacyProducts: [...parapharmacyTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    },
  });
});

export const stockReport = asyncController(async (req, res) => {
  const [medicines, batches, parapharmacy] = await Promise.all([
    Medicine.find({ pharmacyId: req.user.pharmacyId, isActive: true }).lean(),
    Batch.find({ pharmacyId: req.user.pharmacyId, isActive: true }).lean(),
    ParapharmacyProduct.find({ pharmacyId: req.user.pharmacyId, isActive: true }).lean(),
  ]);

  const medicinesWithStock = medicines.map((medicine) => {
    const medicineBatches = batches.filter((batch) => String(batch.medicineId) === String(medicine._id));
    const totalStock = medicineBatches.reduce((sum, batch) => sum + batch.remainingQty, 0);
    return {
      ...medicine,
      totalStock,
      nearestExpiry: medicineBatches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate || null,
      batches: medicineBatches,
    };
  });

  const now = new Date();
  const near = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  res.status(200).json({
    success: true,
    data: {
      medicines: medicinesWithStock,
      parapharmacy,
      lowStockMedicines: medicinesWithStock.filter((item) => item.totalStock < item.minStockLevel),
      lowStockParapharmacy: parapharmacy.filter((item) => item.stockQty < item.minStockLevel),
      nearExpiryBatches: batches.filter((batch) => batch.remainingQty > 0 && batch.expiryDate > now && batch.expiryDate <= near),
      inventoryValues: {
        medicineValue: batches.reduce((sum, batch) => sum + batch.remainingQty * batch.purchasePrice, 0),
        parapharmacyValue: parapharmacy.reduce((sum, product) => sum + product.stockQty * product.purchasePrice, 0),
      },
    },
  });
});
