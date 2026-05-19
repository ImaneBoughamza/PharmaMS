import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Download, Search, X } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import SaleDetailModal from "@/components/pos/SaleDetailModal";
import ReservationDetail from "@/components/reservations/ReservationDetail";
import TransactionTable from "@/components/transactions/TransactionTable";
import { PHARMACIST } from "@/constants/roles";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { getServerAuthUser } from "@/utils/serverAuth";
import api from "@/lib/axios";
import styles from "@/styles/TransactionsPage.module.css";

const PAGE_SIZE = 20;
const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const now = new Date();
const todayKey = now.toISOString().slice(0, 10);
const sub = (ms) => new Date(now.getTime() - ms).toISOString();

const STAFF = ["Dr. Imane Benali", "Sara Alami", "Ahmed Tazi", "Youssef El Amrani"];

const MOCK_TRANSACTIONS = [
  {
    _id: "s1",
    _type: "sale",
    reference: "SAL-2026-001",
    receiptNumber: "SAL-2026-001",
    createdAt: sub(45 * 60000),
    staffName: "Ahmed Tazi",
    cashierName: "Ahmed Tazi",
    paymentMethod: "Cash",
    status: "completed",
    productTypes: ["medicine", "parapharmacy"],
    items: [
      { productName: "Paracetamol 500mg", productType: "medicine", batchNumber: "PAR-0426-A", qty: 2, unitPrice: 18 },
      { productName: "Sunscreen SPF50+", productType: "parapharmacy", qty: 1, unitPrice: 86 },
    ],
  },
  {
    _id: "s2",
    _type: "sale",
    reference: "SAL-2026-002",
    receiptNumber: "SAL-2026-002",
    createdAt: sub(2 * HOUR_MS),
    staffName: "Sara Alami",
    cashierName: "Sara Alami",
    paymentMethod: "Card",
    status: "completed",
    productTypes: ["medicine"],
    items: [
      { productName: "Amoxicillin 500mg", productType: "medicine", batchNumber: "AMX-2201", qty: 1, unitPrice: 64 },
      { productName: "Vitamin D3", productType: "medicine", batchNumber: "VD3-071", qty: 1, unitPrice: 48 },
    ],
  },
  {
    _id: "s3",
    _type: "sale",
    reference: "SAL-2026-003",
    receiptNumber: "SAL-2026-003",
    createdAt: sub(5 * HOUR_MS),
    staffName: "Ahmed Tazi",
    cashierName: "Ahmed Tazi",
    paymentMethod: "Cash",
    status: "voided",
    voidReason: "Duplicate checkout created during payment retry.",
    productTypes: ["parapharmacy"],
    items: [
      { productName: "Baby Shampoo", productType: "parapharmacy", qty: 2, unitPrice: 38 },
    ],
  },
  {
    _id: "r1",
    _type: "reservation",
    reference: "RES-2026-001",
    confirmationCode: "RES-2026-001",
    trackingCode: "RES-2026-001",
    createdAt: sub(3 * HOUR_MS),
    staffName: "Dr. Imane Benali",
    status: "confirmed",
    productTypes: ["medicine", "parapharmacy"],
    customerName: "Fatima Zahra",
    phone: "+212 612345678",
    email: "fatima.zahra@example.com",
    paymentMethod: "Pay on Pickup",
    pickupDate: new Date(now.getTime() + DAY_MS).toISOString().slice(0, 10),
    items: [
      { productName: "Ibuprofen 400mg", productType: "medicine", qty: 1, unitPrice: 27 },
      { productName: "Hand Sanitizer 500ml", productType: "parapharmacy", qty: 2, unitPrice: 31 },
    ],
  },
  {
    _id: "r2",
    _type: "reservation",
    reference: "RES-2026-002",
    confirmationCode: "RES-2026-002",
    trackingCode: "RES-2026-002",
    createdAt: sub(DAY_MS + HOUR_MS),
    staffName: "Youssef El Amrani",
    status: "ready",
    productTypes: ["medicine"],
    customerName: "Karim Mansouri",
    phone: "+212 677889900",
    email: "karim.mansouri@example.com",
    paymentMethod: "Online",
    pickupDate: todayKey,
    items: [
      { productName: "Vitamin C 1000mg", productType: "medicine", qty: 2, unitPrice: 42 },
    ],
  },
  {
    _id: "r3",
    _type: "reservation",
    reference: "RES-2026-003",
    confirmationCode: "RES-2026-003",
    trackingCode: "RES-2026-003",
    createdAt: sub(2 * DAY_MS),
    staffName: "Dr. Imane Benali",
    status: "cancelled",
    rejectionReason: "Requested product is unavailable from current stock.",
    productTypes: ["parapharmacy"],
    customerName: "Nadia El Fassi",
    phone: "+212 699112233",
    email: "nadia.elfassi@example.com",
    paymentMethod: "Pay on Pickup",
    pickupDate: new Date(now.getTime() + 2 * DAY_MS).toISOString().slice(0, 10),
    items: [
      { productName: "La Roche-Posay SPF50", productType: "parapharmacy", qty: 1, unitPrice: 185 },
    ],
  },
  {
    _id: "d1",
    _type: "delivery",
    reference: "DEL-2026-001",
    createdAt: sub(4 * HOUR_MS),
    deliveryDate: sub(4 * HOUR_MS),
    staffName: "Dr. Imane Benali",
    supplierName: "PharmaDist Maroc",
    status: "received",
    productTypes: ["medicine"],
    itemCount: 90,
    medicineItems: [
      { medicineName: "Omeprazole 20mg", batchNumber: "OMP-0927", expiryDate: "2027-09-01", receivedQty: 50, purchasePrice: 18 },
      { medicineName: "Cetirizine 10mg", batchNumber: "CET-0527", expiryDate: "2027-05-20", receivedQty: 40, purchasePrice: 16 },
    ],
    parapharmacyItems: [],
  },
  {
    _id: "d2",
    _type: "delivery",
    reference: "DEL-2026-002",
    createdAt: sub(3 * DAY_MS),
    deliveryDate: sub(3 * DAY_MS),
    staffName: "Sara Alami",
    supplierName: "BioLab Supplies",
    status: "received",
    productTypes: ["parapharmacy"],
    itemCount: 36,
    medicineItems: [],
    parapharmacyItems: [
      { productName: "Bioderma Sensibio H2O", receivedQty: 24, purchasePrice: 71 },
      { productName: "CeraVe Moisturiser", receivedQty: 12, purchasePrice: 92 },
    ],
  },
];

