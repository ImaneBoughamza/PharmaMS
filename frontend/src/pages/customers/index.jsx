import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Download, Edit2, Eye, Power, RotateCcw, Search, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import { ASSISTANT, PHARMACIST } from "@/constants/roles";
import { getServerAuthUser } from "@/utils/serverAuth";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/CustomerManagement.module.css";

const PAGE_SIZE = 20;

function formatMonth(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function CreatedFromBadge({ value }) {
  const label = value === "consultation" ? "Consultation" : "Reservation";
  return <span className={`${styles.badge} ${styles[`from_${value || "reservation"}`]}`}>{label}</span>;
}

function StatusBadge({ active }) {
  return <span className={`${styles.badge} ${active ? styles.status_active : styles.status_deactivated}`}>{active ? "Active" : "Deactivated"}</span>;
}

export default function CustomersPage({ user }) {
  const router = useRouter();
  const isPharmacist = user?.role === PHARMACIST;
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createdFrom, setCreatedFrom] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [statusCustomer, setStatusCustomer] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, createdFrom, dateFrom, dateTo, sort]);

  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, status, createdFrom, dateFrom, dateTo, sort, page]);

  const hasFilters = useMemo(() => (
    Boolean(debouncedSearch || dateFrom || dateTo || status !== "all" || createdFrom !== "all" || sort !== "name")
  ), [createdFrom, dateFrom, dateTo, debouncedSearch, sort, status]);

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/customers", {
        params: {
          search: debouncedSearch || undefined,
          status: status === "all" ? undefined : status,
          createdFrom: createdFrom === "all" ? undefined : createdFrom,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sort,
          page,
          limit: PAGE_SIZE,
        },
      });
      setCustomers(data.data ?? []);
      setPagination(data.pagination ?? { page, totalPages: 1, total: data.data?.length ?? 0 });
    } catch (loadError) {
      setError(loadError.response?.data?.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setCreatedFrom("all");
    setDateFrom("");
    setDateTo("");
    setSort("name");
  }

  async function exportCustomers() {
    try {
      const response = await api.get("/api/customers", {
        params: {
          format: "csv",
          search: debouncedSearch || undefined,
          status: status === "all" ? undefined : status,
          createdFrom: createdFrom === "all" ? undefined : createdFrom,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sort,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `PharmaMS_Customers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Customer list downloaded");
    } catch (exportError) {
      toast.error(exportError.response?.data?.message ?? "Export failed - please try again");
    }
  }

  async function saveCustomer(customerId, payload, setFieldError) {
    try {
      const { data } = await api.patch(`/api/customers/${customerId}`, payload);
      setCustomers((rows) => rows.map((customer) => (
        customer._id === customerId ? { ...customer, ...data.data } : customer
      )));
      setEditingCustomer(null);
      toast.success("Customer updated");
    } catch (saveError) {
      const message = saveError.response?.data?.message ?? "Failed to update customer";
      if (saveError.response?.status === 409) setFieldError(message);
      else toast.error(message);
    }
  }

  async function toggleCustomer() {
    if (!statusCustomer) return;
    const action = statusCustomer.isActive ? "deactivate" : "reactivate";
    try {
      await api.patch(`/api/customers/${statusCustomer._id}/${action}`);
      setCustomers((rows) => rows.map((customer) => (
        customer._id === statusCustomer._id ? { ...customer, isActive: !customer.isActive } : customer
      )));
      toast.success(`${statusCustomer.fullName} ${action === "deactivate" ? "deactivated" : "reactivated"}`);
      setStatusCustomer(null);
    } catch (toggleError) {
      toast.error(toggleError.response?.data?.message ?? `Failed to ${action} customer`);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>Profiles created automatically from reservations and consultations</p>
        </div>
        {isPharmacist && (
          <button type="button" className={styles.secondaryBtn} onClick={exportCustomers}>
            <Download size={15} />
            Export Customers
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone, or email" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button>}
        </div>
        <div className={styles.filterRow}>
          <Filter label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["active", "Active"], ["deactivated", "Deactivated"]]} />
          <Filter label="Created From" value={createdFrom} onChange={setCreatedFrom} options={[["all", "All"], ["reservation", "Reservation"], ["consultation", "Consultation"]]} />
          <label className={styles.filterGroup}><span>Registered From</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label className={styles.filterGroup}><span>To</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
          <Filter label="Sort" value={sort} onChange={setSort} options={[["name", "Name A-Z"], ["name_desc", "Name Z-A"], ["recent", "Most Recent"], ["reservations", "Most Reservations"]]} />
        </div>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
          <button type="button" className={styles.secondaryBtn} onClick={loadCustomers}>Retry</button>
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{hasFilters ? "No customers match your search" : "No customer profiles yet"}</p>
          <span>
            {hasFilters
              ? "Clear filters to see the full customer list."
              : "Profiles are created automatically when customers submit reservations or when prescriptions are scanned for a new patient"}
          </span>
          {hasFilters && <button type="button" className={styles.secondaryBtn} onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Reservations</th>
                  <th>Last Activity</th>
                  <th>Member Since</th>
                  <th>Created From</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className={`${styles.clickableRow} ${!customer.isActive ? styles.deactivatedRow : ""}`} onClick={() => router.push(`/customers/${customer._id}`)}>
                    <td><button type="button" className={styles.nameLink} onClick={(event) => { event.stopPropagation(); router.push(`/customers/${customer._id}`); }}>{customer.fullName}</button></td>
                    <td className={styles.muted}>{customer.phone || "-"}</td>
                    <td className={styles.muted}>{customer.email || "-"}</td>
                    <td>{customer.reservationCount ?? 0}</td>
                    <td>{customer.lastActivity ? formatDate(customer.lastActivity) : "-"}</td>
                    <td>{formatMonth(customer.createdAt)}</td>
                    <td><CreatedFromBadge value={customer.createdFrom} /></td>
                    <td><StatusBadge active={customer.isActive} /></td>
                    <td>
                      <div className={styles.actionRow}>
                        <button type="button" className={styles.iconBtn} title="View" onClick={(event) => { event.stopPropagation(); router.push(`/customers/${customer._id}`); }}><Eye size={15} /></button>
                        {isPharmacist && (
                          <>
                            <button type="button" className={styles.iconBtn} title="Edit" onClick={(event) => { event.stopPropagation(); setEditingCustomer(customer); }}><Edit2 size={15} /></button>
                            <button type="button" className={styles.iconBtn} title={customer.isActive ? "Deactivate" : "Reactivate"} onClick={(event) => { event.stopPropagation(); setStatusCustomer(customer); }}>
                              {customer.isActive ? <Power size={15} /> : <RotateCcw size={15} />}
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
          <Pagination pagination={pagination} setPage={setPage} />
        </>
      )}

      <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSave={saveCustomer} />
      <CustomerStatusModal customer={statusCustomer} onClose={() => setStatusCustomer(null)} onConfirm={toggleCustomer} />
    </div>
  );
}

CustomersPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = customersPageProps();

function Filter({ label, value, onChange, options }) {
  return (
    <label className={styles.filterGroup}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function Pagination({ pagination, setPage }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button type="button" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>Previous</button>
      <span>Page {pagination.page} of {pagination.totalPages}</span>
      <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)}>Next</button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className={styles.tableWrap}>
      {Array.from({ length: 10 }).map((_, index) => <div className={styles.skeletonRow} key={index} />)}
    </div>
  );
}

function EditCustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(customer ?? {});
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    setForm(customer ?? {});
    setEmailError("");
  }, [customer]);

  if (!customer) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Edit Customer - ${customer.fullName}`}
      size="lg"
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primaryBtn} onClick={() => onSave(customer._id, form, setEmailError)}>Save Changes</button>
        </>
      )}
    >
      <CustomerFields form={form} update={update} emailError={emailError} />
    </Modal>
  );
}

