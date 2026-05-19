import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Eye, Lock, Search, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "@/styles/AuditLogsPage.module.css";

const PAGE_SIZE = 50;
const EXPORT_LIMIT = 10000;
const now = new Date("2026-04-27T14:32:05+01:00");
const dayMs = 86400000;
const toISO = (offsetMs) => new Date(now.getTime() - offsetMs).toISOString();

const ACTION_GROUPS = [
  {
    label: "Product Events",
    actions: [
      "MEDICINE_REGISTERED",
      "MEDICINE_UPDATED",
      "MEDICINE_DEACTIVATED",
      "MEDICINE_REACTIVATED",
      "PARAPHARMACY_REGISTERED",
      "PARAPHARMACY_UPDATED",
      "PARAPHARMACY_DEACTIVATED",
      "PARAPHARMACY_REACTIVATED",
    ],
  },
  {
    label: "Stock Events",
    actions: [
      "BATCH_REGISTERED",
      "BATCH_DEACTIVATED",
      "STOCK_ADJUSTED",
      "BATCH_RETURNED",
      "EXPIRY_THRESHOLD_CONFIGURED",
    ],
  },
  {
    label: "Sales Events",
    actions: [
      "SALE_COMPLETED",
      "SALE_VOIDED",
      "REGULATED_SALE_APPROVED",
      "REGULATED_SALE_REJECTED",
    ],
  },
  {
    label: "Reservation Events",
    actions: [
      "RESERVATION_SUBMITTED",
      "RESERVATION_CONFIRMED",
      "RESERVATION_REJECTED",
      "RESERVATION_CANCELLED",
      "RESERVATION_EXPIRED",
      "RESERVATION_CONVERTED",
    ],
  },
  { label: "Delivery Events", actions: ["DELIVERY_RECORDED"] },
  {
    label: "Supplier Events",
    actions: [
      "SUPPLIER_REGISTERED",
      "SUPPLIER_UPDATED",
      "SUPPLIER_DEACTIVATED",
      "SUPPLIER_REACTIVATED",
    ],
  },
  {
    label: "Customer Events",
    actions: [
      "CUSTOMER_UPDATED",
      "CUSTOMER_DEACTIVATED",
      "CUSTOMER_REACTIVATED",
    ],
  },
  {
    label: "User Events",
    actions: ["USER_CREATED", "USER_MODIFIED", "USER_DEACTIVATED", "USER_REACTIVATED", "PASSWORD_RESET"],
  },
  { label: "AI Events", actions: ["AI_CONSULTATION"] },
  { label: "System Events", actions: ["LOGIN", "LOGOUT", "EMAIL_SENT", "DAY_CLOSED"] },
];

const ENTITY_OPTIONS = [
  "users",
  "medicines",
  "parapharmacyProducts",
  "batches",
  "orders",
  "sales",
  "reservations",
  "suppliers",
  "customers",
  "deliveries",
  "auditLogs",
];

const ACTION_CATEGORY = Object.fromEntries(
  ACTION_GROUPS.flatMap((group) => group.actions.map((action) => [action, group.label]))
);

const CATEGORY_CLASS = {
  "Product Events": "product",
  "Stock Events": "stock",
  "Sales Events": "sales",
  "Reservation Events": "reservation",
  "Delivery Events": "delivery",
  "Supplier Events": "supplier",
  "Customer Events": "customer",
  "User Events": "user",
  "AI Events": "ai",
  "System Events": "system",
};

const HIGHLIGHT_ACTIONS = {
  SALE_VOIDED: "red",
  USER_DEACTIVATED: "amber",
  STOCK_ADJUSTED: "amber",
  REGULATED_SALE_REJECTED: "red",
  DAY_CLOSED: "green",
};

