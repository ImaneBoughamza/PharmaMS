import { useState } from "react";
import styles from "./Alert.module.css";

const icons = {
  success: "✓",
  warning: "⚠",
  error: "✕",
  info: "ℹ",
};

export default function Alert({ variant = "info", children, dismissible = false }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={[styles.alert, styles[variant]].join(" ")} role="alert">
      <span className={styles.icon}>{icons[variant]}</span>
      <span className={styles.content}>{children}</span>
      {dismissible && (
        <button
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
