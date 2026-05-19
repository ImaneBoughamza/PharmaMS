import Link from "next/link";
import useSWR from "swr";
import styles from "@/styles/Dashboard.module.css";

const refreshInterval = 60000;

function getDateParts(value, options) {
  return new Intl.DateTimeFormat("en-GB", options)
    .formatToParts(new Date(value))
    .reduce((parts, part) => {
      if (part.type !== "literal") parts[part.type] = part.value;
      return parts;
    }, {});
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load dashboard data");
  return response.json();
}

export function useDashboardResource(url, fallbackData) {
  return useSWR(url, fetchJson, {
    fallbackData,
    refreshInterval,
    revalidateOnFocus: false,
    onErrorRetry: () => {},
  });
}

export function DashboardHeader({ user, roleLabel }) {
  const displayName = (user?.name || user?.fullName || "there").replace(/^Dr\.\s*/i, "");
  const firstName = displayName.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const date = formatLongDashboardDate(new Date());

  return (
    <header className={styles.header}>
      <h1 className={styles.title} suppressHydrationWarning>{greeting}, {firstName}</h1>
      <p className={styles.subtitle} suppressHydrationWarning>{roleLabel} - {date}</p>
    </header>
  );
}

export function KpiGrid({ children }) {
  return <section className={styles.kpiRow}>{children}</section>;
}

export function KpiBlock({ value, label, subtext, border = "green", href }) {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{subtext}</small>
    </>
  );

  const className = `${styles.kpiBlock} ${styles[`border_${border}`]}`;
  if (href) return <Link className={className} href={href}>{content}</Link>;
  return <div className={className}>{content}</div>;
}

export function Panel({ title, subtitle, action, children }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusBanner({ children, tone = "green" }) {
  return <div className={`${styles.statusBanner} ${styles[`banner_${tone}`]}`}>{children}</div>;
}

export function TypeBadge({ type }) {
  return (
    <span className={type === "medicine" ? styles.typeMedicine : styles.typeParapharmacy}>
      {type === "medicine" ? "Medicine" : "Parapharmacy"}
    </span>
  );
}

export function SkeletonBlock() {
  return <div className={styles.skeletonBlock} />;
}

export function MiniLink({ href, children }) {
  return <Link className={styles.miniLink} href={href}>{children}</Link>;
}

export function timeAgo(value) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export function formatLongDashboardDate(value) {
  const parts = getDateParts(value, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;
}

export function formatDate(value) {
  const parts = getDateParts(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${parts.day} ${parts.month} ${parts.year}`;
}

export function formatTime(value) {
  const parts = getDateParts(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${parts.hour}:${parts.minute}`;
}

export function itemCountLabel(items = []) {
  const count = items.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  return `${count} item${count === 1 ? "" : "s"}`;
}
