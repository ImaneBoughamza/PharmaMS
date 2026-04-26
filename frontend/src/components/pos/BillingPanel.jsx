import styles from "./BillingPanel.module.css";

function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(amount ?? 0);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function BillingPanel({ sale, onClose }) {
  if (!sale) return null;

  const { invoice, items = [], totalAmount, cashierId, paymentMethod, createdAt } = sale;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Receipt</h2>
            {invoice?.receiptNumber && (
              <p className={styles.receiptNo}>{invoice.receiptNumber}</p>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.meta}>
          {cashierId?.fullName && (
            <p className={styles.metaRow}><span>Served by</span><span>{cashierId.fullName}</span></p>
          )}
          <p className={styles.metaRow}><span>Payment</span><span style={{ textTransform: "capitalize" }}>{paymentMethod}</span></p>
          {createdAt && (
            <p className={styles.metaRow}><span>Date</span><span>{formatDate(createdAt)}</span></p>
          )}
        </div>

        <div className={styles.divider} />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.medicineName || item.medicineId}</td>
                <td>{item.qty}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.qty * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.divider} />

        <div className={styles.total}>
          <span>Total</span>
          <span className={styles.totalAmount}>{formatCurrency(totalAmount)}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.printBtn} onClick={() => window.print()}>
            Print Receipt
          </button>
          <button className={styles.closeBtn2} onClick={onClose}>
            Close
          </button>
        </div>

        <p className={styles.footer}>Thank you for your visit — PharmaOS</p>
      </div>
    </div>
  );
}
