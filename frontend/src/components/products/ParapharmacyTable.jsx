import Link from "next/link";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/ParapharmacyPage.module.css";

function formatCurrency(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

export default function ParapharmacyTable({ products }) {
  const rows = products ?? [];

  if (rows.length === 0) {
    return (
      <p style={{ padding: "24px", fontFamily: "var(--font-ui)", fontSize: "13px", color: "var(--color-text-muted)" }}>
        No parapharmacy products found.
      </p>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {["Name", "Brand", "Category", "Stock", "Sale Price", "Status"].map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const isLow = p.stockQty <= p.minStockLevel;
          return (
            <tr key={p._id}>
              <td>
                <Link href={`/products/parapharmacy/${p._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                  {p.name}
                </Link>
              </td>
              <td className={styles.brand}>{p.brand || "—"}</td>
              <td style={{ textTransform: "capitalize" }}>{p.category}</td>
              <td className={styles.mono}>{p.stockQty}</td>
              <td className={styles.mono}>{formatCurrency(p.salePrice)}</td>
              <td>
                <Badge variant={p.stockQty === 0 ? "error" : isLow ? "warning" : "success"}>
                  {p.stockQty === 0 ? "Out of stock" : isLow ? "Low" : "OK"}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
