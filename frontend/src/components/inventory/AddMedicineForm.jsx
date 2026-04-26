import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import styles from "./AddMedicineForm.module.css";

const schema = z.object({
  // Basic info
  name:          z.string().min(1, "Name is required"),
  genericName:   z.string().optional().default(""),
  category:      z.enum(["non-prescription", "prescription", "regulated"], { required_error: "Category is required" }),
  unit:          z.string().min(1, "Unit is required"),
  description:   z.string().optional().default(""),
  supplierId:    z.string().optional(),
  // Pricing
  salePrice:     z.coerce.number().positive("Must be positive"),
  purchasePrice: z.coerce.number().positive("Must be positive"),
  // Stock config
  minStockLevel: z.coerce.number().int().min(0, "Must be ≥ 0"),
  // Initial batch
  batchNumber:   z.string().min(1, "Batch number is required"),
  expiryDate:    z.string().min(1, "Expiry date is required"),
  initialQty:    z.coerce.number().int().min(1, "Must be ≥ 1"),
});

const MOCK_SUPPLIERS = [
  { _id: "s1", name: "PharmaDist Maroc" },
  { _id: "s2", name: "BioLab Supplies" },
];

export default function AddMedicineForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>

      {/* ── Section 1: Basic Information ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        <div className={styles.grid2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="name">Medicine Name *</label>
            <input id="name" className={styles.input} placeholder="Paracetamol 500mg" {...register("name")} />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="genericName">Generic Name</label>
            <input id="genericName" className={styles.input} placeholder="Paracetamol" {...register("genericName")} />
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="category">Category *</label>
            <select id="category" className={styles.select} {...register("category")}>
              <option value="">Select…</option>
              <option value="non-prescription">Non-Prescription (OTC)</option>
              <option value="prescription">Prescription</option>
              <option value="regulated">Regulated</option>
            </select>
            {errors.category && <p className={styles.error}>{errors.category.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="unit">Unit *</label>
            <input id="unit" className={styles.input} placeholder="tablet, bottle, vial…" {...register("unit")} />
            {errors.unit && <p className={styles.error}>{errors.unit.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="supplierId">Supplier</label>
            <select id="supplierId" className={styles.select} {...register("supplierId")}>
              <option value="">No supplier</option>
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className={[styles.fieldWrap, styles.fullWidth].join(" ")}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea id="description" className={styles.textarea} rows={2} placeholder="Optional notes about this medicine" {...register("description")} />
          </div>
        </div>
      </div>

      {/* ── Section 2: Pricing ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing</h2>
        <div className={styles.grid2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="salePrice">Sale Price (MAD) *</label>
            <input id="salePrice" type="number" step="0.01" className={styles.input} placeholder="22.50" {...register("salePrice")} />
            {errors.salePrice && <p className={styles.error}>{errors.salePrice.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="purchasePrice">Purchase Price (MAD) *</label>
            <input id="purchasePrice" type="number" step="0.01" className={styles.input} placeholder="15.00" {...register("purchasePrice")} />
            {errors.purchasePrice && <p className={styles.error}>{errors.purchasePrice.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Section 3: Stock Configuration ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Stock Configuration</h2>
        <div className={styles.grid2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="minStockLevel">Min Stock Level *</label>
            <input id="minStockLevel" type="number" min="0" className={styles.input} placeholder="20" {...register("minStockLevel")} />
            {errors.minStockLevel && <p className={styles.error}>{errors.minStockLevel.message}</p>}
            <p className={styles.hint}>Alerts trigger when remaining stock falls below this level.</p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Initial Batch ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Initial Batch</h2>
        <div className={styles.grid2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="batchNumber">Batch Number *</label>
            <input id="batchNumber" className={styles.input} placeholder="PC-2601" {...register("batchNumber")} />
            {errors.batchNumber && <p className={styles.error}>{errors.batchNumber.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expiryDate">Expiry Date *</label>
            <input id="expiryDate" type="date" className={styles.input} {...register("expiryDate")} />
            {errors.expiryDate && <p className={styles.error}>{errors.expiryDate.message}</p>}
          </div>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="initialQty">Initial Quantity *</label>
            <input id="initialQty" type="number" min="1" className={styles.input} placeholder="100" {...register("initialQty")} />
            {errors.initialQty && <p className={styles.error}>{errors.initialQty.message}</p>}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" size="md" disabled={isLoading}>
          {isLoading ? "Saving…" : "Add Medicine"}
        </Button>
      </div>
    </form>
  );
}