function CustomerFields({ form, update, emailError }) {
  return (
    <div className={styles.formStack}>
      <div className={styles.formGrid}>
        <label className={styles.field}><span>Full Name</span><input value={form.fullName ?? ""} onChange={(event) => update("fullName", event.target.value)} /></label>
        <label className={styles.field}><span>Phone Number</span><input value={form.phone ?? ""} onChange={(event) => update("phone", event.target.value)} /></label>
        <label className={styles.field}><span>Email Address</span><input type="email" value={form.email ?? ""} onChange={(event) => update("email", event.target.value)} />{emailError && <em>{emailError}</em>}</label>
        <label className={styles.field}><span>Insurance Type</span><input value={form.insuranceType ?? ""} onChange={(event) => update("insuranceType", event.target.value)} /></label>
        <label className={styles.field}><span>Insurance Number</span><input value={form.insuranceNumber ?? ""} onChange={(event) => update("insuranceNumber", event.target.value)} /></label>
      </div>
      <label className={styles.field}><span>Notes</span><textarea maxLength={1000} rows={4} value={form.notes ?? ""} onChange={(event) => update("notes", event.target.value)} /></label>
    </div>
  );
}

function CustomerStatusModal({ customer, onClose, onConfirm }) {
  if (!customer) return null;
  const isActive = customer.isActive;
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${isActive ? "Deactivate" : "Reactivate"} ${customer.fullName}`}
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={isActive ? styles.dangerBtn : styles.primaryBtn} onClick={onConfirm}>{isActive ? "Deactivate" : "Reactivate"}</button>
        </>
      )}
    >
      <div className={styles.modalBody}>
        {isActive ? (
          <>
            <p>This customer will be prevented from submitting new reservations.</p>
            <p>All existing reservation and consultation history is preserved.</p>
            <p>You can reactivate this customer at any time.</p>
          </>
        ) : (
          <p>This customer will be able to submit reservations again.</p>
        )}
      </div>
    </Modal>
  );
}

export function customersPageProps() {
  return async function getServerSideProps(context) {
    const user = await getServerAuthUser(context);
    if (!user) return { redirect: { destination: "/login", permanent: false } };
    if (user.mustChangePassword) return { redirect: { destination: "/profile", permanent: false } };
    if (![PHARMACIST, ASSISTANT].includes(user.role)) return { redirect: { destination: "/dashboard", permanent: false } };
    return { props: { user } };
  };
}
