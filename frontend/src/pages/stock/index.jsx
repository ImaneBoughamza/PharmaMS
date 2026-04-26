import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import OverviewTab from "@/components/stock/OverviewTab";
import LowStockTab from "@/components/stock/LowStockTab";
import ExpiryTab from "@/components/stock/ExpiryTab";
import BatchManagementTab from "@/components/stock/BatchManagementTab";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST } from "@/constants/roles";
import styles from "@/styles/StockPage.module.css";

// ── Mock data ─────────────────────────────────────────────────────────────
// TODO: replace with useSWR when backend is ready
const INITIAL_MEDICINES = [
  { _id: "1", name: "Paracetamol 500mg", genericName: "Paracetamol",   category: "non-prescription", unit: "tablet", minStockLevel: 20, isActive: true,
    batches: [
      { _id: "b1", batchNumber: "PC-2401",  expiryDate: "2026-05-18", initialQty: 100, remainingQty: 8,  purchasePrice: 15,   salePrice: 22.5, status: "active"   },
      { _id: "b2", batchNumber: "PC-2312",  expiryDate: "2025-09-30", initialQty: 200, remainingQty: 0,  purchasePrice: 14.5, salePrice: 22.5, status: "depleted" },
    ]},
  { _id: "2", name: "Amoxicillin 1g",    genericName: "Amoxicillin",   category: "prescription",     unit: "tablet", minStockLevel: 15, isActive: true,
    batches: [
      { _id: "b3", batchNumber: "AMX-2501", expiryDate: "2027-03-10", initialQty: 150, remainingQty: 42, purchasePrice: 45,   salePrice: 65,   status: "active"   },
    ]},
  { _id: "3", name: "Ibuprofen 400mg",   genericName: "Ibuprofen",     category: "non-prescription", unit: "tablet", minStockLevel: 25, isActive: true,
    batches: [
      { _id: "b4", batchNumber: "IBU-2504", expiryDate: "2026-06-15", initialQty: 100, remainingQty: 12, purchasePrice: 18,   salePrice: 28,   status: "active"   },
      { _id: "b5", batchNumber: "IBU-2502", expiryDate: "2026-07-20", initialQty: 100, remainingQty: 7,  purchasePrice: 18,   salePrice: 28,   status: "active"   },
    ]},
  { _id: "4", name: "Vitamin C 1000mg",  genericName: "Ascorbic Acid", category: "non-prescription", unit: "tablet", minStockLevel: 10, isActive: true,
    batches: [
      { _id: "b6", batchNumber: "VC-2501",  expiryDate: "2028-01-20", initialQty: 300, remainingQty: 63, purchasePrice: 12,   salePrice: 18,   status: "active"   },
    ]},
  { _id: "5", name: "Diazepam 5mg",      genericName: "Diazepam",      category: "regulated",        unit: "tablet", minStockLevel: 5,  isActive: true, batches: [] },
  { _id: "6", name: "Metformin 500mg",   genericName: "Metformin",      category: "prescription",     unit: "tablet", minStockLevel: 20, isActive: true,
    batches: [
      { _id: "b7", batchNumber: "MET-2501", expiryDate: "2026-07-01", initialQty: 200, remainingQty: 55, purchasePrice: 22,   salePrice: 35,   status: "active"   },
    ]},
];

const INITIAL_PARAPHARMACY = [
  { _id: "p1", name: "Vitamin D3 1000 IU",  brand: "Sanofi",    category: "supplements",    stockQty: 48, minStockLevel: 10, purchasePrice: 55,  salePrice: 85,  isActive: true },
  { _id: "p2", name: "Micellar Water 400ml", brand: "Bioderma",  category: "cosmetics",      stockQty: 12, minStockLevel: 5,  purchasePrice: 80,  salePrice: 120, isActive: true },
  { _id: "p3", name: "Digital Thermometer",  brand: "Omron",     category: "medical-device", stockQty: 3,  minStockLevel: 5,  purchasePrice: 140, salePrice: 220, isActive: true },
  { _id: "p4", name: "Hand Sanitiser 500ml", brand: "Dettol",    category: "hygiene",        stockQty: 0,  minStockLevel: 10, purchasePrice: 28,  salePrice: 45,  isActive: true },
  { _id: "p5", name: "Omega-3 Fish Oil",     brand: "Nutrident", category: "supplements",    stockQty: 30, minStockLevel: 8,  purchasePrice: 95,  salePrice: 150, isActive: true },
];

