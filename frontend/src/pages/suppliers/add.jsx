import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/axios";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import styles from "@/styles/SupplierManagement.module.css";

const SUPPLIER_TYPES = [
  { value: "grossiste", label: "Grossiste" },
  { value: "laboratoire", label: "Laboratoire" },
  { value: "parapharmacy-distributor", label: "Parapharmacy Distributor" },
  { value: "other", label: "Other" },
];

const initialForm = {
  name: "",
  type: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Supplier name is required and must be at least 2 characters";
  if (form.name.length > 200) errors.name = "Supplier name cannot exceed 200 characters";
  if (!form.type) errors.type = "Supplier type is required";
  if (!form.contactPerson.trim()) errors.contactPerson = "Contact person is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
  if (form.address.length > 300) errors.address = "Address cannot exceed 300 characters";
  if (form.notes.length > 500) errors.notes = "Notes cannot exceed 500 characters";
  return errors;
}

export default function SupplierAddPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/api/suppliers", {
        name: form.name.trim(),
        type: form.type,
        contact: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Supplier registered successfully");
      router.push(`/suppliers/${data.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message ?? "Failed to register supplier";
      if (error.response?.status === 409) {
        setErrors((current) => ({ ...current, name: "A supplier with this name already exists" }));
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${styles.page} ${styles.narrowPage}`}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <button type="button" className={styles.back} onClick={() => router.push("/suppliers")}>
            ← Back to Suppliers
          </button>
          <h1 className={styles.title}>Register New Supplier</h1>
        </div>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.formStack}>
          <section className={styles.formSection}>
            <h2>Supplier Information</h2>
            <Field label="Supplier Name" error={errors.name}>
              <input value={form.name} maxLength={200} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <div className={styles.formGrid}>
              <Field label="Supplier Type" error={errors.type}>
                <select value={form.type} onChange={(e) => update("type", e.target.value)}>
                  <option value="">Select type</option>
                  {SUPPLIER_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </Field>
              <Field label="Contact Person" error={errors.contactPerson}>
                <input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} />
              </Field>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Contact Details</h2>
            <Field label="Email Address" error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <div className={styles.formGrid}>
              <Field label="Phone Number">
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="Address" error={errors.address}>
                <textarea rows={3} maxLength={300} value={form.address} onChange={(e) => update("address", e.target.value)} />
              </Field>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Notes</h2>
            <Field label="Notes" error={errors.notes}>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Optional internal notes about this supplier"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </section>

          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => router.push("/suppliers")}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? "Registering..." : "Register Supplier"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

SupplierAddPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      {children}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
