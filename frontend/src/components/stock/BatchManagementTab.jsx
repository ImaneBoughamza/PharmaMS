import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/StockPage.module.css";

const PAGE_SIZE = 20;

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

function getDaysLeft(iso) {
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

function getExpiryClass(days, threshold) {
  if (days < 0) return styles.expiredText;
  if (days <= threshold) return styles.warnText;
  return styles.okText;
}

const BATCH_STATUS_DISPLAY = {
  active:   { label: "Active",    variant: "confirmed" },
  depleted: { label: "Depleted",  variant: "expired"   },
  returned: { label: "Returned",  variant: "cancelled" },
  deactivated: { label: "Deactivated", variant: "expired" },
};

export default function BatchManagementTab({
  allBatches,
  medicines,
  threshold = 90,
  onReturnBatch,
  onRegisterBatch,
  onDeactivateBatch,
  onViewHistory,
}) {
  const [search, setSearch] = useState("");
  const [medFilter, setMedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("expiry-asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = allBatches;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) => b.batchNumber.toLowerCase().includes(q) || b.medicine.name.toLowerCase().includes(q)
      );
    }
    if (medFilter) list = list.filter((b) => b.medicine._id === medFilter);
    if (statusFilter === "nearExpiry") {
      list = list.filter((b) => {
        const days = getDaysLeft(b.expiryDate);
        return b.status === "active" && days >= 0 && days <= threshold;
      });
    } else if (statusFilter === "expired") {
      list = list.filter((b) => getDaysLeft(b.expiryDate) < 0);
    } else if (statusFilter) {
      list = list.filter((b) => b.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      if (sort === "expiry-asc")  return new Date(a.expiryDate) - new Date(b.expiryDate);
      if (sort === "expiry-desc") return new Date(b.expiryDate) - new Date(a.expiryDate);
      if (sort === "name-asc")    return a.medicine.name.localeCompare(b.medicine.name);
      if (sort === "qty-desc")    return b.remainingQty - a.remainingQty;
      return 0;
    });
    return list;
  }, [allBatches, search, medFilter, statusFilter, sort, threshold]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.tabContent}>
      {/* Toolbar */}
      <div className={styles.batchToolbar}>
        <div className={styles.batchFilters}>
          <div className={styles.batchSearch}>
            <Search size={13} className={styles.batchSearchIcon} />
            <input
              type="text"
              className={styles.batchSearchInput}
              placeholder="Search by batch number or medicine name"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={medFilter}
            onChange={(e) => { setMedFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Medicines</option>
            {medicines.filter((m) => m.isActive).map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
            <option value="nearExpiry">Near Expiry</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="expiry-asc">Expiry (Soonest)</option>
            <option value="expiry-desc">Expiry (Latest)</option>
            <option value="name-asc">Medicine Name</option>
            <option value="qty-desc">Remaining Qty</option>
          </select>
        </div>
        <button className={styles.primaryBtn} onClick={onRegisterBatch}>
          + Register Batch
        </button>
      </div>

      {/* Batch Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Medicine</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Initial</th>
              <th>Remaining</th>
              <th>Consumed</th>
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={11} className={styles.emptyCell}>No batches match your filters.</td></tr>
            ) : paged.map((b) => {
              const days = getDaysLeft(b.expiryDate);
              const expiryClass = getExpiryClass(days, threshold);
              const statusMeta = BATCH_STATUS_DISPLAY[b.status] ?? { label: b.status, variant: "expired" };
              return (
                <tr key={b._id}>
                  <td className={styles.monoCell}>{b.batchNumber}</td>
                  <td>
                    <Link href={`/products/${b.medicine._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                      {b.medicine.name}
                    </Link>
                  </td>
                  <td className={[expiryClass, days < 0 ? styles.strikethrough : ""].join(" ")}>
                    {fmtDate(b.expiryDate)}
                  </td>
                  <td className={expiryClass} style={{ fontWeight: 600 }}>
                    {days < 0
                      ? `Expired ${Math.abs(days)} days ago`
                      : `${days} day${days !== 1 ? "s" : ""}`}
                  </td>
                  <td className={styles.monoCell}>{b.initialQty}</td>
                  <td className={b.remainingQty === 0 ? styles.lowStockVal : styles.monoCell} style={{ fontWeight: 700 }}>
                    {b.remainingQty}
                  </td>
                  <td className={styles.monoCell}>{b.initialQty - b.remainingQty}</td>
                  <td className={styles.monoCell}>{fmtMAD(b.purchasePrice)}</td>
                  <td className={styles.monoCell}>{fmtMAD(b.salePrice)}</td>
                  <td><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button className={styles.actionBtn} onClick={() => onViewHistory(b)}>History</button>
                      {b.status === "active" && b.remainingQty > 0 && (
                        <button className={styles.dangerActionBtn} onClick={() => onReturnBatch(b)}>Return</button>
                      )}
                      {b.status === "active" && b.remainingQty === b.initialQty && (
                        <button className={styles.actionBtn} onClick={() => onDeactivateBatch(b._id, b.medicine._id)}>
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className={styles.paginationBar}>
            <span className={styles.paginationInfo}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === page ? styles.pageBtnActive : styles.pageBtn} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className={styles.pageBtn} disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
