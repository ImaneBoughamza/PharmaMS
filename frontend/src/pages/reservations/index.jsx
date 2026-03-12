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

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations", active: true },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
];

const initialReservations = [
  {
    id: "RES-201",
    customer: "Sara El Amrani",
    phone: "+212 6 12 45 77 11",
    item: "Efferalgan 500mg",
    category: "OTC",
    qty: 2,
    stockAvailable: 15,
    payment: "Pay on Pickup",
    status: "Pending Approval",
    createdAt: "09:10",
  },
  {
    id: "RES-202",
    customer: "Omar Tahiri",
    phone: "+212 6 77 20 18 44",
    item: "Vitamin D3",
    category: "OTC",
    qty: 1,
    stockAvailable: 24,
    payment: "Online Payment",
    status: "Ready for Pickup",
    createdAt: "10:40",
  },
  {
    id: "RES-203",
    customer: "Nadia Alaoui",
    phone: "+212 6 21 55 60 32",
    item: "Cough Syrup",
    category: "OTC",
    qty: 1,
    stockAvailable: 11,
    payment: "Pay on Pickup",
    status: "Pending Approval",
    createdAt: "11:05",
  },
  {
    id: "RES-204",
    customer: "Yassine M.",
    phone: "+212 6 30 78 91 65",
    item: "Ibuprofen 400mg",
    category: "OTC",
    qty: 3,
    stockAvailable: 19,
    payment: "Online Payment",
    status: "Rejected",
    createdAt: "11:50",
  },
];

