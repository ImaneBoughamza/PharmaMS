import { useState } from "react";
import { useRouter } from "next/router";

const PillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 006 0" />
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

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, active: true },
  { label: "Inventory", icon: <BoxesIcon /> },
  { label: "POS", icon: <CartIcon /> },
  { label: "Reservations", icon: <CalendarIcon /> },
  { label: "Reports", icon: <FileIcon /> },
  { label: "Users", icon: <UsersIcon /> },
  { label: "Audit Logs", icon: <ShieldIcon /> },
];

const stats = [
  { title: "Total Medicines", value: "1,248", change: "+8.2%", tone: "blue" },
  { title: "Low Stock Items", value: "23", change: "-4.1%", tone: "amber" },
  { title: "Near Expiry Batches", value: "14", change: "+2.5%", tone: "red" },
  { title: "Today's Sales", value: "12,480 MAD", change: "+11.3%", tone: "green" },
];

const alerts = [
  { title: "Paracetamol 500mg", detail: "Only 8 units left in stock", type: "low" },
  { title: "Amoxicillin Batch AX493", detail: "Expires in 18 days", type: "expiry" },
  { title: "Ibuprofen 400mg", detail: "Reservation pending pharmacist approval", type: "reservation" },
];

const recentSales = [
  { id: "#POS-1042", customer: "Walk-in Customer", item: "Doliprane 1000mg", amount: "65 MAD", staff: "Cashier", time: "09:12" },
  { id: "#POS-1043", customer: "Walk-in Customer", item: "Vitamin C", amount: "120 MAD", staff: "Assistant", time: "10:03" },
  { id: "#POS-1044", customer: "Walk-in Customer", item: "Nurofen", amount: "89 MAD", staff: "Cashier", time: "11:26" },
  { id: "#POS-1045", customer: "Walk-in Customer", item: "OTC Allergy Kit", amount: "145 MAD", staff: "Pharmacist", time: "12:14" },
];

