import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import styles from "@/styles/MedicineDetailPage.module.css";

// TODO: replace with useSWR(`/api/medicines/${id}`) when backend is ready
const MOCK = {
  _id: "1",
  name: "Paracetamol 500mg",
  genericName: "Paracetamol",
  category: "non-prescription",
  unit: "tablet",
  description: "Analgesic and antipyretic for mild to moderate pain.",
  supplier: { _id: "s1", name: "PharmaDist Maroc" },
  minStockLevel: 20,
  salePrice: 22.5,
  purchasePrice: 15,
  isActive: true,
  batches: [
    { _id: "b1", batchNumber: "PC-2401", expiryDate: "2026-05-18", initialQty: 100, remainingQty: 8,  purchasePrice: 15,   salePrice: 22.5, status: "active"   },
    { _id: "b2", batchNumber: "PC-2312", expiryDate: "2025-11-30", initialQty: 200, remainingQty: 0,  purchasePrice: 14.5, salePrice: 22.5, status: "depleted" },
    { _id: "b3", batchNumber: "PC-2502", expiryDate: "2027-02-14", initialQty: 150, remainingQty: 0,  purchasePrice: 15.2, salePrice: 23.0, status: "returned" },
  ],
};

const BATCH_STATUS_META = {
  active:   { label: "Active",    variant: "confirmed" },
  depleted: { label: "Depleted",  variant: "expired"   },
  returned: { label: "Returned",  variant: "cancelled" },
  expired:  { label: "Expired",   variant: "cancelled" },
};

const registerBatchSchema = z.object({
  batchNumber:   z.string().min(1, "Required"),
  expiryDate:    z.string().min(1, "Required"),
  initialQty:    z.coerce.number().int().min(1, "Must be ≥ 1"),
  purchasePrice: z.coerce.number().positive("Must be positive"),
  salePrice:     z.coerce.number().positive("Must be positive"),
});

const returnBatchSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isNearExpiry(iso) {
  if (!iso) return false;
  return (new Date(iso) - Date.now()) / 86400000 <= 90;
}

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