const MOCK_RECONCILIATION = {
  discrepancies: [],
  closed: false,
  closedAt: null,
  pharmacistName: "Dr. Imane Benali",
};

const STATUS_OPTIONS = [
  "completed",
  "pending",
  "confirmed",
  "ready",
  "voided",
  "cancelled",
  "expired",
  "ordered",
  "received",
];

const PERIOD_LABEL = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  custom: "Custom Range",
};

function saleAmount(sale) {
  return sale.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

function reservationAmount(reservation) {
  return reservation.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

const TRANSACTIONS = MOCK_TRANSACTIONS.map((tx) => ({
  ...tx,
  amount: tx._type === "sale" ? saleAmount(tx) : tx._type === "reservation" ? reservationAmount(tx) : 0,
}));

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getPeriodRange(period, customFrom, customTo) {
  const today = new Date().toISOString().slice(0, 10);
  if (period === "today") return { from: today, to: today };
  if (period === "week") return { from: getWeekStart().toISOString().slice(0, 10), to: today };
  if (period === "month") return { from: getMonthStart().toISOString().slice(0, 10), to: today };
  return { from: customFrom || today, to: customTo || today };
}

function inDateRange(value, from, to) {
  const day = value.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function calculateSummary(transactions) {
  const sales = transactions.filter((tx) => tx._type === "sale");
  const completedSales = sales.filter((tx) => tx.status === "completed");
  const voidedSales = sales.filter((tx) => tx.status === "voided");
  const reservations = transactions.filter((tx) => tx._type === "reservation");
  const deliveries = transactions.filter((tx) => tx._type === "delivery");

  const revenue = completedSales.reduce((acc, sale) => {
    acc.total += sale.amount;
    if (sale.paymentMethod === "Cash") acc.cash += sale.amount;
    if (sale.paymentMethod === "Card") acc.card += sale.amount;
    sale.items.forEach((item) => {
      const amount = item.qty * item.unitPrice;
      if (item.productType === "medicine") acc.medicine += amount;
      else acc.parapharmacy += amount;
    });
    return acc;
  }, { total: 0, cash: 0, card: 0, medicine: 0, parapharmacy: 0 });

  const reservationCounts = reservations.reduce((acc, tx) => {
    acc.total += 1;
    acc[tx.status] = (acc[tx.status] ?? 0) + 1;
    return acc;
  }, { total: 0, pending: 0, confirmed: 0, ready: 0, expired: 0, cancelled: 0 });

  const deliveryCounts = deliveries.reduce((acc, tx) => {
    acc.total += 1;
    if (tx.productTypes.includes("medicine")) acc.medicine += 1;
    if (tx.productTypes.includes("parapharmacy")) acc.parapharmacy += 1;
    return acc;
  }, { total: 0, medicine: 0, parapharmacy: 0 });

  return {
    revenue,
    salesCount: completedSales.length,
    voidedSales,
    reservations: reservationCounts,
    deliveries: deliveryCounts,
  };
}

function buildChartData(transactions, period) {
  const buckets = {};
  const completedSales = transactions.filter((tx) => tx._type === "sale" && tx.status === "completed");
  const reservations = transactions.filter((tx) => tx._type === "reservation");
  const ensureBucket = (key, label) => {
    if (!buckets[key]) {
      buckets[key] = { label, medicineRevenue: 0, parapharmacyRevenue: 0, reservationCount: 0 };
    }
    return buckets[key];
  };

  if (period === "today") {
    for (let h = 0; h <= new Date().getHours(); h += 1) {
      ensureBucket(h, `${h}:00`);
    }
    completedSales.forEach((sale) => {
      const h = new Date(sale.createdAt).getHours();
      const bucket = ensureBucket(h, `${h}:00`);
      sale.items.forEach((item) => {
        const amount = item.qty * item.unitPrice;
        if (item.productType === "medicine") bucket.medicineRevenue += amount;
        else bucket.parapharmacyRevenue += amount;
      });
    });
    reservations.forEach((reservation) => {
      const h = new Date(reservation.createdAt).getHours();
      ensureBucket(h, `${h}:00`).reservationCount += 1;
    });
    return Object.values(buckets).sort((a, b) => Number(a.label.split(":")[0]) - Number(b.label.split(":")[0]));
  }

  transactions.forEach((tx) => {
    const label = formatDate(tx.createdAt);
    ensureBucket(label, label);
  });
  completedSales.forEach((sale) => {
    const label = formatDate(sale.createdAt);
    const bucket = ensureBucket(label, label);
    sale.items.forEach((item) => {
      const amount = item.qty * item.unitPrice;
      if (item.productType === "medicine") bucket.medicineRevenue += amount;
      else bucket.parapharmacyRevenue += amount;
    });
  });
  reservations.forEach((reservation) => {
    const label = formatDate(reservation.createdAt);
    ensureBucket(label, label).reservationCount += 1;
  });
  return Object.values(buckets);
}

function getSearchText(tx) {
  const products = [
    ...(tx.items ?? []).map((item) => item.productName),
    ...(tx.medicineItems ?? []).map((item) => item.medicineName),
    ...(tx.parapharmacyItems ?? []).map((item) => item.productName),
  ];
  return [tx.reference, tx.staffName, tx.customerName, tx.supplierName, ...products]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function downloadCsv(filename, rows) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const [summaryPeriod, setSummaryPeriod] = useState("today");
  const [summaryFrom, setSummaryFrom] = useState("");
  const [summaryTo, setSummaryTo] = useState("");
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [normalConfirm, setNormalConfirm] = useState(false);
  const [discrepancyConfirm, setDiscrepancyConfirm] = useState(false);
  const [confirmingClosure, setConfirmingClosure] = useState(false);
  const [closedRecord, setClosedRecord] = useState(MOCK_RECONCILIATION);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    if (router.query.openReconciliation === "true") {
      setReconciliationOpen(true);
    }
  }, [router.query.openReconciliation]);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setIsLoadingTransactions(true);
      try {
        const { data } = await api.get("/api/transactions", { params: { limit: 1000 } });
        if (!cancelled) {
          setTransactions((data.data ?? []).map((tx) => ({
            ...tx,
            _type: tx._type || tx.type,
            createdAt: tx.createdAt || tx.date,
            productTypes: tx.productTypes ?? [],
            staffName: tx.staffName || tx.staff?.fullName || "Staff",
            amount: tx.amount ?? 0,
            itemCount: tx.itemCount ?? (tx.items?.length || tx.medicineItems?.length || tx.parapharmacyItems?.length || 0),
          })));
        }
      } catch (error) {
        if (!cancelled) toast.error(error?.response?.data?.message ?? "Failed to load transactions");
      } finally {
        if (!cancelled) setIsLoadingTransactions(false);
      }
    }

    loadTransactions();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, productTypeFilter, staffFilter, statusFilter, fromDate, toDate, sortBy]);

  const filteredTransactions = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const rows = transactions.filter((tx) => {
      if (typeFilter !== "all" && tx._type !== typeFilter) return false;
      if (staffFilter !== "all" && tx.staffName !== staffFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (!inDateRange(tx.createdAt, fromDate, toDate)) return false;

      const hasMedicine = tx.productTypes.includes("medicine");
      const hasParapharmacy = tx.productTypes.includes("parapharmacy");
      if (productTypeFilter === "medicine" && (!hasMedicine || hasParapharmacy)) return false;
      if (productTypeFilter === "parapharmacy" && (!hasParapharmacy || hasMedicine)) return false;
      if (productTypeFilter === "mixed" && (!hasMedicine || !hasParapharmacy)) return false;

      return !query || getSearchText(tx).includes(query);
    });

    rows.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount-high") return b.amount - a.amount;
      if (sortBy === "amount-low") return a.amount - b.amount;
      if (sortBy === "type") return a._type.localeCompare(b._type);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return rows;
  }, [transactions, debouncedSearch, typeFilter, productTypeFilter, staffFilter, statusFilter, fromDate, toDate, sortBy]);

  const summaryRange = getPeriodRange(summaryPeriod, summaryFrom, summaryTo);
  const summaryTransactions = useMemo(
    () => transactions.filter((tx) => inDateRange(tx.createdAt, summaryRange.from, summaryRange.to)),
    [transactions, summaryRange.from, summaryRange.to]
  );
  const summary = useMemo(() => calculateSummary(summaryTransactions), [summaryTransactions]);
  const chartData = useMemo(() => buildChartData(summaryTransactions, summaryPeriod), [summaryTransactions, summaryPeriod]);
  const todayTransactions = useMemo(() => transactions.filter((tx) => inDateRange(tx.createdAt, todayKey, todayKey)), [transactions]);
  const todaySummary = useMemo(() => calculateSummary(todayTransactions), [todayTransactions]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(
    debouncedSearch || typeFilter !== "all" || productTypeFilter !== "all" ||
    staffFilter !== "all" || statusFilter !== "all" || fromDate || toDate
  );

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setProductTypeFilter("all");
    setStaffFilter("all");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setSortBy("newest");
  }

  function handleExport() {
    try {
      toast("Downloading transactions...");
      if (activeTab === "transactions") {
        const from = fromDate || "all";
        const to = toDate || "all";
        const rows = [
          "Reference,Type,Date,Staff,Product Types,Amount/Qty,Status",
          ...filteredTransactions.map((tx) => [
            tx.reference,
            titleCase(tx._type),
            formatDateTime(tx.createdAt),
            tx.staffName,
            tx.productTypes.map(titleCase).join(" + "),
            tx._type === "delivery" ? `${tx.itemCount} items received` : formatCurrency(tx.amount),
            titleCase(tx.status),
          ].map(csvField).join(",")),
        ];
        downloadCsv(`PharmaMS_Transactions_${from}_to_${to}.csv`, rows);
      } else {
        const rows = [
          "Section,Metric,Value",
          ["Revenue", "Total Sales Revenue", formatCurrency(summary.revenue.total)].map(csvField).join(","),
          ["Revenue", "Medicine Revenue", formatCurrency(summary.revenue.medicine)].map(csvField).join(","),
          ["Revenue", "Parapharmacy Revenue", formatCurrency(summary.revenue.parapharmacy)].map(csvField).join(","),
          ["Revenue", "Voided Sales", summary.voidedSales.length].map(csvField).join(","),
          ["Reservations", "Total Reservations", summary.reservations.total].map(csvField).join(","),
          ["Reservations", "Pending", summary.reservations.pending].map(csvField).join(","),
          ["Reservations", "Confirmed", summary.reservations.confirmed].map(csvField).join(","),
          ["Reservations", "Ready", summary.reservations.ready].map(csvField).join(","),
          ["Reservations", "Expired", summary.reservations.expired].map(csvField).join(","),
          ["Reservations", "Cancelled", summary.reservations.cancelled].map(csvField).join(","),
          ["Deliveries", "Total Deliveries", summary.deliveries.total].map(csvField).join(","),
          ["Deliveries", "Medicine Deliveries", summary.deliveries.medicine].map(csvField).join(","),
          ["Deliveries", "Parapharmacy Deliveries", summary.deliveries.parapharmacy].map(csvField).join(","),
        ];
        downloadCsv(`PharmaMS_TransactionSummary_${summaryRange.from}_to_${summaryRange.to}.csv`, rows);
      }
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed - please try again");
    }
  }

  function handleCloseDay() {
    const timestamp = new Date().toISOString();
    setClosedRecord({
      ...closedRecord,
      closed: true,
      closedAt: timestamp,
      pharmacistName: "Dr. Imane Benali",
    });
    setConfirmingClosure(false);
    toast.success(`Day ${formatDate(todayKey)} closed successfully`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>Unified view of all system activity</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => setReconciliationOpen(true)}>
            End-of-Day Reconciliation
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={handleExport}>
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "transactions" ? styles.activeTab : ""}
          onClick={() => setActiveTab("transactions")}
        >
          All Transactions
        </button>
        <button
          type="button"
          className={activeTab === "summary" ? styles.activeTab : ""}
          onClick={() => setActiveTab("summary")}
        >
          Summary Report
        </button>
      </div>

      {activeTab === "transactions" ? (
        <>
          <TransactionsToolbar
            search={search}
            setSearch={setSearch}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            productTypeFilter={productTypeFilter}
            setProductTypeFilter={setProductTypeFilter}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {filteredTransactions.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          ) : (
            <>
              <TransactionTable transactions={paginatedTransactions} onView={setSelectedTx} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </>
          )}
        </>
      ) : (
        <SummaryReport
          period={summaryPeriod}
          setPeriod={setSummaryPeriod}
          customFrom={summaryFrom}
          setCustomFrom={setSummaryFrom}
          customTo={summaryTo}
          setCustomTo={setSummaryTo}
          range={summaryRange}
          summary={summary}
          chartData={chartData}
        />
      )}

      <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      <ReconciliationDrawer
        isOpen={reconciliationOpen}
        onClose={() => setReconciliationOpen(false)}
        todaySummary={todaySummary}
        closedRecord={closedRecord}
        normalConfirm={normalConfirm}
        setNormalConfirm={setNormalConfirm}
        discrepancyConfirm={discrepancyConfirm}
        setDiscrepancyConfirm={setDiscrepancyConfirm}
        confirmingClosure={confirmingClosure}
        setConfirmingClosure={setConfirmingClosure}
        onConfirmClosure={handleCloseDay}
      />
    </div>
  );
}