const MOCK_LOGS = [
  {
    _id: "662f3aa8c4e4b8b4a1010001",
    timestamp: toISO(0),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "DAY_CLOSED",
    entity: "auditLogs",
    entityId: "662f3aa8c4e4b8b4a1010001",
    payload: {
      closedDate: "2026-04-27",
      closedAt: toISO(0),
      pharmacistName: "Dr. Imane Benali",
      totalSales: 1245,
      discrepancies: 0,
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010002",
    timestamp: toISO(16 * 60000),
    user: { fullName: "Ahmed Tazi", role: "cashier" },
    action: "SALE_COMPLETED",
    entity: "sales",
    entityId: "662f3aa8c4e4b8b4a2010002",
    payload: {
      receiptNumber: "SAL-2026-001",
      totalAmount: 245,
      paymentMethod: "Cash",
      medicineItems: "Paracetamol x2, Ibuprofen x1",
      parapharmacyItems: "Vitamin C x3",
      cashier: "Ahmed Tazi",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010003",
    timestamp: toISO(42 * 60000),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "REGULATED_SALE_APPROVED",
    entity: "sales",
    entityId: "662f3aa8c4e4b8b4a2010003",
    payload: {
      saleNumber: "SAL-2026-002",
      approvedBy: "Dr. Imane Benali",
      regulatedItem: "Diazepam 5mg",
      reason: "Prescription verified",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010004",
    timestamp: toISO(2 * 3600000),
    user: { fullName: "Sara Alami", role: "assistant" },
    action: "STOCK_ADJUSTED",
    entity: "batches",
    entityId: "662f3aa8c4e4b8b4a3010004",
    payload: {
      product: "Paracetamol 500mg",
      productType: "Medicine",
      batch: "BN-2026-001",
      adjustment: "+50 units",
      reason: "Inventory correction after physical count",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010005",
    timestamp: toISO(4 * 3600000),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "MEDICINE_REGISTERED",
    entity: "medicines",
    entityId: "662f3aa8c4e4b8b4a4010005",
    payload: {
      medicineName: "Paracetamol 500mg",
      category: "Non-Prescription",
      supplier: "MedPharma Distribution",
      purchasePrice: 12,
      salePrice: 18.5,
      initialBatch: "BN-2026-001",
      expiryDate: "2027-12-31",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010006",
    timestamp: toISO(6 * 3600000),
    user: { fullName: "Sara Alami", role: "assistant" },
    action: "DELIVERY_RECORDED",
    entity: "deliveries",
    entityId: "662f3aa8c4e4b8b4a5010006",
    payload: {
      deliveryReference: "DEL-2026-001",
      supplier: "Pharma Grossiste Maroc",
      medicineItems: "Paracetamol 500mg x100, Ibuprofen 400mg x60",
      parapharmacyItems: "Hand Sanitizer 500ml x48",
      receivedBy: "Sara Alami",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010007",
    timestamp: toISO(1 * dayMs),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "USER_CREATED",
    entity: "users",
    entityId: "662f3aa8c4e4b8b4a6010007",
    payload: {
      accountType: "Assistant account",
      fullName: "Sara Alami",
      email: "sara.alami@pharmaos.local",
      role: "assistant",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010008",
    timestamp: toISO(2 * dayMs),
    user: { fullName: "Ahmed Tazi", role: "cashier" },
    action: "SALE_VOIDED",
    entity: "sales",
    entityId: "662f3aa8c4e4b8b4a2010008",
    payload: {
      receiptNumber: "SAL-2026-003",
      totalAmount: 87,
      paymentMethod: "Card",
      voidReason: "Duplicate payment attempt",
      cashier: "Ahmed Tazi",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010009",
    timestamp: toISO(3 * dayMs),
    user: { fullName: "Karim Idrissi", role: "assistant" },
    action: "RESERVATION_CONFIRMED",
    entity: "reservations",
    entityId: "662f3aa8c4e4b8b4a7010009",
    payload: {
      confirmationCode: "RES-2026-004",
      customerName: "Fatima Zahra",
      items: "Ibuprofen 400mg x1, Hand Sanitizer 500ml x2",
      pickupDate: "2026-04-28",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010010",
    timestamp: toISO(4 * dayMs),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "SUPPLIER_UPDATED",
    entity: "suppliers",
    entityId: "662f3aa8c4e4b8b4a8010010",
    payload: {
      supplierName: "MedPharma Distribution",
      contactPerson: "Hassan Ouali",
      email: "contact@medpharma.ma",
      changedFields: "Phone, Address",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010011",
    timestamp: toISO(5 * dayMs),
    user: { fullName: "System", role: "pharmacist" },
    action: "EMAIL_SENT",
    entity: "reservations",
    entityId: "662f3aa8c4e4b8b4a7010011",
    payload: {
      recipient: "customer@example.com",
      subject: "Reservation ready for pickup",
      template: "reservation_ready",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010012",
    timestamp: toISO(6 * dayMs),
    user: { fullName: "Dr. Imane Benali", role: "pharmacist" },
    action: "AI_CONSULTATION",
    entity: "auditLogs",
    entityId: "662f3aa8c4e4b8b4a9010012",
    payload: {
      consultationType: "Prescription scan",
      suggestions: 3,
      status: "Reviewed",
    },
  },
  {
    _id: "662f3aa8c4e4b8b4a1010013",
    timestamp: toISO(8 * dayMs),
    user: { fullName: "Ahmed Tazi", role: "cashier" },
    action: "LOGIN",
    entity: "users",
    entityId: "662f3aa8c4e4b8b4a6010013",
    payload: {},
  },
];

function defaultDateRange() {
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - 6 * dayMs).toISOString().slice(0, 10);
  return { from, to };
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function titleCase(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function actionLabel(action) {
  return titleCase(action);
}

function categoryForAction(action) {
  return ACTION_CATEGORY[action] ?? "System Events";
}

function categoryClass(action) {
  return styles[`category_${CATEGORY_CLASS[categoryForAction(action)]}`] ?? styles.category_system;
}

function rowHighlight(action) {
  const tone = HIGHLIGHT_ACTIONS[action];
  return tone ? styles[`highlight_${tone}`] : "";
}

function detailSummary(log) {
  const p = log.payload ?? {};
  switch (log.action) {
    case "MEDICINE_REGISTERED":
      return `${p.medicineName} - ${p.category}`;
    case "SALE_COMPLETED":
      return `Receipt #${p.receiptNumber} - ${formatCurrency(p.totalAmount)}`;
    case "SALE_VOIDED":
      return `Receipt #${p.receiptNumber} - ${p.voidReason}`;
    case "STOCK_ADJUSTED":
      return `${p.product} - ${p.adjustment} - ${p.reason}`;
    case "REGULATED_SALE_APPROVED":
      return `Sale #${p.saleNumber} - Approved by ${p.approvedBy}`;
    case "REGULATED_SALE_REJECTED":
      return `Sale #${p.saleNumber} - Rejected by ${p.rejectedBy}`;
    case "USER_CREATED":
      return `${p.accountType} - ${p.fullName}`;
    case "LOGIN":
      return "Logged in";
    case "LOGOUT":
      return "Logged out";
    case "AI_CONSULTATION":
      return `${p.consultationType} - ${p.suggestions} suggestions`;
    case "DELIVERY_RECORDED":
      return `${p.deliveryReference} - ${p.supplier}`;
    case "RESERVATION_CONFIRMED":
      return `${p.confirmationCode} - ${p.customerName}`;
    case "SUPPLIER_UPDATED":
      return `${p.supplierName} - ${p.changedFields}`;
    case "EMAIL_SENT":
      return `${p.subject} - ${p.recipient}`;
    case "DAY_CLOSED":
      return `${p.closedDate} - closed by ${p.pharmacistName}`;
    default:
      return "—";
  }
}

function payloadRows(log) {
  const p = log.payload ?? {};
  const known = {
    MEDICINE_REGISTERED: [
      ["Medicine Name", p.medicineName],
      ["Category", p.category],
      ["Supplier", p.supplier],
      ["Purchase Price", formatCurrency(p.purchasePrice)],
      ["Sale Price", formatCurrency(p.salePrice)],
      ["Initial Batch", p.initialBatch],
      ["Expiry Date", formatDateLong(p.expiryDate)],
    ],
    SALE_COMPLETED: [
      ["Receipt Number", p.receiptNumber],
      ["Total Amount", formatCurrency(p.totalAmount)],
      ["Payment Method", p.paymentMethod],
      ["Medicine Items", p.medicineItems],
      ["Parapharmacy", p.parapharmacyItems],
      ["Cashier", p.cashier],
    ],
    STOCK_ADJUSTED: [
      ["Product", p.product],
      ["Product Type", p.productType],
      ["Batch", p.batch],
      ["Adjustment", p.adjustment],
      ["Reason", p.reason],
    ],
  };

  if (known[log.action]) return known[log.action].filter(([, value]) => value);

  const entries = Object.entries(p);
  if (entries.length === 0) return [];
  return entries.map(([key, value]) => [titleCase(key), formatPayloadValue(value)]);
}

function formatPayloadValue(value) {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return Object.values(value).join(", ");
  if (String(value).match(/^\d{4}-\d{2}-\d{2}$/)) return formatDateLong(value);
  return String(value ?? "");
}

function formatDateLong(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function csvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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

export default function AuditLogsPage() {
  const range = defaultDateRange();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [fromDate, setFromDate] = useState(range.from);
  const [toDate, setToDate] = useState(range.to);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showExportWarning, setShowExportWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter, userFilter, entityFilter, fromDate, toDate, sortBy]);

  const users = useMemo(() => {
    return Array.from(new Set(MOCK_LOGS.map((log) => log.user.fullName))).sort();
  }, []);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const rows = MOCK_LOGS.filter((log) => {
      const day = log.timestamp.slice(0, 10);
      if (fromDate && day < fromDate) return false;
      if (toDate && day > toDate) return false;
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (userFilter !== "all" && log.user.fullName !== userFilter) return false;
      if (entityFilter !== "all" && log.entity !== entityFilter) return false;
      if (!query) return true;
      return [log.user.fullName, log.user.role, actionLabel(log.action), log.action, log.entity, log.entityId, detailSummary(log)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    rows.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.timestamp) - new Date(b.timestamp);
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    return rows;
  }, [actionFilter, debouncedSearch, entityFilter, fromDate, sortBy, toDate, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(
    debouncedSearch || actionFilter !== "all" || userFilter !== "all" ||
    entityFilter !== "all" || fromDate !== range.from || toDate !== range.to
  );

  function clearFilters() {
    setSearch("");
    setActionFilter("all");
    setUserFilter("all");
    setEntityFilter("all");
    setFromDate(range.from);
    setToDate(range.to);
    setSortBy("newest");
  }

  function startExport() {
    if (filtered.length > EXPORT_LIMIT) {
      setShowExportWarning(true);
      return;
    }
    exportLogs();
  }

  function exportLogs() {
    try {
      toast("Preparing audit log export...");
      const exportRows = filtered.slice(0, EXPORT_LIMIT);
      const csv = [
        "Timestamp,User,Role,Action,Entity,Entity ID,Details",
        ...exportRows.map((log) => [
          formatTimestamp(log.timestamp),
          log.user.fullName,
          titleCase(log.user.role),
          actionLabel(log.action),
          log.entity,
          log.entityId,
          detailSummary(log),
        ].map(csvField).join(",")),
      ];
      downloadCsv(`PharmaMS_AuditLogs_${fromDate}_to_${toDate}.csv`, csv);
      setShowExportWarning(false);
      toast.success("Audit log downloaded");
    } catch {
      toast.error("Export failed - please try again");
    }
  }

  function emptyMessage() {
    if (fromDate && toDate && fromDate === toDate) return "No events recorded on this date";
    if (hasFilters) return "No audit log entries match your filters";
    return "No audit log entries found";
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.subtitle}>Immutable record of all system events</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={startExport}>
          <Download size={15} />
          Export Logs
        </button>
      </div>

      <div className={styles.notice}>
        <Lock size={16} />
        <span>
          Audit logs are immutable. No entry can be modified or deleted by any user including the pharmacist administrator.
        </span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, action, or entity"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterGroup}>
            <span>Action</span>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All</option>
              {ACTION_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.actions.map((action) => (
                    <option key={action} value={action}>{actionLabel(action)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <FilterSelect
            label="User"
            value={userFilter}
            onChange={setUserFilter}
            options={[{ value: "all", label: "All" }, ...users.map((user) => ({ value: user, label: user }))]}
          />
          <FilterSelect
            label="Entity"
            value={entityFilter}
            onChange={setEntityFilter}
            options={[{ value: "all", label: "All" }, ...ENTITY_OPTIONS.map((entity) => ({ value: entity, label: entity }))]}
          />
          <DateField label="From" value={fromDate} onChange={setFromDate} />
          <DateField label="To" value={toDate} onChange={setToDate} />
          <FilterSelect
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
            ]}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{emptyMessage()}</p>
          {hasFilters && <button type="button" className={styles.secondaryBtn} onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => (
                  <tr
                    key={log._id}
                    className={[styles.clickableRow, rowHighlight(log.action)].filter(Boolean).join(" ")}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className={styles.timestamp}>{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{log.user.fullName}</strong>
                        <span className={styles.roleBadge}>{titleCase(log.user.role)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.actionBadge} ${categoryClass(log.action)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className={styles.entity}>{log.entity}</td>
                    <td className={styles.entityId} title={log.entityId}>{log.entityId.slice(0, 8)}</td>
                    <td className={styles.details} title={detailSummary(log)}>{detailSummary(log)}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="View"
                        aria-label="View audit log entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} total={filtered.length} onChange={setPage} />
        </>
      )}

      <AuditLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      <ExportWarningModal
        isOpen={showExportWarning}
        total={filtered.length}
        onCancel={() => setShowExportWarning(false)}
        onContinue={exportLogs}
      />
    </div>
  );
}

AuditLogsPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className={styles.filterGroup}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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

function Pagination({ currentPage, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <span>Page {currentPage} of {totalPages} - {total} entries</span>
      <div className={styles.pageActions}>
        <button type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>Previous</button>
        <button type="button" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}

function AuditLogDetailModal({ log, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!log) return null;

  const rows = payloadRows(log);

  function copyId() {
    navigator.clipboard.writeText(log.entityId).catch(() => {});
    setCopied(true);
    toast.success("Entry ID copied to clipboard");
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Audit Log Entry"
      size="lg"
      footer={<button type="button" className={styles.secondaryBtn} onClick={onClose}>Close</button>}
    >
      <div className={styles.modalStack}>
        <p className={styles.modalSubtitle}>{formatTimestamp(log.timestamp)}</p>
        <section className={styles.modalSection}>
          <div className={styles.kvGrid}>
            <div><span>User</span><strong>{log.user.fullName} <span className={styles.roleBadge}>{titleCase(log.user.role)}</span></strong></div>
            <div><span>Action</span><strong><span className={`${styles.actionBadge} ${categoryClass(log.action)}`}>{actionLabel(log.action)}</span></strong></div>
            <div><span>Entity</span><strong>{log.entity}</strong></div>
            <div>
              <span>Entity ID</span>
              <strong className={styles.copyLine}>
                <span className={styles.fullId}>{log.entityId}</span>
                <button type="button" className={styles.copyBtn} onClick={copyId} title={copied ? "Copied!" : "Copy ID"}>
                  <Copy size={14} />
                </button>
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.modalSection}>
          <h3>Event Details</h3>
          {rows.length === 0 ? (
            <p className={styles.noDetails}>No additional details available</p>
          ) : (
            <div className={styles.payloadList}>
              {rows.map(([label, value]) => (
                <div key={label} className={styles.payloadRow}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

function ExportWarningModal({ isOpen, total, onCancel, onContinue }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Large Export"
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button type="button" className={styles.primaryBtn} onClick={onContinue}>Continue Export</button>
        </>
      )}
    >
      <div className={styles.warningBox}>
        Your filter returns {total} entries. Only the most recent 10,000 will be exported.
        Narrow your date range or filters to export all records.
      </div>
    </Modal>
  );
}
