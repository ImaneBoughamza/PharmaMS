import styles from "@/styles/StockPage.module.css";

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

export default function ExpiryAlerts({ batches }) {
  const items = batches ?? [];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Near Expiry</h2>
        {items.length > 0 && (
          <span className={`${styles.sectionBadge} ${styles.warn}`}>{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>No batches expiring within 30 days.</p>
      ) : (
        <ul className={styles.alertList}>
          {items.map((b) => {
            const days = daysUntil(b.expiryDate);
            const name = b.medicineId?.name ?? "Unknown";
            return (
              <li key={b._id} className={styles.alertItem}>
                <div>
                  <p className={styles.alertName}>{name}</p>
                  <p className={styles.alertMeta}>Batch {b.batchNumber} — {b.remainingQty} units left</p>
                </div>
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: days <= 7 ? "var(--color-error)" : "var(--color-warning)",
                }}>
                  {days <= 0 ? "Expired" : `${days}d left`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
