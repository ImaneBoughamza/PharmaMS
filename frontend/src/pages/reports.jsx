import { useMemo, useState } from "react";
import { useRouter } from "next/router";

const PillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const BoxesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.2 10.2a1 1 0 001 .8H19a1 1 0 001-.8L22 7H7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 006 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports", active: true },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
];

const monthlySales = [
  { month: "Jan", value: 14500 },
  { month: "Feb", value: 16200 },
  { month: "Mar", value: 15400 },
  { month: "Apr", value: 18100 },
  { month: "May", value: 17600 },
  { month: "Jun", value: 19300 },
];

const categoryStock = [
  { label: "OTC", value: 420 },
  { label: "Prescription", value: 290 },
  { label: "Regulated", value: 54 },
  { label: "Supplements", value: 180 },
];

const expiryAlerts = [
  { medicine: "Diazepam 5mg", batch: "DZ-9921", daysLeft: 18, qty: 14, severity: "high" },
  { medicine: "Cough Syrup", batch: "CS-3302", daysLeft: 42, qty: 11, severity: "medium" },
  { medicine: "Ibuprofen 400mg", batch: "IB-8420", daysLeft: 61, qty: 19, severity: "medium" },
  { medicine: "Amoxicillin 1g", batch: "AMX-2318", daysLeft: 75, qty: 42, severity: "low" },
];

