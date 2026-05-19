import { useState, useMemo, useEffect } from "react";
import { Download, ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import SaleDetailModal from "@/components/pos/SaleDetailModal";
import VoidSaleModal from "@/components/pos/VoidSaleModal";
import api from "@/lib/axios";
import styles from "@/styles/ReportsPage.module.css";

const MOCK_USER = { role: "pharmacist", name: "Dr. Benali" };

/* ── Mock sales data ── */
const _now = new Date();
const sub  = (ms) => new Date(_now - ms).toISOString();
const H = 3600000;
const D = 86400000;

const MOCK_SALES_BASE = [
  {
    _id: "s1", receiptNumber: "RCP-20260425-8821", createdAt: sub(0.5 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Amoxicillin 500mg",     productType: "medicine",      category: "Antibiotic", qty: 2, unitPrice: 45.00 },
      { productName: "Bioderma Sensibio H2O", productType: "parapharmacy", category: "Skincare",   qty: 1, unitPrice: 98.50 },
    ],
  },
  {
    _id: "s2", receiptNumber: "RCP-20260425-7743", createdAt: sub(2 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Paracetamol 1g", productType: "medicine", category: "Analgesic", qty: 3, unitPrice: 12.00 },
    ],
  },
  {
    _id: "s3", receiptNumber: "RCP-20260425-6612", createdAt: sub(4 * H),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Voltaren Gel",   productType: "parapharmacy", category: "Topical",    qty: 2, unitPrice: 75.00 },
      { productName: "Bepanthen Plus", productType: "parapharmacy", category: "Wound Care", qty: 1, unitPrice: 55.00 },
    ],
  },
  {
    _id: "s4", receiptNumber: "RCP-20260425-5501", createdAt: sub(6 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "voided",
    voidReason: "Customer requested cancellation after regulatory check",
    items: [
      { productName: "Tramadol 100mg",  productType: "medicine", category: "Regulated", qty: 1, unitPrice: 85.00 },
      { productName: "Ibuprofen 400mg", productType: "medicine", category: "Analgesic", qty: 2, unitPrice: 18.00 },
    ],
  },
  {
    _id: "s5", receiptNumber: "RCP-20260424-4430", createdAt: sub(1 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Cetirizine 10mg", productType: "medicine", category: "Antihistamine", qty: 1, unitPrice: 32.00 },
    ],
  },
  {
    _id: "s6", receiptNumber: "RCP-20260424-3310", createdAt: sub(1 * D + 2 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "La Roche-Posay SPF50", productType: "parapharmacy", category: "Suncare",  qty: 1, unitPrice: 230.00 },
      { productName: "CeraVe Moisturiser",   productType: "parapharmacy", category: "Skincare", qty: 1, unitPrice: 185.00 },
    ],
  },
  {
    _id: "s7", receiptNumber: "RCP-20260423-2209", createdAt: sub(2 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Metformin 850mg",  productType: "medicine",     category: "Antidiabetic", qty: 1, unitPrice: 28.00 },
      { productName: "Aspirin 100mg",    productType: "medicine",     category: "Analgesic",    qty: 2, unitPrice: 15.00 },
      { productName: "Omega-3 Capsules", productType: "parapharmacy", category: "Supplement",   qty: 1, unitPrice: 145.00 },
    ],
  },
  {
    _id: "s8", receiptNumber: "RCP-20260422-1108", createdAt: sub(3 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Omeprazole 20mg", productType: "medicine", category: "Antacid", qty: 1, unitPrice: 22.00 },
    ],
  },
  {
    _id: "s9", receiptNumber: "RCP-20260421-0987", createdAt: sub(4 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Vitamin D3 1000IU", productType: "parapharmacy", category: "Supplement", qty: 2, unitPrice: 88.00 },
    ],
  },
  {
    _id: "s10", receiptNumber: "RCP-20260420-0876", createdAt: sub(5 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Augmentin 875mg", productType: "medicine", category: "Antibiotic", qty: 1, unitPrice: 95.00 },
      { productName: "Nurofen Plus",    productType: "medicine", category: "Analgesic",  qty: 2, unitPrice: 42.00 },
    ],
  },
  {
    _id: "s11", receiptNumber: "RCP-20260419-0765", createdAt: sub(6 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Avène Thermal Water", productType: "parapharmacy", category: "Skincare", qty: 1, unitPrice: 65.00 },
      { productName: "Dexeryl Cream",       productType: "parapharmacy", category: "Skincare", qty: 1, unitPrice: 115.00 },
    ],
  },
  {
    _id: "s12", receiptNumber: "RCP-20260418-0654", createdAt: sub(7 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Doliprane 1g", productType: "medicine", category: "Analgesic", qty: 3, unitPrice: 14.00 },
    ],
  },
];

const MOCK_STAFF = {
  u1: { name: "Imane B.",  role: "Cashier" },
  u2: { name: "Ahmed K.", role: "Assistant" },
};

const S7_PAGE_SIZE = 20;

/* ── Skeleton column-width sequences (visual variety) ── */
const SKW7 = ["65%", "50%", "35%", "55%", "50%", "60%", "30%"];
const SKW5 = ["70%", "50%", "40%", "45%", "60%"];
const SKW9 = ["55%", "60%", "45%", "35%", "50%", "50%", "60%", "40%", "40%"];