export default function MedicineDetailPage() {
  const router = useRouter();
  const [medicine, setMedicine] = useState(MOCK);
  const [registerModal, setRegisterModal] = useState(false);
  const [returnModal, setReturnModal]     = useState({ open: false, batch: null });

  const totalStock    = medicine.batches?.reduce((s, b) => s + (b.status === "active" ? b.remainingQty : 0), 0) ?? 0;
  const activeBatches = medicine.batches?.filter((b) => b.status === "active").length ?? 0;
  const nearestExpiry = medicine.batches
    ?.filter((b) => b.status === "active" && b.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate ?? null;

  const stockStatus =
    !medicine.isActive ? "expired" :
    totalStock === 0   ? "cancelled" :
    totalStock < medicine.minStockLevel ? "pending" : "confirmed";
  const stockLabel =
    !medicine.isActive ? "Inactive" :
    totalStock === 0   ? "Out of Stock" :
    totalStock < medicine.minStockLevel ? "Low Stock" : "In Stock";

  // Register batch form
  const registerForm = useForm({ resolver: zodResolver(registerBatchSchema) });
  const returnForm   = useForm({ resolver: zodResolver(returnBatchSchema) });

  function handleRegisterBatch(data) {
    const newBatch = {
      _id: `b-${Date.now()}`,
      batchNumber:   data.batchNumber,
      expiryDate:    data.expiryDate,
      initialQty:    data.initialQty,
      remainingQty:  data.initialQty,
      purchasePrice: data.purchasePrice,
      salePrice:     data.salePrice,
      status: "active",
    };
    setMedicine((prev) => ({ ...prev, batches: [...prev.batches, newBatch] }));
    toast.success(`Batch ${data.batchNumber} registered`);
    registerForm.reset();
    setRegisterModal(false);
  }

  function handleReturnBatch(data) {
    setMedicine((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        b._id === returnModal.batch._id ? { ...b, status: "returned" } : b
      ),
    }));
    toast.success(`Batch ${returnModal.batch.batchNumber} marked as returned`);
    returnForm.reset();
    setReturnModal({ open: false, batch: null });
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/products")}>
        ← Back to Products
      </button>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{medicine.name}</h1>
          {medicine.genericName && <p className={styles.subtitle}>{medicine.genericName}</p>}
        </div>
        <Badge variant={stockStatus}>{stockLabel}</Badge>
      </div>

      {/* Two-column layout */}
      <div className={styles.columns}>
        {/* Left: Medicine Info */}
        <div className={styles.card}>
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel}>Basic Information</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Category</span>
                <span className={styles.infoValue} style={{ textTransform: "capitalize" }}>{medicine.category}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Unit</span>
                <span className={styles.infoValue}>{medicine.unit}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Supplier</span>
                <span className={styles.infoValue}>{medicine.supplier?.name || "—"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <span className={styles.infoValue}>{medicine.isActive ? "Active" : "Inactive"}</span>
              </div>
              {medicine.description && (
                <div className={[styles.infoItem, styles.infoItemFull].join(" ")}>
                  <span className={styles.infoLabel}>Description</span>
                  <span className={styles.infoValue}>{medicine.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.cardSection}>
            <p className={styles.sectionLabel}>Pricing</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sale Price</span>
                <span className={[styles.infoValue, styles.mono].join(" ")}>{fmtMAD(medicine.salePrice)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Purchase Price</span>
                <span className={[styles.infoValue, styles.mono].join(" ")}>{fmtMAD(medicine.purchasePrice)}</span>
              </div>
            </div>
          </div>

          <div className={styles.cardSection}>
            <p className={styles.sectionLabel}>Stock Configuration</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Min Stock Level</span>
                <span className={[styles.infoValue, styles.mono].join(" ")}>{medicine.minStockLevel} {medicine.unit}s</span>
              </div>
            </div>
            <p className={styles.hint}>Alerts trigger when remaining stock falls below this level.</p>
          </div>
        </div>

        {/* Right: Stock Summary */}
        <div className={styles.summaryCard}>
          <p className={styles.sectionLabel} style={{ padding: "1rem 1.25rem 0" }}>Stock Summary</p>
          <div className={styles.stockKpi}>
            <p className={styles.stockLabel}>Total Stock</p>
            <p className={[styles.stockValue, totalStock === 0 ? styles.stockErr : totalStock < medicine.minStockLevel ? styles.stockWarn : ""].join(" ")}>
              {totalStock}
            </p>
            <p className={styles.stockUnit}>{medicine.unit}s</p>
          </div>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Active Batches</span>
              <span className={styles.summaryVal}>{activeBatches}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Nearest Expiry</span>
              <span className={[styles.summaryVal, isNearExpiry(nearestExpiry) ? styles.expiryWarn : ""].join(" ")}>
                {fmtDate(nearestExpiry)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Min Stock Level</span>
              <span className={styles.summaryVal}>{medicine.minStockLevel}</span>
            </div>
          </div>
          <div className={styles.summaryAction}>
            <button className={styles.registerBtn} onClick={() => setRegisterModal(true)}>
              <Plus size={14} /> Register Batch
            </button>
          </div>
        </div>
      </div>

      {/* Batch table */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Batches</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Expiry Date</th>
                <th>Initial Qty</th>
                <th>Remaining</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicine.batches.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyCell}>No batches registered yet.</td></tr>
              ) : medicine.batches.map((b) => {
                const meta = BATCH_STATUS_META[b.status] ?? { label: b.status, variant: "expired" };
                return (
                  <tr key={b._id} className={isNearExpiry(b.expiryDate) && b.status === "active" ? styles.rowNearExpiry : ""}>
                    <td className={styles.mono}>{b.batchNumber}</td>
                    <td className={[styles.mono, isNearExpiry(b.expiryDate) && b.status === "active" ? styles.expiryWarn : ""].join(" ")}>
                      {fmtDate(b.expiryDate)}
                    </td>
                    <td className={styles.mono}>{b.initialQty}</td>
                    <td className={styles.mono}>{b.remainingQty}</td>
                    <td className={styles.mono}>{fmtMAD(b.purchasePrice)}</td>
                    <td className={styles.mono}>{fmtMAD(b.salePrice)}</td>
                    <td><Badge variant={meta.variant}>{meta.label}</Badge></td>
                    <td>
                      {b.status === "active" && (
                        <button
                          className={styles.returnBtn}
                          onClick={() => setReturnModal({ open: true, batch: b })}
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Batch Modal */}
      <Modal
        isOpen={registerModal}
        onClose={() => { setRegisterModal(false); registerForm.reset(); }}
        title="Register New Batch"
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => { setRegisterModal(false); registerForm.reset(); }}>Cancel</button>
            <button className={styles.primaryBtn} type="submit" form="register-batch-form">Register Batch</button>
          </>
        }
      >
        <form id="register-batch-form" onSubmit={registerForm.handleSubmit(handleRegisterBatch)} noValidate>
          <div className={styles.formGrid2}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Batch Number *</label>
              <input className={styles.formInput} {...registerForm.register("batchNumber")} placeholder="PC-2601" />
              {registerForm.formState.errors.batchNumber && (
                <p className={styles.formError}>{registerForm.formState.errors.batchNumber.message}</p>
              )}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Expiry Date *</label>
              <input type="date" className={styles.formInput} {...registerForm.register("expiryDate")} />
              {registerForm.formState.errors.expiryDate && (
                <p className={styles.formError}>{registerForm.formState.errors.expiryDate.message}</p>
              )}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Initial Quantity *</label>
              <input type="number" className={styles.formInput} {...registerForm.register("initialQty")} placeholder="100" />
              {registerForm.formState.errors.initialQty && (
                <p className={styles.formError}>{registerForm.formState.errors.initialQty.message}</p>
              )}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Purchase Price (MAD) *</label>
              <input type="number" step="0.01" className={styles.formInput} {...registerForm.register("purchasePrice")} placeholder="15.00" />
              {registerForm.formState.errors.purchasePrice && (
                <p className={styles.formError}>{registerForm.formState.errors.purchasePrice.message}</p>
              )}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Sale Price (MAD) *</label>
              <input type="number" step="0.01" className={styles.formInput} {...registerForm.register("salePrice")} placeholder="22.50" />
              {registerForm.formState.errors.salePrice && (
                <p className={styles.formError}>{registerForm.formState.errors.salePrice.message}</p>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Return Batch Modal */}
      <Modal
        isOpen={returnModal.open}
        onClose={() => { setReturnModal({ open: false, batch: null }); returnForm.reset(); }}
        title="Return Batch"
        size="sm"
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => { setReturnModal({ open: false, batch: null }); returnForm.reset(); }}>Cancel</button>
            <button className={styles.dangerBtn} type="submit" form="return-batch-form">Confirm Return</button>
          </>
        }
      >
        {returnModal.batch && (
          <form id="return-batch-form" onSubmit={returnForm.handleSubmit(handleReturnBatch)} noValidate>
            <p className={styles.returnInfo}>
              Batch <strong>{returnModal.batch.batchNumber}</strong> — {returnModal.batch.remainingQty} units remaining.
            </p>
            <div className={styles.formField} style={{ marginTop: "1rem" }}>
              <label className={styles.formLabel}>Reason *</label>
              <textarea
                className={styles.formTextarea}
                rows={3}
                placeholder="e.g. Quality issue, supplier recall…"
                {...returnForm.register("reason")}
              />
              {returnForm.formState.errors.reason && (
                <p className={styles.formError}>{returnForm.formState.errors.reason.message}</p>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

MedicineDetailPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
