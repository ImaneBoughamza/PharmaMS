import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "node:path";

import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Supplier from "../models/Supplier.model.js";
import Medicine from "../models/Medicine.model.js";
import Batch from "../models/Batch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import Order from "../models/Order.model.js";
import Delivery from "../models/Delivery.model.js";
import Customer from "../models/Customer.model.js";
import Reservation from "../models/Reservation.model.js";
import AiConsultation from "../models/AiConsultation.model.js";
import Sale from "../models/Sale.model.js";
import AuditLog from "../models/AuditLog.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const DEMO_PASSWORD = "PharmaOS2026";
const SEED = "demo";

const daysAgo = (days, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const daysFromNow = (days, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const seededNote = (text = "") => `[DEMO_SEED] ${text}`.trim();

const getDemoPharmacyId = async () => {
  const demoPharmacist = await User.findOne({ email: "pharmacist@pharmaos.ma" });
  if (demoPharmacist?.pharmacyId) return demoPharmacist.pharmacyId;

  const anyPharmacist = await User.findOne({ role: "pharmacist" });
  if (anyPharmacist?.pharmacyId) return anyPharmacist.pharmacyId;

  return new mongoose.Types.ObjectId();
};

const upsertUser = async ({ pharmacyId, fullName, email, role, phone, lastLoginAt }) => {
  const passwordHash = await User.hashPassword(DEMO_PASSWORD);
  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        pharmacyId,
        fullName,
        email,
        passwordHash,
        role,
        phone,
        isActive: true,
        mustChangePassword: false,
        lastLoginAt,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

const upsertSupplier = (pharmacyId, data) =>
  Supplier.findOneAndUpdate(
    { pharmacyId, name: data.name },
    { $set: { ...data, pharmacyId, isActive: data.isActive ?? true } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

const upsertMedicine = (pharmacyId, data) =>
  Medicine.findOneAndUpdate(
    { pharmacyId, name: data.name },
    { $set: { ...data, pharmacyId, isActive: data.isActive ?? true } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

const upsertParapharmacy = (pharmacyId, data) =>
  ParapharmacyProduct.findOneAndUpdate(
    { pharmacyId, name: data.name, brand: data.brand },
    { $set: { ...data, pharmacyId, isActive: data.isActive ?? true } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

const upsertCustomer = (pharmacyId, data) =>
  Customer.findOneAndUpdate(
    { pharmacyId, email: data.email },
    { $set: { ...data, pharmacyId, isActive: data.isActive ?? true } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

const createBatch = (pharmacyId, medicine, data) =>
  Batch.create({
    pharmacyId,
    medicineId: medicine._id,
    batchNumber: data.batchNumber,
    expiryDate: data.expiryDate,
    purchasePrice: data.purchasePrice ?? medicine.purchasePrice,
    salePrice: data.salePrice ?? medicine.salePrice,
    initialQty: data.initialQty,
    remainingQty: data.remainingQty,
    isActive: true,
  });

const saleMedicineItem = (batch, medicine, qty) => ({
  batchId: batch._id,
  medicineId: medicine._id,
  medicineName: medicine.name,
  qty,
  unitPrice: medicine.salePrice,
});

const saleParapharmacyItem = (product, qty) => ({
  productId: product._id,
  qty,
  unitPrice: product.salePrice,
});

const reservationItem = (product, productType, qty) => ({
  productType,
  productId: product._id,
  medicineId: productType === "medicine" ? product._id : null,
  qty,
});

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env before running the seed.");
  }

  await connectDB();

  const pharmacyId = await getDemoPharmacyId();

  const [pharmacist, assistant, cashier] = await Promise.all([
    upsertUser({
      pharmacyId,
      fullName: "Imane Boughamza",
      email: "pharmacist@pharmaos.ma",
      role: "pharmacist",
      phone: "+212 600 100 001",
      lastLoginAt: daysAgo(0, 8, 25),
    }),
    upsertUser({
      pharmacyId,
      fullName: "Youssef El Amrani",
      email: "assistant@pharmaos.ma",
      role: "assistant",
      phone: "+212 600 100 002",
      lastLoginAt: daysAgo(0, 9, 5),
    }),
    upsertUser({
      pharmacyId,
      fullName: "Sara Benali",
      email: "cashier@pharmaos.ma",
      role: "cashier",
      phone: "+212 600 100 003",
      lastLoginAt: daysAgo(0, 9, 40),
    }),
  ]);

  const seededReceiptNumbers = ["SAL-2026-DEMO-001", "SAL-2026-DEMO-002", "SAL-2026-DEMO-003"];
  const seededReservationCodes = [
    "RES-2026-DEMO-001",
    "RES-2026-DEMO-002",
    "RES-2026-DEMO-003",
    "RES-2026-DEMO-004",
    "RES-2026-DEMO-005",
  ];
  const seededBatchNumbers = [
    "BN-DEMO-DOL-001",
    "BN-DEMO-AMOX-001",
    "BN-DEMO-IBU-001",
    "BN-DEMO-VENT-001",
    "BN-DEMO-CET-001",
  ];

  await Promise.all([
    AuditLog.deleteMany({ pharmacyId, "payload.seed": SEED }),
    Sale.deleteMany({ pharmacyId, "invoice.receiptNumber": { $in: seededReceiptNumbers } }),
    Reservation.deleteMany({ pharmacyId, confirmationCode: { $in: seededReservationCodes } }),
    AiConsultation.deleteMany({ pharmacyId, patientNotes: /\[DEMO_SEED\]/ }),
    Delivery.deleteMany({ pharmacyId, notes: /\[DEMO_SEED\]/ }),
    Order.deleteMany({ pharmacyId, notes: /\[DEMO_SEED\]/ }),
    Batch.deleteMany({ pharmacyId, batchNumber: { $in: seededBatchNumbers } }),
  ]);

  const [grossiste, laboratoire, paraSupplier] = await Promise.all([
    upsertSupplier(pharmacyId, {
      name: "Atlas Pharma Grossiste",
      type: "grossiste",
      contact: "Nadia El Idrissi",
      contactPerson: "Nadia El Idrissi",
      email: "orders@atlas-pharma.ma",
      phone: "+212 522 100 200",
      address: "Zone Industrielle Sidi Maarouf, Casablanca",
      notes: seededNote("Main distributor for daily medicine replenishment."),
    }),
    upsertSupplier(pharmacyId, {
      name: "Laboratoire Safa",
      type: "laboratoire",
      contact: "Driss Alaoui",
      contactPerson: "Driss Alaoui",
      email: "supply@labosafa.ma",
      phone: "+212 537 200 300",
      address: "Technopark, Rabat",
      notes: seededNote("Direct laboratory supplier for regulated and prescription lines."),
    }),
    upsertSupplier(pharmacyId, {
      name: "DermaCare Distribution",
      type: "parapharmacy-distributor",
      contact: "Meriem Lahlou",
      contactPerson: "Meriem Lahlou",
      email: "contact@dermacare.ma",
      phone: "+212 524 300 400",
      address: "Gueliz, Marrakech",
      notes: seededNote("Parapharmacy and skincare distributor."),
    }),
  ]);

  const medicines = {};
  for (const data of [
    {
      key: "doliprane",
      name: "Doliprane 500mg",
      genericName: "Paracetamol",
      category: "non-prescription",
      unit: "tablet",
      supplierId: grossiste._id,
      purchasePrice: 8.5,
      salePrice: 12,
      minStockLevel: 50,
    },
    {
      key: "amoxicillin",
      name: "Amoxicillin 1g",
      genericName: "Amoxicillin",
      category: "prescription",
      unit: "capsule",
      supplierId: laboratoire._id,
      purchasePrice: 24,
      salePrice: 36,
      minStockLevel: 30,
    },
    {
      key: "ibuprofen",
      name: "Ibuprofen 400mg",
      genericName: "Ibuprofen",
      category: "non-prescription",
      unit: "tablet",
      supplierId: grossiste._id,
      purchasePrice: 11,
      salePrice: 18,
      minStockLevel: 40,
    },
    {
      key: "ventolin",
      name: "Ventolin Inhaler",
      genericName: "Salbutamol",
      category: "regulated",
      unit: "unit",
      supplierId: laboratoire._id,
      purchasePrice: 42,
      salePrice: 65,
      minStockLevel: 20,
    },
    {
      key: "cetirizine",
      name: "Cetirizine 10mg",
      genericName: "Cetirizine",
      category: "non-prescription",
      unit: "tablet",
      supplierId: grossiste._id,
      purchasePrice: 9,
      salePrice: 15,
      minStockLevel: 35,
    },
  ]) {
    medicines[data.key] = await upsertMedicine(pharmacyId, data);
  }

  const products = {};
  for (const data of [
    {
      key: "vitc",
      name: "Vitamin C 1000mg",
      brand: "NutriPlus",
      category: "supplements",
      supplierId: paraSupplier._id,
      purchasePrice: 35,
      salePrice: 58,
      stockQty: 86,
      minStockLevel: 20,
    },
    {
      key: "probiotic",
      name: "Probiotic Balance",
      brand: "BioFlora",
      category: "supplements",
      supplierId: paraSupplier._id,
      purchasePrice: 62,
      salePrice: 95,
      stockQty: 18,
      minStockLevel: 25,
    },
    {
      key: "sunscreen",
      name: "SPF50 Sunscreen",
      brand: "DermaCare",
      category: "cosmetics",
      supplierId: paraSupplier._id,
      purchasePrice: 70,
      salePrice: 120,
      stockQty: 42,
      minStockLevel: 15,
    },
    {
      key: "thermometer",
      name: "Digital Thermometer",
      brand: "MedTech",
      category: "medical-device",
      supplierId: paraSupplier._id,
      purchasePrice: 45,
      salePrice: 75,
      stockQty: 9,
      minStockLevel: 12,
    },
    {
      key: "oral",
      name: "Oral Rehydration Salts",
      brand: "HydraCare",
      category: "supplements",
      supplierId: grossiste._id,
      purchasePrice: 7,
      salePrice: 14,
      stockQty: 64,
      minStockLevel: 20,
    },
  ]) {
    products[data.key] = await upsertParapharmacy(pharmacyId, data);
  }

  const batches = {};
  batches.doliprane = await createBatch(pharmacyId, medicines.doliprane, {
    batchNumber: "BN-DEMO-DOL-001",
    expiryDate: daysFromNow(420),
    initialQty: 220,
    remainingQty: 188,
  });
  batches.amoxicillin = await createBatch(pharmacyId, medicines.amoxicillin, {
    batchNumber: "BN-DEMO-AMOX-001",
    expiryDate: daysFromNow(65),
    initialQty: 90,
    remainingQty: 44,
  });
  batches.ibuprofen = await createBatch(pharmacyId, medicines.ibuprofen, {
    batchNumber: "BN-DEMO-IBU-001",
    expiryDate: daysFromNow(21),
    initialQty: 80,
    remainingQty: 11,
  });
  batches.ventolin = await createBatch(pharmacyId, medicines.ventolin, {
    batchNumber: "BN-DEMO-VENT-001",
    expiryDate: daysFromNow(180),
    initialQty: 40,
    remainingQty: 16,
  });
  batches.cetirizine = await createBatch(pharmacyId, medicines.cetirizine, {
    batchNumber: "BN-DEMO-CET-001",
    expiryDate: daysFromNow(390),
    initialQty: 120,
    remainingQty: 75,
  });

  const deliveries = await Delivery.create([
    {
      pharmacyId,
      supplierId: grossiste._id,
      receivedBy: assistant._id,
      deliveryDate: daysAgo(3, 11),
      notes: seededNote("Weekly replenishment received."),
      medicineItems: [
        {
          medicineId: medicines.doliprane._id,
          batchNumber: batches.doliprane.batchNumber,
          expiryDate: batches.doliprane.expiryDate,
          receivedQty: 220,
          purchasePrice: medicines.doliprane.purchasePrice,
          salePrice: medicines.doliprane.salePrice,
          batchId: batches.doliprane._id,
        },
        {
          medicineId: medicines.ibuprofen._id,
          batchNumber: batches.ibuprofen.batchNumber,
          expiryDate: batches.ibuprofen.expiryDate,
          receivedQty: 80,
          purchasePrice: medicines.ibuprofen.purchasePrice,
          salePrice: medicines.ibuprofen.salePrice,
          batchId: batches.ibuprofen._id,
        },
      ],
      parapharmacyItems: [
        { productId: products.oral._id, receivedQty: 30, purchasePrice: products.oral.purchasePrice },
      ],
    },
    {
      pharmacyId,
      supplierId: paraSupplier._id,
      receivedBy: pharmacist._id,
      deliveryDate: daysAgo(1, 15),
      notes: seededNote("Parapharmacy display restock."),
      medicineItems: [],
      parapharmacyItems: [
        { productId: products.vitc._id, receivedQty: 48, purchasePrice: products.vitc.purchasePrice },
        { productId: products.sunscreen._id, receivedQty: 24, purchasePrice: products.sunscreen.purchasePrice },
      ],
    },
  ]);

  await Promise.all([
    Batch.updateOne({ _id: batches.doliprane._id }, { deliveryId: deliveries[0]._id }),
    Batch.updateOne({ _id: batches.ibuprofen._id }, { deliveryId: deliveries[0]._id }),
  ]);

  await Order.create([
    {
      pharmacyId,
      supplierId: laboratoire._id,
      createdBy: pharmacist._id,
      productType: "medicine",
      items: [
        { productId: medicines.amoxicillin._id, medicineId: medicines.amoxicillin._id, orderedQty: 80 },
        { productId: medicines.ventolin._id, medicineId: medicines.ventolin._id, orderedQty: 30 },
      ],
      status: "ordered",
      notes: seededNote("Open order for prescription products."),
      createdAt: daysAgo(2, 16),
    },
    {
      pharmacyId,
      supplierId: paraSupplier._id,
      createdBy: assistant._id,
      productType: "parapharmacy",
      items: [{ productId: products.probiotic._id, medicineId: products.probiotic._id, orderedQty: 40 }],
      status: "ordered",
      notes: seededNote("Low stock replenishment for probiotics."),
      createdAt: daysAgo(1, 10),
    },
  ]);

  const customers = {};
  for (const data of [
    {
      key: "hassan",
      fullName: "Hassan Amrani",
      phone: "+212 612 345 001",
      email: "hassan.amrani@example.ma",
      insuranceType: "CNSS",
      insuranceNumber: "CNSS-102938",
      notes: "Known allergy: penicillin.",
      createdFrom: "reservation",
      createdAt: daysAgo(45),
    },
    {
      key: "samira",
      fullName: "Samira El Fassi",
      phone: "+212 612 345 002",
      email: "samira.fassi@example.ma",
      insuranceType: "CNOPS",
      insuranceNumber: "CNOPS-776655",
      notes: "Prefers SMS reminders for pickup.",
      createdFrom: "consultation",
      createdAt: daysAgo(28),
    },
    {
      key: "meryem",
      fullName: "Meryem Alaoui",
      phone: "+212 612 345 003",
      email: "meryem.alaoui@example.ma",
      notes: "Chronic asthma noted by pharmacist.",
      createdFrom: "reservation",
      createdAt: daysAgo(14),
    },
    {
      key: "karim",
      fullName: "Karim Bennani",
      phone: "+212 612 345 004",
      email: "karim.bennani@example.ma",
      notes: "",
      createdFrom: "reservation",
      createdAt: daysAgo(5),
    },
  ]) {
    customers[data.key] = await upsertCustomer(pharmacyId, data);
  }

  const reservations = await Reservation.create([
    {
      pharmacyId,
      customerId: customers.hassan._id,
      customerName: customers.hassan.fullName,
      customerPhone: customers.hassan.phone,
      customerEmail: customers.hassan.email,
      items: [
        reservationItem(medicines.doliprane, "medicine", 2),
        reservationItem(products.vitc, "parapharmacy", 1),
      ],
      status: "pending",
      confirmationCode: "RES-2026-DEMO-001",
      paymentMethod: "pay-on-pickup",
      pickupDate: daysFromNow(1, 14),
      expiresAt: daysFromNow(3, 18),
      notes: seededNote("Customer will pick up after work."),
      createdAt: daysAgo(0, 9, 20),
    },
    {
      pharmacyId,
      customerId: customers.samira._id,
      customerName: customers.samira.fullName,
      customerPhone: customers.samira.phone,
      customerEmail: customers.samira.email,
      items: [
        reservationItem(medicines.amoxicillin, "medicine", 1),
        reservationItem(products.probiotic, "parapharmacy", 1),
      ],
      status: "confirmed",
      confirmationCode: "RES-2026-DEMO-002",
      paymentMethod: "online",
      pickupDate: daysFromNow(1, 10),
      expiresAt: daysFromNow(2, 18),
      confirmedAt: daysAgo(0, 10, 5),
      confirmedBy: pharmacist._id,
      prescriptionRequired: true,
      prescriptionVerified: true,
      prescriptionVerifiedAt: daysAgo(0, 10, 3),
      prescriptionVerifiedBy: pharmacist._id,
      notes: seededNote("Prescription verified."),
      createdAt: daysAgo(1, 16),
    },
    {
      pharmacyId,
      customerId: customers.meryem._id,
      customerName: customers.meryem.fullName,
      customerPhone: customers.meryem.phone,
      customerEmail: customers.meryem.email,
      items: [
        reservationItem(medicines.ventolin, "medicine", 1),
        reservationItem(products.thermometer, "parapharmacy", 1),
      ],
      status: "ready",
      confirmationCode: "RES-2026-DEMO-003",
      paymentMethod: "pay-on-pickup",
      pickupDate: daysAgo(0, 17),
      expiresAt: daysFromNow(1, 18),
      confirmedAt: daysAgo(1, 11),
      confirmedBy: pharmacist._id,
      readyAt: daysAgo(0, 13),
      prescriptionRequired: true,
      prescriptionVerified: true,
      prescriptionVerifiedAt: daysAgo(1, 11),
      prescriptionVerifiedBy: pharmacist._id,
      notes: seededNote("Ready shelf A."),
      createdAt: daysAgo(2, 12),
    },
    {
      pharmacyId,
      customerId: customers.karim._id,
      customerName: customers.karim.fullName,
      customerPhone: customers.karim.phone,
      customerEmail: customers.karim.email,
      items: [reservationItem(medicines.ibuprofen, "medicine", 1)],
      status: "cancelled",
      confirmationCode: "RES-2026-DEMO-004",
      paymentMethod: "pay-on-pickup",
      pickupDate: daysAgo(1, 12),
      expiresAt: daysAgo(0, 18),
      cancelledAt: daysAgo(0, 11),
      cancelledBy: pharmacist._id,
      rejectionReason: "Customer requested cancellation by phone.",
      notes: seededNote("Cancelled by customer."),
      createdAt: daysAgo(4, 10),
    },
    {
      pharmacyId,
      customerId: customers.hassan._id,
      customerName: customers.hassan.fullName,
      customerPhone: customers.hassan.phone,
      customerEmail: customers.hassan.email,
      items: [reservationItem(products.sunscreen, "parapharmacy", 2)],
      status: "expired",
      confirmationCode: "RES-2026-DEMO-005",
      paymentMethod: "online",
      pickupDate: daysAgo(3, 10),
      expiresAt: daysAgo(1, 18),
      expiredAt: daysAgo(1, 18),
      notes: seededNote("Auto-expired demo reservation."),
      createdAt: daysAgo(7, 13),
    },
  ]);

  await AiConsultation.create([
    {
      pharmacyId,
      staffId: assistant._id,
      customerId: customers.samira._id,
      prescriptionImage: null,
      patientNotes: seededNote("Patient reported digestive discomfort with antibiotics."),
      extractedMedicines: [{ name: "Amoxicillin 1g" }],
      suggestions: [
        {
          productId: products.probiotic._id,
          name: products.probiotic.name,
          brand: products.probiotic.brand,
          category: "Probiotics",
          salePrice: products.probiotic.salePrice,
          rationale: "Supports gut flora during antibiotic treatment.",
        },
        {
          productId: products.oral._id,
          name: products.oral.name,
          brand: products.oral.brand,
          category: "Supplements",
          salePrice: products.oral.salePrice,
          rationale: "Helps maintain hydration if digestive symptoms occur.",
        },
      ],
      createdAt: daysAgo(1, 11),
    },
    {
      pharmacyId,
      staffId: pharmacist._id,
      customerId: customers.meryem._id,
      prescriptionImage: null,
      patientNotes: seededNote("Asthma patient asked for home monitoring advice."),
      extractedMedicines: [{ name: "Ventolin Inhaler" }],
      suggestions: [
        {
          productId: products.thermometer._id,
          name: products.thermometer.name,
          brand: products.thermometer.brand,
          category: "Medical Device",
          salePrice: products.thermometer.salePrice,
          rationale: "Useful for monitoring fever while managing respiratory symptoms.",
        },
      ],
      createdAt: daysAgo(0, 12),
    },
  ]);

  const sales = [
    {
      receiptNumber: "SAL-2026-DEMO-001",
      cashierId: cashier._id,
      items: [
        saleMedicineItem(batches.doliprane, medicines.doliprane, 3),
        saleMedicineItem(batches.cetirizine, medicines.cetirizine, 1),
      ],
      parapharmacyItems: [saleParapharmacyItem(products.vitc, 2)],
      paymentMethod: "cash",
      approvalStatus: "approved",
      createdAt: daysAgo(0, 10, 15),
    },
    {
      receiptNumber: "SAL-2026-DEMO-002",
      cashierId: assistant._id,
      items: [saleMedicineItem(batches.ventolin, medicines.ventolin, 1)],
      parapharmacyItems: [saleParapharmacyItem(products.thermometer, 1)],
      paymentMethod: "card",
      approvalStatus: "approved",
      pharmacistId: pharmacist._id,
      createdAt: daysAgo(0, 12, 45),
    },
    {
      receiptNumber: "SAL-2026-DEMO-003",
      cashierId: cashier._id,
      items: [saleMedicineItem(batches.ibuprofen, medicines.ibuprofen, 1)],
      parapharmacyItems: [],
      paymentMethod: "cash",
      approvalStatus: "voided",
      voidReason: "Customer returned before payment completion.",
      voidedBy: pharmacist._id,
      voidedAt: daysAgo(0, 14, 10),
      createdAt: daysAgo(0, 14),
    },
  ];

  const createdSales = [];
  for (const sale of sales) {
    const medicineSubtotal = sale.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const parapharmacySubtotal = sale.parapharmacyItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const totalAmount = medicineSubtotal + parapharmacySubtotal;
    createdSales.push(
      await Sale.create({
        pharmacyId,
        cashierId: sale.cashierId,
        pharmacistId: sale.pharmacistId ?? null,
        items: sale.items,
        parapharmacyItems: sale.parapharmacyItems,
        totalAmount,
        paymentMethod: sale.paymentMethod,
        approvalStatus: sale.approvalStatus,
        voidReason: sale.voidReason ?? null,
        voidedBy: sale.voidedBy ?? null,
        voidedAt: sale.voidedAt ?? null,
        invoice: {
          receiptNumber: sale.receiptNumber,
          generatedAt: sale.createdAt,
          medicineSubtotal,
          parapharmacySubtotal,
        },
        createdAt: sale.createdAt,
      })
    );
  }

  await AuditLog.create([
    {
      pharmacyId,
      userId: pharmacist._id,
      action: "MEDICINE_REGISTERED",
      entity: "medicines",
      entityId: medicines.doliprane._id,
      payload: { seed: SEED, name: medicines.doliprane.name, category: medicines.doliprane.category },
      createdAt: daysAgo(3, 9),
    },
    {
      pharmacyId,
      userId: assistant._id,
      action: "DELIVERY_RECORDED",
      entity: "deliveries",
      entityId: deliveries[0]._id,
      payload: { seed: SEED, supplier: grossiste.name, medicineItemsCount: 2, parapharmacyItemsCount: 1 },
      createdAt: daysAgo(3, 11),
    },
    {
      pharmacyId,
      userId: cashier._id,
      action: "SALE_COMPLETED",
      entity: "sales",
      entityId: createdSales[0]._id,
      payload: { seed: SEED, receiptNumber: "SAL-2026-DEMO-001", totalAmount: createdSales[0].totalAmount },
      createdAt: daysAgo(0, 10, 15),
    },
    {
      pharmacyId,
      userId: pharmacist._id,
      action: "RESERVATION_CONFIRMED",
      entity: "reservations",
      entityId: reservations[1]._id,
      payload: { seed: SEED, confirmationCode: reservations[1].confirmationCode },
      createdAt: daysAgo(0, 10, 5),
    },
    {
      pharmacyId,
      userId: pharmacist._id,
      action: "CUSTOMER_UPDATED",
      entity: "customers",
      entityId: customers.hassan._id,
      payload: { seed: SEED, updatedFields: ["notes"] },
      createdAt: daysAgo(0, 15),
    },
  ]);

  const counts = {
    users: await User.countDocuments({ pharmacyId }),
    suppliers: await Supplier.countDocuments({ pharmacyId }),
    medicines: await Medicine.countDocuments({ pharmacyId }),
    batches: await Batch.countDocuments({ pharmacyId }),
    parapharmacyProducts: await ParapharmacyProduct.countDocuments({ pharmacyId }),
    orders: await Order.countDocuments({ pharmacyId }),
    deliveries: await Delivery.countDocuments({ pharmacyId }),
    customers: await Customer.countDocuments({ pharmacyId }),
    reservations: await Reservation.countDocuments({ pharmacyId }),
    aiConsultations: await AiConsultation.countDocuments({ pharmacyId }),
    sales: await Sale.countDocuments({ pharmacyId }),
    auditLogs: await AuditLog.countDocuments({ pharmacyId }),
  };

  console.log("Demo seed complete.");
  console.log(`Pharmacy ID: ${pharmacyId.toString()}`);
  console.log(`Demo login: pharmacist@pharmaos.ma / ${DEMO_PASSWORD}`);
  console.table(counts);
};

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
