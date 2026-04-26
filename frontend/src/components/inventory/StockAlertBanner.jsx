import Link from "next/link";
import styles from "./StockAlertBanner.module.css";

export default function StockAlertBanner({ count }) {
  if (!count || count === 0) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>
        <strong>{count} medicine{count > 1 ? "s" : ""}</strong> below minimum stock level.
      </span>
      <Link href="/stock" className={styles.link}>
        View all
      </Link>
    </div>
  );
}
