import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "./ReservationForm.module.css";

const schema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Phone number is required"),
  medicineName: z.string().min(1, "Medicine name is required"),
  qty: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  paymentMethod: z.enum(["Pay on Pickup", "Online Payment"], {
    required_error: "Payment method is required",
  }),
  notes: z.string().optional(),
});

export default function ReservationForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "Pay on Pickup", qty: 1 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Customer Information</h3>
        <div className={styles.row}>
          <Input
            label="Full Name"
            placeholder="Customer full name"
            error={errors.customerName?.message}
            {...register("customerName")}
          />
          <Input
            label="Phone Number"
            placeholder="+212 ..."
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Reservation Details</h3>
        <Input
          label="Medicine Name"
          placeholder="Enter medicine name"
          error={errors.medicineName?.message}
          {...register("medicineName")}
        />
        <div className={styles.row}>
          <Input
            label="Quantity"
            type="number"
            min="1"
            error={errors.qty?.message}
            {...register("qty")}
          />
          <Input
            label="Pickup Date"
            type="date"
            error={errors.pickupDate?.message}
            {...register("pickupDate")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Payment Method</label>
          <div className={styles.paymentGrid}>
            {["Pay on Pickup", "Online Payment"].map((method) => (
              <label key={method} className={styles.payOption}>
                <input type="radio" value={method} {...register("paymentMethod")} />
                {method}
              </label>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className={styles.error}>{errors.paymentMethod.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Notes (optional)</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Additional notes for the pharmacist..."
            {...register("notes")}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" isLoading={isLoading} className={styles.submitBtn}>
        Create Reservation
      </Button>
    </form>
  );
}
