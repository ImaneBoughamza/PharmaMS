import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./BillView.module.css";


export default function BillView({ receipt, onNewSale }) {
  const { receiptNumber, pharmacyName, date, time, cashierName, paymentMethod,
          medicines, parapharmacy, medSubtotal, paraSubtotal, total } = receipt;

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <div className={styles.checkIcon}>✓</div>
        <h2 className={styles.saleTitle}>Sale Complete</h2>
      </div>

      <div className={styles.scrollArea}>
        {/* Receipt */}
        <div className={styles.receipt} id="pos-receipt">
          <div className={styles.receiptHeader}>
            <p className={styles.brand}>PharmaMS</p>
            <p className={styles.pharmacyName}>{pharmacyName}</p>
            <p className={styles.meta}>{date} — {time}</p>
            <p className={styles.meta}>Receipt #{receiptNumber}</p>
            <p className={styles.meta}>Cashier: {cashierName}</p>
          </div>

          {medicines.length > 0 && (
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
                  {medicines.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className={styles.right}>{item.qty}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice)}</td>
                      <td className={styles.right}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.sectionSubtotal}>
                <span>Medicines subtotal</span>
                <span>{formatCurrency(medSubtotal)}</span>
              </div>
            </div>
          )}

          {parapharmacy.length > 0 && (
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
                  {parapharmacy.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className={styles.right}>{item.qty}</td>
                      <td className={styles.right}>{formatCurrency(item.unitPrice)}</td>
                      <td className={styles.right}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.sectionSubtotal}>
                <span>Parapharmacy subtotal</span>
                <span>{formatCurrency(paraSubtotal)}</span>
              </div>
            </div>
          )}

          <div className={styles.divider} />

          <div className={styles.grandTotal}>
            <span className={styles.grandTotalLabel}>TOTAL</span>
            <span className={styles.grandTotalValue}>{formatCurrency(total)}</span>
          </div>

          <div className={styles.paymentRow}>
            <span>Payment Method</span>
            <span>{paymentMethod}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.printBtn}
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
          <button type="button" className={styles.newSaleBtn} onClick={onNewSale}>
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}
