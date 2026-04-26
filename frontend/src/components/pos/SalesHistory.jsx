import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatCurrency";
import SaleDetailModal from "./SaleDetailModal";
import VoidSaleModal from "./VoidSaleModal";
import styles from "./SalesHistory.module.css";

/* ── Mock data ── */
const _now = new Date();
const sub = (ms) => new Date(_now - ms).toISOString();
const H = 3600000;
const D = 86400000;

const INITIAL_SALES = [
  {
    _id: "s1", receiptNumber: "RCP-20260425-8821", createdAt: sub(0.5 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Amoxicillin 500mg",    productType: "medicine",      qty: 2, unitPrice: 45.00, batchNumber: "BAT-2025-001" },
      { productName: "Bioderma Sensibio H2O", productType: "parapharmacy", qty: 1, unitPrice: 98.50 },
    ],
  },
  {
    _id: "s2", receiptNumber: "RCP-20260425-7743", createdAt: sub(2 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Paracetamol 1g", productType: "medicine", qty: 3, unitPrice: 12.00, batchNumber: "BAT-2025-002" },
    ],
  },
  {
    _id: "s3", receiptNumber: "RCP-20260425-6612", createdAt: sub(4 * H),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Voltaren Gel",   productType: "parapharmacy", qty: 2, unitPrice: 75.00 },
      { productName: "Bepanthen Plus", productType: "parapharmacy", qty: 1, unitPrice: 55.00 },
    ],
  },
  {
    _id: "s4", receiptNumber: "RCP-20260425-5501", createdAt: sub(6 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "voided",
    voidedAt: sub(5.5 * H), voidReason: "Customer returned — duplicate purchase",
    items: [
      { productName: "Tramadol 100mg",  productType: "medicine", qty: 1, unitPrice: 85.00, batchNumber: "BAT-2025-010" },
      { productName: "Ibuprofen 400mg", productType: "medicine", qty: 2, unitPrice: 18.00, batchNumber: "BAT-2025-003" },
    ],
  },
  {
    _id: "s5", receiptNumber: "RCP-20260424-4430", createdAt: sub(1 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Cetirizine 10mg", productType: "medicine", qty: 1, unitPrice: 32.00, batchNumber: "BAT-2025-004" },
    ],
  },
  {
    _id: "s6", receiptNumber: "RCP-20260424-3310", createdAt: sub(1 * D + 2 * H),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "La Roche-Posay SPF50", productType: "parapharmacy", qty: 1, unitPrice: 230.00 },
      { productName: "CeraVe Moisturiser",  productType: "parapharmacy", qty: 1, unitPrice: 185.00 },
    ],
  },
  {
    _id: "s7", receiptNumber: "RCP-20260423-2209", createdAt: sub(2 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Metformin 850mg",  productType: "medicine",      qty: 1, unitPrice: 28.00, batchNumber: "BAT-2025-005" },
      { productName: "Aspirin 100mg",    productType: "medicine",      qty: 2, unitPrice: 15.00, batchNumber: "BAT-2025-006" },
      { productName: "Omega-3 Capsules", productType: "parapharmacy",  qty: 1, unitPrice: 145.00 },
    ],
  },
  {
    _id: "s8", receiptNumber: "RCP-20260422-1108", createdAt: sub(3 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Omeprazole 20mg", productType: "medicine", qty: 1, unitPrice: 22.00, batchNumber: "BAT-2025-007" },
    ],
  },
  {
    _id: "s9", receiptNumber: "RCP-20260421-0987", createdAt: sub(4 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Vitamin D3 1000IU", productType: "parapharmacy", qty: 2, unitPrice: 88.00 },
    ],
  },
  {
    _id: "s10", receiptNumber: "RCP-20260420-0876", createdAt: sub(5 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Augmentin 875mg", productType: "medicine", qty: 1, unitPrice: 95.00, batchNumber: "BAT-2025-008" },
      { productName: "Nurofen Plus",    productType: "medicine", qty: 2, unitPrice: 42.00, batchNumber: "BAT-2025-009" },
    ],
  },
  {
    _id: "s11", receiptNumber: "RCP-20260419-0765", createdAt: sub(6 * D),
    cashierId: "u2", cashierName: "Ahmed K.", paymentMethod: "Card", status: "completed",
    items: [
      { productName: "Avène Thermal Water", productType: "parapharmacy", qty: 1, unitPrice: 65.00 },
      { productName: "Dexeryl Cream",       productType: "parapharmacy", qty: 1, unitPrice: 115.00 },
    ],
  },
  {
    _id: "s12", receiptNumber: "RCP-20260418-0654", createdAt: sub(7 * D),
    cashierId: "u1", cashierName: "Imane B.", paymentMethod: "Cash", status: "completed",
    items: [
      { productName: "Doliprane 1g", productType: "medicine", qty: 3, unitPrice: 14.00, batchNumber: "BAT-2025-011" },
    ],
  },
];

