import { useMemo, useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "@/styles/SettingsUsersPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist"]);


const INITIAL_USERS = [
  { id: 1, fullName: "Dr. Youssef Alami", email: "youssef@pharmaos.ma", phone: "+212 600 112233", role: "pharmacist", status: "active" },
  { id: 2, fullName: "Salma Karim",       email: "salma@pharmaos.ma",   phone: "+212 614 221090", role: "assistant",  status: "active" },
  { id: 3, fullName: "Youssef Naji",      email: "youssef.n@pharmaos.ma", phone: "+212 677 305540", role: "cashier", status: "inactive" },
];

const EMPTY_FORM = { fullName: "", email: "", phone: "", password: "", role: "assistant" };

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function SettingsUsersPage() {
  const [users, setUsers]         = useState(INITIAL_USERS);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [isSaving, setIsSaving]   = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.includes(q)
    );
  }, [users, search]);

  const counts = useMemo(() => ({
    total:       users.length,
    pharmacist:  users.filter((u) => u.role === "pharmacist").length,
    assistant:   users.filter((u) => u.role === "assistant").length,
    cashier:     users.filter((u) => u.role === "cashier").length,
  }), [users]);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim())    e.email    = "Email is required.";
    if (!form.phone.trim())    e.phone    = "Phone is required.";
    if (!form.password.trim()) e.password = "Password is required.";
    return e;
  }

  async function handleAdd(evt) {
    evt.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    // TODO: replace with real API call: await api.post("/api/auth/register", form)
    setUsers((prev) => [
      { id: Date.now(), fullName: form.fullName, email: form.email, phone: form.phone, role: form.role, status: "active" },
      ...prev,
    ]);
    toast.success(`${form.fullName} added as ${form.role}.`);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(false);
    setIsSaving(false);
  }

  function handleRoleChange(id, role) {
    // TODO: replace with real API call: await api.patch(`/api/users/${id}`, { role })
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated.");
  }

  function handleToggleStatus(id) {
    // TODO: replace with real API call: await api.patch(`/api/users/${id}/status`)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>User Management</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add User
        </Button>
      </div>

      {/* KPI cards */}
      <div className={styles.statsGrid}>
        {[
          { label: "Total Users",   value: counts.total },
          { label: "Pharmacists",   value: counts.pharmacist },
          { label: "Assistants",    value: counts.assistant },
          { label: "Cashiers",      value: counts.cashier },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No users match your search.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{initials(u.fullName)}</div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{u.fullName}</span>
                          <span className={styles.userEmail}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone}</td>
                    <td>
                      <select
                        className={styles.roleSelect}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="pharmacist">Pharmacist</option>
                        <option value="assistant">Assistant</option>
                        <option value="cashier">Cashier</option>
                      </select>
                    </td>
                    <td>
                      <Badge variant={u.status === "active" ? "success" : "neutral"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className={u.status === "active" ? styles.toggleActive : styles.toggleInactive}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); setErrors({}); }}
        title="Add New User"
      >
        <form onSubmit={handleAdd} className={styles.modalForm}>
          <div className={styles.modalRow}>
            <Input
              label="Full Name *"
              placeholder="e.g. Sara Bennani"
              error={errors.fullName}
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            />
            <Input
              label="Phone *"
              placeholder="+212 ..."
              error={errors.phone}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <Input
            label="Email *"
            type="email"
            placeholder="user@pharmaos.ma"
            error={errors.email}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />

          <div className={styles.modalRow}>
            <Input
              label="Password *"
              type="password"
              placeholder="Temporary password"
              error={errors.password}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Role</label>
              <select
                className={styles.modalSelect}
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="pharmacist">Pharmacist</option>
                <option value="assistant">Assistant</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalOpen(false); setForm(EMPTY_FORM); setErrors({}); }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Add User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

SettingsUsersPage.getLayout = AppLayout.getLayout;