/* ── Date helpers ── */
function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const m = new Date(d);
  m.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  m.setHours(0, 0, 0, 0);
  return m;
}

function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getDateRange(activePeriod, appliedFrom, appliedTo) {
  const today = new Date().toISOString().slice(0, 10);
  if (activePeriod === "today")  return { from: today, to: today };
  if (activePeriod === "week")   return { from: getWeekStart().toISOString().slice(0, 10), to: today };
  if (activePeriod === "month")  return { from: getMonthStart().toISOString().slice(0, 10), to: today };
  if (activePeriod === "custom") return { from: appliedFrom || today, to: appliedTo || today };
  return { from: today, to: today };
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + "…" : (str ?? "");
}

/* ── CSV field escaping ── */
function csvField(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"` : s;
}

/* ── Filter ── */
function filterByPeriod(sales, activePeriod, from, to) {
  const now = new Date();
  if (activePeriod === "today") {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return sales.filter((s) => new Date(s.createdAt) >= start);
  }
  if (activePeriod === "week")  return sales.filter((s) => new Date(s.createdAt) >= getWeekStart());
  if (activePeriod === "month") return sales.filter((s) => new Date(s.createdAt) >= getMonthStart());
  if (activePeriod === "custom" && from) {
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    const end   = to ? new Date(to) : now; end.setHours(23, 59, 59, 999);
    return sales.filter((s) => { const d = new Date(s.createdAt); return d >= start && d <= end; });
  }
  return sales;
}

/* ── Aggregate calculators ── */
function computeKPIs(sales) {
  const completed = sales.filter((s) => s.status === "completed");
  const voided    = sales.filter((s) => s.status === "voided");
  let totalRevenue = 0, medRevenue = 0, paraRevenue = 0, voidedAmount = 0;
  for (const s of completed)
    for (const i of s.items) {
      const amt = i.unitPrice * i.qty;
      totalRevenue += amt;
      if (i.productType === "medicine") medRevenue += amt; else paraRevenue += amt;
    }
  for (const s of voided)
    for (const i of s.items) voidedAmount += i.unitPrice * i.qty;
  return { totalRevenue, medRevenue, paraRevenue, voidedAmount,
           completedCount: completed.length, voidedCount: voided.length };
}

/* ── Chart — always generates the full date range (flat zero when no sales) ── */
function buildChartData(sales, activePeriod, appliedFrom, appliedTo) {
  const completed = sales.filter((s) => s.status === "completed");
  const now = new Date();
  const buckets = {};

  if (activePeriod === "today") {
    const curHour = now.getHours();
    for (let h = 0; h <= curHour; h++) buckets[h] = { label: `${h}:00`, med: 0, para: 0 };
    for (const s of completed) {
      const h = new Date(s.createdAt).getHours();
      if (buckets[h] !== undefined)
        for (const i of s.items) {
          const amt = i.unitPrice * i.qty;
          if (i.productType === "medicine") buckets[h].med += amt; else buckets[h].para += amt;
        }
    }
    return Object.values(buckets);
  }

  let startDate, endDate;
  if (activePeriod === "week")        { startDate = getWeekStart();   endDate = new Date(now); }
  else if (activePeriod === "month")  { startDate = getMonthStart();  endDate = new Date(now); }
  else if (activePeriod === "custom" && appliedFrom) {
    startDate = new Date(appliedFrom);
    endDate   = appliedTo ? new Date(appliedTo) : new Date(now);
  } else {
    return [{ label: "No data", med: 0, para: 0 }];
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    buckets[key] = {
      label: d.toLocaleDateString("fr-MA", { day: "2-digit", month: "2-digit" }),
      med: 0, para: 0,
    };
  }
  for (const s of completed) {
    const key = new Date(s.createdAt).toISOString().slice(0, 10);
    if (!buckets[key]) continue;
    for (const i of s.items) {
      const amt = i.unitPrice * i.qty;
      if (i.productType === "medicine") buckets[key].med += amt; else buckets[key].para += amt;
    }
  }
  return Object.values(buckets);
}

function computePaymentBreakdown(sales) {
  const completed = sales.filter((s) => s.status === "completed");
  const totals = { Cash: 0, Card: 0 };
  for (const s of completed) {
    const t = s.items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
    totals[s.paymentMethod] = (totals[s.paymentMethod] || 0) + t;
  }
  const grand = totals.Cash + totals.Card;
  return [
    { label: "Cash", value: totals.Cash, pct: grand > 0 ? (totals.Cash / grand) * 100 : 0 },
    { label: "Card", value: totals.Card, pct: grand > 0 ? (totals.Card / grand) * 100 : 0 },
  ];
}

function computeTypeBreakdown(sales) {
  const completed = sales.filter((s) => s.status === "completed");
  let med = 0, para = 0;
  for (const s of completed)
    for (const i of s.items) {
      const amt = i.unitPrice * i.qty;
      if (i.productType === "medicine") med += amt; else para += amt;
    }
  const grand = med + para;
  return [
    { label: "Medicine",     value: med,  pct: grand > 0 ? (med  / grand) * 100 : 0, color: "med"  },
    { label: "Parapharmacy", value: para, pct: grand > 0 ? (para / grand) * 100 : 0, color: "para" },
  ];
}