const reservations = [
  { code: "RES-201", customer: "Sara E.", item: "Efferalgan", status: "Pending Approval" },
  { code: "RES-202", customer: "Omar T.", item: "Vitamin D3", status: "Ready for Pickup" },
  { code: "RES-203", customer: "Nadia A.", item: "Cough Syrup", status: "Pending Approval" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="db-root">
        <aside className="db-sidebar">
          <div>
            <div className="db-brand">
              <div className="db-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="db-brand-title">PharmaOS</div>
                <div className="db-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="db-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`db-nav-item${item.active ? " active" : ""}`}
                >
                  <span className="db-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="db-sidebar-card">
            <div className="db-sidebar-card-badge">System Status</div>
            <h4>All services operational</h4>
            <p>Inventory, reservations, and POS modules are running normally.</p>
          </div>
        </aside>

        <main className="db-main">
          <header className="db-topbar">
            <div>
              <p className="db-topbar-label">Dashboard Overview</p>
              <h1>Welcome back, Dr. Admin</h1>
            </div>

            <div className="db-topbar-actions">
              <div className="db-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search medicine, batch, reservation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="db-icon-btn">
                <BellIcon />
              </button>

              <div className="db-user">
                <div className="db-user-avatar">DA</div>
                <div>
                  <div className="db-user-name">Dr. Admin</div>
                  <div className="db-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="db-hero">
            <div className="db-hero-text">
              <span className="db-hero-badge">Single-Tenant SaaS</span>
              <h2>Monitor stock, sales, reservations, and compliance from one place.</h2>
              <p>
                This dashboard gives the pharmacy administrator a quick view of critical
                inventory, operational alerts, and daily transaction activity.
              </p>
            </div>

            <div className="db-hero-actions">
              <button type="button" className="db-primary-btn">Go to Inventory</button>
              <button type="button" className="db-secondary-btn">Create Reservation</button>
            </div>
          </section>

          <section className="db-stats-grid">
            {stats.map((card) => (
              <div key={card.title} className={`db-stat-card ${card.tone}`}>
                <div className="db-stat-top">
                  <span>{card.title}</span>
                  <ArrowUpRightIcon />
                </div>
                <div className="db-stat-value">{card.value}</div>
                <div className="db-stat-change">{card.change} this week</div>
              </div>
            ))}
          </section>

          <section className="db-content-grid">
            <div className="db-panel db-panel-large">
              <div className="db-panel-head">
                <div>
                  <p className="db-panel-kicker">Alerts & Compliance</p>
                  <h3>Priority alerts</h3>
                </div>
              </div>

              <div className="db-alert-list">
                {alerts.map((alert) => (
                  <div key={alert.title} className="db-alert-item">
                    <div className={`db-alert-icon ${alert.type}`}>
                      <AlertIcon />
                    </div>
                    <div className="db-alert-text">
                      <h4>{alert.title}</h4>
                      <p>{alert.detail}</p>
                    </div>
                    <button type="button" className="db-link-btn">View</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-panel">
              <div className="db-panel-head">
                <div>
                  <p className="db-panel-kicker">Reservations</p>
                  <h3>Today’s queue</h3>
                </div>
              </div>

              <div className="db-mini-list">
                {reservations.map((item) => (
                  <div key={item.code} className="db-mini-item">
                    <div>
                      <h4>{item.code}</h4>
                      <p>{item.customer} • {item.item}</p>
                    </div>
                    <span className={`db-status ${item.status === "Ready for Pickup" ? "ready" : "pending"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="db-panel">
            <div className="db-panel-head">
              <div>
                <p className="db-panel-kicker">Point of Sale</p>
                <h3>Recent sales</h3>
              </div>
              <button type="button" className="db-link-btn">See all</button>
            </div>

            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Staff</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>{sale.customer}</td>
                      <td>{sale.item}</td>
                      <td>{sale.amount}</td>
                      <td>{sale.staff}</td>
                      <td>{sale.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
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

        .db-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .db-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .db-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .db-brand-icon {
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

        .db-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .db-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .db-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .db-nav-item {
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

        .db-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .db-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .db-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .db-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .db-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .db-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .db-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .db-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .db-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .db-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .db-topbar h1 {
          margin: 0;
          font-size: 46px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .db-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .db-search {
          width: 360px;
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

        .db-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .db-icon-btn {
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

        .db-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .db-user-avatar {
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

        .db-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .db-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .db-hero {
          background: linear-gradient(135deg, #0b1c35, #163257);
          color: white;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 22px;
          box-shadow: 0 16px 40px rgba(11, 28, 53, 0.16);
        }

        .db-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .db-hero h2 {
          margin: 0 0 12px;
          max-width: 700px;
          font-size: 32px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .db-hero p {
          margin: 0;
          max-width: 720px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .db-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .db-primary-btn,
        .db-secondary-btn,
        .db-link-btn {
          font-family: "Outfit", sans-serif;
          cursor: pointer;
        }

        .db-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
        }

        .db-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
        }

        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .db-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .db-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #7a8a9b;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .db-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #0b1c35;
          margin-bottom: 8px;
        }

        .db-stat-change {
          font-size: 13px;
          font-weight: 500;
        }

        .db-stat-card.blue .db-stat-change { color: #2563eb; }
        .db-stat-card.green .db-stat-change { color: #059669; }
        .db-stat-card.red .db-stat-change { color: #dc2626; }
        .db-stat-card.amber .db-stat-change { color: #d97706; }

        .db-content-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 16px;
          margin-bottom: 22px;
        }

        .db-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .db-panel-large {
          min-height: 280px;
        }

        .db-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .db-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .db-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .db-alert-list,
        .db-mini-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .db-alert-item {
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #edf2f7;
          border-radius: 16px;
          padding: 14px;
        }

        .db-alert-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-alert-icon.low {
          background: #fff7ed;
          color: #ea580c;
        }

        .db-alert-icon.expiry {
          background: #fef2f2;
          color: #dc2626;
        }

        .db-alert-icon.reservation {
          background: #eff6ff;
          color: #2563eb;
        }

        .db-alert-text h4,
        .db-mini-item h4 {
          margin: 0 0 5px;
          color: #0b1c35;
          font-size: 15px;
        }

        .db-alert-text p,
        .db-mini-item p {
          margin: 0;
          color: #6b7a90;
          font-size: 13px;
          line-height: 1.6;
        }

        .db-link-btn {
          margin-left: auto;
          border: none;
          background: transparent;
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
        }

        .db-mini-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          border: 1px solid #edf2f7;
          border-radius: 16px;
          padding: 14px;
        }

        .db-status {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .db-status.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .db-status.ready {
          background: #ecfdf5;
          color: #047857;
        }

        .db-table-wrap {
          overflow-x: auto;
        }

        .db-table {
          width: 100%;
          border-collapse: collapse;
        }

        .db-table th {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #7a8a9b;
          border-bottom: 1px solid #e2e8f0;
        }

        .db-table td {
          padding: 14px 10px;
          font-size: 14px;
          color: #0b1c35;
          border-bottom: 1px solid #eef2f7;
        }

        @media (max-width: 1200px) {
          .db-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .db-content-grid {
            grid-template-columns: 1fr;
          }

          .db-search {
            width: 260px;
          }
        }

        @media (max-width: 900px) {
          .db-root {
            flex-direction: column;
          }

          .db-sidebar {
            width: 100%;
            gap: 20px;
          }

          .db-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .db-topbar-actions {
            flex-wrap: wrap;
          }

          .db-search {
            width: 100%;
          }

          .db-hero {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .db-main {
            padding: 18px;
          }

          .db-stats-grid {
            grid-template-columns: 1fr;
          }

          .db-topbar h1 {
            font-size: 34px;
          }

          .db-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}