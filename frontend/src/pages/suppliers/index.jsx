import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Edit2, Eye, Power, RotateCcw, Search, Truck, UserPlus, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/SupplierManagement.module.css";

const PAGE_SIZE = 20;
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

function normalizeSupplier(supplier) {
  return {
    ...supplier,
    contactPerson: supplier.contactPerson || supplier.contact || "",
    status: supplier.isActive === false ? "deactivated" : "active",
  };
}

function StatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {status === "active" ? "Active" : "Deactivated"}
    </span>
  );
}

function SortSelect({ label, value, onChange, options }) {
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

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [confirmSupplier, setConfirmSupplier] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadSuppliers();
  }, [debouncedSearch, typeFilter, statusFilter, sortBy, page]);

  const hasFilters = Boolean(debouncedSearch || typeFilter !== "all" || statusFilter !== "all");

  async function loadSuppliers() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/suppliers", {
        params: {
          search: debouncedSearch || undefined,
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          sort: sortBy,
          page,
          limit: PAGE_SIZE,
        },
      });
      setSuppliers((data.data ?? []).map(normalizeSupplier));
      setPagination(data.pagination ?? { page, totalPages: 1, total: data.data?.length ?? 0 });
    } catch (loadError) {
      setError(loadError.response?.data?.message ?? "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("name-asc");
  }

  async function handleUpdate(updated) {
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
      setSuppliers((current) => current.map((supplier) => (
        supplier._id === updated._id ? normalizeSupplier(data.data) : supplier
      )));
      setEditingSupplier(null);
      toast.success("Supplier updated");
    } catch (updateError) {
      toast.error(updateError.response?.data?.message ?? "Failed to update supplier");
    }
  }

  async function handleToggleStatus() {
    const action = confirmSupplier.status === "active" ? "deactivate" : "reactivate";
    try {
      const { data } = await api.patch(`/api/suppliers/${confirmSupplier._id}/${action}`);
      const updated = data.data?._id ? normalizeSupplier(data.data) : { ...confirmSupplier, status: action === "reactivate" ? "active" : "deactivated" };
      setSuppliers((current) => current.map((supplier) => (
        supplier._id === confirmSupplier._id ? updated : supplier
      )));
      toast.success(`${confirmSupplier.name} ${action === "reactivate" ? "reactivated" : "deactivated"}`);
      setConfirmSupplier(null);
    } catch (toggleError) {
      toast.error(toggleError.response?.data?.message ?? `Failed to ${action} supplier`);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>Suppliers</h1>
          <p className={styles.subtitle}>Manage your medicine and parapharmacy product suppliers</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => router.push("/suppliers/add")}>
            <UserPlus size={15} />
            Register Supplier
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={() => router.push("/suppliers/delivery/new")}>
            <Truck size={15} />
            Record Delivery
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier name or contact"
          />
          {search && (
            <button type="button" className={styles.ghostBtn} onClick={() => setSearch("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
        <div className={styles.filterRow}>
          <SortSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All" },
              ...SUPPLIER_TYPES,
            ]}
          />
          <SortSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "deactivated", label: "Deactivated" },
            ]}
          />
          <SortSelect
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "name-asc", label: "Name A-Z" },
              { value: "name-desc", label: "Name Z-A" },
              { value: "type", label: "Type" },
              { value: "recent", label: "Most Recent Delivery" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.tableWrap}>
          {Array.from({ length: 10 }).map((_, index) => <div className={styles.skeletonRow} key={index} />)}
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
          <button type="button" className={styles.secondaryBtn} onClick={loadSuppliers}>Retry</button>
        </div>
      ) : suppliers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{hasFilters ? "No suppliers match your filters" : "No suppliers registered"}</p>
          <span>
            {hasFilters
              ? "Clear filters to see the full supplier list."
              : "Register your first supplier to start managing deliveries"}
          </span>
          {hasFilters ? (
            <button type="button" className={styles.secondaryBtn} onClick={clearFilters}>Clear filters</button>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={() => router.push("/suppliers/add")}>
              Register Supplier
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => {
                  return (
                    <tr
                      key={supplier._id}
                      className={styles.clickableRow}
                      onClick={() => router.push(`/suppliers/${supplier._id}`)}
                    >
                      <td>
                        <button
                          type="button"
                          className={styles.nameLink}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/suppliers/${supplier._id}`);
                          }}
                        >
                          {supplier.name}
                        </button>
                      </td>
                      <td><TypeBadge type={supplier.type} /></td>
                      <td>{supplier.contactPerson}</td>
                      <td className={styles.muted}>{supplier.email}</td>
                      <td className={styles.muted}>{supplier.phone || "Not provided"}</td>
                      <td>{supplier.lastDelivery ? formatDate(supplier.lastDelivery) : "Never"}</td>
                      <td><StatusBadge status={supplier.status} /></td>
                      <td>
                        <div className={styles.actionRow}>
                          <button type="button" className={styles.iconBtn} title="View" onClick={(e) => { e.stopPropagation(); router.push(`/suppliers/${supplier._id}`); }}>
                            <Eye size={15} />
                          </button>
                          <button type="button" className={styles.iconBtn} title="Edit" onClick={(e) => { e.stopPropagation(); setEditingSupplier(supplier); }}>
                            <Edit2 size={15} />
                          </button>
                          <button type="button" className={styles.iconBtn} title={supplier.status === "active" ? "Deactivate" : "Reactivate"} onClick={(e) => { e.stopPropagation(); setConfirmSupplier(supplier); }}>
                            {supplier.status === "active" ? <Power size={15} /> : <RotateCcw size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
      )}

      <EditSupplierModal supplier={editingSupplier} onClose={() => setEditingSupplier(null)} onSave={handleUpdate} />
      <SupplierStatusModal supplier={confirmSupplier} onClose={() => setConfirmSupplier(null)} onConfirm={handleToggleStatus} />
    </div>
  );
}

SuppliersPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

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

function EditSupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier ?? {});
  useEffect(() => setForm(supplier ?? {}), [supplier]);

  if (!supplier) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

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
      <SupplierFields form={form} update={update} />
    </Modal>
  );
}

function SupplierStatusModal({ supplier, onClose, onConfirm }) {
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

function SupplierFields({ form, update }) {
  return (
    <div className={styles.formStack}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span>Supplier Name</span>
          <input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className={styles.field}>
          <span>Supplier Type</span>
          <select value={form.type ?? ""} onChange={(e) => update("type", e.target.value)}>
            {SUPPLIER_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span>Contact Person</span>
          <input value={form.contactPerson ?? ""} onChange={(e) => update("contactPerson", e.target.value)} />
        </div>
        <div className={styles.field}>
          <span>Email Address</span>
          <input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className={styles.field}>
          <span>Phone Number</span>
          <input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
        </div>
      </div>
      <div className={styles.field}>
        <span>Address</span>
        <textarea rows={3} value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
      </div>
      <div className={styles.field}>
        <span>Notes</span>
        <textarea rows={3} value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} />
      </div>
    </div>
  );
}
