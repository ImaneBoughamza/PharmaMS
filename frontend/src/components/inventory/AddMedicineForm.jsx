import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "./AddMedicineForm.module.css";

const schema = z.object({
  // Medicine details
  name:          z.string().min(1, "Name is required"),
  genericName:   z.string().optional(),
  category:      z.enum(["OTC", "Prescription", "Regulated"], { required_error: "Category is required" }),
  unit:          z.string().min(1, "Unit is required"),
  minStockLevel: z.coerce.number().min(0, "Must be ≥ 0"),
  // Initial batch
  batchNumber:   z.string().min(1, "Batch number is required"),
  expiryDate:    z.string().min(1, "Expiry date is required"),
  purchasePrice: z.coerce.number().min(0, "Must be ≥ 0"),
  salePrice:     z.coerce.number().min(0, "Must be ≥ 0"),
  initialQty:    z.coerce.number().min(1, "Must be ≥ 1"),
});

export default function AddMedicineForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      {/* ── Section 1: Medicine details ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Medicine Details</h2>
        <div className={styles.grid2}>
          <Input
            id="name"
            label="Medicine name *"
            placeholder="Paracetamol 500mg"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="genericName"
            label="Generic name"
            placeholder="Paracetamol"
            error={errors.genericName?.message}
            {...register("genericName")}
          />
        </div>

        <div className={styles.grid3}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="category">Category *</label>
            <select id="category" className={styles.select} {...register("category")}>
              <option value="">Select…</option>
              <option value="OTC">OTC (Non-Prescription)</option>
              <option value="Prescription">Prescription</option>
              <option value="Regulated">Regulated</option>
            </select>
            {errors.category && <p className={styles.error}>{errors.category.message}</p>}
          </div>

          <Input
            id="unit"
            label="Unit *"
            placeholder="tablet, bottle, vial…"
            error={errors.unit?.message}
            {...register("unit")}
          />

          <Input
            id="minStockLevel"
            label="Min stock level *"
            type="number"
            placeholder="20"
            error={errors.minStockLevel?.message}
            {...register("minStockLevel")}
          />
        </div>
      </div>

      {/* ── Section 2: Initial batch ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Initial Batch</h2>
        <div className={styles.grid2}>
          <Input
            id="batchNumber"
            label="Batch number *"
            placeholder="PC-2401"
            error={errors.batchNumber?.message}
            {...register("batchNumber")}
          />
          <Input
            id="expiryDate"
            label="Expiry date *"
            type="date"
            error={errors.expiryDate?.message}
            {...register("expiryDate")}
          />
        </div>

        <div className={styles.grid3}>
          <Input
            id="initialQty"
            label="Initial quantity *"
            type="number"
            placeholder="100"
            error={errors.initialQty?.message}
            {...register("initialQty")}
          />
          <Input
            id="purchasePrice"
            label="Purchase price (MAD) *"
            type="number"
            step="0.01"
            placeholder="15.00"
            error={errors.purchasePrice?.message}
            {...register("purchasePrice")}
          />
          <Input
            id="salePrice"
            label="Sale price (MAD) *"
            type="number"
            step="0.01"
            placeholder="22.50"
            error={errors.salePrice?.message}
            {...register("salePrice")}
          />
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
