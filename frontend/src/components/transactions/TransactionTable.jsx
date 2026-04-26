// TODO [PROVISIONAL-2]: scope to be confirmed with supervisor
import Badge from "@/components/ui/Badge";
import styles from "@/styles/TransactionsPage.module.css";

function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(amount ?? 0);
}

function formatDate(d) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TYPE_LABEL = { sale: "Sale", reservation: "Reservation", delivery: "Delivery" };
const TYPE_VARIANT = { sale: "info", reservation: "success", delivery: "warning" };
const DOT_CLASS = { sale: styles.typeSale, reservation: styles.typeReservation, delivery: styles.typeDelivery };

export default function TransactionTable({ transactions }) {
  const rows = transactions ?? [];

  if (rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          No transactions found.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
            {["Type", "Reference", "Amount / Details", "Date"].map((h) => (
              <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-ui)", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={`${tx._type}-${tx._id}`} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "0.85rem 1rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>
                  <span className={`${styles.typeDot} ${DOT_CLASS[tx._type]}`} />
                  {TYPE_LABEL[tx._type]}
                </span>
              </td>
              <td style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-ui)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                {tx.invoice?.receiptNumber ?? tx.confirmationCode ?? tx._id?.toString().slice(-6)}
              </td>
              <td style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-ui)", fontSize: "0.88rem" }}>
                {tx._type === "sale" && formatCurrency(tx.totalAmount)}
                {tx._type === "reservation" && (
                  <span>{tx.customerName} — <Badge variant={tx.status === "confirmed" ? "success" : "warning"}>{tx.status}</Badge></span>
                )}
                {tx._type === "delivery" && (tx.supplierId?.name ?? "Delivery")}
              </td>
              <td style={{ padding: "0.85rem 1rem", fontFamily: "var(--font-ui)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                {formatDate(tx.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
