import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Edit2, Power, RotateCcw, Truck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/SupplierManagement.module.css";

const DELIVERY_PAGE_SIZE = 10;
const RETURN_PAGE_SIZE = 5;
const SUPPLIER_TYPES = [
  { value: "grossiste", label: "Grossiste" },
  { value: "laboratoire", label: "Laboratoire" },
  { value: "parapharmacy-distributor", label: "Parapharmacy Distributor" },
  { value: "other", label: "Other" },
];

function typeLabel(type) {
  return SUPPLIER_TYPES.find((option) => option.value === type)?.label ?? "Other";
}

function typeClass(type) {
  return styles[`type_${typeLabel(type).replace(/\s+/g, "")}`] ?? styles.type_Other;
}

function TypeBadge({ type }) {
  return <span className={`${styles.typeBadge} ${typeClass(type)}`}>{typeLabel(type)}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {status === "active" ? "Active" : "Deactivated"}
    </span>
  );
}

function normalizeSupplier(supplier) {
  return {
    ...supplier,
    contactPerson: supplier.contactPerson || supplier.contact || "",
    status: supplier.isActive === false ? "deactivated" : "active",
    deliveries: (supplier.deliveries || []).map(normalizeDelivery),
    returns: supplier.returns || [],
  };
}

function normalizeDelivery(delivery) {
  const medicineItems = delivery.medicineItems || delivery.items || [];
  const parapharmacyItems = delivery.parapharmacyItems || [];
  const productTypes = [
    medicineItems.length ? "medicine" : null,
    parapharmacyItems.length ? "parapharmacy" : null,
  ].filter(Boolean);
  return {
    ...delivery,
    medicineItems,
    parapharmacyItems,
    productTypes: delivery.productTypes || productTypes,
    reference: delivery.reference || delivery.invoiceNumber || `DEL-${String(delivery._id || "").slice(-6)}`,
    staffName: delivery.staffName || delivery.receivedBy?.fullName || "Staff",
  };
}

