import { useMemo, useState } from "react";
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

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory", active: true },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
];

const medicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    substance: "Paracetamol",
    category: "Non-Prescription",
    batch: "PC-2401",
    expiry: "2026-05-18",
    quantity: 8,
    supplier: "Pharma Distrib",
  },
  {
    id: 2,
    name: "Amoxicillin 1g",
    substance: "Amoxicillin",
    category: "Prescription",
    batch: "AMX-2318",
    expiry: "2026-01-10",
    quantity: 42,
    supplier: "MediSupply",
  },
  {
    id: 3,
    name: "Diazepam 5mg",
    substance: "Diazepam",
    category: "Regulated",
    batch: "DZ-9921",
    expiry: "2025-12-22",
    quantity: 14,
    supplier: "Secure Pharma",
  },
  {
    id: 4,
    name: "Vitamin C 1000mg",
    substance: "Ascorbic Acid",
    category: "Non-Prescription",
    batch: "VC-1143",
    expiry: "2027-03-30",
    quantity: 63,
    supplier: "NutriMed",
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    substance: "Ibuprofen",
    category: "Non-Prescription",
    batch: "IB-8420",
    expiry: "2026-02-15",
    quantity: 19,
    supplier: "Pharma Distrib",
  },
  {
    id: 6,
    name: "Cough Syrup",
    substance: "Dextromethorphan",
    category: "Non-Prescription",
    batch: "CS-3302",
    expiry: "2025-11-08",
    quantity: 11,
    supplier: "MediSupply",
  },
];

