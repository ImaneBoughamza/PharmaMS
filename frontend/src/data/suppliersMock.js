const now = new Date();
const day = 86400000;
const iso = (offset) => new Date(now.getTime() - offset).toISOString();

export const SUPPLIER_TYPES = ["Grossiste", "Laboratoire", "Parapharmacy Distributor", "Other"];

export const MOCK_SUPPLIERS = [
  {
    _id: "sup-1",
    name: "MedPharma Distribution",
    type: "Grossiste",
    contactPerson: "Hassan Ouali",
    email: "contact@medpharma.ma",
    phone: "+212 522334455",
    address: "18 Rue Ibn Sina, Casablanca",
    notes: "Preferred supplier for generic medicine orders.",
    status: "active",
    createdAt: "2026-01-12T09:30:00Z",
  },
  {
    _id: "sup-2",
    name: "BioLab Morocco",
    type: "Laboratoire",
    contactPerson: "Samira Tazi",
    email: "samira@biolab.ma",
    phone: "+212 537112233",
    address: "Avenue Al Abtal, Rabat",
    notes: "Fast lab order confirmation.",
    status: "active",
    createdAt: "2026-02-04T10:10:00Z",
  },
  {
    _id: "sup-3",
    name: "ParaCare Atlas",
    type: "Parapharmacy Distributor",
    contactPerson: "Youssef Mansouri",
    email: "orders@paracare.ma",
    phone: "+212 524778899",
    address: "Zone Industrielle Sidi Ghanem, Marrakech",
    notes: "Monthly parapharmacy restock.",
    status: "active",
    createdAt: "2026-02-18T08:45:00Z",
  },
  {
    _id: "sup-4",
    name: "Nord Santé Services",
    type: "Other",
    contactPerson: "Nadia El Fassi",
    email: "contact@nordsante.ma",
    phone: "",
    address: "",
    notes: "",
    status: "deactivated",
    createdAt: "2026-03-06T14:15:00Z",
  },
];

export const MOCK_DELIVERIES = [
  {
    _id: "del-1",
    supplierId: "sup-1",
    reference: "DEL-2026-001",
    deliveryDate: iso(2 * day),
    staffName: "Dr. Imane Benali",
    productTypes: ["medicine", "parapharmacy"],
    medicineItems: [
      { medicineId: "med-1", medicineName: "Paracetamol 500mg", batchNumber: "BN-2026-001", expiryDate: "2027-08-30", receivedQty: 100, purchasePrice: 11, salePrice: 18 },
      { medicineId: "med-2", medicineName: "Ibuprofen 400mg", batchNumber: "BN-2026-002", expiryDate: "2027-10-15", receivedQty: 60, purchasePrice: 16, salePrice: 24 },
    ],
    parapharmacyItems: [
      { productId: "para-2", productName: "Hand Sanitizer 500ml", receivedQty: 48, purchasePrice: 21 },
    ],
  },
  {
    _id: "del-2",
    supplierId: "sup-2",
    reference: "DEL-2026-002",
    deliveryDate: iso(5 * day),
    staffName: "Sara Alami",
    productTypes: ["medicine"],
    medicineItems: [
      { medicineId: "med-3", medicineName: "Amoxicillin 500mg", batchNumber: "AMX-0426", expiryDate: "2027-12-01", receivedQty: 40, purchasePrice: 35, salePrice: 58 },
    ],
    parapharmacyItems: [],
  },
  {
    _id: "del-3",
    supplierId: "sup-3",
    reference: "DEL-2026-003",
    deliveryDate: iso(9 * day),
    staffName: "Ahmed Tazi",
    productTypes: ["parapharmacy"],
    medicineItems: [],
    parapharmacyItems: [
      { productId: "para-1", productName: "Sunscreen SPF50+", receivedQty: 24, purchasePrice: 62 },
      { productId: "para-3", productName: "Baby Shampoo", receivedQty: 30, purchasePrice: 23 },
    ],
  },
  {
    _id: "del-4",
    supplierId: "sup-1",
    reference: "DEL-2026-004",
    deliveryDate: iso(14 * day),
    staffName: "Dr. Imane Benali",
    productTypes: ["medicine"],
    medicineItems: [
      { medicineId: "med-4", medicineName: "Vitamin C 1000mg", batchNumber: "VITC-0426", expiryDate: "2028-02-01", receivedQty: 80, purchasePrice: 27, salePrice: 42 },
    ],
    parapharmacyItems: [],
  },
];

export const MOCK_RETURNS = [
  {
    _id: "ret-1",
    supplierId: "sup-1",
    batchNumber: "BN-2026-002",
    medicineName: "Ibuprofen 400mg",
    returnDate: iso(1 * day),
    returnedQty: 8,
    reason: "Damaged outer packaging identified during stock inspection.",
  },
];

export const MOCK_MEDICINES = [
  { _id: "med-1", name: "Paracetamol 500mg", supplierId: "sup-1", active: true },
  { _id: "med-2", name: "Ibuprofen 400mg", supplierId: "sup-1", active: true },
  { _id: "med-3", name: "Amoxicillin 500mg", supplierId: "sup-2", active: true },
  { _id: "med-4", name: "Vitamin C 1000mg", supplierId: "sup-1", active: true },
];

export const MOCK_PARAPHARMACY = [
  { _id: "para-1", name: "Sunscreen SPF50+", active: true },
  { _id: "para-2", name: "Hand Sanitizer 500ml", active: true },
  { _id: "para-3", name: "Baby Shampoo", active: true },
  { _id: "para-4", name: "Bioderma Sensibio H2O", active: true },
];

export const MOCK_ORDERS = [
  {
    _id: "ord-1",
    supplierId: "sup-1",
    reference: "ORD-2026-001",
    status: "Ordered",
    medicineItems: [
      { medicineId: "med-1", medicineName: "Paracetamol 500mg", receivedQty: 40, purchasePrice: 11, salePrice: 18 },
    ],
    parapharmacyItems: [
      { productId: "para-2", productName: "Hand Sanitizer 500ml", receivedQty: 24, purchasePrice: 21 },
    ],
  },
];

export function getSupplierById(id) {
  return MOCK_SUPPLIERS.find((supplier) => supplier._id === id) ?? null;
}

export function getDeliveriesForSupplier(id) {
  return MOCK_DELIVERIES.filter((delivery) => delivery.supplierId === id);
}

export function getReturnsForSupplier(id) {
  return MOCK_RETURNS.filter((item) => item.supplierId === id);
}

export function getLastDelivery(id) {
  return getDeliveriesForSupplier(id)
    .slice()
    .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))[0] ?? null;
}

export function getDeliveryItems(delivery) {
  return [
    ...(delivery.medicineItems ?? []).map((item) => item.medicineName),
    ...(delivery.parapharmacyItems ?? []).map((item) => item.productName),
  ];
}
