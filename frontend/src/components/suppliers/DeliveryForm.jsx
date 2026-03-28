import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "./DeliveryForm.module.css";

const schema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  purchasePrice: z.coerce.number().positive("Purchase price must be positive"),
  salePrice: z.coerce.number().positive("Sale price must be positive"),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export default function DeliveryForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Medicine & Batch</h3>
        <Input
          label="Medicine Name *"
          placeholder="e.g. Paracetamol 500mg"
          error={errors.medicineName?.message}
          {...register("medicineName")}
        />
        <div className={styles.row}>
          <Input
            label="Batch Number *"
            placeholder="e.g. BATCH-2026-01"
            error={errors.batchNumber?.message}
            {...register("batchNumber")}
          />
          <Input
            label="Expiry Date *"
            type="date"
            error={errors.expiryDate?.message}
            {...register("expiryDate")}
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Quantity *"
            type="number"
            min="1"
            placeholder="0"
            error={errors.quantity?.message}
            {...register("quantity")}
          />
          <Input
            label="Invoice Number"
            placeholder="INV-..."
            error={errors.invoiceNumber?.message}
            {...register("invoiceNumber")}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pricing</h3>
        <div className={styles.row}>
          <Input
            label="Purchase Price (MAD) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.purchasePrice?.message}
            {...register("purchasePrice")}
          />
          <Input
            label="Sale Price (MAD) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.salePrice?.message}
            {...register("salePrice")}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Notes</h3>
        <div className={styles.field}>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Optional notes about this delivery..."
            {...register("notes")}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" isLoading={isLoading} className={styles.submitBtn}>
        Log Delivery
      </Button>
    </form>
  );
}
