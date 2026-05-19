const now = new Date();
const hour = 3600000;
const day = 86400000;

const iso = (offset) => new Date(now.getTime() - offset).toISOString();

export const pharmacistData = {
  kpis: {
    revenueToday: 12450,
    completedSales: 38,
    pendingReservations: 4,
    lowStockItems: 7,
    nearExpiryBatches: 5,
    expiryThresholdDays: 30,
  },
  salesChart: [
    { day: "Mon", date: "21 Apr", medicineRevenue: 7200, parapharmacyRevenue: 2200 },
    { day: "Tue", date: "22 Apr", medicineRevenue: 8400, parapharmacyRevenue: 1800 },
    { day: "Wed", date: "23 Apr", medicineRevenue: 6900, parapharmacyRevenue: 2400 },
    { day: "Thu", date: "24 Apr", medicineRevenue: 9300, parapharmacyRevenue: 3100 },
    { day: "Fri", date: "25 Apr", medicineRevenue: 8800, parapharmacyRevenue: 2600 },
    { day: "Sat", date: "26 Apr", medicineRevenue: 10500, parapharmacyRevenue: 3500 },
    { day: "Sun", date: "27 Apr", medicineRevenue: 9100, parapharmacyRevenue: 3350 },
  ],
  pendingReservations: [
    {
      _id: "r1",
      trackingCode: "RES-2026-041",
      customerName: "Nadia El Fassi",
      pickupDate: "2026-04-27",
      items: [
        { productName: "Amoxicillin 500mg", productType: "medicine", qty: 1 },
        { productName: "Probiotic 10 Billion", productType: "parapharmacy", qty: 1 },
      ],
    },
    {
      _id: "r2",
      trackingCode: "RES-2026-042",
      customerName: "Mounir Ait Lahcen",
      pickupDate: "2026-04-26",
      items: [{ productName: "Metformin 850mg", productType: "medicine", qty: 2 }],
    },
    {
      _id: "r3",
      trackingCode: "RES-2026-043",
      customerName: "Salma Idrissi",
      pickupDate: "2026-04-29",
      items: [{ productName: "Vitamin D3", productType: "parapharmacy", qty: 1 }],
    },
  ],
  lowStock: [
    { _id: "p1", name: "Paracetamol 500mg", productType: "medicine", stock: 8, minStock: 30 },
    { _id: "p2", name: "Sunscreen SPF50+", productType: "parapharmacy", stock: 5, minStock: 20 },
    { _id: "p3", name: "Ibuprofen 400mg", productType: "medicine", stock: 7, minStock: 25 },
    { _id: "p4", name: "Digital Thermometer", productType: "parapharmacy", stock: 3, minStock: 12 },
    { _id: "p5", name: "Omeprazole 20mg", productType: "medicine", stock: 6, minStock: 18 },
  ],
  expiryBatches: [
    { _id: "b1", medicineName: "Amoxicillin 500mg", batchNumber: "AMX-2201", expiryDate: "2026-05-08", remainingQty: 24 },
    { _id: "b2", medicineName: "Metformin 850mg", batchNumber: "MET-044", expiryDate: "2026-05-14", remainingQty: 18 },
    { _id: "b3", medicineName: "Ibuprofen 400mg", batchNumber: "IBU-701", expiryDate: "2026-05-19", remainingQty: 11 },
  ],
  audit: [
    { _id: "a1", action: "Reservation Confirmed", category: "reservation", userName: "Dr. Imane", createdAt: iso(18 * 60000) },
    { _id: "a2", action: "Sale Completed", category: "sales", userName: "Ahmed Naciri", createdAt: iso(31 * 60000) },
    { _id: "a3", action: "Stock Adjusted", category: "stock", userName: "Dr. Imane", createdAt: iso(2 * hour) },
    { _id: "a4", action: "AI Consultation", category: "ai", userName: "Sara Bennani", createdAt: iso(4 * hour) },
    { _id: "a5", action: "Delivery Recorded", category: "delivery", userName: "Dr. Imane", createdAt: iso(5 * hour) },
  ],
  demandAlerts: [
    { productName: "Probiotic 10 Billion", direction: "increased", change: 42, productType: "parapharmacy", thisWeek: 17, lastWeek: 12 },
    { productName: "Paracetamol 500mg", direction: "increased", change: 27, productType: "medicine", thisWeek: 33, lastWeek: 26 },
    { productName: "Vitamin C 1000mg", direction: "decreased", change: 22, productType: "parapharmacy", thisWeek: 7, lastWeek: 9 },
  ],
  endOfDay: {
    closed: false,
    closedAt: null,
    revenueToday: 12450,
  },
};

export const assistantData = {
  kpis: {
    pendingReservations: 4,
    readyReservations: 6,
    mySalesToday: 9,
    myRevenueToday: 2180,
    aiConsultationsToday: 3,
  },
  confirmedReservations: [
    { _id: "r11", trackingCode: "RES-2026-051", customerName: "Yassine Tazi", pickupDate: "2026-04-27", items: [{ productName: "Metformin 850mg", productType: "medicine", qty: 1 }] },
    { _id: "r12", trackingCode: "RES-2026-052", customerName: "Hajar El Amrani", pickupDate: "2026-04-28", items: [{ productName: "Sunscreen SPF50+", productType: "parapharmacy", qty: 2 }] },
  ],
  readyReservations: [
    { _id: "r21", trackingCode: "RES-2026-061", customerName: "Karim Benjelloun", pickupDate: "2026-04-27", items: [{ productName: "Omeprazole 20mg", productType: "medicine", qty: 1 }] },
    { _id: "r22", trackingCode: "RES-2026-062", customerName: "Amina Bennis", pickupDate: "2026-04-29", items: [{ productName: "Vitamin D3", productType: "parapharmacy", qty: 1 }] },
  ],
  demandAlerts: pharmacistData.demandAlerts,
  lowStock: pharmacistData.lowStock,
  consultations: [
    { _id: "c1", createdAt: iso(2 * hour), medicines: 2, recommendations: 3 },
    { _id: "c2", createdAt: iso(5 * hour), medicines: 1, recommendations: 1 },
    { _id: "c3", createdAt: iso(day), medicines: 3, recommendations: 2 },
  ],
};

export const cashierData = {
  kpis: {
    mySalesToday: 12,
    myRevenueToday: 3620,
    cashRevenue: 1840,
    cardRevenue: 1780,
    readyReservations: 5,
  },
  pharmacistGate: {
    available: true,
    pharmacistName: "Dr. Imane El Fassi",
  },
  recentSales: [
    {
      _id: "s1",
      receiptNumber: "SAL-2026-091",
      createdAt: iso(20 * 60000),
      cashierName: "Ahmed Naciri",
      paymentMethod: "Cash",
      status: "completed",
      items: [
        { productName: "Paracetamol 500mg", productType: "medicine", qty: 2, unitPrice: 18 },
        { productName: "Vitamin C 1000mg", productType: "parapharmacy", qty: 1, unitPrice: 58 },
      ],
    },
    {
      _id: "s2",
      receiptNumber: "SAL-2026-090",
      createdAt: iso(75 * 60000),
      cashierName: "Ahmed Naciri",
      paymentMethod: "Card",
      status: "completed",
      items: [{ productName: "Digital Thermometer", productType: "parapharmacy", qty: 1, unitPrice: 75 }],
    },
  ],
  readyReservations: assistantData.readyReservations,
};
