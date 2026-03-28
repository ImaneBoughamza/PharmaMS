import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "./AddSupplierForm.module.css";

const schema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default function AddSupplierForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>
        <Input
          label="Supplier Name *"
          placeholder="e.g. MedPharma Distribution"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className={styles.row}>
          <Input
            label="Contact Person"
            placeholder="Full name"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />
          <Input
            label="Phone"
            placeholder="+212 ..."
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="supplier@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Additional Details</h3>
        <Input
          label="Address"
          placeholder="Street, City"
          error={errors.address?.message}
          {...register("address")}
        />
        <div className={styles.field}>
          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Optional notes..."
            {...register("notes")}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" isLoading={isLoading} className={styles.submitBtn}>
        Add Supplier
      </Button>
    </form>
  );
}
