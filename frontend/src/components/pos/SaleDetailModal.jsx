import { X } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./SaleDetailModal.module.css";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}


export default function SaleDetailModal({ sale, isPharmacist, onClose, onVoid }) {
  if (!sale) return null;

  const meds = sale.items.filter((i) => i.productType === "medicine");
  const para = sale.items.filter((i) => i.productType !== "medicine");
  const medSubtotal  = meds.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const paraSubtotal = para.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total        = medSubtotal + paraSubtotal;
  const isVoided     = sale.status === "voided";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Sale #{sale.receiptNumber}</h2>
            <p className={styles.subtitle}>{formatDateTime(sale.createdAt)} — {sale.cashierName}</p>
          </div>
          <button type="button" className={styles.closeIcon} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Receipt body */}
        <div className={styles.body} id="pos-receipt">
          {isVoided && (
            <div className={styles.voidedBanner}>
              Voided — {sale.voidReason}
            </div>
          )}

          {meds.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>MEDICINES</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className={styles.right}>Qty</th>
                    <th className={styles.right}>Unit Price</th>
                    <th className={styles.right}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td className={styles.right}>{item.qty}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice)}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {para.length > 0 && (
                <div className={styles.sectionSubtotal}>
                  <span>Medicines subtotal</span>
                  <span>{formatCurrency(medSubtotal)}</span>
                </div>
              )}
            </div>
          )}

          {para.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>PARAPHARMACY</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className={styles.right}>Qty</th>
                    <th className={styles.right}>Unit Price</th>
                    <th className={styles.right}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {para.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td className={styles.right}>{item.qty}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice)}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {meds.length > 0 && (
                <div className={styles.sectionSubtotal}>
                  <span>Parapharmacy subtotal</span>
                  <span>{formatCurrency(paraSubtotal)}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.divider} />

          <div className={styles.grandTotal}>
            <span className={styles.grandTotalLabel}>TOTAL</span>
            <span className={styles.grandTotalValue}>{formatCurrency(total)}</span>
          </div>

          <div className={styles.paymentRow}>
            <span>Payment Method</span>
            <span>{sale.paymentMethod}</span>
          </div>

          <div className={styles.paymentRow}>
            <span>Status</span>
            <span className={isVoided ? styles.statusVoided : styles.statusCompleted}>
              {isVoided ? "Voided" : "Completed"}
            </span>
          </div>

          {isVoided && sale.voidReason && (
            <div className={styles.paymentRow}>
              <span>Void Reason</span>
              <span className={styles.voidReasonText}>{sale.voidReason}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.printBtn}
            onClick={() => window.print()}
          >
            Print
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          {isPharmacist && !isVoided && (
            <button type="button" className={styles.voidBtn} onClick={() => onVoid(sale)}>
              Void Sale
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
