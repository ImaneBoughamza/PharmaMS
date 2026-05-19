import { Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "@/styles/TransactionsPage.module.css";

const TYPE_LABEL = {
  sale: "Sale",
  reservation: "Reservation",
  delivery: "Delivery",
};

const TYPE_VARIANT = {
  sale: "success",
  reservation: "info",
  delivery: "warning",
};

const STATUS_VARIANT = {
  completed: "success",
  voided: "error",
  pending: "warning",
  confirmed: "info",
  ready: "success",
  expired: "neutral",
  cancelled: "error",
  ordered: "warning",
  received: "success",
};

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function amountOrQty(tx) {
  if (tx._type === "delivery") return `${tx.itemCount} items received`;
  return formatCurrency(tx.amount);
}

export default function TransactionTable({ transactions, onView }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Date / Time</th>
            <th>Product Types</th>
            <th>Staff</th>
            <th>Amount / Qty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={`${tx._type}-${tx._id}`}
              className={styles.clickableRow}
              onClick={() => onView(tx)}
            >
              <td>
                <span className={[styles.reference, styles[`reference_${tx._type}`]].join(" ")}>
                  {tx.reference}
                </span>
              </td>
              <td>
                <Badge variant={TYPE_VARIANT[tx._type]}>{TYPE_LABEL[tx._type]}</Badge>
              </td>
              <td className={styles.mutedCell}>{formatDateTime(tx.createdAt)}</td>
              <td>
                <div className={styles.tagRow}>
                  {tx.productTypes.includes("medicine") && (
                    <span className={styles.productTagMedicine}>Medicine</span>
                  )}
                  {tx.productTypes.includes("parapharmacy") && (
                    <span className={styles.productTagParapharmacy}>Parapharmacy</span>
                  )}
                </div>
              </td>
              <td>{tx.staffName}</td>
              <td>{amountOrQty(tx)}</td>
              <td>
                <Badge variant={STATUS_VARIANT[tx.status] ?? "neutral"}>
                  {titleCase(tx.status)}
                </Badge>
              </td>
              <td>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(tx);
                  }}
                  title="View"
                  aria-label={`View ${tx.reference}`}
                >
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