function computeStaffStats(sales) {
  const map = {};
  for (const s of sales) {
    if (!map[s.cashierId]) {
      map[s.cashierId] = {
        id: s.cashierId,
        name: MOCK_STAFF[s.cashierId]?.name ?? s.cashierName,
        role: MOCK_STAFF[s.cashierId]?.role ?? "—",
        salesCount: 0, medRevenue: 0, paraRevenue: 0, totalRevenue: 0, voidedCount: 0,
      };
    }
    const row = map[s.cashierId];
    if (s.status === "completed") {
      row.salesCount++;
      for (const i of s.items) {
        const amt = i.unitPrice * i.qty;
        row.totalRevenue += amt;
        if (i.productType === "medicine") row.medRevenue += amt; else row.paraRevenue += amt;
      }
    } else if (s.status === "voided") {
      row.voidedCount++;
    }
  }
  return Object.values(map);
}

function computeTopProducts(sales) {
  const completed = sales.filter((s) => s.status === "completed");
  const medMap = {}, paraMap = {};
  for (const s of completed)
    for (const i of s.items) {
      const target = i.productType === "medicine" ? medMap : paraMap;
      if (!target[i.productName])
        target[i.productName] = { name: i.productName, category: i.category ?? "—", qty: 0, revenue: 0 };
      target[i.productName].qty     += i.qty;
      target[i.productName].revenue += i.unitPrice * i.qty;
    }
  const byRevenue = (a, b) => b.revenue - a.revenue;
  return {
    medicines:    Object.values(medMap).sort(byRevenue).slice(0, 10),
    parapharmacy: Object.values(paraMap).sort(byRevenue).slice(0, 10),
  };
}

/* ── CSV: one row per line item ── */
function buildLineItemCSV(sales) {
  const header = [
    "Receipt #", "Date", "Staff", "Product Type", "Product Name",
    "Qty", "Unit Price", "Line Total", "Payment Method", "Status",
  ].join(",");
  const rows = [];
  for (const s of sales) {
    const date = new Date(s.createdAt).toLocaleDateString("fr-MA");
    for (const i of s.items) {
      rows.push([
        csvField(s.receiptNumber),
        date,
        csvField(s.cashierName),
        i.productType === "medicine" ? "Medicine" : "Parapharmacy",
        csvField(i.productName),
        i.qty,
        i.unitPrice.toFixed(2).replace(".", ","),
        (i.unitPrice * i.qty).toFixed(2).replace(".", ","),
        s.paymentMethod,
        s.status,
      ].join(","));
    }
  }
  return [header, ...rows].join("\n");
}

