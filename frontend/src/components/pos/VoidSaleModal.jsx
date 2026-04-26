import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "./VoidSaleModal.module.css";

const schema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export default function VoidSaleModal({ sale, onConfirm, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

  if (!sale) return null;

  const meds = sale.items.filter((i) => i.productType === "medicine");
  const para = sale.items.filter((i) => i.productType !== "medicine");

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true">
        <h2 className={styles.title}>Void Sale #{sale.receiptNumber}</h2>
        <p className={styles.warning}>
          This will permanently void this sale and restore all stock quantities.
        </p>

        {/* Medicines to restore */}
        {meds.length > 0 && (
          <div className={styles.restoreSection}>
            <p className={styles.restoreLabel}>Medicines to restore</p>
            {meds.map((item, i) => (
              <div key={i} className={styles.restoreRow}>
                <span className={styles.restoreName}>{item.productName}</span>
                <span className={styles.restoreMeta}>
                  {item.qty} unit{item.qty !== 1 ? "s" : ""}
                  {item.batchNumber && (
                    <> → batch <span className={styles.batch}>{item.batchNumber}</span></>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Parapharmacy to restore */}
        {para.length > 0 && (
          <div className={styles.restoreSection}>
            <p className={styles.restoreLabel}>Parapharmacy to restore</p>
            {para.map((item, i) => (
              <div key={i} className={styles.restoreRow}>
                <span className={styles.restoreName}>{item.productName}</span>
                <span className={styles.restoreMeta}>
                  {item.qty} unit{item.qty !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Reason form */}
        <form onSubmit={handleSubmit((data) => onConfirm(sale, data.reason))}>
          <div className={styles.field}>
            <textarea
              className={[styles.textarea, errors.reason ? styles.textareaError : ""].join(" ")}
              rows={3}
              placeholder="Provide a reason for voiding this sale"
              {...register("reason")}
            />
            {errors.reason && (
              <p className={styles.errorMsg}>{errors.reason.message}</p>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.voidBtn} disabled={!isValid}>
              Void Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
