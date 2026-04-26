import { TrendingUp, X } from "lucide-react";
import styles from "./DemandAlert.module.css";

export default function DemandAlert({ alert, onDismiss, onViewDemand }) {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}><TrendingUp size={16} /></span>
      <p className={styles.text}>
        <strong>Demand alert:</strong>{" "}
        <strong>{alert.productName}</strong> reservations increased{" "}
        <strong>{alert.changePercent}%</strong> this week compared to last week.{" "}
        Consider adjusting stock orders.
      </p>
      <button
        type="button"
        className={styles.viewBtn}
        onClick={onViewDemand}
      >
        View Demand Analysis
      </button>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <X size={14} />
      </button>
    </div>
  );
}