/* ── Custom chart tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const med  = payload.find((p) => p.dataKey === "med")?.value  ?? 0;
  const para = payload.find((p) => p.dataKey === "para")?.value ?? 0;
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipLabel}>{label}</p>
      <p className={styles.chartTooltipMed}>Medicine: {formatCurrency(med)}</p>
      <p className={styles.chartTooltipPara}>Parapharmacy: {formatCurrency(para)}</p>
      <p className={styles.chartTooltipTotal}>Total: {formatCurrency(med + para)}</p>
    </div>
  );
}

function normalizeSale(sale) {
  const medicineItems = (sale.items ?? []).map((item) => ({
    productName: item.medicineId?.name || item.medicineName || "Medicine",
    productType: "medicine",
    category: item.medicineId?.category || "Medicine",
    batchNumber: item.batchId?.batchNumber,
    qty: item.qty,
    unitPrice: item.unitPrice,
  }));
  const parapharmacyItems = (sale.parapharmacyItems ?? []).map((item) => ({
    productName: item.productId?.name || "Parapharmacy product",
    productType: "parapharmacy",
    category: item.productId?.category || "Parapharmacy",
    qty: item.qty,
    unitPrice: item.unitPrice,
  }));

  return {
    ...sale,
    receiptNumber: sale.invoice?.receiptNumber || sale.receiptNumber,
    cashierId: sale.cashierId?._id || sale.cashierId,
    cashierName: sale.cashierId?.fullName || sale.cashierName || "Staff",
    paymentMethod: sale.paymentMethod === "card" ? "Card" : "Cash",
    status: sale.approvalStatus === "voided" ? "voided" : "completed",
    items: [...medicineItems, ...parapharmacyItems],
  };
}

const PERIOD_OPTS   = [{ value: "today", label: "Today" }, { value: "week", label: "This Week" },
                       { value: "month", label: "This Month" }, { value: "custom", label: "Custom Range" }];
const S7_TYPE_OPTS  = [{ v: "all", l: "All" }, { v: "medicine", l: "Medicine Only" },
                       { v: "parapharmacy", l: "Parapharmacy Only" }, { v: "mixed", l: "Mixed" }];
const S7_PAY_OPTS   = [{ v: "all", l: "All" }, { v: "Cash", l: "Cash" }, { v: "Card", l: "Card" }];
const S7_STATUS_OPTS = [{ v: "all", l: "All" }, { v: "completed", l: "Completed" }, { v: "voided", l: "Voided" }];

/* ── Component ── */
export default function ReportsPage() {
  /* ── Period ── */
  const [period,       setPeriod]       = useState("today");
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");
  const [activePeriod, setActivePeriod] = useState("today");
  const [appliedFrom,  setAppliedFrom]  = useState("");
  const [appliedTo,    setAppliedTo]    = useState("");
  const [isLoading,    setIsLoading]    = useState(false);  // sections 1-6

  /* ── Data ── */
  const [salesData, setSalesData] = useState([]);

  /* ── Section 4 sort ── */
  const [sortField, setSortField] = useState("totalRevenue");
  const [sortDir,   setSortDir]   = useState("desc");

  /* ── Section 7 ── */
  const [s7Search,  setS7Search]  = useState("");
  const [s7Type,    setS7Type]    = useState("all");
  const [s7Pay,     setS7Pay]     = useState("all");
  const [s7Staff,   setS7Staff]   = useState("all");
  const [s7Status,  setS7Status]  = useState("all");
  const [s7Page,    setS7Page]    = useState(0);
  const [s7Loading, setS7Loading] = useState(false);  // section 7 independent

  /* ── Modals ── */
  const [detailSale, setDetailSale] = useState(null);
  const [voidSale,   setVoidSale]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSales() {
      setIsLoading(true);
      setS7Loading(true);
      try {
        const { data } = await api.get("/api/sales", { params: { limit: 1000 } });
        if (!cancelled) setSalesData((data.data ?? []).map(normalizeSale));
      } catch (error) {
        if (!cancelled) toast.error(error?.response?.data?.message ?? "Failed to load sales report");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setS7Loading(false);
        }
      }
    }

    loadSales();
    return () => { cancelled = true; };
  }, []);

  /* ── Period logic ── */
  function applyPeriod(p, from = "", to = "") {
    setIsLoading(true);
    setActivePeriod(p);
    setAppliedFrom(from);
    setAppliedTo(to);
    setS7Page(0);
    setTimeout(() => setIsLoading(false), 550);
  }

  function handlePeriodSelect(value) {
    setPeriod(value);
    if (value !== "custom") applyPeriod(value);
  }

  function handleApply() {
    if (!customFrom) return;
    applyPeriod("custom", customFrom, customTo);
  }

  /* ── Section 7 independent loading — 250ms debounce ── */
  useEffect(() => {
    setS7Loading(true);
    const t = setTimeout(() => setS7Loading(false), 250);
    return () => clearTimeout(t);
  }, [s7Search, s7Type, s7Pay, s7Staff, s7Status, activePeriod, appliedFrom, appliedTo]);

  /* ── Derived data ── */
  const filteredSales = useMemo(
    () => filterByPeriod(salesData, activePeriod, appliedFrom, appliedTo),
    [salesData, activePeriod, appliedFrom, appliedTo]
  );

  const noData = filteredSales.length === 0;

  const kpis             = useMemo(() => computeKPIs(filteredSales), [filteredSales]);
  const chartData        = useMemo(() => buildChartData(filteredSales, activePeriod, appliedFrom, appliedTo),
                                   [filteredSales, activePeriod, appliedFrom, appliedTo]);
  const paymentBreakdown = useMemo(() => computePaymentBreakdown(filteredSales), [filteredSales]);
  const typeBreakdown    = useMemo(() => computeTypeBreakdown(filteredSales),    [filteredSales]);
  const voidedSales      = useMemo(() => filteredSales.filter((s) => s.status === "voided"), [filteredSales]);

  const staffRows = useMemo(() => {
    const rows = computeStaffStats(filteredSales);
    return [...rows].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDir === "asc" ? diff : -diff;
    });
  }, [filteredSales, sortField, sortDir]);

  const { medicines: topMeds, parapharmacy: topPara } =
    useMemo(() => computeTopProducts(filteredSales), [filteredSales]);

  const staffOptions = useMemo(() => {
    const seen = {};
    for (const s of filteredSales)
      if (!seen[s.cashierId]) seen[s.cashierId] = s.cashierName;
    return Object.entries(seen).map(([id, name]) => ({ id, name }));
  }, [filteredSales]);

  const s7Filtered = useMemo(() => {
    let data = filteredSales;
    if (s7Search) {
      const q = s7Search.toLowerCase();
      data = data.filter((s) =>
        s.receiptNumber.toLowerCase().includes(q) ||
        s.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    }
    if (s7Type !== "all") {
      data = data.filter((s) => {
        const hasMed  = s.items.some((i) => i.productType === "medicine");
        const hasPara = s.items.some((i) => i.productType !== "medicine");
        if (s7Type === "medicine")     return hasMed && !hasPara;
        if (s7Type === "parapharmacy") return hasPara && !hasMed;
        if (s7Type === "mixed")        return hasMed && hasPara;
        return true;
      });
    }
    if (s7Pay    !== "all") data = data.filter((s) => s.paymentMethod === s7Pay);
    if (s7Staff  !== "all") data = data.filter((s) => s.cashierId === s7Staff);
    if (s7Status !== "all") data = data.filter((s) => s.status === s7Status);
    return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredSales, s7Search, s7Type, s7Pay, s7Staff, s7Status]);

  const hasActiveFilters = s7Search || s7Type !== "all" || s7Pay !== "all" || s7Staff !== "all" || s7Status !== "all";

  useEffect(() => { setS7Page(0); }, [s7Search, s7Type, s7Pay, s7Staff, s7Status, filteredSales]);

  const s7PageCount = Math.max(1, Math.ceil(s7Filtered.length / S7_PAGE_SIZE));
  const s7Rows      = s7Filtered.slice(s7Page * S7_PAGE_SIZE, (s7Page + 1) * S7_PAGE_SIZE);

  /* ── Section 4 sort ── */
  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <ChevronsUpDown size={12} className={styles.sortIconNeutral} />;
    return sortDir === "asc"
      ? <ChevronUp   size={12} className={styles.sortIconActive} />
      : <ChevronDown size={12} className={styles.sortIconActive} />;
  }

  /* ── Clear Section 7 filters ── */
  function handleClearFilters() {
    setS7Search("");
    setS7Type("all");
    setS7Pay("all");
    setS7Staff("all");
    setS7Status("all");
  }

  /* ── Modal handlers ── */
  function handleOpenDetail(sale)          { setDetailSale(sale); }
  function handleCloseDetail()             { setDetailSale(null); }
  function handleOpenVoidFromDetail(sale)  { setDetailSale(null); setVoidSale(sale); }
  function handleCloseVoid()               { setVoidSale(null); }

  function handleVoidConfirm(sale, reason) {
    try {
      // TODO: replace with: await api.post(`/api/sales/${sale._id}/void`, { reason })
      setSalesData((prev) =>
        prev.map((s) => s._id === sale._id ? { ...s, status: "voided", voidReason: reason } : s)
      );
      setVoidSale(null);
      toast.success(`Sale #${sale.receiptNumber} voided`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to void sale — please try again");
    }
  }

  /* Always read live sale state (may have just been voided) */
  const currentDetailSale = detailSale
    ? salesData.find((s) => s._id === detailSale._id) ?? detailSale
    : null;

  /* ── Export ── */
  async function handleExport() {
    try {
      // TODO: replace with:
      // const { from, to } = getDateRange(activePeriod, appliedFrom, appliedTo);
      // const response = await api.get("/api/reports/sales", { params: { from, to }, responseType: "blob" });
      // const url = URL.createObjectURL(response.data);
      const { from, to } = getDateRange(activePeriod, appliedFrom, appliedTo);
      const csv  = buildLineItemCSV(filteredSales);
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `PharmaMS_SalesReport_${from}_to_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to export report — please try again");
    }
  }

  /* ── Render ── */
  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sales Report</h1>
          <p className={styles.pageSubtitle}>Revenue and transaction analysis by period</p>
        </div>
        <button type="button" className={styles.exportBtn} onClick={handleExport}>
          <Download size={14} />
          Export Report
        </button>
      </div>

      {/* ── Sticky period toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.periodGroup}>
          {PERIOD_OPTS.map((o) => (
            <button key={o.value} type="button"
              className={[styles.periodBtn, period === o.value ? styles.periodActive : ""].join(" ")}
              onClick={() => handlePeriodSelect(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className={styles.customRange}>
            <input type="date" className={styles.dateInput} value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)} />
            <span className={styles.dateSep}>to</span>
            <input type="date" className={styles.dateInput} value={customTo}
              min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} />
            <button type="button" className={styles.applyBtn} onClick={handleApply}
              disabled={!customFrom}>Apply</button>
          </div>
        )}
      </div>

      {/* ── Section 1: KPI Row ── */}
      <div className={styles.kpiRow}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={[styles.kpiCard, styles.kpiSkeleton].join(" ")} />
          ))
        ) : (
          <>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total Revenue</span>
              <span className={styles.kpiValue}>{formatCurrency(kpis.totalRevenue)}</span>
              <span className={styles.kpiSub}>
                {kpis.completedCount} completed sale{kpis.completedCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className={[styles.kpiCard, styles.kpiMed].join(" ")}>
              <span className={styles.kpiLabel}>Medicine Sales</span>
              <span className={styles.kpiValue}>{formatCurrency(kpis.medRevenue)}</span>
            </div>
            <div className={[styles.kpiCard, styles.kpiPara].join(" ")}>
              <span className={styles.kpiLabel}>Parapharmacy Sales</span>
              <span className={styles.kpiValue}>{formatCurrency(kpis.paraRevenue)}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Voided Sales</span>
              <span className={[styles.kpiValue,
                kpis.voidedCount > 0 ? styles.kpiValueError : styles.kpiValueMuted].join(" ")}>
                {formatCurrency(kpis.voidedAmount)}
              </span>
              <span className={styles.kpiSub}>
                {kpis.voidedCount} transaction{kpis.voidedCount !== 1 ? "s" : ""} voided
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Section 2: Revenue Over Time (always shows — flat line on no data) ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Revenue Over Time</h2>
        {isLoading ? (
          <div className={[styles.chartSkeleton, styles.kpiSkeleton].join(" ")} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="0" />
              <XAxis dataKey="label"
                tick={{ fontFamily: "var(--font-ui)", fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => Math.round(v)}
                tick={{ fontFamily: "var(--font-ui)", fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="plainline" iconSize={18}
                wrapperStyle={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", paddingTop: "12px" }}
                formatter={(v) => v === "med" ? "Medicine" : "Parapharmacy"} />
              <Line type="monotone" dataKey="med"  name="med"  stroke="var(--color-accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="para" name="para" stroke="#D97706"             strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3: Revenue Breakdown ── */}
      <div className={styles.breakdownRow}>
        <div className={styles.breakdownCard}>
          <h2 className={styles.sectionTitle}>By Payment Method</h2>
          {isLoading ? (
            <div className={styles.breakdownList}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.breakdownItem}>
                  <div className={styles.breakdownMeta}>
                    <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: "40%" }} />
                    <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: "25%" }} />
                  </div>
                  <div className={[styles.progressTrack, styles.kpiSkeleton].join(" ")} />
                </div>
              ))}
            </div>
          ) : noData ? (
            <p className={styles.emptyBreakdown}>No data</p>
          ) : (
            <div className={styles.breakdownList}>
              {paymentBreakdown.map((row) => (
                <div key={row.label} className={styles.breakdownItem}>
                  <div className={styles.breakdownMeta}>
                    <span className={styles.breakdownLabel}>{row.label}</span>
                    <span className={styles.breakdownValue}>{formatCurrency(row.value)}</span>
                    <span className={styles.breakdownPct}>{row.pct.toFixed(1)}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFillNeutral} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.breakdownCard}>
          <h2 className={styles.sectionTitle}>By Product Type</h2>
          {isLoading ? (
            <div className={styles.breakdownList}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.breakdownItem}>
                  <div className={styles.breakdownMeta}>
                    <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: "45%" }} />
                    <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: "25%" }} />
                  </div>
                  <div className={[styles.progressTrack, styles.kpiSkeleton].join(" ")} />
                </div>
              ))}
            </div>
          ) : noData ? (
            <p className={styles.emptyBreakdown}>No data</p>
          ) : (
            <div className={styles.breakdownList}>
              {typeBreakdown.map((row) => (
                <div key={row.label} className={styles.breakdownItem}>
                  <div className={styles.breakdownMeta}>
                    <span className={styles.breakdownLabel}>{row.label}</span>
                    <span className={styles.breakdownValue}>{formatCurrency(row.value)}</span>
                    <span className={styles.breakdownPct}>{row.pct.toFixed(1)}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={row.color === "med" ? styles.progressFillMed : styles.progressFillPara}
                      style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: Sales by Staff Member ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Sales by Staff Member</h2>
        {isLoading ? (
          <div className={styles.staffTableWrap}>
            <table className={styles.staffTable}>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {SKW7.map((w, j) => (
                      <td key={j} className={styles.skeletonCell}>
                        <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : noData ? (
          <p className={styles.emptySection}>No sales recorded for this period</p>
        ) : (
          <div className={styles.staffTableWrap}>
            <table className={styles.staffTable}>
              <thead>
                <tr>
                  <th className={styles.staffTh}>Staff Member</th>
                  <th className={styles.staffTh}>Role</th>
                  <th className={[styles.staffTh, styles.staffThSortable].join(" ")} onClick={() => handleSort("salesCount")}>
                    Sales <SortIcon field="salesCount" />
                  </th>
                  <th className={[styles.staffTh, styles.staffThSortable].join(" ")} onClick={() => handleSort("medRevenue")}>
                    Medicine Rev. <SortIcon field="medRevenue" />
                  </th>
                  <th className={[styles.staffTh, styles.staffThSortable].join(" ")} onClick={() => handleSort("paraRevenue")}>
                    Parapharmacy Rev. <SortIcon field="paraRevenue" />
                  </th>
                  <th className={[styles.staffTh, styles.staffThSortable].join(" ")} onClick={() => handleSort("totalRevenue")}>
                    Total Revenue <SortIcon field="totalRevenue" />
                  </th>
                  <th className={[styles.staffTh, styles.staffThSortable].join(" ")} onClick={() => handleSort("voidedCount")}>
                    Voided <SortIcon field="voidedCount" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffRows.map((row) => (
                  <tr key={row.id} className={styles.staffTr}>
                    <td className={styles.staffTd}>{row.name}</td>
                    <td className={styles.staffTd}>
                      <span className={
                        row.role === "Cashier"   ? styles.roleCashier :
                        row.role === "Assistant" ? styles.roleAssistant : styles.rolePharmacist
                      }>{row.role}</span>
                    </td>
                    <td className={styles.staffTd}>{row.salesCount}</td>
                    <td className={styles.staffTd}>{formatCurrency(row.medRevenue)}</td>
                    <td className={styles.staffTd}>{formatCurrency(row.paraRevenue)}</td>
                    <td className={[styles.staffTd, styles.staffTdBold].join(" ")}>{formatCurrency(row.totalRevenue)}</td>
                    <td className={[styles.staffTd, row.voidedCount > 0 ? styles.staffTdVoided : ""].join(" ")}>
                      {row.voidedCount > 0 ? row.voidedCount : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 5: Top Selling Products ── */}
      <div className={styles.topProductsRow}>
        {/* Top Medicines */}
        <div className={styles.breakdownCard}>
          <h2 className={styles.sectionTitle}>Top Selling Medicines</h2>
          {isLoading ? (
            <div className={styles.topTableWrap}>
              <table className={styles.topTable}>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {SKW5.map((w, j) => (
                        <td key={j} className={styles.skeletonCell}>
                          <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : topMeds.length === 0 ? (
            <p className={styles.topEmpty}>No sales recorded for this period</p>
          ) : (
            <div className={styles.topTableWrap}>
              <table className={styles.topTable}>
                <thead>
                  <tr>
                    <th className={styles.topTh}>#</th>
                    <th className={styles.topTh}>Medicine</th>
                    <th className={styles.topTh}>Category</th>
                    <th className={[styles.topTh, styles.topThRight].join(" ")}>Qty Sold</th>
                    <th className={[styles.topTh, styles.topThRight].join(" ")}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topMeds.map((p, i) => (
                    <tr key={p.name} className={styles.topTr}>
                      <td className={[styles.topTd, styles.rankCell].join(" ")}>{i + 1}</td>
                      <td className={[styles.topTd, styles.productNameBold].join(" ")}>{p.name}</td>
                      <td className={styles.topTd}><span className={styles.categoryBadgeMed}>{p.category}</span></td>
                      <td className={[styles.topTd, styles.topTdRight].join(" ")}>{p.qty}</td>
                      <td className={[styles.topTd, styles.topTdRight].join(" ")}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Parapharmacy */}
        <div className={styles.breakdownCard}>
          <h2 className={styles.sectionTitle}>Top Parapharmacy Products</h2>
          {isLoading ? (
            <div className={styles.topTableWrap}>
              <table className={styles.topTable}>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {SKW5.map((w, j) => (
                        <td key={j} className={styles.skeletonCell}>
                          <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : topPara.length === 0 ? (
            <p className={styles.topEmpty}>No sales recorded for this period</p>
          ) : (
            <div className={styles.topTableWrap}>
              <table className={styles.topTable}>
                <thead>
                  <tr>
                    <th className={styles.topTh}>#</th>
                    <th className={styles.topTh}>Product</th>
                    <th className={styles.topTh}>Category</th>
                    <th className={[styles.topTh, styles.topThRight].join(" ")}>Qty Sold</th>
                    <th className={[styles.topTh, styles.topThRight].join(" ")}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topPara.map((p, i) => (
                    <tr key={p.name} className={styles.topTr}>
                      <td className={[styles.topTd, styles.rankCell].join(" ")}>{i + 1}</td>
                      <td className={[styles.topTd, styles.productNameBold].join(" ")}>{p.name}</td>
                      <td className={styles.topTd}><span className={styles.categoryBadgePara}>{p.category}</span></td>
                      <td className={[styles.topTd, styles.topTdRight].join(" ")}>{p.qty}</td>
                      <td className={[styles.topTd, styles.topTdRight].join(" ")}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 6: Voided Sales (hidden if none) ── */}
      {!isLoading && voidedSales.length > 0 && (
        <div className={[styles.section, styles.sectionVoided].join(" ")}>
          <h2 className={styles.sectionTitle}>Voided Sales</h2>
          <div className={styles.topTableWrap}>
            <table className={styles.topTable}>
              <thead>
                <tr>
                  <th className={styles.topTh}>Receipt #</th>
                  <th className={styles.topTh}>Date / Time</th>
                  <th className={[styles.topTh, styles.topThRight].join(" ")}>Original Total</th>
                  <th className={styles.topTh}>Voided By</th>
                  <th className={styles.topTh}>Reason</th>
                  <th className={styles.topTh}>Items</th>
                </tr>
              </thead>
              <tbody>
                {voidedSales.map((s) => {
                  const total     = s.items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
                  const itemNames = s.items.map((i) => `${i.productName} ×${i.qty}`).join("\n");
                  return (
                    <tr key={s._id} className={styles.topTr}>
                      <td className={styles.topTd}>
                        <button type="button" className={styles.receiptLinkBtn}
                          onClick={() => handleOpenDetail(s)}>
                          {s.receiptNumber}
                        </button>
                      </td>
                      <td className={styles.topTd}>{formatDateTime(s.createdAt)}</td>
                      <td className={[styles.topTd, styles.topTdRight, styles.strikethrough].join(" ")}>
                        {formatCurrency(total)}
                      </td>
                      <td className={styles.topTd}>{s.cashierName}</td>
                      <td className={styles.topTd}>
                        <span className={styles.truncatedText} title={s.voidReason ?? ""}>
                          {truncate(s.voidReason ?? "—", 60)}
                        </span>
                      </td>
                      <td className={styles.topTd}>
                        <span className={styles.itemsHint} title={itemNames}>
                          {s.items.length} item{s.items.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Section 7: Full Sales List ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          All Sales — {s7Filtered.length} transaction{s7Filtered.length !== 1 ? "s" : ""}
        </h2>

        {/* Toolbar */}
        <div className={styles.s7Toolbar}>
          <div className={styles.s7SearchWrap}>
            <Search size={14} className={styles.s7SearchIcon} />
            <input type="search" className={styles.s7SearchInput}
              placeholder="Receipt # or product name…"
              value={s7Search}
              onChange={(e) => setS7Search(e.target.value)} />
          </div>

          <div className={styles.s7FilterRow}>
            <div className={styles.s7FilterGroup}>
              {S7_TYPE_OPTS.map((o) => (
                <button key={o.v} type="button"
                  className={[styles.s7FilterBtn, s7Type === o.v ? styles.s7FilterActive : ""].join(" ")}
                  onClick={() => setS7Type(o.v)}>{o.l}</button>
              ))}
            </div>

            <div className={styles.s7FilterGroup}>
              {S7_PAY_OPTS.map((o) => (
                <button key={o.v} type="button"
                  className={[styles.s7FilterBtn, s7Pay === o.v ? styles.s7FilterActive : ""].join(" ")}
                  onClick={() => setS7Pay(o.v)}>{o.l}</button>
              ))}
            </div>

            <select className={styles.s7StaffSelect} value={s7Staff}
              onChange={(e) => setS7Staff(e.target.value)}>
              <option value="all">All Staff</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div className={styles.s7FilterGroup}>
              {S7_STATUS_OPTS.map((o) => (
                <button key={o.v} type="button"
                  className={[styles.s7FilterBtn, s7Status === o.v ? styles.s7FilterActive : ""].join(" ")}
                  onClick={() => setS7Status(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Table or empty state */}
        {s7Loading ? (
          <div className={styles.s7TableWrap}>
            <table className={styles.s7Table}>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {SKW9.map((w, j) => (
                      <td key={j} className={styles.skeletonCell}>
                        <div className={[styles.skeletonBar, styles.kpiSkeleton].join(" ")} style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : noData ? (
          <div className={styles.s7Empty}>No transactions found</div>
        ) : s7Filtered.length === 0 ? (
          <div className={styles.s7Empty}>
            <p>No sales match your filters</p>
            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={handleClearFilters}>
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.s7TableWrap}>
              <table className={styles.s7Table}>
                <thead>
                  <tr>
                    <th className={styles.s7Th}>Receipt #</th>
                    <th className={styles.s7Th}>Date / Time</th>
                    <th className={styles.s7Th}>Staff</th>
                    <th className={styles.s7Th}>Items</th>
                    <th className={[styles.s7Th, styles.s7ThRight].join(" ")}>Medicine</th>
                    <th className={[styles.s7Th, styles.s7ThRight].join(" ")}>Parapharmacy</th>
                    <th className={[styles.s7Th, styles.s7ThRight].join(" ")}>Total</th>
                    <th className={styles.s7Th}>Payment</th>
                    <th className={styles.s7Th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s7Rows.map((s) => {
                    const med  = s.items.filter((i) => i.productType === "medicine")
                                        .reduce((a, i) => a + i.unitPrice * i.qty, 0);
                    const para = s.items.filter((i) => i.productType !== "medicine")
                                        .reduce((a, i) => a + i.unitPrice * i.qty, 0);
                    return (
                      <tr key={s._id} className={styles.s7Tr}>
                        <td className={styles.s7Td}>
                          <button type="button" className={styles.s7ReceiptBtn}
                            onClick={() => handleOpenDetail(s)}>
                            {s.receiptNumber}
                          </button>
                        </td>
                        <td className={styles.s7Td}>{formatDateTime(s.createdAt)}</td>
                        <td className={styles.s7Td}>{s.cashierName}</td>
                        <td className={styles.s7Td}>{s.items.length} item{s.items.length !== 1 ? "s" : ""}</td>
                        <td className={[styles.s7Td, styles.s7ThRight, med === 0 ? styles.s7TdMuted : ""].join(" ")}>
                          {med > 0 ? formatCurrency(med) : "—"}
                        </td>
                        <td className={[styles.s7Td, styles.s7ThRight, para === 0 ? styles.s7TdMuted : ""].join(" ")}>
                          {para > 0 ? formatCurrency(para) : "—"}
                        </td>
                        <td className={[styles.s7Td, styles.s7ThRight, styles.s7TdBold].join(" ")}>
                          {formatCurrency(med + para)}
                        </td>
                        <td className={styles.s7Td}>
                          <span className={s.paymentMethod === "Cash" ? styles.s7PayCash : styles.s7PayCard}>
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className={styles.s7Td}>
                          <span className={s.status === "completed" ? styles.s7StatusCompleted : styles.s7StatusVoided}>
                            {s.status === "completed" ? "Completed" : "Voided"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {s7PageCount > 1 && (
              <div className={styles.s7Pagination}>
                <button type="button" className={styles.s7PageBtn}
                  disabled={s7Page === 0} onClick={() => setS7Page((p) => p - 1)}>‹</button>
                {Array.from({ length: s7PageCount }).map((_, i) => (
                  <button key={i} type="button"
                    className={[styles.s7PageBtn, i === s7Page ? styles.s7PageBtnActive : ""].join(" ")}
                    onClick={() => setS7Page(i)}>{i + 1}</button>
                ))}
                <button type="button" className={styles.s7PageBtn}
                  disabled={s7Page === s7PageCount - 1} onClick={() => setS7Page((p) => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {currentDetailSale && (
        <SaleDetailModal
          sale={currentDetailSale}
          isPharmacist={MOCK_USER.role === "pharmacist"}
          onClose={handleCloseDetail}
          onVoid={handleOpenVoidFromDetail}
        />
      )}
      {voidSale && (
        <VoidSaleModal
          sale={voidSale}
          onConfirm={handleVoidConfirm}
          onCancel={handleCloseVoid}
        />
      )}
    </div>
  );
}

ReportsPage.getLayout = AppLayout.getLayout;

// TODO: uncomment when backend is ready
// export const getServerSideProps = withRoleGuard([ROLES.PHARMACIST]);
