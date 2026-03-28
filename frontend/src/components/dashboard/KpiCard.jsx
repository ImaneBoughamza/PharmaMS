import styles from "./KpiCard.module.css";

export default function KpiCard({ label, value, trend, trendUp }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value ?? "—"}</p>
      {trend !== undefined && (
        <p className={[styles.trend, trendUp ? styles.up : styles.down].join(" ")}>
          {trendUp ? "▲" : "▼"} {trend}
        </p>
      )}
    </div>
  );
}
