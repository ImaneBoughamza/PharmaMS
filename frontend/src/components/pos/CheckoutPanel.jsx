import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import Button from "@/components/ui/Button";
import styles from "./CheckoutPanel.module.css";

const PAYMENT_METHODS = ["Cash", "Card", "Insurance"];

export default function CheckoutPanel({ total, onCheckout, isLoading, disabled }) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  return (
    <div className={styles.panel}>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatCurrency(total)}</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Payment method</label>
        <div className={styles.methods}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              className={[
                styles.methodBtn,
                paymentMethod === m ? styles.active : "",
              ].join(" ")}
              onClick={() => setPaymentMethod(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={() => onCheckout(paymentMethod)}
        disabled={disabled || isLoading || total === 0}
        className={styles.checkoutBtn}
      >
        {isLoading ? "Processing…" : "Complete Sale"}
      </Button>
    </div>
  );
}