function computeTotals(sale) {
  const meds = sale.items.filter((i) => i.productType === "medicine");
  const para = sale.items.filter((i) => i.productType !== "medicine");
  const medSubtotal  = meds.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const paraSubtotal = para.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  return { medSubtotal, paraSubtotal, total: medSubtotal + paraSubtotal };
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const DATE_OPTS  = [
  { value: "today",  label: "Today" },
  { value: "week",   label: "This Week" },
  { value: "month",  label: "This Month" },
  { value: "custom", label: "Custom" },
];
const TYPE_OPTS = [
  { value: "all",          label: "All" },
  { value: "medicine",     label: "Medicine Only" },
  { value: "parapharmacy", label: "Parapharmacy Only" },
  { value: "mixed",        label: "Mixed" },
];

const PAGE_SIZE = 10;

export default function SalesHistory({ userRole, userId }) {
  const [sales,       setSales]       = useState(INITIAL_SALES);
  const [search,      setSearch]      = useState("");
  const [dateFilter,  setDateFilter]  = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [page,        setPage]        = useState(1);
  const [detailSale,  setDetailSale]  = useState(null);
  const [voidSale,    setVoidSale]    = useState(null);

  const isCashier    = userRole === "cashier";
  const isPharmacist = userRole === "pharmacist";

  useEffect(() => { setPage(1); }, [search, dateFilter, customStart, customEnd, typeFilter]);

  const filtered = useMemo(() => {
    const now = new Date();
    let r = sales;

    if (isCashier) r = r.filter((s) => s.cashierId === userId);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((s) => s.items.some((i) => i.productName.toLowerCase().includes(q)));
    }

    if (dateFilter === "today") {
      r = r.filter((s) => new Date(s.createdAt).toDateString() === now.toDateString());
    } else if (dateFilter === "week") {
      const ago = new Date(now - 7 * D);
      r = r.filter((s) => new Date(s.createdAt) >= ago);
    } else if (dateFilter === "month") {
      r = r.filter((s) => {
        const d = new Date(s.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (dateFilter === "custom" && customStart) {
      const start = new Date(customStart);
      const end   = customEnd ? new Date(customEnd + "T23:59:59") : now;
      r = r.filter((s) => { const d = new Date(s.createdAt); return d >= start && d <= end; });
    }

    if (typeFilter === "medicine") {
      r = r.filter((s) => s.items.every((i) => i.productType === "medicine"));
    } else if (typeFilter === "parapharmacy") {
      r = r.filter((s) => s.items.every((i) => i.productType !== "medicine"));
    } else if (typeFilter === "mixed") {
      r = r.filter((s) =>
        s.items.some((i) => i.productType === "medicine") &&
        s.items.some((i) => i.productType !== "medicine")
      );
    }
    return r;
  }, [sales, search, dateFilter, customStart, customEnd, typeFilter, isCashier, userId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSales  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleVoidConfirm(sale, reason) {
    setSales((prev) =>
      prev.map((s) =>
        s._id === sale._id
          ? { ...s, status: "voided", voidedAt: new Date().toISOString(), voidReason: reason }
          : s
      )
    );
    setVoidSale(null);
    toast.success(`Sale #${sale.receiptNumber} voided`);
  }

  function handleOpenVoidFromDetail(sale) {
    setDetailSale(null);
    setVoidSale(sale);
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Sales History</h3>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by product name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            {DATE_OPTS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={[styles.filterBtn, dateFilter === o.value ? styles.filterActive : ""].join(" ")}
                onClick={() => setDateFilter(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {dateFilter === "custom" && (
            <div className={styles.dateRange}>
              <input type="date" className={styles.dateInput} value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className={styles.dateSep}>to</span>
              <input type="date" className={styles.dateInput} value={customEnd}   onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          )}

          <div className={styles.filterGroup}>
            {TYPE_OPTS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={[styles.filterBtn, typeFilter === o.value ? styles.filterActive : ""].join(" ")}
                onClick={() => setTypeFilter(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {pageSales.length === 0 ? (
          <div className={styles.empty}>No sales found for the selected filters.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Receipt #</th>
                <th className={styles.th}>Date / Time</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Medicine Sub</th>
                <th className={styles.th}>Parapharmacy</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Payment</th>
                {!isCashier && <th className={styles.th}>Staff</th>}
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSales.map((sale) => {
                const { medSubtotal, paraSubtotal, total } = computeTotals(sale);
                const isVoided = sale.status === "voided";
                return (
                  <tr key={sale._id} className={isVoided ? styles.voidedRow : ""}>
                    <td className={styles.td}>
                      <button
                        type="button"
                        className={[styles.receiptLink, isVoided ? styles.receiptVoided : ""].join(" ")}
                        onClick={() => setDetailSale(sale)}
                      >
                        {sale.receiptNumber}
                      </button>
                    </td>
                    <td className={styles.td}>{formatDateTime(sale.createdAt)}</td>
                    <td className={styles.td}>
                      <span
                        className={styles.itemsCount}
                        title={sale.items.map((i) => `${i.productName} ×${i.qty}`).join("\n")}
                      >
                        {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className={styles.td}>{medSubtotal > 0 ? formatCurrency(medSubtotal) : "—"}</td>
                    <td className={styles.td}>{paraSubtotal > 0 ? formatCurrency(paraSubtotal) : "—"}</td>
                    <td className={[styles.td, styles.totalCell].join(" ")}>{formatCurrency(total)}</td>
                    <td className={styles.td}>
                      <span className={sale.paymentMethod === "Cash" ? styles.payCash : styles.payCard}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    {!isCashier && <td className={styles.td}>{sale.cashierName}</td>}
                    <td className={styles.td}>
                      <span className={isVoided ? styles.statusVoided : styles.statusCompleted}>
                        {isVoided ? "Voided" : "Completed"}
                      </span>
                    </td>
                    <td className={[styles.td, styles.actionsCell].join(" ")}>
                      <button type="button" className={styles.viewBtn} onClick={() => setDetailSale(sale)}>
                        View
                      </button>
                      {isPharmacist && !isVoided && (
                        <button type="button" className={styles.voidBtn} onClick={() => setVoidSale(sale)}>
                          Void
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {detailSale && (
        <SaleDetailModal
          sale={detailSale}
          isPharmacist={isPharmacist}
          onClose={() => setDetailSale(null)}
          onVoid={handleOpenVoidFromDetail}
        />
      )}

      {voidSale && (
        <VoidSaleModal
          sale={voidSale}
          onConfirm={handleVoidConfirm}
          onCancel={() => setVoidSale(null)}
        />
      )}
    </section>
  );
}