TransactionsPage.getLayout = AppLayout.getLayout;

function TransactionsToolbar(props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchRow}>
        <Search size={16} />
        <input
          value={props.search}
          onChange={(e) => props.setSearch(e.target.value)}
          placeholder="Search by receipt number, product name, or staff name"
        />
        {props.search && (
          <button type="button" onClick={() => props.setSearch("")} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>
      <div className={styles.filterRow}>
        <FilterSelect label="Type" value={props.typeFilter} onChange={props.setTypeFilter} options={[
          { value: "all", label: "All" },
          { value: "sale", label: "Sales" },
          { value: "reservation", label: "Reservations" },
          { value: "delivery", label: "Deliveries" },
        ]} />
        <FilterSelect label="Product Type" value={props.productTypeFilter} onChange={props.setProductTypeFilter} options={[
          { value: "all", label: "All" },
          { value: "medicine", label: "Medicines Only" },
          { value: "parapharmacy", label: "Parapharmacy Only" },
          { value: "mixed", label: "Mixed" },
        ]} />
        <FilterSelect label="Staff" value={props.staffFilter} onChange={props.setStaffFilter} options={[
          { value: "all", label: "All" },
          ...STAFF.map((staff) => ({ value: staff, label: staff })),
        ]} />
        <FilterSelect label="Status" value={props.statusFilter} onChange={props.setStatusFilter} options={[
          { value: "all", label: "All" },
          ...STATUS_OPTIONS.map((status) => ({ value: status, label: titleCase(status) })),
        ]} />
        <DateField label="From" value={props.fromDate} onChange={props.setFromDate} />
        <DateField label="To" value={props.toDate} onChange={props.setToDate} />
        <FilterSelect label="Sort" value={props.sortBy} onChange={props.setSortBy} options={[
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
          { value: "amount-high", label: "Amount (High-Low)" },
          { value: "amount-low", label: "Amount (Low-High)" },
          { value: "type", label: "Type" },
        ]} />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className={styles.filterGroup}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className={styles.filterGroup}>
      <span>{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className={styles.emptyState}>
      <p>{hasFilters ? "No transactions match your filters" : "No transactions recorded"}</p>
      <span>
        {hasFilters
          ? "Adjust your filters or clear them to see more activity."
          : "Transactions will appear here as sales, reservations, and deliveries are processed."}
      </span>
      {hasFilters && (
        <button type="button" className={styles.secondaryBtn} onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button type="button" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
        Next
      </button>
    </div>
  );
}

function SummaryReport({ period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, range, summary, chartData }) {
  return (
    <div className={styles.summaryStack}>
      <div className={styles.periodToolbar}>
        {Object.entries(PERIOD_LABEL).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={period === key ? styles.activePeriod : ""}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
        {period === "custom" && (
          <div className={styles.customRange}>
            <DateField label="From" value={customFrom} onChange={setCustomFrom} />
            <DateField label="To" value={customTo} onChange={setCustomTo} />
          </div>
        )}
        <span className={styles.periodHint}>{formatDate(range.from)} to {formatDate(range.to)}</span>
      </div>

      <div className={styles.kpiGrid}>
        <KpiCard label="Total Sales Revenue" value={formatCurrency(summary.revenue.total)} subtext={`${summary.salesCount} sales`} tone="green" />
        <KpiCard label="Medicine Revenue" value={formatCurrency(summary.revenue.medicine)} tone="green" />
        <KpiCard label="Parapharmacy Revenue" value={formatCurrency(summary.revenue.parapharmacy)} tone="amber" />
        <KpiCard
          label="Voided Sales"
          value={summary.voidedSales.length}
          subtext={`${summary.voidedSales.length} voided transactions`}
          tone={summary.voidedSales.length > 0 ? "red" : "gray"}
        />
      </div>

      <section className={styles.summarySection}>
        <h2>Reservation Summary</h2>
        <div className={styles.inlineStats}>
          <InlineStat label="Total Reservations" value={summary.reservations.total} />
          <InlineStat label="Pending" value={summary.reservations.pending} tone={summary.reservations.pending > 0 ? "amber" : ""} />
          <InlineStat label="Confirmed" value={summary.reservations.confirmed} />
          <InlineStat label="Ready for Pickup" value={summary.reservations.ready} tone="green" />
          <InlineStat label="Expired" value={summary.reservations.expired} tone={summary.reservations.expired > 0 ? "red" : ""} />
          <InlineStat label="Cancelled" value={summary.reservations.cancelled} />
        </div>
      </section>

      <section className={styles.summarySection}>
        <h2>Delivery Summary</h2>
        <div className={styles.inlineStats}>
          <InlineStat label="Total Deliveries" value={summary.deliveries.total} />
          <InlineStat label="Medicine Deliveries" value={summary.deliveries.medicine} />
          <InlineStat label="Parapharmacy Deliveries" value={summary.deliveries.parapharmacy} />
        </div>
      </section>

      <section className={styles.summarySection}>
        <h2>Activity Timeline</h2>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="count" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="bottom" height={28} />
              <Bar yAxisId="revenue" dataKey="medicineRevenue" stackId="sales" fill="#1B5E42" name="Medicine Sales Revenue" />
              <Bar yAxisId="revenue" dataKey="parapharmacyRevenue" stackId="sales" fill="#D97706" name="Parapharmacy Revenue" />
              <Line yAxisId="count" type="monotone" dataKey="reservationCount" stroke="#1E3A5F" strokeWidth={2} name="Reservation Count" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, subtext, tone }) {
  return (
    <div className={[styles.kpiCard, tone ? styles[`tone_${tone}`] : ""].join(" ")}>
      <p>{label}</p>
      <strong>{value}</strong>
      {subtext && <span>{subtext}</span>}
    </div>
  );
}

function InlineStat({ label, value, tone }) {
  return (
    <div className={[styles.inlineStat, tone ? styles[`stat_${tone}`] : ""].join(" ")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const med = payload.find((item) => item.dataKey === "medicineRevenue")?.value ?? 0;
  const para = payload.find((item) => item.dataKey === "parapharmacyRevenue")?.value ?? 0;
  const reservations = payload.find((item) => item.dataKey === "reservationCount")?.value ?? 0;
  return (
    <div className={styles.chartTooltip}>
      <strong>{label}</strong>
      <p>Medicine Revenue: {formatCurrency(med)}</p>
      <p>Parapharmacy Revenue: {formatCurrency(para)}</p>
      <p>Total Revenue: {formatCurrency(med + para)}</p>
      <p>Reservations: {reservations}</p>
    </div>
  );
}

function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;
  if (transaction._type === "sale") {
    return <SaleDetailModal sale={transaction} isPharmacist={false} onClose={onClose} onVoid={() => {}} />;
  }

  if (transaction._type === "reservation") {
    return (
      <Modal
        isOpen
        onClose={onClose}
        title={`Reservation ${transaction.confirmationCode}`}
        size="lg"
        footer={<button type="button" className={styles.secondaryBtn} onClick={onClose}>Close</button>}
      >
        <div className={styles.modalMeta}>
          <span>{formatDateTime(transaction.createdAt)} - {transaction.staffName}</span>
          <Badge variant={transaction.status}>{titleCase(transaction.status)}</Badge>
        </div>
        <ReservationDetail reservation={transaction} />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Delivery ${transaction.reference}`}
      size="lg"
      footer={<button type="button" className={styles.secondaryBtn} onClick={onClose}>Close</button>}
    >
      <div className={styles.modalMeta}>
        <span>{formatDateTime(transaction.createdAt)} - {transaction.staffName}</span>
        <Badge variant="success">Received</Badge>
      </div>
      <DeliveryDetail transaction={transaction} />
    </Modal>
  );
}

function DeliveryDetail({ transaction }) {
  return (
    <div className={styles.detailStack}>
      <div className={styles.detailGrid}>
        <p><span>Supplier</span><strong>{transaction.supplierName}</strong></p>
        <p><span>Received by</span><strong>{transaction.staffName}</strong></p>
        <p><span>Date</span><strong>{formatDateTime(transaction.deliveryDate)}</strong></p>
      </div>
      {transaction.medicineItems.length > 0 && (
        <>
          <h3 className={styles.detailTitle}>Medicine Items</h3>
          <DetailTable
            headers={["Medicine", "Batch Number", "Expiry Date", "Received Qty", "Purchase Price"]}
            rows={transaction.medicineItems.map((item) => [
              item.medicineName,
              item.batchNumber,
              formatDate(item.expiryDate),
              item.receivedQty,
              formatCurrency(item.purchasePrice),
            ])}
          />
        </>
      )}
      {transaction.parapharmacyItems.length > 0 && (
        <>
          <h3 className={styles.detailTitle}>Parapharmacy Items</h3>
          <DetailTable
            headers={["Product", "Received Qty", "Purchase Price"]}
            rows={transaction.parapharmacyItems.map((item) => [
              item.productName,
              item.receivedQty,
              formatCurrency(item.purchasePrice),
            ])}
          />
        </>
      )}
    </div>
  );
}

function DetailTable({ headers, rows }) {
  return (
    <table className={styles.detailTable}>
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReconciliationDrawer(props) {
  if (!props.isOpen) return null;
  const discrepancies = props.closedRecord.discrepancies ?? [];
  const hasDiscrepancies = discrepancies.length > 0;
  const canClose = props.normalConfirm && (!hasDiscrepancies || props.discrepancyConfirm);

  return (
    <div className={styles.drawerLayer}>
      <div className={styles.drawerShade} onClick={props.onClose} />
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <h2>End-of-Day Reconciliation</h2>
            <p>{formatDate(todayKey)}</p>
          </div>
          <button type="button" onClick={props.onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {props.closedRecord.closed && (
          <div className={styles.successBanner}>
            This day was closed on {formatDateTime(props.closedRecord.closedAt)} by {props.closedRecord.pharmacistName}
          </div>
        )}

        <div className={styles.drawerBody}>
          <DrawerSection title="Today's Revenue Summary">
            <div className={styles.reconcileRows}>
              <p className={styles.largeRow}><span>Total Completed Sales</span><strong>{formatCurrency(props.todaySummary.revenue.total)}</strong></p>
              <p><span>Cash Sales</span><strong>{formatCurrency(props.todaySummary.revenue.cash)}</strong></p>
              <p><span>Card Sales</span><strong>{formatCurrency(props.todaySummary.revenue.card)}</strong></p>
              <p><span>Medicine Revenue</span><strong>{formatCurrency(props.todaySummary.revenue.medicine)}</strong></p>
              <p><span>Parapharmacy Revenue</span><strong>{formatCurrency(props.todaySummary.revenue.parapharmacy)}</strong></p>
              <p><span>Total Sales Count</span><strong>{props.todaySummary.salesCount} transactions</strong></p>
              <p className={props.todaySummary.voidedSales.length > 0 ? styles.dangerRow : ""}>
                <span>Voided Sales</span><strong>{props.todaySummary.voidedSales.length} transactions</strong>
              </p>
            </div>
            {props.todaySummary.voidedSales.length > 0 && (
              <div className={styles.reasonList}>
                {props.todaySummary.voidedSales.map((sale) => (
                  <p key={sale._id}><strong>{sale.reference}</strong> - {sale.voidReason}</p>
                ))}
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Today's Reservations">
            <div className={styles.reconcileRows}>
              <p><span>Reservations Received</span><strong>{props.todaySummary.reservations.total}</strong></p>
              <p><span>Confirmed Today</span><strong>{props.todaySummary.reservations.confirmed}</strong></p>
              <p><span>Rejected Today</span><strong>{props.todaySummary.reservations.cancelled}</strong></p>
              <p><span>Converted to Sales</span><strong>0</strong></p>
              <p><span>Auto-Expired</span><strong>{props.todaySummary.reservations.expired}</strong></p>
            </div>
          </DrawerSection>

          <DrawerSection title="Today's Deliveries">
            <div className={styles.reconcileRows}>
              <p><span>Deliveries Received</span><strong>{props.todaySummary.deliveries.total}</strong></p>
              <p><span>Medicine Deliveries</span><strong>{props.todaySummary.deliveries.medicine}</strong></p>
              <p><span>Parapharmacy Deliveries</span><strong>{props.todaySummary.deliveries.parapharmacy}</strong></p>
            </div>
          </DrawerSection>

          <DrawerSection title="Discrepancy Check">
            {hasDiscrepancies ? (
              <>
                <div className={styles.warningBanner}>
                  {discrepancies.length} discrepancy detected - review before closing the day
                </div>
                <DetailTable
                  headers={["Type", "Expected", "Recorded", "Difference"]}
                  rows={discrepancies.map((item) => [item.type, item.expected, item.recorded, item.difference])}
                />
                <p className={styles.drawerNote}>Review these discrepancies before confirming the day closure.</p>
              </>
            ) : (
              <div className={styles.successBanner}>No discrepancies detected - all transactions balance correctly</div>
            )}
          </DrawerSection>

          <DrawerSection title="Close the Day">
            {props.closedRecord.closed ? (
              <div className={styles.successBanner}>
                Day closed at {formatDateTime(props.closedRecord.closedAt)} by {props.closedRecord.pharmacistName}
              </div>
            ) : (
              <div className={styles.closeDayBox}>
                <p>
                  By confirming, you attest that the above records are accurate and complete.
                  This action is permanent and cannot be undone.
                </p>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={props.normalConfirm}
                    onChange={(e) => props.setNormalConfirm(e.target.checked)}
                  />
                  I confirm the accuracy of today's transaction records
                </label>
                {hasDiscrepancies && (
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={props.discrepancyConfirm}
                      onChange={(e) => props.setDiscrepancyConfirm(e.target.checked)}
                    />
                    I acknowledge the discrepancies listed above and confirm closure
                  </label>
                )}
                <button
                  type="button"
                  className={styles.primaryWideBtn}
                  disabled={!canClose}
                  onClick={() => props.setConfirmingClosure(true)}
                >
                  Close the Day
                </button>
                {props.confirmingClosure && (
                  <div className={styles.inlineConfirm}>
                    <p>This will permanently close {formatDate(todayKey)}. This record cannot be modified after closure.</p>
                    <div>
                      <button type="button" className={styles.secondaryBtn} onClick={() => props.setConfirmingClosure(false)}>Cancel</button>
                      <button type="button" className={styles.dangerBtn} onClick={props.onConfirmClosure}>Confirm Closure</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DrawerSection>
        </div>
      </aside>
    </div>
  );
}

function DrawerSection({ title, children }) {
  return (
    <section className={styles.drawerSection}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export async function getServerSideProps(context) {
  const user = await getServerAuthUser(context);
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  if (user.mustChangePassword) {
    return { redirect: { destination: "/profile", permanent: false } };
  }
  if (user.role !== PHARMACIST) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: { user } };
}
