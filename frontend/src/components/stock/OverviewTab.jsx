import Link from "next/link";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/StockPage.module.css";

const PAGE_SIZE = 20;

function getMedStatus(m) {
  if (m.totalStock === 0) return { label: "Out of Stock", variant: "cancelled", order: 0 };
  if (m.totalStock < m.minStockLevel) return { label: "Low Stock", variant: "pending", order: 1 };
  return { label: "In Stock", variant: "confirmed", order: 2 };
}

function getParaStatus(p) {
  if (p.stockQty === 0) return { label: "Out of Stock", variant: "cancelled", order: 0 };
  if (p.stockQty < p.minStockLevel) return { label: "Low Stock", variant: "pending", order: 1 };
  return { label: "In Stock", variant: "confirmed", order: 2 };
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isNearExpiry(iso, threshold = 90) {
  if (!iso) return false;
  return (new Date(iso) - Date.now()) / 86400000 <= threshold;
}

export default function OverviewTab({ enrichedMedicines, parapharmacy, lowStockCount, nearExpiryCount }) {
  const activeMeds = enrichedMedicines.filter((m) => m.isActive);
  const activePara = parapharmacy.filter((p) => p.isActive);

  const sortedMeds = [...activeMeds].sort((a, b) => getMedStatus(a).order - getMedStatus(b).order);
  const sortedPara = [...activePara].sort((a, b) => getParaStatus(a).order - getParaStatus(b).order);

  return (
    <div className={styles.tabContent}>
      {/* KPI row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total Medicine SKUs</p>
          <p className={styles.kpiValue}>{activeMeds.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total Parapharmacy SKUs</p>
          <p className={styles.kpiValue}>{activePara.length}</p>
        </div>
        <div className={lowStockCount > 0 ? styles.kpiCardWarn : styles.kpiCard}>
          <p className={styles.kpiLabel}>Low-Stock Items</p>
          <p className={[styles.kpiValue, lowStockCount > 0 ? styles.warning : ""].join(" ")}>{lowStockCount}</p>
        </div>
        <div className={nearExpiryCount > 0 ? styles.kpiCardDanger : styles.kpiCard}>
          <p className={styles.kpiLabel}>Near-Expiry Batches</p>
          <p className={[styles.kpiValue, nearExpiryCount > 0 ? styles.error : ""].join(" ")}>{nearExpiryCount}</p>
        </div>
      </div>

      {/* Medicine Stock Summary */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Medicine Stock Summary</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Active Batches</th>
                <th>Total Stock</th>
                <th>Min Threshold</th>
                <th>Nearest Expiry</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeds.slice(0, PAGE_SIZE).map((m) => {
                const { label, variant } = getMedStatus(m);
                const belowMin = m.totalStock < m.minStockLevel;
                return (
                  <tr key={m._id}>
                    <td>
                      <Link href={`/products/${m._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                        {m.name}
                      </Link>
                      {m.genericName && <span className={styles.cellSub}>{m.genericName}</span>}
                    </td>
                    <td><Badge variant={m.category === "regulated" ? "regulated" : "neutral"}>{m.category}</Badge></td>
                    <td className={styles.monoCell}>{m.activeBatchCount}</td>
                    <td className={belowMin ? styles.lowStockVal : styles.monoCell}>{m.totalStock} {m.unit}s</td>
                    <td className={styles.monoCell}>{m.minStockLevel}</td>
                    <td className={isNearExpiry(m.nearestExpiry) ? styles.expiredText : styles.monoCell}>{fmtDate(m.nearestExpiry)}</td>
                    <td><Badge variant={variant}>{label}</Badge></td>
                  </tr>
                );
              })}
              {sortedMeds.length === 0 && (
                <tr><td colSpan={7} className={styles.emptyCell}>No medicine data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parapharmacy Stock Summary */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Parapharmacy Stock Summary</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Threshold</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedPara.slice(0, PAGE_SIZE).map((p) => {
                const { label, variant } = getParaStatus(p);
                const belowMin = p.stockQty < p.minStockLevel;
                return (
                  <tr key={p._id}>
                    <td>
                      <Link href={`/products/parapharmacy/${p._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                        {p.name}
                      </Link>
                      {p.brand && <span className={styles.cellSub}>{p.brand}</span>}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                    <td className={belowMin ? styles.lowStockVal : styles.monoCell}>{p.stockQty}</td>
                    <td className={styles.monoCell}>{p.minStockLevel}</td>
                    <td><Badge variant={variant}>{label}</Badge></td>
                  </tr>
                );
              })}
              {sortedPara.length === 0 && (
                <tr><td colSpan={5} className={styles.emptyCell}>No parapharmacy data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