function daysUntil(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const filtered = useMemo(() => {
    return medicines.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.substance.toLowerCase().includes(q) ||
        item.batch.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "All" ? true : item.category === categoryFilter;

      const matchesStock =
        stockFilter === "All"
          ? true
          : stockFilter === "Low Stock"
          ? item.quantity <= 20
          : stockFilter === "Near Expiry"
          ? daysUntil(item.expiry) <= 90
          : true;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [search, categoryFilter, stockFilter]);

  const totalMedicines = medicines.length;
  const lowStock = medicines.filter((m) => m.quantity <= 20).length;
  const nearExpiry = medicines.filter((m) => daysUntil(m.expiry) <= 90).length;
  const regulated = medicines.filter((m) => m.category === "Regulated").length;

  return (
    <>
      <div className="inv-root">
        <aside className="inv-sidebar">
          <div>
            <div className="inv-brand">
              <div className="inv-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="inv-brand-title">PharmaOS</div>
                <div className="inv-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="inv-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`inv-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="inv-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="inv-sidebar-card">
            <div className="inv-sidebar-card-badge">Inventory Rules</div>
            <h4>Batch-level traceability enabled</h4>
            <p>FIFO allocation, expiry monitoring, and regulated stock supervision are active.</p>
          </div>
        </aside>

        <main className="inv-main">
          <header className="inv-topbar">
            <div>
              <p className="inv-topbar-label">Inventory Management</p>
              <h1>Medicines & Batches</h1>
            </div>

            <div className="inv-topbar-actions">
              <div className="inv-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search medicine, substance, batch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="inv-icon-btn">
                <BellIcon />
              </button>

              <div className="inv-user">
                <div className="inv-user-avatar">DA</div>
                <div>
                  <div className="inv-user-name">Dr. Admin</div>
                  <div className="inv-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="inv-hero">
            <div className="inv-hero-text">
              <span className="inv-hero-badge">Batch Tracking</span>
              <h2>Monitor stock, expiry dates, categories, and supplier-linked batches in one place.</h2>
              <p>
                This inventory module supports pharmacy operations through search, filtering,
                stock visibility, and traceability aligned with your capstone requirements.
              </p>
            </div>

            <div className="inv-hero-actions">
              <button
                type="button"
                className="inv-primary-btn"
                onClick={() => router.push("/inventory/add")}
              >
                <PlusIcon /> Add Medicine
              </button>
              <button type="button" className="inv-secondary-btn">
                <FilterIcon /> Export Report
              </button>
            </div>
          </section>

          <section className="inv-stats-grid">
            <div className="inv-stat-card blue">
              <div className="inv-stat-title">Total Medicines</div>
              <div className="inv-stat-value">{totalMedicines}</div>
              <div className="inv-stat-note">Registered products</div>
            </div>

            <div className="inv-stat-card amber">
              <div className="inv-stat-title">Low Stock</div>
              <div className="inv-stat-value">{lowStock}</div>
              <div className="inv-stat-note">Threshold attention needed</div>
            </div>

            <div className="inv-stat-card red">
              <div className="inv-stat-title">Near Expiry</div>
              <div className="inv-stat-value">{nearExpiry}</div>
              <div className="inv-stat-note">Within 90 days</div>
            </div>

            <div className="inv-stat-card violet">
              <div className="inv-stat-title">Regulated Items</div>
              <div className="inv-stat-value">{regulated}</div>
              <div className="inv-stat-note">Require strict supervision</div>
            </div>
          </section>

          <section className="inv-panel">
            <div className="inv-panel-head">
              <div>
                <p className="inv-panel-kicker">Filters</p>
                <h3>Inventory controls</h3>
              </div>
            </div>

            <div className="inv-filters">
              <div className="inv-filter-group">
                <label>Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option>All</option>
                  <option>Non-Prescription</option>
                  <option>Prescription</option>
                  <option>Regulated</option>
                </select>
              </div>

              <div className="inv-filter-group">
                <label>Stock Status</label>
                <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                  <option>All</option>
                  <option>Low Stock</option>
                  <option>Near Expiry</option>
                </select>
              </div>
            </div>
          </section>

          <section className="inv-panel">
            <div className="inv-panel-head">
              <div>
                <p className="inv-panel-kicker">Medicine List</p>
                <h3>Registered inventory</h3>
              </div>
              <button type="button" className="inv-link-btn">View all batches</button>
            </div>

            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Active Substance</th>
                    <th>Category</th>
                    <th>Batch</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const d = daysUntil(item.expiry);
                    const low = item.quantity <= 20;
                    const near = d <= 90;

                    return (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.substance}</td>
                        <td>
                          <span
                            className={`inv-badge ${
                              item.category === "Regulated"
                                ? "regulated"
                                : item.category === "Prescription"
                                ? "prescription"
                                : "otc"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td>{item.batch}</td>
                        <td>{item.expiry}</td>
                        <td>{item.quantity}</td>
                        <td>{item.supplier}</td>
                        <td>
                          {near ? (
                            <span className="inv-status danger">
                              <WarningIcon /> Near Expiry
                            </span>
                          ) : low ? (
                            <span className="inv-status warning">
                              <WarningIcon /> Low Stock
                            </span>
                          ) : (
                            <span className="inv-status ok">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

        .inv-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .inv-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .inv-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .inv-brand-icon {
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

        .inv-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .inv-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .inv-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inv-nav-item {
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

        .inv-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .inv-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .inv-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inv-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .inv-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .inv-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .inv-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .inv-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .inv-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .inv-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .inv-topbar h1 {
          margin: 0;
          font-size: 46px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .inv-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .inv-search {
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

        .inv-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .inv-icon-btn {
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

        .inv-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .inv-user-avatar {
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

        .inv-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .inv-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .inv-hero {
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

        .inv-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .inv-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 32px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .inv-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .inv-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .inv-primary-btn,
        .inv-secondary-btn,
        .inv-link-btn {
          font-family: "Outfit", sans-serif;
          cursor: pointer;
        }

        .inv-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
        }

        .inv-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inv-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .inv-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .inv-stat-title {
          color: #7a8a9b;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .inv-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #0b1c35;
          margin-bottom: 8px;
        }

        .inv-stat-note {
          font-size: 13px;
          font-weight: 500;
        }

        .inv-stat-card.blue .inv-stat-note { color: #2563eb; }
        .inv-stat-card.amber .inv-stat-note { color: #d97706; }
        .inv-stat-card.red .inv-stat-note { color: #dc2626; }
        .inv-stat-card.violet .inv-stat-note { color: #7c3aed; }

        .inv-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
          margin-bottom: 22px;
        }

        .inv-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .inv-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .inv-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .inv-filters {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .inv-filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 220px;
        }

        .inv-filter-group label {
          font-size: 13px;
          color: #6b7a90;
          font-weight: 500;
        }

        .inv-filter-group select {
          height: 46px;
          border-radius: 14px;
          border: 1px solid #dbe3ed;
          background: #f8fafc;
          padding: 0 14px;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
          outline: none;
        }

        .inv-link-btn {
          margin-left: auto;
          border: none;
          background: transparent;
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
        }

        .inv-table-wrap {
          overflow-x: auto;
        }

        .inv-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inv-table th {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #7a8a9b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .inv-table td {
          padding: 14px 10px;
          font-size: 14px;
          color: #0b1c35;
          border-bottom: 1px solid #eef2f7;
          vertical-align: middle;
        }

        .inv-badge {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
        }

        .inv-badge.otc {
          background: #eff6ff;
          color: #2563eb;
        }

        .inv-badge.prescription {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .inv-badge.regulated {
          background: #fef2f2;
          color: #dc2626;
        }

        .inv-status {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .inv-status.ok {
          background: #ecfdf5;
          color: #047857;
        }

        .inv-status.warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .inv-status.danger {
          background: #fef2f2;
          color: #dc2626;
        }

        @media (max-width: 1200px) {
          .inv-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .inv-search {
            width: 260px;
          }
        }

        @media (max-width: 900px) {
          .inv-root {
            flex-direction: column;
          }

          .inv-sidebar {
            width: 100%;
            gap: 20px;
          }

          .inv-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .inv-topbar-actions {
            flex-wrap: wrap;
          }

          .inv-search {
            width: 100%;
          }

          .inv-hero {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .inv-main {
            padding: 18px;
          }

          .inv-stats-grid {
            grid-template-columns: 1fr;
          }

          .inv-topbar h1 {
            font-size: 34px;
          }

          .inv-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}