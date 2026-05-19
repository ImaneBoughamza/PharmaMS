import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import styles from "@/styles/ProductOrdersPage.module.css";

const TYPE_LABEL = { medicine: "Medicine", parapharmacy: "Parapharmacy" };
const TYPE_VARIANT = { medicine: "info", parapharmacy: "primary" };
const STATUS_VARIANT = { ordered: "pending", received: "confirmed", cancelled: "cancelled" };
const TYPE_FILTERS = ["all", "medicine", "parapharmacy"];

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeOrder(order) {
  return {
    ...order,
    supplier: order.supplierName || order.supplier?.name || order.supplierId?.name || "Unknown supplier",
    supplierIdValue: order.supplier?._id || order.supplierId?._id || order.supplierId,
    itemCount: order.items?.reduce((sum, item) => sum + (item.orderedQty || 0), 0) || 0,
    type: order.productType,
  };
}

export default function ProductOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [updatingId, setUpdatingId] = useState("");

  async function loadOrders() {
    setLoading(true);
    try {
      const [orderResponse, supplierResponse] = await Promise.all([
        api.get("/api/orders", { params: { limit: 500 } }),
        api.get("/api/suppliers", { params: { status: "all", limit: 500 } }),
      ]);
      setOrders((orderResponse.data.data ?? []).map(normalizeOrder));
      setSuppliers(supplierResponse.data.data ?? []);
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (typeFilter !== "all") list = list.filter((order) => order.type === typeFilter);
    if (supplierFilter) list = list.filter((order) => String(order.supplierIdValue) === String(supplierFilter));
    if (dateFrom) list = list.filter((order) => new Date(order.createdAt) >= new Date(dateFrom));
    if (dateTo) list = list.filter((order) => new Date(order.createdAt) <= new Date(`${dateTo}T23:59:59`));
    return list;
  }, [orders, typeFilter, supplierFilter, dateFrom, dateTo]);

  async function updateOrderStatus(order, status) {
    setUpdatingId(order._id);
    try {
      const { data } = await api.patch(`/api/orders/${order._id}`, { status });
      const updated = normalizeOrder(data.data);
      setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      if (selectedOrder?._id === updated._id) setSelectedOrder(updated);
      toast.success(status === "received" ? "Purchase order received - stock updated" : "Order cancelled");
      if (status === "received") {
        // Other pages refetch from the backend; this makes the stock update visible as soon as they open.
        await loadOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message ?? `Failed to mark order as ${status}`);
    } finally {
      setUpdatingId("");
      setCancelModal({ open: false, order: null });
    }
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

      <div className={styles.filterBar}>
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter}
            className={typeFilter === filter ? styles.filterActive : styles.filterBtn}
            onClick={() => setTypeFilter(filter)}
            type="button"
          >
            {filter === "all" ? "All" : TYPE_LABEL[filter]}
          </button>
        ))}
      </div>

      <div className={styles.filtersRow}>
        <select
          className={styles.filterSelect}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
          ))}
        </select>
        <div className={styles.dateRange}>
          <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className={styles.dateSep}>→</span>
          <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {hasFilters && <button className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>}
      </div>

      {loading ? (
        <p className={styles.empty}>Loading purchase orders...</p>
      ) : filtered.length === 0 ? (
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
                  <td><Badge variant={TYPE_VARIANT[order.type]}>{TYPE_LABEL[order.type]}</Badge></td>
                  <td>{order.itemCount} unit{order.itemCount !== 1 ? "s" : ""}</td>
                  <td><Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge></td>
                  <td className={styles.date}>{formatDate(order.createdAt)}</td>
                  <td className={styles.notes}>{order.notes || "-"}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button className={styles.viewBtn} type="button" onClick={() => setSelectedOrder(order)}>
                        View
                      </button>
                      {order.status === "ordered" && (
                        <>
                          <button
                            className={styles.receiveBtn}
                            onClick={() => updateOrderStatus(order, "received")}
                            disabled={updatingId === order._id}
                            type="button"
                          >
                            {updatingId === order._id ? "Receiving..." : "Mark Received"}
                          </button>
                          <button
                            className={styles.cancelOrderBtn}
                            onClick={() => setCancelModal({ open: true, order })}
                            disabled={updatingId === order._id}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, order: null })}
        title="Cancel Order"
        size="sm"
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => setCancelModal({ open: false, order: null })}>Keep Order</button>
            <button
              className={styles.dangerBtn}
              onClick={() => updateOrderStatus(cancelModal.order, "cancelled")}
              disabled={updatingId === cancelModal.order?._id}
            >
              Cancel Order
            </button>
          </>
        }
      >
        {cancelModal.order && (
          <p className={styles.confirmText}>
            Cancel the order from <strong>{cancelModal.order.supplier}</strong>? This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <Modal isOpen={Boolean(order)} onClose={onClose} title="Purchase Order Details" size="lg">
      <div className={styles.detailGrid}>
        <p><span>Supplier</span><strong>{order.supplier}</strong></p>
        <p><span>Type</span><strong>{TYPE_LABEL[order.type]}</strong></p>
        <p><span>Status</span><strong>{order.status}</strong></p>
        <p><span>Created</span><strong>{formatDate(order.createdAt)}</strong></p>
      </div>

      <div className={styles.detailSection}>
        <p className={styles.detailTitle}>Items</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={`${item.productId}-${item.productName}`}>
                <td>{item.productName}</td>
                <td>{item.orderedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.detailSection}>
        <p className={styles.detailTitle}>Notes</p>
        <p className={styles.confirmText}>{order.notes || "No notes"}</p>
      </div>
    </Modal>
  );
}

ProductOrdersPage.getLayout = AppLayout.getLayout;
