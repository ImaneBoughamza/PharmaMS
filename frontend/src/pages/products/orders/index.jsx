import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import styles from "@/styles/ProductOrdersPage.module.css";

// TODO: replace with useSWR("/api/orders") when backend is ready
const INITIAL_ORDERS = [
  { _id: "o1", supplier: "PharmaDist Maroc", supplierId: "s1", itemCount: 3, type: "medicine",     status: "ordered",   createdAt: "2026-04-20T08:00:00Z", notes: "Urgent restock needed" },
  { _id: "o2", supplier: "BioLab Supplies",  supplierId: "s2", itemCount: 5, type: "parapharmacy", status: "received",  createdAt: "2026-04-15T14:00:00Z", notes: "" },
  { _id: "o3", supplier: "PharmaDist Maroc", supplierId: "s1", itemCount: 4, type: "mixed",        status: "ordered",   createdAt: "2026-04-18T10:30:00Z", notes: "Combined restock" },
  { _id: "o4", supplier: "BioLab Supplies",  supplierId: "s2", itemCount: 2, type: "parapharmacy", status: "cancelled", createdAt: "2026-04-10T11:00:00Z", notes: "Out of budget" },
  { _id: "o5", supplier: "PharmaDist Maroc", supplierId: "s1", itemCount: 6, type: "medicine",     status: "received",  createdAt: "2026-04-05T09:00:00Z", notes: "" },
];

const MOCK_SUPPLIERS = [
  { _id: "s1", name: "PharmaDist Maroc" },
  { _id: "s2", name: "BioLab Supplies" },
];

const TYPE_LABEL   = { medicine: "Medicine", parapharmacy: "Parapharmacy", mixed: "Mixed" };
const TYPE_VARIANT = { medicine: "info", parapharmacy: "primary", mixed: "pending" };
const STATUS_VARIANT = { ordered: "pending", received: "confirmed", cancelled: "cancelled" };

const TYPE_FILTERS = ["all", "medicine", "parapharmacy"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProductOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [typeFilter,     setTypeFilter]     = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");

  const [cancelModal, setCancelModal] = useState({ open: false, order: null });

  const filtered = useMemo(() => {
    let list = orders;
    if (typeFilter !== "all") list = list.filter((o) => o.type === typeFilter || o.type === "mixed");
    if (supplierFilter)       list = list.filter((o) => o.supplierId === supplierFilter);
    if (dateFrom) list = list.filter((o) => new Date(o.createdAt) >= new Date(dateFrom));
    if (dateTo)   list = list.filter((o) => new Date(o.createdAt) <= new Date(dateTo + "T23:59:59Z"));
    return list;
  }, [orders, typeFilter, supplierFilter, dateFrom, dateTo]);

  function handleMarkReceived(order) {
    setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: "received" } : o));
    toast.success(`Order from ${order.supplier} marked as received`);
  }

  function handleCancelConfirm() {
    setOrders((prev) => prev.map((o) => o._id === cancelModal.order._id ? { ...o, status: "cancelled" } : o));
    toast.success("Order cancelled");
    setCancelModal({ open: false, order: null });
  }

  const hasFilters = typeFilter !== "all" || supplierFilter || dateFrom || dateTo;

  function clearFilters() {
    setTypeFilter("all");
    setSupplierFilter("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/products" className={styles.back}>← Products</Link>
          <h1 className={styles.title} style={{ marginTop: 6 }}>Purchase Orders</h1>
        </div>
        <Link href="/products/orders/new" className={styles.addBtn}>+ New Order</Link>
      </div>

      {/* Type filter buttons */}
      <div className={styles.filterBar}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            className={typeFilter === f ? styles.filterActive : styles.filterBtn}
            onClick={() => setTypeFilter(f)}
          >
            {f === "all" ? "All" : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Supplier + date filters */}
      <div className={styles.filtersRow}>
        <select
          className={styles.filterSelect}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="">All Suppliers</option>
          {MOCK_SUPPLIERS.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <div className={styles.dateRange}>
          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
          />
          <span className={styles.dateSep}>→</span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
          />
        </div>
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No orders match your filters.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Type</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order._id}>
                  <td className={styles.supplier}>{order.supplier}</td>
                  <td>
                    <Badge variant={TYPE_VARIANT[order.type]}>
                      {TYPE_LABEL[order.type]}
                    </Badge>
                  </td>
                  <td>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                  </td>
                  <td className={styles.date}>{formatDate(order.createdAt)}</td>
                  <td className={styles.notes}>{order.notes || "—"}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      {order.status === "ordered" && (
                        <>
                          <button
                            className={styles.receiveBtn}
                            onClick={() => handleMarkReceived(order)}
                          >
                            Mark Received
                          </button>
                          <button
                            className={styles.cancelOrderBtn}
                            onClick={() => setCancelModal({ open: true, order })}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status !== "ordered" && (
                        <span className={styles.noActions}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel confirm modal */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, order: null })}
        title="Cancel Order"
        size="sm"
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => setCancelModal({ open: false, order: null })}>Keep Order</button>
            <button className={styles.dangerBtn} onClick={handleCancelConfirm}>Cancel Order</button>
          </>
        }
      >
        {cancelModal.order && (
          <p className={styles.confirmText}>
            Cancel the order from <strong>{cancelModal.order.supplier}</strong> ({cancelModal.order.itemCount} items)?
            This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}

ProductOrdersPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
