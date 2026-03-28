import { useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/AuditLogsPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

const PAGE_SIZE = 10;

const MOCK_LOGS = [
  { _id: "l01", timestamp: "2026-03-28 09:14:32", user: { name: "Dr. Youssef Alami", role: "pharmacist" }, category: "sale", action: "Completed sale", details: "Sale #SL-2026-041 · 3 items · 87 MAD · Cash", ip: "192.168.1.12" },
  { _id: "l02", timestamp: "2026-03-28 09:02:11", user: { name: "Sara Bennani", role: "cashier" }, category: "sale", action: "Started checkout", details: "Cart: Paracetamol 500mg × 2, Vitamin C × 1", ip: "192.168.1.15" },
  { _id: "l03", timestamp: "2026-03-28 08:55:44", user: { name: "Dr. Youssef Alami", role: "pharmacist" }, category: "reservation", action: "Confirmed reservation", details: "RES-2026-003 · Youssef El Amrani · Ibuprofen 400mg × 3", ip: "192.168.1.12" },
  { _id: "l04", timestamp: "2026-03-27 17:33:09", user: { name: "Karim Idrissi", role: "assistant" }, category: "inventory", action: "Added medicine", details: "Vitamin D3 · Category: OTC · Unit: tablet", ip: "192.168.1.20" },
  { _id: "l05", timestamp: "2026-03-27 16:48:22", user: { name: "Karim Idrissi", role: "assistant" }, category: "delivery", action: "Logged delivery", details: "MedPharma Distribution · Batch BATCH-2026-004 · 100 units", ip: "192.168.1.20" },
  { _id: "l06", timestamp: "2026-03-27 15:21:05", user: { name: "Dr. Youssef Alami", role: "pharmacist" }, category: "reservation", action: "Rejected reservation", details: "RES-2026-005 · Karim Mansouri · Diazepam 5mg × 1", ip: "192.168.1.12" },
  { _id: "l07", timestamp: "2026-03-27 14:07:58", user: { name: "Sara Bennani", role: "cashier" }, category: "auth", action: "Logged in", details: "Successful login from browser", ip: "192.168.1.15" },
  { _id: "l08", timestamp: "2026-03-27 13:55:31", user: { name: "Admin", role: "pharmacist" }, category: "user", action: "Created user account", details: "Sara Bennani · Role: cashier", ip: "192.168.1.10" },
  { _id: "l09", timestamp: "2026-03-27 12:40:17", user: { name: "Karim Idrissi", role: "assistant" }, category: "inventory", action: "Updated batch", details: "Batch BATCH-2026-001 · qty adjusted from 100 to 98", ip: "192.168.1.20" },
  { _id: "l10", timestamp: "2026-03-27 11:22:44", user: { name: "Dr. Youssef Alami", role: "pharmacist" }, category: "sale", action: "Approved regulated sale", details: "Sale #SL-2026-038 · Diazepam 5mg × 1 · requires approval", ip: "192.168.1.12" },
  { _id: "l11", timestamp: "2026-03-26 17:10:03", user: { name: "Karim Idrissi", role: "assistant" }, category: "delivery", action: "Logged delivery", details: "BioLab Morocco · Batch BATCH-2026-003 · 200 units", ip: "192.168.1.20" },
  { _id: "l12", timestamp: "2026-03-26 16:05:29", user: { name: "Admin", role: "pharmacist" }, category: "user", action: "Updated user role", details: "Karim Idrissi · cashier → assistant", ip: "192.168.1.10" },
  { _id: "l13", timestamp: "2026-03-26 14:48:50", user: { name: "Sara Bennani", role: "cashier" }, category: "sale", action: "Completed sale", details: "Sale #SL-2026-036 · 2 items · 63 MAD · Card", ip: "192.168.1.15" },
  { _id: "l14", timestamp: "2026-03-26 13:30:12", user: { name: "Dr. Youssef Alami", role: "pharmacist" }, category: "inventory", action: "Added supplier", details: "SantéPlus Maroc · Contact: info@santeplus.ma", ip: "192.168.1.12" },
  { _id: "l15", timestamp: "2026-03-25 11:05:47", user: { name: "Sara Bennani", role: "cashier" }, category: "auth", action: "Logged out", details: "Session ended", ip: "192.168.1.15" },
];

const CATEGORIES = ["all", "sale", "inventory", "reservation", "delivery", "auth", "user"];

const CATEGORY_BADGE = {
  sale:        "success",
  inventory:   "info",
  reservation: "warning",
  delivery:    "neutral",
  auth:        "neutral",
  user:        "info",
};

const ACTION_DOT = {
  sale:        styles.actionDotSale,
  inventory:   styles.actionDotInventory,
  reservation: styles.actionDotReservation,
  auth:        styles.actionDotAuth,
  user:        styles.actionDotUser,
  delivery:    styles.actionDotDelivery,
};

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // TODO: replace with real SWR fetch + server-side filtering
  const filtered = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        log.user.name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);
      const matchCategory = category === "all" || log.category === category;
      const matchFrom = !dateFrom || log.timestamp >= dateFrom;
      const matchTo = !dateTo || log.timestamp <= dateTo + " 23:59:59";
      return matchSearch && matchCategory && matchFrom && matchTo;
    });
  }, [search, category, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.subtitle}>{filtered.length} entries found</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

        <select
          className={styles.select}
          value={category}
          onChange={handleFilterChange(setCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={handleFilterChange(setDateFrom)}
          title="From date"
        />
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={handleFilterChange(setDateTo)}
          title="To date"
        />
      </div>

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          {paginated.length === 0 ? (
            <p className={styles.empty}>No log entries match your filters.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => (
                  <tr key={log._id}>
                    <td className={styles.timestamp}>{log.timestamp}</td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{log.user.name}</span>
                        <span className={styles.userRole}>{log.user.role}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={CATEGORY_BADGE[log.category] ?? "neutral"}>
                        {log.category}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <div className={ACTION_DOT[log.category] ?? styles.actionDotAuth} />
                        <span className={styles.actionText}>{log.action}</span>
                      </div>
                    </td>
                    <td className={styles.details} title={log.details}>
                      {log.details}
                    </td>
                    <td className={styles.ip}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className={styles.pageButtons}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === currentPage ? styles.pageBtnActive : styles.pageBtn}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AuditLogsPage.getLayout = AppLayout.getLayout;
