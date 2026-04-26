import Badge from "@/components/ui/Badge";
import styles from "./AlertFeed.module.css";

export default function AlertFeed({ alerts = [] }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Stock Alerts</p>
      {alerts.length === 0 ? (
        <p className={styles.empty}>No active alerts.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Detail</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, i) => (
              <tr key={i}>
                <td className={styles.name}>{alert.medicineName}</td>
                <td className={styles.message}>{alert.message}</td>
                <td>
                  <Badge variant={alert.type === "expiry" ? "pending" : "cancelled"}>
                    {alert.type === "expiry" ? "Near Expiry" : "Low Stock"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
