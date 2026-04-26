import Link from "next/link";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/StockPage.module.css";

function getStatus(item, productType) {
  const qty = productType === "parapharmacy" ? item.stockQty : item.totalStock;
  if (qty === 0) return { label: "Out of Stock", variant: "cancelled" };
  if (qty <= item.minStockLevel) return { label: "Low", variant: "pending" };
  if (productType === "medicine" && item.nearExpiry) return { label: "Near Expiry", variant: "pending" };
  return { label: "OK", variant: "confirmed" };
}

export default function StockOverview({ stockList, productType = "medicine", basePath = "/products" }) {
  const rows = stockList ?? [];

  if (rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p className={styles.empty}>No products found.</p>
      </div>
    );
  }

  const isMedicine = productType === "medicine";

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            {isMedicine ? <th>Category</th> : <th>Brand</th>}
            <th>Stock</th>
            <th>Min Level</th>
            {isMedicine && <th>Batches</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const { label, variant } = getStatus(item, productType);
            const qty = isMedicine ? item.totalStock : item.stockQty;
            return (
              <tr key={item._id}>
                <td className={styles.productName}>
                  <Link href={`${basePath}/${item._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none" }}>
                    {item.name}
                  </Link>
                </td>
                {isMedicine
                  ? <td className={styles.category}>{item.category}</td>
                  : <td className={styles.category}>{item.brand || "—"}</td>
                }
                <td className={styles.qty}>
                  {qty}{isMedicine && item.unit ? ` ${item.unit}s` : ""}
                </td>
                <td className={styles.qty}>{item.minStockLevel}</td>
                {isMedicine && <td className={styles.qty}>{item.batchCount ?? "—"}</td>}
                <td><Badge variant={variant}>{label}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
