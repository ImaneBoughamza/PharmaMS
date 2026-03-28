import styles from "./Input.module.css";

export default function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={[styles.input, error ? styles.hasError : "", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
      {!error && helperText && (
        <p className={styles.helper}>{helperText}</p>
      )}
    </div>
  );
}
