import { useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import styles from "@/styles/ReportsPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

const MONTHLY_SALES = [
  { month: "Oct", value: 14500 },
  { month: "Nov", value: 16200 },
  { month: "Dec", value: 15400 },
  { month: "Jan", value: 18100 },
  { month: "Feb", value: 17600 },
  { month: "Mar", value: 19300 },
];

const CATEGORY_STOCK = [
  { label: "OTC", value: 420 },
  { label: "Prescription", value: 290 },
  { label: "Regulated", value: 54 },
  { label: "Supplements", value: 180 },
];

const EXPIRY_ALERTS = [
  { medicine: "Diazepam 5mg", batch: "DZ-9921", daysLeft: 18, qty: 14, severity: "high" },
  { medicine: "Cough Syrup", batch: "CS-3302", daysLeft: 42, qty: 11, severity: "medium" },
  { medicine: "Ibuprofen 400mg", batch: "IB-8420", daysLeft: 61, qty: 19, severity: "medium" },
  { medicine: "Amoxicillin 1g", batch: "AMX-2318", daysLeft: 75, qty: 42, severity: "low" },
];

const LOW_STOCK = [
  { medicine: "Paracetamol 500mg", qty: 8, threshold: 20, category: "OTC" },
  { medicine: "Cough Syrup", qty: 11, threshold: 20, category: "OTC" },
  { medicine: "Diazepam 5mg", qty: 14, threshold: 20, category: "Regulated" },
  { medicine: "Ibuprofen 400mg", qty: 19, threshold: 20, category: "OTC" },
];

const SEVERITY_ICON_CLASS = {
  high: styles.alertIconHigh,
  medium: styles.alertIconMedium,
  low: styles.alertIconLow,
};

const SEVERITY_CLASS = {
  high: styles.severityHigh,
  medium: styles.severityMedium,
  low: styles.severityLow,
};

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function ReportsPage() {
  const [alertFilter, setAlertFilter] = useState("All");

  const maxMonthly = Math.max(...MONTHLY_SALES.map((m) => m.value));
  const maxCategory = Math.max(...CATEGORY_STOCK.map((c) => c.value));

  const filteredAlerts = useMemo(() => {
    return EXPIRY_ALERTS.filter(
      (item) =>
        alertFilter === "All" || item.severity === alertFilter.toLowerCase()
    );
  }, [alertFilter]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Analytics · Monitoring · Reporting</span>
        <h1 className={styles.heroTitle}>
          Monitor sales performance, expiry risks, stock distribution, and critical inventory issues.
        </h1>
        <p className={styles.heroDesc}>
          Visual overview of pharmacy activity — identify near-expiry batches, low-stock products,
          and category trends at a glance.
        </p>
      </section>

      {/* KPI cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Monthly Revenue</p>
          <p className={styles.statValue}>19,300 MAD</p>
          <span className={styles.statNoteUp}><ArrowUpIcon /> +9.6% vs previous month</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Near Expiry Batches</p>
          <p className={styles.statValue}>4</p>
          <span className={styles.statNote}>Require follow-up</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Low Stock Items</p>
          <p className={styles.statValue}>4</p>
          <span className={styles.statNote}>Below threshold</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Inventory Categories</p>
          <p className={styles.statValue}>4</p>
          <span className={styles.statNote}>OTC · Rx · Regulated · Supplements</span>
        </div>
      </div>

      {/* Charts row */}
      <div className={styles.grid}>
        {/* Monthly sales bar chart */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.panelKicker}>Sales Trend</p>
              <h3 className={styles.panelTitle}>Monthly sales</h3>
            </div>
          </div>
          <div className={styles.barChart}>
            {MONTHLY_SALES.map((item) => (
              <div className={styles.barCol} key={item.month}>
                <div
                  className={styles.bar}
                  style={{ height: `${(item.value / maxMonthly) * 210}px` }}
                  title={`${item.value.toLocaleString()} MAD`}
                />
                <span className={styles.barValue}>{(item.value / 1000).toFixed(1)}k</span>
                <span className={styles.barLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category horizontal chart */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.panelKicker}>Inventory Distribution</p>
              <h3 className={styles.panelTitle}>Stock by category</h3>
            </div>
          </div>
          <div className={styles.hChart}>
            {CATEGORY_STOCK.map((item) => (
              <div className={styles.hRow} key={item.label}>
                <div className={styles.hHead}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className={styles.hTrack}>
                  <div
                    className={styles.hFill}
                    style={{ width: `${(item.value / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + low stock row */}
      <div className={styles.grid}>
        {/* Expiry alerts */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.panelKicker}>Expiry Monitoring</p>
              <h3 className={styles.panelTitle}>Expiry alerts</h3>
            </div>
            <select
              className={styles.filterSelect}
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className={styles.alertList}>
            {filteredAlerts.map((item) => (
              <div className={styles.alertItem} key={item.batch}>
                <div className={SEVERITY_ICON_CLASS[item.severity]}>
                  <AlertIcon />
                </div>
                <div className={styles.alertText}>
                  <h4>{item.medicine}</h4>
                  <p>Batch {item.batch} · {item.daysLeft} days left · Qty {item.qty}</p>
                </div>
                <span className={SEVERITY_CLASS[item.severity]}>{item.severity}</span>
              </div>
            ))}
            {filteredAlerts.length === 0 && (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                No alerts match your filter.
              </p>
            )}
          </div>
        </div>

        {/* Low stock table */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.panelKicker}>Threshold Monitoring</p>
              <h3 className={styles.panelTitle}>Low stock</h3>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Threshold</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {LOW_STOCK.map((item) => (
                  <tr key={item.medicine}>
                    <td>{item.medicine}</td>
                    <td className={styles.qtyLow}>{item.qty}</td>
                    <td>{item.threshold}</td>
                    <td>{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

ReportsPage.getLayout = AppLayout.getLayout;
