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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
  { label: "Settings", icon: <SettingsIcon />, href: "/settings/users", active: true },
];

const initialUsers = [
  {
    id: 1,
    fullName: "Dr. Admin",
    email: "admin@pharmaos.ma",
    role: "Pharmacist",
    status: "Active",
    phone: "+212 6 00 11 22 33",
  },
  {
    id: 2,
    fullName: "Salma Karim",
    email: "assistant1@pharmaos.ma",
    role: "Assistant",
    status: "Active",
    phone: "+212 6 14 22 10 90",
  },
  {
    id: 3,
    fullName: "Youssef Naji",
    email: "cashier1@pharmaos.ma",
    role: "Cashier",
    status: "Inactive",
    phone: "+212 6 77 30 55 40",
  },
];

export default function SettingsUsersPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [saved, setSaved] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    role: "Assistant",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const counts = {
    total: users.length,
    pharmacists: users.filter((u) => u.role === "Pharmacist").length,
    assistants: users.filter((u) => u.role === "Assistant").length,
    cashiers: users.filter((u) => u.role === "Cashier").length,
  };

  const updateNewUser = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!newUser.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!newUser.email.trim()) newErrors.email = "Email is required.";
    if (!newUser.phone.trim()) newErrors.phone = "Phone is required.";
    if (!newUser.username.trim()) newErrors.username = "Username is required.";
    if (!newUser.password.trim()) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      setSaved(false);
      return;
    }

    const createdUser = {
      id: Date.now(),
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: "Active",
    };

    setUsers((prev) => [createdUser, ...prev]);
    setNewUser({
      fullName: "",
      email: "",
      phone: "",
      username: "",
      role: "Assistant",
      password: "",
    });
    setErrors({});
    setSaved(true);
  };

  const changeRole = (id, role) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role } : user))
    );
    setSaved(false);
  };

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
          : user
      )
    );
    setSaved(false);
  };

  return (
    <>
      <div className="usr-root">
        <aside className="usr-sidebar">
          <div>
            <div className="usr-brand">
              <div className="usr-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="usr-brand-title">PharmaOS</div>
                <div className="usr-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="usr-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`usr-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="usr-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="usr-sidebar-card">
            <div className="usr-sidebar-card-badge">RBAC</div>
            <h4>Role-based access control</h4>
            <p>Assign pharmacists, assistants, and cashiers based on operational permissions.</p>
          </div>
        </aside>

        <main className="usr-main">
          <header className="usr-topbar">
            <div>
              <p className="usr-topbar-label">Settings / User Management</p>
              <h1>Staff & Roles</h1>
            </div>

            <div className="usr-topbar-actions">
              <div className="usr-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search staff by name, email, role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="usr-icon-btn">
                <BellIcon />
              </button>

              <div className="usr-user">
                <div className="usr-user-avatar">DA</div>
                <div>
                  <div className="usr-user-name">Dr. Admin</div>
                  <div className="usr-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="usr-hero">
            <div className="usr-hero-text">
              <span className="usr-hero-badge">RBAC Management</span>
              <h2>Add staff accounts, assign roles, and control access permissions across the pharmacy system.</h2>
              <p>
                This page supports your capstone RBAC requirements by allowing pharmacist-controlled
                account creation, role assignment, and activation status management.
              </p>
            </div>
          </section>

          <section className="usr-stats-grid">
            <div className="usr-stat-card blue">
              <div className="usr-stat-title">Total Staff</div>
              <div className="usr-stat-value">{counts.total}</div>
              <div className="usr-stat-note">Registered accounts</div>
            </div>
            <div className="usr-stat-card green">
              <div className="usr-stat-title">Pharmacists</div>
              <div className="usr-stat-value">{counts.pharmacists}</div>
              <div className="usr-stat-note">Full validation authority</div>
            </div>
            <div className="usr-stat-card amber">
              <div className="usr-stat-title">Assistants</div>
              <div className="usr-stat-value">{counts.assistants}</div>
              <div className="usr-stat-note">Operational support role</div>
            </div>
            <div className="usr-stat-card violet">
              <div className="usr-stat-title">Cashiers</div>
              <div className="usr-stat-value">{counts.cashiers}</div>
              <div className="usr-stat-note">POS-focused access</div>
            </div>
          </section>

          <div className="usr-layout">
            <section className="usr-panel">
              <div className="usr-panel-head">
                <div>
                  <p className="usr-panel-kicker">Create Account</p>
                  <h3>Add staff member</h3>
                </div>
              </div>

              <form className="usr-form" onSubmit={handleAddUser}>
                <div className="usr-grid two">
                  <div className="usr-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={newUser.fullName}
                      onChange={(e) => updateNewUser("fullName", e.target.value)}
                      placeholder="e.g. Salma Karim"
                    />
                    {errors.fullName && <p className="usr-error">{errors.fullName}</p>}
                  </div>

                  <div className="usr-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => updateNewUser("email", e.target.value)}
                      placeholder="staff@pharmaos.ma"
                    />
                    {errors.email && <p className="usr-error">{errors.email}</p>}
                  </div>
                </div>

                <div className="usr-grid two">
                  <div className="usr-field">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) => updateNewUser("phone", e.target.value)}
                      placeholder="+212 ..."
                    />
                    {errors.phone && <p className="usr-error">{errors.phone}</p>}
                  </div>

                  <div className="usr-field">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => updateNewUser("username", e.target.value)}
                      placeholder="username"
                    />
                    {errors.username && <p className="usr-error">{errors.username}</p>}
                  </div>
                </div>

                <div className="usr-grid two">
                  <div className="usr-field">
                    <label>Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => updateNewUser("role", e.target.value)}
                    >
                      <option>Pharmacist</option>
                      <option>Assistant</option>
                      <option>Cashier</option>
                    </select>
                  </div>

                  <div className="usr-field">
                    <label>Temporary Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => updateNewUser("password", e.target.value)}
                      placeholder="Enter temporary password"
                    />
                    {errors.password && <p className="usr-error">{errors.password}</p>}
                  </div>
                </div>

                <div className="usr-actions">
                  <button type="submit" className="usr-primary-btn">
                    <PlusIcon /> Add Staff
                  </button>
                </div>

                {saved && (
                  <div className="usr-success">
                    <CheckIcon />
                    Staff account created successfully.
                  </div>
                )}
              </form>
            </section>

            <section className="usr-panel">
              <div className="usr-panel-head">
                <div>
                  <p className="usr-panel-kicker">Current Accounts</p>
                  <h3>Role assignment table</h3>
                </div>
              </div>

              <div className="usr-table-wrap">
                <table className="usr-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            className="usr-role-select"
                            value={user.role}
                            onChange={(e) => changeRole(user.id, e.target.value)}
                          >
                            <option>Pharmacist</option>
                            <option>Assistant</option>
                            <option>Cashier</option>
                          </select>
                        </td>
                        <td>
                          <span
                            className={`usr-status ${
                              user.status === "Active" ? "active" : "inactive"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="usr-toggle-btn"
                            onClick={() => toggleStatus(user.id)}
                          >
                            {user.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="usr-note-box">
                <h4>Permission Logic</h4>
                <ul>
                  <li><strong>Pharmacist:</strong> can validate regulated medicines and configure stock settings.</li>
                  <li><strong>Assistant:</strong> can support operations but cannot validate regulated sales.</li>
                  <li><strong>Cashier:</strong> can handle transactions but has restricted inventory access.</li>
                </ul>
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

        .usr-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .usr-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .usr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .usr-brand-icon {
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

        .usr-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .usr-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .usr-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .usr-nav-item {
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

        .usr-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .usr-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .usr-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .usr-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .usr-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .usr-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .usr-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .usr-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .usr-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .usr-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .usr-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .usr-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .usr-search {
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

        .usr-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .usr-icon-btn {
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

        .usr-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .usr-user-avatar {
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

        .usr-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .usr-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .usr-hero {
          background: linear-gradient(135deg, #0b1c35, #163257);
          color: white;
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 22px;
          box-shadow: 0 16px 40px rgba(11, 28, 53, 0.16);
        }

        .usr-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .usr-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .usr-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .usr-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .usr-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .usr-stat-title {
          color: #7a8a9b;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .usr-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #0b1c35;
          margin-bottom: 8px;
        }

        .usr-stat-note {
          font-size: 13px;
          font-weight: 500;
          color: #607086;
        }

        .usr-layout {
          display: grid;
          grid-template-columns: 0.95fr 1.25fr;
          gap: 18px;
        }

        .usr-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .usr-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .usr-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .usr-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .usr-form {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .usr-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 12px;
        }

        .usr-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .usr-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .usr-field label {
          font-size: 13px;
          color: #5d6d82;
          font-weight: 500;
        }

        .usr-field input,
        .usr-field select {
          width: 100%;
          border: 1px solid #dbe3ed;
          background: #f8fafc;
          border-radius: 14px;
          padding: 14px 14px;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
          outline: none;
        }

        .usr-field input:focus,
        .usr-field select:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .usr-error {
          margin: 0;
          color: #dc2626;
          font-size: 12px;
        }

        .usr-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .usr-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
          font-family: "Outfit", sans-serif;
          cursor: pointer;
          border-radius: 14px;
          height: 46px;
          padding: 0 18px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .usr-success {
          margin-top: 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ecfdf5;
          color: #047857;
          font-size: 13px;
          font-weight: 500;
        }

        .usr-table-wrap {
          overflow-x: auto;
        }

        .usr-table {
          width: 100%;
          border-collapse: collapse;
        }

        .usr-table th {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: #7a8a9b;
          border-bottom: 1px solid #e2e8f0;
        }

        .usr-table td {
          padding: 14px 10px;
          font-size: 14px;
          color: #0b1c35;
          border-bottom: 1px solid #eef2f7;
          vertical-align: middle;
        }

        .usr-role-select {
          height: 38px;
          border-radius: 10px;
          border: 1px solid #dbe3ed;
          background: #fff;
          padding: 0 10px;
          font-family: "Outfit", sans-serif;
        }

        .usr-status {
          display: inline-block;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .usr-status.active {
          background: #ecfdf5;
          color: #047857;
        }

        .usr-status.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .usr-toggle-btn {
          border: 1px solid #dbe4ef;
          background: #fff;
          color: #2563eb;
          border-radius: 10px;
          height: 36px;
          padding: 0 12px;
          font-family: "Outfit", sans-serif;
          cursor: pointer;
          font-weight: 500;
        }

        .usr-note-box {
          margin-top: 18px;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(135deg, #eff6ff, #f8fbff);
          border: 1px solid #dbeafe;
        }

        .usr-note-box h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #0b1c35;
        }

        .usr-note-box ul {
          margin: 0;
          padding-left: 18px;
          color: #516275;
          line-height: 1.8;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .usr-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .usr-layout {
            grid-template-columns: 1fr;
          }

          .usr-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .usr-root {
            flex-direction: column;
          }

          .usr-sidebar {
            width: 100%;
            gap: 20px;
          }

          .usr-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .usr-topbar-actions {
            flex-wrap: wrap;
          }

          .usr-search {
            width: 100%;
          }

          .usr-grid.two {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .usr-main {
            padding: 18px;
          }

          .usr-stats-grid {
            grid-template-columns: 1fr;
          }

          .usr-topbar h1 {
            font-size: 34px;
          }

          .usr-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}