import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./BatchList.module.css";

function expiryVariant(expiryDate) {
  const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (days <= 30)  return "error";
  if (days <= 90)  return "warning";
  return "success";
}

export default function BatchList({ batches = [] }) {
  if (batches.length === 0) {
    return <p className={styles.empty}>No batches found for this medicine.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Batch №</th>
            <th className={styles.th}>Expiry Date</th>
            <th className={styles.th}>Remaining Qty</th>
            <th className={styles.th}>Sale Price</th>
            <th className={styles.th}>Purchase Price</th>
            <th className={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b._id} className={styles.tr}>
              <td className={styles.td}>{b.batchNumber}</td>
              <td className={styles.td}>{formatDate(b.expiryDate)}</td>
              <td className={styles.td}>{b.remainingQty} / {b.initialQty}</td>
              <td className={styles.td}>{formatCurrency(b.salePrice)}</td>
              <td className={styles.td}>{formatCurrency(b.purchasePrice)}</td>
              <td className={styles.td}>
                <Badge variant={expiryVariant(b.expiryDate)}>
                  {expiryVariant(b.expiryDate) === "error"
                    ? "Near Expiry"
                    : expiryVariant(b.expiryDate) === "warning"
                    ? "Expires Soon"
                    : "OK"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