const MOCK_BATCH_HISTORY = [
  { _id: "h1", date: "2026-04-20T10:30:00Z", type: "Sale",              qtyChange: -5, reference: "SALE-1234", staff: "Ahmed (cashier)"       },
  { _id: "h2", date: "2026-04-18T14:00:00Z", type: "Sale",              qtyChange: -3, reference: "SALE-1198", staff: "Sara (assistant)"      },
  { _id: "h3", date: "2026-04-15T09:00:00Z", type: "Manual Adjustment", qtyChange: -2, reference: null,        staff: "Dr. Imane (pharmacist)" },
  { _id: "h4", date: "2026-04-10T16:45:00Z", type: "Reservation",       qtyChange: -1, reference: "RES-0089",  staff: "Ahmed (cashier)"       },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function enrichMed(m) {
  const activeBatches = m.batches.filter((b) => b.status === "active");
  const totalStock    = activeBatches.reduce((s, b) => s + b.remainingQty, 0);
  const nearestExpiry = [...activeBatches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate ?? null;
  return { ...m, totalStock, activeBatchCount: activeBatches.length, nearestExpiry };
}

function getNearExpiry(medicines, thresholdDays) {
  const now = Date.now();
  return medicines
    .flatMap((m) =>
      m.batches
        .filter((b) => b.status === "active")
        .filter((b) => (new Date(b.expiryDate) - now) / 86400000 <= thresholdDays)
        .map((b) => ({ ...b, medicine: m }))
    )
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Schemas ───────────────────────────────────────────────────────────────
const adjustSchema = z.object({
  productType:    z.enum(["medicine", "parapharmacy"]),
  productId:      z.string().min(1, "Required"),
  batchId:        z.string().optional(),
  adjustmentType: z.enum(["add", "subtract"]),
  quantity:       z.coerce.number().int().min(1, "Must be ≥ 1"),
  reason:         z.string().min(10, "At least 10 characters required"),
});

const returnSchema = z.object({
  returnQty: z.coerce.number().int().min(1, "Must be ≥ 1"),
  reason:    z.enum(["near-expiry", "recall", "damaged", "supplier-error", "other"]),
  notes:     z.string().optional(),
});

const registerSchema = z.object({
  medicineId:    z.string().min(1, "Required"),
  batchNumber:   z.string().min(1, "Required"),
  expiryDate:    z.string().min(1, "Required").refine((v) => new Date(v) > new Date(), "Expiry date must be in the future"),
  receivedQty:   z.coerce.number().int().min(1, "Must be ≥ 1"),
  purchasePrice: z.coerce.number().min(0, "Must be ≥ 0"),
  salePrice:     z.coerce.number().min(0, "Must be ≥ 0"),
});

// ── AdjustStockModal ──────────────────────────────────────────────────────
function AdjustStockModal({ open, onClose, medicines, parapharmacy, onSubmit, prefill }) {
  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(adjustSchema),
    mode: "onChange",
    defaultValues: { productType: "medicine", productId: "", batchId: "", adjustmentType: "add", quantity: 1, reason: "" },
  });

  useEffect(() => {
    if (open && prefill) {
      setValue("productType", prefill.productType, { shouldValidate: true });
      setValue("productId",   prefill.productId,   { shouldValidate: true });
      setValue("batchId",     "",                  { shouldValidate: false });
    }
  }, [open, prefill]);

  const productType    = watch("productType");
  const productId      = watch("productId");
  const batchId        = watch("batchId");
  const adjustmentType = watch("adjustmentType");
  const quantity       = watch("quantity");
  const reason         = watch("reason");

  const activeBatches = useMemo(() => {
    if (productType !== "medicine" || !productId) return [];
    return (medicines.find((m) => m._id === productId)?.batches ?? []).filter((b) => b.status === "active");
  }, [productType, productId, medicines]);

  const currentStock = useMemo(() => {
    if (productType === "medicine") {
      return activeBatches.find((b) => b._id === batchId)?.remainingQty ?? 0;
    }
    return parapharmacy.find((p) => p._id === productId)?.stockQty ?? 0;
  }, [productType, productId, batchId, activeBatches, parapharmacy]);

  const qty = parseInt(quantity) || 0;
  const afterAdjustment = adjustmentType === "add" ? currentStock + qty : Math.max(0, currentStock - qty);
  const canSubmit = !!productId && (productType !== "medicine" || !!batchId) && qty >= 1 && (reason?.length ?? 0) >= 10;

  function handleClose() { reset(); onClose(); }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Adjust Stock Manually"
      footer={
        <>
          <button className={styles.ghostBtn} onClick={handleClose}>Cancel</button>
          <button className={styles.successBtn} type="submit" form="adjust-stock-form" disabled={!canSubmit}>Apply Adjustment</button>
        </>
      }
    >
      <form id="adjust-stock-form" onSubmit={handleSubmit((data) => { if (onSubmit(data) !== false) handleClose(); })} noValidate>
        <div className={styles.formGrid2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Product Type *</label>
            <select className={styles.formSelect} {...register("productType")} onChange={(e) => { setValue("productType", e.target.value); setValue("productId", ""); setValue("batchId", ""); }}>
              <option value="medicine">Medicine</option>
              <option value="parapharmacy">Parapharmacy Product</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Product *</label>
            <select className={styles.formSelect} {...register("productId")} onChange={(e) => { setValue("productId", e.target.value); setValue("batchId", ""); }}>
              <option value="">Select…</option>
              {(productType === "medicine" ? medicines : parapharmacy).filter((p) => p.isActive).map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <p className={styles.formError}>{errors.productId.message}</p>}
          </div>

          {productType === "medicine" && (
            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.formLabel}>Batch *</label>
              <select className={styles.formSelect} {...register("batchId")}>
                <option value="">Select batch…</option>
                {activeBatches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchNumber} — exp. {fmtDate(b.expiryDate)} — {b.remainingQty} remaining
                  </option>
                ))}
              </select>
              {errors.batchId && <p className={styles.formError}>{errors.batchId.message}</p>}
            </div>
          )}

          <div className={styles.formField}>
            <label className={styles.formLabel}>Adjustment Type *</label>
            <select className={styles.formSelect} {...register("adjustmentType")}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Quantity *</label>
            <input type="number" min="1" max={adjustmentType === "subtract" ? currentStock : undefined} className={styles.formInput} {...register("quantity")} />
            {errors.quantity && <p className={styles.formError}>{errors.quantity.message}</p>}
          </div>

          {productId && (
            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <p className={styles.previewText}>
                After adjustment: <span className={styles.previewStrong}>{afterAdjustment} units remaining</span>
              </p>
            </div>
          )}

          <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.formLabel}>Reason * (min 10 chars)</label>
            <textarea
              className={styles.formTextarea}
              rows={3}
              placeholder="Provide a clear reason for this adjustment (required for audit)"
              {...register("reason")}
            />
            {errors.reason && <p className={styles.formError}>{errors.reason.message}</p>}
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ── ReturnBatchModal ──────────────────────────────────────────────────────
function ReturnBatchModal({ open, batch, onClose, onSubmit }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { returnQty: 1, reason: "near-expiry", notes: "" },
  });
  const reason = watch("reason");

  function handleClose() { reset(); onClose(); }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Return Batch to Supplier"
      size="sm"
      footer={
        <>
          <button className={styles.ghostBtn} onClick={handleClose}>Cancel</button>
          <button className={styles.dangerBtn} type="submit" form="return-batch-form">Confirm Return</button>
        </>
      }
    >
      {batch && (
        <form id="return-batch-form" onSubmit={handleSubmit((data) => { onSubmit(data, batch); handleClose(); })} noValidate>
          <div style={{ padding: "8px 10px", background: "var(--color-bg)", borderRadius: "var(--radius-sm)", marginBottom: 14, fontFamily: "var(--font-ui)", fontSize: 13 }}>
            <strong>{batch.batchNumber}</strong> — {batch.medicine?.name ?? batch.medicineName} — {batch.remainingQty} units remaining
          </div>
          <div className={styles.formField} style={{ marginBottom: 12 }}>
            <label className={styles.formLabel}>Return Quantity *</label>
            <input type="number" min="1" max={batch.remainingQty} className={styles.formInput} {...register("returnQty")} />
            {errors.returnQty && <p className={styles.formError}>{errors.returnQty.message}</p>}
          </div>
          <div className={styles.formField} style={{ marginBottom: reason === "other" ? 12 : 0 }}>
            <label className={styles.formLabel}>Reason *</label>
            <select className={styles.formSelect} {...register("reason")}>
              <option value="near-expiry">Near expiry (before official date)</option>
              <option value="recall">Product recall</option>
              <option value="damaged">Damaged stock</option>
              <option value="supplier-error">Supplier error</option>
              <option value="other">Other</option>
            </select>
          </div>
          {reason === "other" && (
            <div className={styles.formField}>
              <label className={styles.formLabel}>Notes</label>
              <textarea className={styles.formTextarea} rows={2} {...register("notes")} placeholder="Specify reason…" />
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

// ── RegisterBatchModal ────────────────────────────────────────────────────
function RegisterBatchModal({ open, onClose, medicines, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  function handleClose() { reset(); onClose(); }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Register New Batch"
      footer={
        <>
          <button className={styles.ghostBtn} onClick={handleClose}>Cancel</button>
          <button className={styles.successBtn} type="submit" form="register-batch-form">Register Batch</button>
        </>
      }
    >
      <form id="register-batch-form" onSubmit={handleSubmit((data) => { if (onSubmit(data) !== false) handleClose(); })} noValidate>
        <div className={styles.formGrid2}>
          <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.formLabel}>Medicine *</label>
            <select className={styles.formSelect} {...register("medicineId")}>
              <option value="">Select medicine…</option>
              {medicines.filter((m) => m.isActive).map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            {errors.medicineId && <p className={styles.formError}>{errors.medicineId.message}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Batch Number *</label>
            <input className={styles.formInput} {...register("batchNumber")} placeholder="e.g. BN-2026-001" />
            {errors.batchNumber && <p className={styles.formError}>{errors.batchNumber.message}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Expiry Date *</label>
            <input type="date" className={styles.formInput} {...register("expiryDate")} />
            {errors.expiryDate && <p className={styles.formError}>{errors.expiryDate.message}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Received Quantity *</label>
            <input type="number" min="1" className={styles.formInput} {...register("receivedQty")} placeholder="100" />
            {errors.receivedQty && <p className={styles.formError}>{errors.receivedQty.message}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Purchase Price (MAD) *</label>
            <input type="number" step="0.01" className={styles.formInput} {...register("purchasePrice")} placeholder="15.00" />
            {errors.purchasePrice && <p className={styles.formError}>{errors.purchasePrice.message}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Sale Price (MAD) *</label>
            <input type="number" step="0.01" className={styles.formInput} {...register("salePrice")} placeholder="22.50" />
            {errors.salePrice && <p className={styles.formError}>{errors.salePrice.message}</p>}
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ── BatchHistoryModal ─────────────────────────────────────────────────────
function BatchHistoryModal({ open, batch, onClose }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={`Batch History — ${batch?.batchNumber ?? ""}`} size="lg">
      {batch && (
        <>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
            {batch.medicine?.name ?? batch.medicineName}
          </p>
          <div className={styles.historyMeta}>
            <div className={styles.historyMetaItem}>
              <span className={styles.historyMetaLabel}>Initial Qty</span>
              <span className={styles.historyMetaVal}>{batch.initialQty}</span>
            </div>
            <div className={styles.historyMetaItem}>
              <span className={styles.historyMetaLabel}>Remaining Qty</span>
              <span className={styles.historyMetaVal}>{batch.remainingQty}</span>
            </div>
            <div className={styles.historyMetaItem}>
              <span className={styles.historyMetaLabel}>Consumed</span>
              <span className={styles.historyMetaVal}>{batch.initialQty - batch.remainingQty}</span>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Qty Change</th>
                  <th>Reference</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BATCH_HISTORY.map((h) => (
                  <tr key={h._id}>
                    <td className={styles.monoCell}>{fmtDate(h.date)}</td>
                    <td>{h.type}</td>
                    <td className={h.qtyChange < 0 ? styles.subQty : styles.addQty}>
                      {h.qtyChange > 0 ? "+" : ""}{h.qtyChange}
                    </td>
                    <td>
                      {h.reference
                        ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-primary-action)", cursor: "pointer", textDecoration: "underline" }}>{h.reference}</span>
                        : <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                    </td>
                    <td>{h.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function StockPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  const [medicines,       setMedicines]       = useState(INITIAL_MEDICINES);
  const [parapharmacy,    setParapharmacy]    = useState(INITIAL_PARAPHARMACY);
  const [expiryThreshold, setExpiryThreshold] = useState(90);

  // Modal state
  const [adjustModal,   setAdjustModal]   = useState({ open: false });
  const [returnModal,   setReturnModal]   = useState({ open: false, batch: null });
  const [registerModal, setRegisterModal] = useState(false);
  const [historyModal,  setHistoryModal]  = useState({ open: false, batch: null });

  // Derived data
  const enriched = useMemo(() => medicines.map(enrichMed), [medicines]);
  const lowStockMeds  = useMemo(() => enriched.filter((m) => m.isActive && m.totalStock < m.minStockLevel), [enriched]);
  const lowStockPara  = useMemo(() => parapharmacy.filter((p) => p.isActive && p.stockQty < p.minStockLevel), [parapharmacy]);
  const nearExpiryBatches = useMemo(() => getNearExpiry(medicines, expiryThreshold), [medicines, expiryThreshold]);
  const allBatches = useMemo(() =>
    medicines.flatMap((m) => m.batches.map((b) => ({ ...b, medicine: m }))),
    [medicines]
  );
  const lowStockCount = lowStockMeds.length + lowStockPara.length;

  // ── Handlers ──────────────────────────────────────────────────────────
  function handleAdjustStock(data) {
    if (data.adjustmentType === "subtract") {
      const current = data.productType === "medicine"
        ? medicines.find((m) => m._id === data.productId)?.batches.find((b) => b._id === data.batchId)?.remainingQty ?? 0
        : parapharmacy.find((p) => p._id === data.productId)?.stockQty ?? 0;
      if (data.quantity > current) {
        toast.error("Cannot subtract more than the available quantity");
        return false;
      }
    }
    if (data.productType === "medicine") {
      setMedicines((prev) => prev.map((m) => ({
        ...m,
        batches: m.batches.map((b) => b._id === data.batchId
          ? { ...b, remainingQty: data.adjustmentType === "add" ? b.remainingQty + data.quantity : b.remainingQty - data.quantity }
          : b
        ),
      })));
    } else {
      setParapharmacy((prev) => prev.map((p) => p._id !== data.productId ? p : {
        ...p,
        stockQty: data.adjustmentType === "add" ? p.stockQty + data.quantity : p.stockQty - data.quantity,
      }));
    }
    toast.success("Stock adjustment recorded");
  }

  function handleReturnBatch(data, batch) {
    setMedicines((prev) => prev.map((m) => ({
      ...m,
      batches: m.batches.map((b) => b._id === batch._id ? { ...b, status: "returned" } : b),
    })));
    toast.success("Batch marked for return to supplier");
  }

  function handleRegisterBatch(data) {
    const med = medicines.find((m) => m._id === data.medicineId);
    if (med?.batches.some((b) => b.batchNumber === data.batchNumber)) {
      toast.error("A batch with this number already exists for this medicine");
      return false;
    }
    const newBatch = {
      _id: `b-${Date.now()}`,
      batchNumber:   data.batchNumber,
      expiryDate:    data.expiryDate,
      initialQty:    data.receivedQty,
      remainingQty:  data.receivedQty,
      purchasePrice: data.purchasePrice,
      salePrice:     data.salePrice,
      status: "active",
    };
    setMedicines((prev) => prev.map((m) => m._id === data.medicineId
      ? { ...m, batches: [...m.batches, newBatch] }
      : m
    ));
    toast.success("Batch registered successfully");
  }

  function handleDeactivateBatch(batchId, medId) {
    setMedicines((prev) => prev.map((m) => m._id !== medId ? m : {
      ...m,
      batches: m.batches.map((b) => b._id === batchId ? { ...b, status: "deactivated" } : b),
    }));
    toast.success("Batch deactivated");
  }

  function handleSaveMedThresholds(updates) {
    setMedicines((prev) => prev.map((m) => updates[m._id] !== undefined ? { ...m, minStockLevel: updates[m._id] } : m));
    toast.success("Minimum stock threshold updated");
  }

  function handleSaveParaThresholds(updates) {
    setParapharmacy((prev) => prev.map((p) => updates[p._id] !== undefined ? { ...p, minStockLevel: updates[p._id] } : p));
    toast.success("Minimum stock threshold updated");
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Stock Management</h1>
          <p className={styles.subtitle}>Inventory status for medicines and parapharmacy products</p>
        </div>
        {role === PHARMACIST && (
          <div className={styles.headerActions}>
            <button className={styles.secondaryBtn} onClick={() => setAdjustModal({ open: true })}>
              Adjust Stock
            </button>
            <button className={styles.primaryBtn} onClick={() => router.push("/stock/report")}>
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button className={tab === "overview" ? styles.tabActive : styles.tab} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button className={tab === "lowstock" ? styles.tabActive : styles.tab} onClick={() => setTab("lowstock")}>
          Low-Stock Alerts {lowStockCount > 0 && <span className={styles.tabBadge}>{lowStockCount}</span>}
        </button>
        <button className={tab === "expiry" ? styles.tabActive : styles.tab} onClick={() => setTab("expiry")}>
          Expiry Alerts {nearExpiryBatches.length > 0 && <span className={styles.tabBadge}>{nearExpiryBatches.length}</span>}
        </button>
        {role === PHARMACIST && (
          <button className={tab === "batches" ? styles.tabActive : styles.tab} onClick={() => setTab("batches")}>
            Batch Management
          </button>
        )}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab
          enrichedMedicines={enriched}
          parapharmacy={parapharmacy}
          lowStockCount={lowStockCount}
          nearExpiryCount={nearExpiryBatches.length}
        />
      )}
      {tab === "lowstock" && (
        <LowStockTab
          lowStockMeds={lowStockMeds}
          lowStockPara={lowStockPara}
          medicines={enriched}
          parapharmacy={parapharmacy}
          onSaveMedThresholds={handleSaveMedThresholds}
          onSaveParaThresholds={handleSaveParaThresholds}
          onOrderStock={() => router.push("/products/orders/new")}
          onAdjustStock={(item) => setAdjustModal({ open: true, prefill: { productType: "parapharmacy", productId: item._id } })}
          role={role}
        />
      )}
      {tab === "expiry" && (
        <ExpiryTab
          batches={nearExpiryBatches}
          threshold={expiryThreshold}
          onSaveThreshold={(days) => { setExpiryThreshold(days); toast.success(`Near-expiry threshold updated to ${days} days`); }}
          onReturnBatch={(batch) => setReturnModal({ open: true, batch })}
          onDeactivateBatch={handleDeactivateBatch}
          role={role}
        />
      )}
      {tab === "batches" && role === PHARMACIST && (
        <BatchManagementTab
          allBatches={allBatches}
          medicines={medicines}
          threshold={expiryThreshold}
          onReturnBatch={(batch) => setReturnModal({ open: true, batch })}
          onRegisterBatch={() => setRegisterModal(true)}
          onDeactivateBatch={handleDeactivateBatch}
          onViewHistory={(batch) => setHistoryModal({ open: true, batch })}
        />
      )}

      {/* Modals */}
      <AdjustStockModal
        open={adjustModal.open}
        onClose={() => setAdjustModal({ open: false })}
        medicines={enriched}
        parapharmacy={parapharmacy}
        onSubmit={handleAdjustStock}
        prefill={adjustModal.prefill}
      />
      <ReturnBatchModal
        open={returnModal.open}
        batch={returnModal.batch}
        onClose={() => setReturnModal({ open: false, batch: null })}
        onSubmit={handleReturnBatch}
      />
      <RegisterBatchModal
        open={registerModal}
        onClose={() => setRegisterModal(false)}
        medicines={medicines}
        onSubmit={handleRegisterBatch}
      />
      <BatchHistoryModal
        open={historyModal.open}
        batch={historyModal.batch}
        onClose={() => setHistoryModal({ open: false, batch: null })}
      />
    </div>
  );
}

StockPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
