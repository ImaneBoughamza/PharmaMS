import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        isLoading ? styles.loading : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? "Saving…" : children}
    </button>
  );
}
