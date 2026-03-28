import Badge from "@/components/ui/Badge";
import styles from "./AlertFeed.module.css";

export default function AlertFeed({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.title}>Alerts</p>
        <p className={styles.empty}>No active alerts.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.title}>Alerts</p>
      <ul className={styles.list}>
        {alerts.map((alert, i) => (
          <li key={i} className={styles.item}>
            <div className={styles.itemText}>
              <span className={styles.itemName}>{alert.medicineName}</span>
              <span className={styles.itemDetail}>{alert.message}</span>
            </div>
            <Badge variant={alert.type === "expiry" ? "error" : "warning"}>
              {alert.type === "expiry" ? "Near Expiry" : "Low Stock"}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