function getDeliveryItems(delivery) {
  return [
    ...(delivery.medicineItems ?? []).map((item) => item.medicineName || item.name || item.medicineId?.name || "Medicine item"),
    ...(delivery.parapharmacyItems ?? []).map((item) => item.productName || item.name || item.productId?.name || "Parapharmacy item"),
  ];
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deliveryType, setDeliveryType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [returnPage, setReturnPage] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirmingStatus, setConfirmingStatus] = useState(false);

  const deliveries = useMemo(() => supplier?.deliveries || [], [supplier]);
  const returns = useMemo(() => supplier?.returns || [], [supplier]);

  useEffect(() => {
    if (id) loadSupplier();
  }, [id]);

  async function loadSupplier() {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get(`/api/suppliers/${id}`);
      setSupplier(normalizeSupplier(data.data));
    } catch (error) {
      setLoadError(error.response?.status === 404 ? "Supplier not found" : (error.response?.data?.message ?? "Failed to load supplier information"));
    } finally {
      setLoading(false);
    }
  }

  const filteredDeliveries = useMemo(() => {
    const rows = deliveries.filter((delivery) => {
      if (deliveryType === "medicine" && !delivery.productTypes.includes("medicine")) return false;
      if (deliveryType === "parapharmacy" && !delivery.productTypes.includes("parapharmacy")) return false;
      const day = delivery.deliveryDate.slice(0, 10);
      if (fromDate && day < fromDate) return false;
      if (toDate && day > toDate) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      return new Date(b.deliveryDate) - new Date(a.deliveryDate);
    });
    return rows;
  }, [deliveries, deliveryType, fromDate, toDate, sortBy]);

  if (!id || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.tableWrap}>
          {Array.from({ length: 8 }).map((_, index) => <div className={styles.skeletonRow} key={index} />)}
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p>{loadError || "Supplier not found"}</p>
          {loadError === "Supplier not found" ? (
            <button type="button" className={styles.secondaryBtn} onClick={() => router.push("/suppliers")}>Back to Suppliers</button>
          ) : (
            <button type="button" className={styles.secondaryBtn} onClick={loadSupplier}>Retry</button>
          )}
        </div>
      </div>
    );
  }

  const medicineDeliveryCount = deliveries.filter((delivery) => delivery.productTypes.includes("medicine")).length;
  const paraDeliveryCount = deliveries.filter((delivery) => delivery.productTypes.includes("parapharmacy")).length;
  const lastDelivery = deliveries.slice().sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))[0];
  const deliveryPages = Math.max(1, Math.ceil(filteredDeliveries.length / DELIVERY_PAGE_SIZE));
  const deliveryRows = filteredDeliveries.slice((deliveryPage - 1) * DELIVERY_PAGE_SIZE, deliveryPage * DELIVERY_PAGE_SIZE);
  const returnPages = Math.max(1, Math.ceil(returns.length / RETURN_PAGE_SIZE));
  const returnRows = returns.slice((returnPage - 1) * RETURN_PAGE_SIZE, returnPage * RETURN_PAGE_SIZE);

  async function handleSave(updated) {
    try {
      const { data } = await api.patch(`/api/suppliers/${updated._id}`, {
        name: updated.name,
        type: updated.type,
        contact: updated.contactPerson,
        email: updated.email,
        phone: updated.phone || "",
        address: updated.address || "",
        notes: updated.notes || "",
      });
      setSupplier((current) => normalizeSupplier({ ...current, ...data.data, deliveries: current.deliveries, returns: current.returns }));
      setEditing(false);
      toast.success("Supplier updated");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Failed to update supplier");
    }
  }

  async function toggleStatus() {
    const action = supplier.status === "active" ? "deactivate" : "reactivate";
    try {
      const { data } = await api.patch(`/api/suppliers/${supplier._id}/${action}`);
      const nextSupplier = data.data?._id
        ? normalizeSupplier({ ...supplier, ...data.data, deliveries: supplier.deliveries, returns: supplier.returns })
        : { ...supplier, status: action === "reactivate" ? "active" : "deactivated" };
      setSupplier(nextSupplier);
      toast.success(`${supplier.name} ${action === "reactivate" ? "reactivated" : "deactivated"}`);
      setConfirmingStatus(false);
    } catch (error) {
      toast.error(error.response?.data?.message ?? `Failed to ${action} supplier`);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <button type="button" className={styles.back} onClick={() => router.push("/suppliers")}>← Back to Suppliers</button>
          <h1 className={styles.title}>{supplier.name}</h1>
          <p className={styles.subtitle}>
            <TypeBadge type={supplier.type} /> <span> - </span> <StatusBadge status={supplier.status} />
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn} onClick={() => setEditing(true)}>
            <Edit2 size={15} />
            Edit Supplier
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={supplier.status !== "active"}
            onClick={() => router.push(`/suppliers/delivery/new?supplierId=${supplier._id}`)}
          >
            <Truck size={15} />
            Record Delivery
          </button>
          <button
            type="button"
            className={supplier.status === "active" ? styles.dangerBtn : styles.primaryBtn}
            onClick={() => setConfirmingStatus(true)}
          >
            {supplier.status === "active" ? <Power size={15} /> : <RotateCcw size={15} />}
            {supplier.status === "active" ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.leftCol}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
            </div>
            <div className={styles.infoList}>
              <InfoRow label="Supplier Name" value={supplier.name} />
              <InfoRow label="Type" value={<TypeBadge type={supplier.type} />} />
              <InfoRow label="Contact Person" value={supplier.contactPerson} />
              <InfoRow label="Email" value={<a href={`mailto:${supplier.email}`}>{supplier.email}</a>} />
              <InfoRow label="Phone" value={supplier.phone ? <a href={`tel:${supplier.phone}`}>{supplier.phone}</a> : "Not provided"} />
              <InfoRow label="Address" value={supplier.address || "Not provided"} />
              <InfoRow label="Notes" value={supplier.notes || "None"} />
              <InfoRow label="Registered" value={formatDate(supplier.createdAt)} />
              <InfoRow label="Status" value={supplier.status === "active" ? "Active" : "Deactivated"} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Delivery History</h2>
              <p>{deliveries.length} deliveries recorded</p>
            </div>
            <div className={styles.deliveryToolbar}>
              <SelectField label="Product Type" value={deliveryType} onChange={setDeliveryType} options={[
                { value: "all", label: "All" },
                { value: "medicine", label: "Medicines" },
                { value: "parapharmacy", label: "Parapharmacy" },
              ]} />
              <DateField label="From" value={fromDate} onChange={setFromDate} />
              <DateField label="To" value={toDate} onChange={setToDate} />
              <SelectField label="Sort" value={sortBy} onChange={setSortBy} options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
              ]} />
            </div>

            {deliveryRows.length === 0 ? (
              <div className={styles.emptyState}><p>No deliveries recorded from this supplier</p></div>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date</th>
                        <th>Product Types</th>
                        <th>Items</th>
                        <th>Received By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryRows.map((delivery) => {
                        const items = getDeliveryItems(delivery);
                        return (
                          <tr key={delivery._id}>
                            <td className={styles.mono}>{delivery.reference}</td>
                            <td>{formatDate(delivery.deliveryDate)}</td>
                            <td><ProductTags types={delivery.productTypes} /></td>
                            <td title={items.join(", ")}>{items.length} items</td>
                            <td>{delivery.staffName}</td>
                            <td>
                              <button type="button" className={styles.secondaryBtn} onClick={() => setSelectedDelivery(delivery)}>
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={deliveryPage} totalPages={deliveryPages} onChange={setDeliveryPage} />
              </>
            )}
          </section>
        </div>

        <div className={styles.rightCol}>
          <section className={styles.summaryCard}>
            <h2 className={styles.sectionTitle}>Quick Stats</h2>
            <div className={styles.statsStack}>
              <Stat label="Total Deliveries" value={deliveries.length} />
              <Stat label="Medicine Deliveries" value={medicineDeliveryCount} />
              <Stat label="Parapharmacy Deliveries" value={paraDeliveryCount} />
              <Stat label="Last Delivery" value={lastDelivery ? formatDate(lastDelivery.deliveryDate) : "Never"} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Return History</h2>
              <p>{returns.length} returns recorded</p>
            </div>
            {returns.length === 0 ? (
              <p className={styles.muted}>No returns recorded for this supplier</p>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Batch Number</th>
                        <th>Medicine</th>
                        <th>Return Date</th>
                        <th>Returned Qty</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRows.map((item) => (
                        <tr key={item._id}>
                          <td className={styles.mono}>{item.batchNumber}</td>
                          <td>{item.medicineName}</td>
                          <td>{formatDate(item.returnDate)}</td>
                          <td>{item.returnedQty} units</td>
                          <td title={item.reason}>{item.reason.length > 28 ? `${item.reason.slice(0, 28)}...` : item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={returnPage} totalPages={returnPages} onChange={setReturnPage} />
              </>
            )}
          </section>
        </div>
      </div>

      <DeliveryDetailModal delivery={selectedDelivery} supplier={supplier} onClose={() => setSelectedDelivery(null)} />
      <EditSupplierModal supplier={editing ? supplier : null} onClose={() => setEditing(false)} onSave={handleSave} />
      <StatusModal supplier={confirmingStatus ? supplier : null} onClose={() => setConfirmingStatus(false)} onConfirm={toggleStatus} />
    </div>
  );
}

SupplierDetailPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.statBlock}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
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

function ProductTags({ types }) {
  return (
    <div className={styles.tagRow}>
      {types.includes("medicine") && <span className={styles.productBadge}>Medicine</span>}
      {types.includes("parapharmacy") && <span className={styles.productBadge}>Parapharmacy</span>}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>Previous</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button type="button" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>Next</button>
    </div>
  );
}

function DeliveryDetailModal({ delivery, supplier, onClose }) {
  if (!delivery) return null;
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Delivery ${delivery.reference}`}
      size="lg"
      footer={<button type="button" className={styles.secondaryBtn} onClick={onClose}>Close</button>}
    >
      <div className={styles.modalBody}>
        <div className={styles.modalMeta}>
          <span>{formatDate(delivery.deliveryDate)} - Received by {delivery.staffName}</span>
          <strong>Supplier: {supplier.name}</strong>
        </div>
        {delivery.medicineItems.length > 0 && (
          <DetailTable
            title="Medicine Items"
            headers={["Medicine", "Batch Number", "Expiry Date", "Received Qty", "Purchase Price"]}
            rows={delivery.medicineItems.map((item) => [
              item.medicineName || item.name || item.medicineId?.name || "Medicine item",
              <span className={styles.mono}>{item.batchNumber}</span>,
              formatDate(item.expiryDate),
              item.receivedQty,
              formatCurrency(item.purchasePrice),
            ])}
          />
        )}
        {delivery.parapharmacyItems.length > 0 && (
          <DetailTable
            title="Parapharmacy Items"
            headers={["Product", "Received Qty", "Purchase Price"]}
            rows={delivery.parapharmacyItems.map((item) => [
              item.productName || item.name || item.productId?.name || "Parapharmacy item",
              item.receivedQty,
              formatCurrency(item.purchasePrice),
            ])}
          />
        )}
      </div>
    </Modal>
  );
}

function DetailTable({ title, headers, rows }) {
  return (
    <div>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditSupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier ?? {});
  useEffect(() => setForm(supplier ?? {}), [supplier]);
  if (!supplier) return null;
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Edit Supplier - ${supplier.name}`}
      size="lg"
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primaryBtn} onClick={() => onSave(form)}>Save Changes</button>
        </>
      )}
    >
      <div className={styles.formStack}>
        <div className={styles.formGrid}>
          <Field label="Supplier Name"><input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label="Supplier Type"><select value={form.type ?? ""} onChange={(e) => update("type", e.target.value)}>{SUPPLIER_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
          <Field label="Contact Person"><input value={form.contactPerson ?? ""} onChange={(e) => update("contactPerson", e.target.value)} /></Field>
          <Field label="Email Address"><input value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Phone Number"><input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} /></Field>
        </div>
        <Field label="Address"><textarea rows={3} value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} /></Field>
        <Field label="Notes"><textarea rows={3} value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      {children}
    </div>
  );
}

function StatusModal({ supplier, onClose, onConfirm }) {
  if (!supplier) return null;
  const isActive = supplier.status === "active";
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${isActive ? "Deactivate" : "Reactivate"} ${supplier.name}`}
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={isActive ? styles.dangerBtn : styles.primaryBtn} onClick={onConfirm}>
            {isActive ? "Deactivate" : "Reactivate"}
          </button>
        </>
      )}
    >
      {isActive ? (
        <div className={styles.modalBody}>
          <p>This supplier will be marked as inactive.</p>
          <p>You will not be able to place new orders or record deliveries from this supplier.</p>
          <p>All existing delivery and transaction history will be preserved.</p>
          <p>You can reactivate this supplier at any time.</p>
        </div>
      ) : (
        <div className={styles.modalBody}>
          <p>This supplier will be marked as active again.</p>
          <p>You will be able to place orders and record deliveries from this supplier.</p>
        </div>
      )}
    </Modal>
  );
}
