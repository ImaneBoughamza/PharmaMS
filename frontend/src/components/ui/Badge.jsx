import styles from "./Badge.module.css";

export default function Badge({ children, variant = "neutral" }) {
  return (
    <span className={[styles.badge, styles[variant]].join(" ")}>
      {children}
    </span>
  );
}
