import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./CheckoutPanel.module.css";

const PAYMENT_METHODS = ["Cash", "Card"];

export default function CheckoutPanel({ cart, onCheckout, isLoading, receipt, onNewSale, pharmacistNotice, initialPaymentMethod }) {
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod ?? "Cash");

  useEffect(() => {
    if (initialPaymentMethod) setPaymentMethod(initialPaymentMethod);
  }, [initialPaymentMethod]);

  /* ── Receipt (read-only) mode ── */
  if (receipt) {
    return (
      <div className={styles.panel}>
        <div className={styles.totalsSection}>
          <div className={styles.divider} />
          {receipt.medicines.length > 0 && (
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Medicines subtotal</span>
              <span className={styles.subtotalValue}>{formatCurrency(receipt.medSubtotal)}</span>
            </div>
          )}
          {receipt.parapharmacy.length > 0 && (
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Parapharmacy subtotal</span>
              <span className={styles.subtotalValue}>{formatCurrency(receipt.paraSubtotal)}</span>
            </div>
          )}
          <div className={styles.divider} />
          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalLabel}>Total</span>
            <span className={styles.grandTotalValue}>{formatCurrency(receipt.total)}</span>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Payment method</span>
          <div className={styles.paymentCompleted}>{receipt.paymentMethod}</div>
        </div>

        <button type="button" className={styles.newSaleBtn} onClick={onNewSale}>
          New Sale
        </button>
      </div>
    );
  }

  /* ── Normal checkout mode ── */
  const medItems  = cart.filter((i) => i.item.type === "medicine");
  const paraItems = cart.filter((i) => i.item.type !== "medicine");
  const medTotal  = medItems.reduce((s, i)  => s + i.item.salePrice * i.qty, 0);
  const paraTotal = paraItems.reduce((s, i) => s + i.item.salePrice * i.qty, 0);
  const total     = medTotal + paraTotal;

  const hasOverStock = cart.some((i) => i.qty > i.item.stock);
  const disabled = cart.length === 0 || hasOverStock || isLoading;

  return (
    <div className={styles.panel}>
      {/* ── Cart Totals ── */}
      <div className={styles.totalsSection}>
        <div className={styles.divider} />
        {medItems.length > 0 && (
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>Medicines subtotal</span>
            <span className={styles.subtotalValue}>{formatCurrency(medTotal)}</span>
          </div>
        )}
        {paraItems.length > 0 && (
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>Parapharmacy subtotal</span>
            <span className={styles.subtotalValue}>{formatCurrency(paraTotal)}</span>
          </div>
        )}
        <div className={styles.divider} />
        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalLabel}>Total</span>
          <span className={styles.grandTotalValue}>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className={styles.field}>
        <span className={styles.label}>Payment method</span>
        <div className={styles.methods}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              className={[styles.methodBtn, paymentMethod === m ? styles.active : ""].join(" ")}
              onClick={() => setPaymentMethod(m)}
              disabled={isLoading}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pharmacist regulated-medicine notice ── */}
      {pharmacistNotice && (
        <div className={styles.regulatedNotice}>
          Regulated medicines — dispensing as pharmacist
        </div>
      )}

      {/* ── Complete Sale ── */}
      <button
        type="button"
        className={styles.checkoutBtn}
        onClick={() => onCheckout(paymentMethod)}
        disabled={disabled}
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className={styles.spinner} />
            Processing…
          </>
        ) : (
          "Complete Sale"
        )}
      </button>
    </div>
  );
}
