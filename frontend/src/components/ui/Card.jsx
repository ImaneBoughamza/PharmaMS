import styles from "./Card.module.css";

export default function Card({ children, padding = "md", className = "" }) {
  return (
    <div className={[styles.card, styles[padding], className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
