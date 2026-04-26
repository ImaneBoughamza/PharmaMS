import Link from "next/link";
import styles from "@/styles/StockPage.module.css";

export default function LowStockAlerts({ alerts, basePath = "/products" }) {
  const items = alerts ?? [];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Low Stock</h2>
        {items.length > 0 && (
          <span className={styles.sectionBadge}>{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>All products are above minimum stock level.</p>
      ) : (
        <ul className={styles.alertList}>
          {items.map((a) => {
            const id = a.product?._id ?? a.medicine?._id;
            const name = a.product?.name ?? a.medicine?.name;
            const stock = a.totalStock ?? a.stockQty;
            return (
              <li key={id} className={styles.alertItem}>
                <div>
                  <p className={styles.alertName}>
                    <Link href={`${basePath}/${id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none" }}>
                      {name}
                    </Link>
                  </p>
                  <p className={styles.alertMeta}>Min: {a.minStockLevel} — Current: {stock}</p>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: stock === 0 ? "var(--color-error)" : "var(--color-warning)",
                }}>
                  {stock === 0 ? "Out of stock" : "Low"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