const lowStockItems = [
  { medicine: "Paracetamol 500mg", qty: 8, threshold: 20, category: "OTC" },
  { medicine: "Cough Syrup", qty: 11, threshold: 20, category: "OTC" },
  { medicine: "Diazepam 5mg", qty: 14, threshold: 20, category: "Regulated" },
  { medicine: "Ibuprofen 400mg", qty: 19, threshold: 20, category: "OTC" },
];

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [alertFilter, setAlertFilter] = useState("All");

  const maxMonthly = Math.max(...monthlySales.map((m) => m.value));
  const maxCategory = Math.max(...categoryStock.map((c) => c.value));

  const filteredAlerts = useMemo(() => {
    return expiryAlerts.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.medicine.toLowerCase().includes(q) ||
        item.batch.toLowerCase().includes(q);

      const matchesFilter =
        alertFilter === "All"
          ? true
          : alertFilter === "High"
          ? item.severity === "high"
          : alertFilter === "Medium"
          ? item.severity === "medium"
          : item.severity === "low";

      return matchesSearch && matchesFilter;
    });
  }, [search, alertFilter]);

  return (
    <>
      <div className="rep-root">
        <aside className="rep-sidebar">
          <div>
            <div className="rep-brand">
              <div className="rep-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="rep-brand-title">PharmaOS</div>
                <div className="rep-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="rep-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`rep-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="rep-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="rep-sidebar-card">
            <div className="rep-sidebar-card-badge">Reporting</div>
            <h4>Visual monitoring active</h4>
            <p>Track sales trends, category distribution, low-stock items, and near-expiry alerts.</p>
          </div>
        </aside>

        <main className="rep-main">
          <header className="rep-topbar">
            <div>
              <p className="rep-topbar-label">Analytics / Monitoring / Reporting</p>
              <h1>Reports & Alerts</h1>
            </div>

            <div className="rep-topbar-actions">
              <div className="rep-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search alert by medicine or batch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="rep-icon-btn">
                <BellIcon />
              </button>

              <div className="rep-user">
                <div className="rep-user-avatar">DA</div>
                <div>
                  <div className="rep-user-name">Dr. Admin</div>
                  <div className="rep-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="rep-hero">
            <div className="rep-hero-text">
              <span className="rep-hero-badge">Data Visualization + Alerts</span>
              <h2>Monitor sales performance, expiry risks, stock distribution, and critical inventory issues.</h2>
              <p>
                This reporting page gives you a visual overview of pharmacy activity and helps identify
                near-expiry batches, low-stock products, and overall category trends.
              </p>
            </div>
          </section>

          <section className="rep-stats-grid">
            <div className="rep-stat-card blue">
              <div className="rep-stat-title">Monthly Revenue</div>
              <div className="rep-stat-value">19,300 MAD</div>
              <div className="rep-stat-note up"><ArrowUpIcon /> +9.6% vs previous month</div>
            </div>

            <div className="rep-stat-card amber">
              <div className="rep-stat-title">Near Expiry Batches</div>
              <div className="rep-stat-value">4</div>
              <div className="rep-stat-note">Require follow-up</div>
            </div>

            <div className="rep-stat-card red">
              <div className="rep-stat-title">Low Stock Items</div>
              <div className="rep-stat-value">4</div>
              <div className="rep-stat-note">Below threshold</div>
            </div>

            <div className="rep-stat-card green">
              <div className="rep-stat-title">Inventory Categories</div>
              <div className="rep-stat-value">4</div>
              <div className="rep-stat-note">OTC / Rx / Regulated / Supplements</div>
            </div>
          </section>

          <div className="rep-grid">
            <section className="rep-panel">
              <div className="rep-panel-head">
                <div>
                  <p className="rep-panel-kicker">Sales Trend</p>
                  <h3>Monthly sales chart</h3>
                </div>
              </div>

              <div className="rep-chart">
                {monthlySales.map((item) => (
                  <div className="rep-chart-col" key={item.month}>
                    <div
                      className="rep-chart-bar blue"
                      style={{ height: `${(item.value / maxMonthly) * 220}px` }}
                      title={`${item.value} MAD`}
                    />
                    <span className="rep-chart-value">{item.value}</span>
                    <span className="rep-chart-label">{item.month}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rep-panel">
              <div className="rep-panel-head">
                <div>
                  <p className="rep-panel-kicker">Inventory Distribution</p>
                  <h3>Stock by category</h3>
                </div>
              </div>

              <div className="rep-horizontal-chart">
                {categoryStock.map((item) => (
                  <div key={item.label} className="rep-horizontal-row">
                    <div className="rep-horizontal-head">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="rep-horizontal-track">
                      <div
                        className="rep-horizontal-fill"
                        style={{ width: `${(item.value / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="rep-grid">
            <section className="rep-panel">
              <div className="rep-panel-head">
                <div>
                  <p className="rep-panel-kicker">Expiry Monitoring</p>
                  <h3>Expiry alerts</h3>
                </div>

                <div className="rep-filter-wrap">
                  <select value={alertFilter} onChange={(e) => setAlertFilter(e.target.value)}>
                    <option>All</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="rep-alert-list">
                {filteredAlerts.map((item) => (
                  <div className="rep-alert-item" key={item.batch}>
                    <div className={`rep-alert-icon ${item.severity}`}>
                      <AlertIcon />
                    </div>
                    <div className="rep-alert-text">
                      <h4>{item.medicine}</h4>
                      <p>Batch {item.batch} • {item.daysLeft} days left • Qty {item.qty}</p>
                    </div>
                    <span className={`rep-severity ${item.severity}`}>
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rep-panel">
              <div className="rep-panel-head">
                <div>
                  <p className="rep-panel-kicker">Threshold Monitoring</p>
                  <h3>Low stock table</h3>
                </div>
              </div>

              <div className="rep-table-wrap">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Qty</th>
                      <th>Threshold</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.medicine}>
                        <td>{item.medicine}</td>
                        <td>{item.qty}</td>
                        <td>{item.threshold}</td>
                        <td>{item.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        body {
          margin: 0;
          background: #f5f3ee;
          font-family: "Outfit", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .rep-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .rep-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .rep-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .rep-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.32);
        }

        .rep-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .rep-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .rep-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rep-nav-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #a8bdd7;
          min-height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          text-align: left;
        }

        .rep-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .rep-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .rep-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rep-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .rep-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .rep-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .rep-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .rep-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .rep-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .rep-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .rep-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .rep-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rep-search {
          width: 330px;
          height: 48px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          color: #7b8ba1;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .rep-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .rep-icon-btn {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .rep-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .rep-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .rep-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .rep-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .rep-hero {
          background: linear-gradient(135deg, #0b1c35, #163257);
          color: white;
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 22px;
          box-shadow: 0 16px 40px rgba(11, 28, 53, 0.16);
        }

        .rep-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .rep-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .rep-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .rep-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .rep-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .rep-stat-title {
          color: #7a8a9b;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .rep-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #0b1c35;
          margin-bottom: 8px;
        }

        .rep-stat-note {
          font-size: 13px;
          font-weight: 500;
          color: #607086;
        }

        .rep-stat-note.up {
          color: #059669;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rep-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 22px;
        }

        .rep-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .rep-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .rep-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .rep-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .rep-filter-wrap select {
          height: 42px;
          border-radius: 12px;
          border: 1px solid #dbe4ef;
          background: #fff;
          padding: 0 12px;
          font-family: "Outfit", sans-serif;
          color: #0b1c35;
          outline: none;
        }

        .rep-chart {
          height: 290px;
          display: flex;
          align-items: flex-end;
          gap: 14px;
          padding-top: 14px;
        }

        .rep-chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          height: 100%;
        }

        .rep-chart-bar {
          width: 100%;
          max-width: 46px;
          border-radius: 14px 14px 6px 6px;
          min-height: 20px;
        }

        .rep-chart-bar.blue {
          background: linear-gradient(180deg, #60a5fa, #2563eb);
        }

        .rep-chart-value {
          font-size: 11px;
          color: #607086;
        }

        .rep-chart-label {
          font-size: 12px;
          color: #0b1c35;
          font-weight: 500;
        }

        .rep-horizontal-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rep-horizontal-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rep-horizontal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #0b1c35;
        }

        .rep-horizontal-track {
          height: 12px;
          border-radius: 999px;
          background: #edf2f7;
          overflow: hidden;
        }

        .rep-horizontal-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #93c5fd, #2563eb);
        }

        .rep-alert-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rep-alert-item {
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e8eef5;
          background: #fbfdff;
          border-radius: 16px;
          padding: 14px;
        }

        .rep-alert-icon {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rep-alert-icon.high {
          background: #fef2f2;
          color: #dc2626;
        }

        .rep-alert-icon.medium {
          background: #fff7ed;
          color: #c2410c;
        }

        .rep-alert-icon.low {
          background: #eff6ff;
          color: #2563eb;
        }

        .rep-alert-text h4 {
          margin: 0 0 4px;
          font-size: 15px;
          color: #0b1c35;
        }

        .rep-alert-text p {
          margin: 0;
          font-size: 13px;
          color: #607086;
        }

        .rep-severity {
          margin-left: auto;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .rep-severity.high {
          background: #fef2f2;
          color: #dc2626;
        }

        .rep-severity.medium {
          background: #fff7ed;
          color: #c2410c;
        }

        .rep-severity.low {
          background: #eff6ff;
          color: #2563eb;
        }

        .rep-table-wrap {
          overflow-x: auto;
        }

        .rep-table {
          width: 100%;
          border-collapse: collapse;
        }

        .rep-table th {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #7a8a9b;
          border-bottom: 1px solid #e2e8f0;
        }

        .rep-table td {
          padding: 14px 10px;
          font-size: 14px;
          color: #0b1c35;
          border-bottom: 1px solid #eef2f7;
        }

        @media (max-width: 1200px) {
          .rep-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .rep-grid {
            grid-template-columns: 1fr;
          }

          .rep-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .rep-root {
            flex-direction: column;
          }

          .rep-sidebar {
            width: 100%;
            gap: 20px;
          }

          .rep-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .rep-topbar-actions {
            flex-wrap: wrap;
          }

          .rep-search {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .rep-main {
            padding: 18px;
          }

          .rep-stats-grid {
            grid-template-columns: 1fr;
          }

          .rep-topbar h1 {
            font-size: 34px;
          }

          .rep-panel-head h3 {
            font-size: 20px;
          }

          .rep-chart {
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}