export default function ReservationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reservations, setReservations] = useState(initialReservations);
  const [selectedId, setSelectedId] = useState(initialReservations[0].id);

  const filteredReservations = useMemo(() => {
    const q = search.toLowerCase();
    return reservations.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" ? true : r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, reservations]);

  const selectedReservation =
    reservations.find((r) => r.id === selectedId) || reservations[0];

  const counts = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "Pending Approval").length,
    ready: reservations.filter((r) => r.status === "Ready for Pickup").length,
    rejected: reservations.filter((r) => r.status === "Rejected").length,
  };

  const updateReservationStatus = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    setSelectedId(id);
  };

  const convertToSale = (id) => {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Converted to Sale" } : item
      )
    );
    setSelectedId(id);
  };

  return (
    <>
      <div className="res-root">
        <aside className="res-sidebar">
          <div>
            <div className="res-brand">
              <div className="res-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="res-brand-title">PharmaOS</div>
                <div className="res-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="res-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`res-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="res-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="res-sidebar-card">
            <div className="res-sidebar-card-badge">Reservation Rules</div>
            <h4>OTC only + pharmacist supervision</h4>
            <p>Requests stay pending until approval. Ready reservations can later be converted to sales.</p>
          </div>
        </aside>

        <main className="res-main">
          <header className="res-topbar">
            <div>
              <p className="res-topbar-label">Customer Requests / OTC Reservations</p>
              <h1>Reservation Management</h1>
            </div>

            <div className="res-topbar-actions">
              <div className="res-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search reservation, customer, item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="res-icon-btn">
                <BellIcon />
              </button>

              <div className="res-user">
                <div className="res-user-avatar">DA</div>
                <div>
                  <div className="res-user-name">Dr. Admin</div>
                  <div className="res-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="res-hero">
            <div className="res-hero-text">
              <span className="res-hero-badge">Approval Workflow</span>
              <h2>Review OTC reservations, confirm availability, approve pickup, or convert approved requests into sales.</h2>
              <p>
                This page covers your capstone reservation workflow: stock verification,
                pharmacist approval, rejection with reason, ready status, and conversion to sale.
              </p>
            </div>

            <div className="res-hero-actions">
              <button type="button" className="res-secondary-btn" onClick={() => router.push("/pos")}>
                Go to POS
              </button>
            </div>
          </section>

          <section className="res-stats-grid">
            <div className="res-stat-card blue">
              <div className="res-stat-title">Total Requests</div>
              <div className="res-stat-value">{counts.total}</div>
              <div className="res-stat-note">All reservations</div>
            </div>
            <div className="res-stat-card amber">
              <div className="res-stat-title">Pending</div>
              <div className="res-stat-value">{counts.pending}</div>
              <div className="res-stat-note">Awaiting pharmacist approval</div>
            </div>
            <div className="res-stat-card green">
              <div className="res-stat-title">Ready</div>
              <div className="res-stat-value">{counts.ready}</div>
              <div className="res-stat-note">Prepared for pickup</div>
            </div>
            <div className="res-stat-card red">
              <div className="res-stat-title">Rejected</div>
              <div className="res-stat-value">{counts.rejected}</div>
              <div className="res-stat-note">Unavailable or refused</div>
            </div>
          </section>

          <div className="res-layout">
            <section className="res-list-panel">
              <div className="res-panel-head">
                <div>
                  <p className="res-panel-kicker">Reservation Queue</p>
                  <h3>Incoming requests</h3>
                </div>

                <div className="res-filter-wrap">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All</option>
                    <option>Pending Approval</option>
                    <option>Ready for Pickup</option>
                    <option>Rejected</option>
                    <option>Converted to Sale</option>
                  </select>
                </div>
              </div>

              <div className="res-list">
                {filteredReservations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`res-list-item${selectedId === item.id ? " active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="res-list-top">
                      <div>
                        <h4>{item.id}</h4>
                        <p>{item.customer}</p>
                      </div>
                      <span className={`res-status-chip ${item.status.replace(/\s/g, "-").toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="res-list-bottom">
                      <span>{item.item}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <aside className="res-detail-panel">
              {selectedReservation && (
                <>
                  <div className="res-panel-head">
                    <div>
                      <p className="res-panel-kicker">Selected Reservation</p>
                      <h3>{selectedReservation.id}</h3>
                    </div>
                  </div>

                  <div className="res-detail-card">
                    <div className="res-detail-row">
                      <span>Customer</span>
                      <strong>{selectedReservation.customer}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Phone</span>
                      <strong>{selectedReservation.phone}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Requested Item</span>
                      <strong>{selectedReservation.item}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Category</span>
                      <strong>{selectedReservation.category}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Requested Quantity</span>
                      <strong>{selectedReservation.qty}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Stock Available</span>
                      <strong>{selectedReservation.stockAvailable}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Payment Choice</span>
                      <strong className="res-inline-icon">
                        <CreditCardIcon />
                        {selectedReservation.payment}
                      </strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Status</span>
                      <strong>{selectedReservation.status}</strong>
                    </div>
                    <div className="res-detail-row">
                      <span>Created At</span>
                      <strong className="res-inline-icon">
                        <ClockIcon />
                        {selectedReservation.createdAt}
                      </strong>
                    </div>
                  </div>

                  <div className="res-actions-box">
                    <p className="res-actions-title">Decision Actions</p>

                    <div className="res-actions-grid">
                      <button
                        type="button"
                        className="res-approve-btn"
                        onClick={() =>
                          updateReservationStatus(selectedReservation.id, "Ready for Pickup")
                        }
                      >
                        <CheckIcon /> Approve
                      </button>

                      <button
                        type="button"
                        className="res-reject-btn"
                        onClick={() =>
                          updateReservationStatus(selectedReservation.id, "Rejected")
                        }
                      >
                        <CloseIcon /> Reject
                      </button>
                    </div>

                    <button
                      type="button"
                      className="res-convert-btn"
                      onClick={() => convertToSale(selectedReservation.id)}
                    >
                      <ArrowRightIcon /> Convert to Sale
                    </button>
                  </div>

                  <div className="res-note-box">
                    <h4>Workflow Notes</h4>
                    <ul>
                      <li>Only OTC reservations are allowed.</li>
                      <li>Pending requests must be reviewed by the pharmacist.</li>
                      <li>Approved reservations are marked as ready for pickup.</li>
                      <li>Ready reservations can later be converted into sale records.</li>
                    </ul>
                  </div>
                </>
              )}
            </aside>
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

        .res-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .res-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .res-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .res-brand-icon {
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

        .res-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .res-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .res-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .res-nav-item {
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

        .res-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .res-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .res-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .res-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .res-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .res-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .res-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .res-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .res-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .res-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .res-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .res-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .res-search {
          width: 320px;
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

        .res-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .res-icon-btn {
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

        .res-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .res-user-avatar {
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

        .res-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .res-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .res-hero {
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

        .res-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .res-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .res-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .res-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
          font-family: "Outfit", sans-serif;
          cursor: pointer;
        }

        .res-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .res-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .res-stat-title {
          color: #7a8a9b;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .res-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #0b1c35;
          margin-bottom: 8px;
        }

        .res-stat-note {
          font-size: 13px;
          font-weight: 500;
        }

        .res-stat-card.blue .res-stat-note { color: #2563eb; }
        .res-stat-card.amber .res-stat-note { color: #d97706; }
        .res-stat-card.green .res-stat-note { color: #059669; }
        .res-stat-card.red .res-stat-note { color: #dc2626; }

        .res-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 18px;
        }

        .res-list-panel,
        .res-detail-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .res-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .res-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .res-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .res-filter-wrap select {
          height: 42px;
          border-radius: 12px;
          border: 1px solid #dbe4ef;
          background: #fff;
          padding: 0 12px;
          font-family: "Outfit", sans-serif;
          color: #0b1c35;
          outline: none;
        }

        .res-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .res-list-item {
          width: 100%;
          border: 1px solid #e8eef5;
          background: #fbfdff;
          border-radius: 18px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .res-list-item:hover {
          border-color: #c7d7ea;
          background: #ffffff;
        }

        .res-list-item.active {
          border-color: #bfdbfe;
          background: #eff6ff;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.08);
        }

        .res-list-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .res-list-top h4 {
          margin: 0 0 4px;
          font-size: 15px;
          color: #0b1c35;
        }

        .res-list-top p {
          margin: 0;
          font-size: 13px;
          color: #6b7a90;
        }

        .res-list-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #516275;
          font-size: 13px;
        }

        .res-status-chip {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .res-status-chip.pending-approval {
          background: #fff7ed;
          color: #c2410c;
        }

        .res-status-chip.ready-for-pickup {
          background: #ecfdf5;
          color: #047857;
        }

        .res-status-chip.rejected {
          background: #fef2f2;
          color: #dc2626;
        }

        .res-status-chip.converted-to-sale {
          background: #eff6ff;
          color: #2563eb;
        }

        .res-detail-card {
          border: 1px solid #e8eef5;
          border-radius: 18px;
          background: #fbfdff;
          padding: 16px;
          margin-bottom: 16px;
        }

        .res-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #edf2f7;
        }

        .res-detail-row:last-child {
          border-bottom: none;
        }

        .res-detail-row span {
          color: #6b7a90;
          font-size: 13px;
        }

        .res-detail-row strong {
          color: #0b1c35;
          font-size: 14px;
          text-align: right;
        }

        .res-inline-icon {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .res-actions-box {
          border: 1px solid #e8eef5;
          border-radius: 18px;
          background: #fff;
          padding: 16px;
          margin-bottom: 16px;
        }

        .res-actions-title {
          margin: 0 0 12px;
          color: #516275;
          font-size: 13px;
          font-weight: 500;
        }

        .res-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }

        .res-approve-btn,
        .res-reject-btn,
        .res-convert-btn {
          height: 44px;
          border-radius: 12px;
          font-family: "Outfit", sans-serif;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .res-approve-btn {
          border: none;
          background: #059669;
          color: white;
        }

        .res-reject-btn {
          border: none;
          background: #dc2626;
          color: white;
        }

        .res-convert-btn {
          width: 100%;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #2563eb;
        }

        .res-note-box {
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(135deg, #eff6ff, #f8fbff);
          border: 1px solid #dbeafe;
        }

        .res-note-box h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #0b1c35;
        }

        .res-note-box ul {
          margin: 0;
          padding-left: 18px;
          color: #516275;
          line-height: 1.8;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .res-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .res-layout {
            grid-template-columns: 1fr;
          }

          .res-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .res-root {
            flex-direction: column;
          }

          .res-sidebar {
            width: 100%;
            gap: 20px;
          }

          .res-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .res-topbar-actions {
            flex-wrap: wrap;
          }

          .res-search {
            width: 100%;
          }

          .res-hero {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 700px) {
          .res-main {
            padding: 18px;
          }

          .res-stats-grid {
            grid-template-columns: 1fr;
          }

          .res-topbar h1 {
            font-size: 34px;
          }

          .res-panel-head h3 {
            font-size: 20px;
          }

          .res-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}