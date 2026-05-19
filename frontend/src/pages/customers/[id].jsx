import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ArrowLeft, Edit2, Mail, Phone, Power, RotateCcw } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import { ASSISTANT, PHARMACIST } from "@/constants/roles";
import { getServerAuthUser } from "@/utils/serverAuth";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/CustomerManagement.module.css";

function formatMonth(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function CreatedFromBadge({ value }) {
  const label = value === "consultation" ? "Consultation" : "Reservation";
  return <span className={`${styles.badge} ${styles[`from_${value || "reservation"}`]}`}>{label}</span>;
}

function StatusBadge({ active }) {
  return <span className={`${styles.badge} ${active ? styles.status_active : styles.status_deactivated}`}>{active ? "Active" : "Deactivated"}</span>;
}

function ReservationStatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[`reservation_${status}`] || styles.status_deactivated}`}>{statusLabel(status)}</span>;
}

function statusLabel(status = "") {
  return status.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function paymentLabel(method) {
  if (method === "online" || method === "card") return "Online";
  return "Pay on Pickup";
}

function itemText(items = []) {
  if (!items.length) return "No items";
  return items.map((item) => `${item.name || "Product"} x${item.qty}`).join(", ");
}

export default function CustomerDetailPage({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const isPharmacist = user?.role === PHARMACIST;
  const [record, setRecord] = useState(null);
  const [reservationRows, setReservationRows] = useState([]);
  const [reservationMeta, setReservationMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [reservationStatus, setReservationStatus] = useState("all");
  const [reservationSort, setReservationSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [statusCustomer, setStatusCustomer] = useState(null);
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    if (id) loadCustomer(1, false);
  }, [id]);

  const customer = record?.customer;
  const stats = record?.stats ?? {};
  const consultations = record?.consultations ?? [];

  const visibleReservations = useMemo(() => {
    const rows = reservationRows.filter((reservation) => (
      reservationStatus === "all" || reservation.status === reservationStatus
    ));
    rows.sort((a, b) => {
      if (reservationSort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return rows;
  }, [reservationRows, reservationSort, reservationStatus]);

  async function loadCustomer(page = 1, append = false) {
    setLoading(!append);
    setError("");
    try {
      const { data } = await api.get(`/api/customers/${id}`, {
        params: { resPage: page, resLimit: 5 },
      });
      setRecord(data.data);
      setReservationRows((current) => (
        append ? [...current, ...(data.data?.reservations?.data ?? [])] : (data.data?.reservations?.data ?? [])
      ));
      setReservationMeta(data.data?.reservations ?? { page, totalPages: 1, total: 0 });
      setNotesDraft(data.data?.customer?.notes ?? "");
    } catch (loadError) {
      const status = loadError.response?.status;
      setError(status === 404 ? "Customer not found" : (loadError.response?.data?.message ?? "Failed to load customer profile"));
    } finally {
      setLoading(false);
    }
  }

  async function saveCustomer(customerId, payload, setFieldError) {
    try {
      const { data } = await api.patch(`/api/customers/${customerId}`, payload);
      setRecord((current) => ({ ...current, customer: { ...current.customer, ...data.data } }));
      setEditingCustomer(null);
      setNotesEditing(false);
      setNotesDraft(data.data.notes ?? "");
      toast.success(payload.notes !== undefined && Object.keys(payload).length === 1 ? "Notes saved" : "Customer updated");
    } catch (saveError) {
      const message = saveError.response?.data?.message ?? "Failed to update customer";
      if (saveError.response?.status === 409 && setFieldError) setFieldError(message);
      else toast.error(message);
    }
  }

  async function toggleCustomer() {
    if (!statusCustomer) return;
    const action = statusCustomer.isActive ? "deactivate" : "reactivate";
    try {
      await api.patch(`/api/customers/${statusCustomer._id}/${action}`);
      setRecord((current) => ({ ...current, customer: { ...current.customer, isActive: !current.customer.isActive } }));
      toast.success(`${statusCustomer.fullName} ${action === "deactivate" ? "deactivated" : "reactivated"}`);
      setStatusCustomer(null);
    } catch (toggleError) {
      toast.error(toggleError.response?.data?.message ?? `Failed to ${action} customer`);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p>{error || "Failed to load customer profile"}</p>
          {error === "Customer not found" ? (
            <button type="button" className={styles.secondaryBtn} onClick={() => router.push("/customers")}>Back to Customers</button>
          ) : (
            <button type="button" className={styles.secondaryBtn} onClick={() => loadCustomer(1, false)}>Retry</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/customers"><ArrowLeft size={16} /> Back to Customers</Link>
          <h1 className={styles.title}>{customer.fullName}</h1>
          <p className={styles.subtitle}>Customer since {formatMonth(customer.createdAt)}</p>
        </div>
        {isPharmacist && (
          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => setEditingCustomer(customer)}>
              <Edit2 size={15} />
              Edit Customer
            </button>
            <button type="button" className={customer.isActive ? styles.dangerBtn : styles.primaryBtn} onClick={() => setStatusCustomer(customer)}>
              {customer.isActive ? <Power size={15} /> : <RotateCcw size={15} />}
              {customer.isActive ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <h2>Contact Information</h2>
            <div className={styles.infoGrid}>
              <Info label="Full Name" value={customer.fullName} />
              <Info label="Phone" value={customer.phone ? <a href={`tel:${customer.phone}`}><Phone size={13} />{customer.phone}</a> : "Not provided"} />
              <Info label="Email" value={customer.email ? <a href={`mailto:${customer.email}`}><Mail size={13} />{customer.email}</a> : "Not provided"} />
              <Info label="Insurance" value={customer.insuranceType ? `${customer.insuranceType} - ${customer.insuranceNumber || "Not provided"}` : "Not provided"} />
              <Info label="Member Since" value={formatDate(customer.createdAt)} />
              <Info label="Created From" value={<CreatedFromBadge value={customer.createdFrom} />} />
              <Info label="Status" value={<StatusBadge active={customer.isActive} />} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Reservation History</h2>
                <p>{reservationMeta.total ?? 0} reservations</p>
              </div>
              <div className={styles.compactFilters}>
                <Filter label="Status" value={reservationStatus} onChange={setReservationStatus} options={[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["ready", "Ready"], ["expired", "Expired"], ["cancelled", "Cancelled"]]} />
                <Filter label="Sort" value={reservationSort} onChange={setReservationSort} options={[["newest", "Newest First"], ["oldest", "Oldest First"]]} />
              </div>
            </div>
            {visibleReservations.length === 0 ? (
              <div className={styles.inlineEmpty}>No reservations yet</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleReservations.map((reservation) => (
                      <tr key={reservation._id}>
                        <td><Link className={styles.codeLink} href={`/reservations/${reservation._id}`}>{reservation.confirmationCode}</Link></td>
                        <td>{formatDate(reservation.createdAt)}</td>
                        <td title={itemText(reservation.items)}>{reservation.items?.length ?? 0} items</td>
                        <td><ReservationStatusBadge status={reservation.status} /></td>
                        <td>{paymentLabel(reservation.paymentMethod)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {reservationMeta.page < reservationMeta.totalPages && (
              <button type="button" className={styles.secondaryBtn} onClick={() => loadCustomer(reservationMeta.page + 1, true)}>Load more</button>
            )}
          </section>
        </div>

        <div className={styles.rightColumn}>
          <section className={styles.statsStack}>
            <Stat label="Total Reservations" value={stats.totalReservations ?? 0} />
            <Stat label="Completed" value={stats.completedReservations ?? 0} />
            <Stat label="Cancelled / Expired" value={stats.cancelledExpired ?? 0} />
            <Stat label="AI Consultations" value={stats.totalConsultations ?? 0} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>AI Consultations</h2>
                <p>{stats.totalConsultations ?? consultations.length} consultations</p>
              </div>
            </div>
            {consultations.length === 0 ? (
              <div className={styles.inlineEmpty}>No consultations recorded for this customer</div>
            ) : (
              <div className={styles.consultationList}>
                {consultations.map((consultation) => (
                  <article className={styles.consultationCard} key={consultation._id}>
                    <div>
                      <strong>{formatDate(consultation.createdAt)} - {consultation.staffId?.fullName || "Staff"}</strong>
                      <span>{consultation.extractedMedicines?.length ?? 0} medicines - {consultation.suggestions?.length ?? 0} recommendations</span>
                    </div>
                    <button type="button" onClick={() => setSelectedConsultation(consultation)}>View</button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Clinical Notes</h2>
                <p>Internal only - not visible to customer</p>
              </div>
            </div>
            {notesEditing ? (
              <div className={styles.notesEditor}>
                <textarea
                  value={notesDraft}
                  maxLength={1000}
                  rows={6}
                  placeholder="Known allergies, chronic conditions, insurance details, internal notes..."
                  onChange={(event) => setNotesDraft(event.target.value)}
                />
                <span>{notesDraft.length}/1000</span>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.primaryBtn} onClick={() => saveCustomer(customer._id, { notes: notesDraft })}>Save</button>
                  <button type="button" className={styles.textBtn} onClick={() => { setNotesDraft(customer.notes ?? ""); setNotesEditing(false); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {customer.notes ? <div className={styles.notesBox}>{customer.notes}</div> : <p className={styles.muted}>No notes added yet</p>}
                {isPharmacist && (
                  <button type="button" className={styles.textBtn} onClick={() => setNotesEditing(true)}>
                    {customer.notes ? "Edit Notes" : "+ Add Notes"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSave={saveCustomer} />
      <CustomerStatusModal customer={statusCustomer} onClose={() => setStatusCustomer(null)} onConfirm={toggleCustomer} />
      <ConsultationDetailModal consultation={selectedConsultation} onClose={() => setSelectedConsultation(null)} />
    </div>
  );
}

CustomerDetailPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = customersPageProps();

function Info({ label, value }) {
  return (
    <div className={styles.infoItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.statBlock}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

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
    </Modal>
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

function ConsultationDetailModal({ consultation, onClose }) {
  if (!consultation) return null;
  const medicines = consultation.extractedMedicines ?? [];
  const suggestions = consultation.suggestions ?? [];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Consultation - ${formatDate(consultation.createdAt)}`}
      size="lg"
      footer={<button type="button" className={styles.secondaryBtn} onClick={onClose}>Close</button>}
    >
      <div className={styles.consultationModal}>
        <p className={styles.modalSubtitle}>{consultation.staffId?.fullName || "Staff"} - {statusLabel(consultation.staffId?.role || "")}</p>
        <section>
          <h3>Prescribed Medicines</h3>
          {medicines.length ? medicines.map((medicine, index) => <p key={`${medicine.name}-${index}`}>{medicine.name}</p>) : <p>No medicines recorded</p>}
        </section>
        <section>
          <h3>Patient Notes</h3>
          <p>{consultation.patientNotes || "None"}</p>
        </section>
        <section>
          <h3>Recommendations Given</h3>
          {suggestions.length ? (
            <table className={styles.table}>
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rationale</th></tr></thead>
              <tbody>
                {suggestions.map((product, index) => (
                  <tr key={`${product.name}-${index}`}>
                    <td>{product.name}</td>
                    <td>{product.category || "-"}</td>
                    <td>{Number(product.salePrice || 0).toFixed(2)} MAD</td>
                    <td>{product.rationale || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No recommendations recorded</p>}
        </section>
      </div>
    </Modal>
  );
}

function CustomerDetailSkeleton() {
  return (
    <>
      <div className={styles.skeletonRow} />
      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </div>
      </div>
    </>
  );
}

function customersPageProps() {
  return async function getServerSideProps(context) {
    const user = await getServerAuthUser(context);
    if (!user) return { redirect: { destination: "/login", permanent: false } };
    if (user.mustChangePassword) return { redirect: { destination: "/profile", permanent: false } };
    if (![PHARMACIST, ASSISTANT].includes(user.role)) return { redirect: { destination: "/dashboard", permanent: false } };
    return { props: { user } };
  };
}
