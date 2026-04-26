import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import styles from "@/styles/ParapharmacyPage.module.css";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional().default(""),
  category: z.enum(["cosmetics", "supplements", "medical-device", "hygiene", "other"]),
  purchasePrice: z.coerce.number().positive("Must be positive"),
  salePrice: z.coerce.number().positive("Must be positive"),
  stockQty: z.coerce.number().int().min(0, "Cannot be negative"),
  minStockLevel: z.coerce.number().int().min(0).optional().default(5),
  supplierId: z.string().optional().nullable(),
});

const MOCK_SUPPLIERS = [
  { _id: "s1", name: "PharmaDist Maroc" },
  { _id: "s2", name: "BioLab Supplies" },
];

export default function AddParapharmacyForm({ onSubmit, isLoading, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* Product info */}
      <div className={styles.formSection}>
        <p className={styles.formSectionLabel}>Product Information</p>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Name</label>
            <input className={styles.input} {...register("name")} placeholder="e.g. Vitamin D3 1000 IU" />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Brand</label>
            <input className={styles.input} {...register("brand")} placeholder="e.g. Sanofi" />
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Category</label>
            <select className={styles.select} {...register("category")}>
              <option value="">Select category…</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="supplements">Supplements</option>
              <option value="medical-device">Medical Device</option>
              <option value="hygiene">Hygiene</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p className={styles.error}>{errors.category.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Supplier</label>
            <select className={styles.select} {...register("supplierId")}>
              <option value="">No supplier</option>
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & stock */}
      <div className={styles.formSection}>
        <p className={styles.formSectionLabel}>Pricing & Stock</p>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Purchase Price (MAD)</label>
            <input type="number" step="0.01" className={styles.input} {...register("purchasePrice")} />
            {errors.purchasePrice && <p className={styles.error}>{errors.purchasePrice.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Sale Price (MAD)</label>
            <input type="number" step="0.01" className={styles.input} {...register("salePrice")} />
            {errors.salePrice && <p className={styles.error}>{errors.salePrice.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Initial Stock Qty</label>
            <input type="number" min="0" className={styles.input} {...register("stockQty")} />
            {errors.stockQty && <p className={styles.error}>{errors.stockQty.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Min Stock Level</label>
            <input type="number" min="0" className={styles.input} {...register("minStockLevel")} />
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Save Product
        </Button>
      </div>
    </form>
  );
}
