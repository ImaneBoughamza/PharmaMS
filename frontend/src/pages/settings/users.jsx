import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  Search,
  ShieldCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import api from "@/lib/axios";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import { ASSISTANT, CASHIER, PHARMACIST } from "@/constants/roles";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import styles from "@/styles/SettingsUsersPage.module.css";

const PAGE_SIZE = 20;

const INITIAL_USERS = [
  {
    _id: "mock-pharmacist",
    fullName: "Dr. Imane El Fassi",
    email: "imane@pharmaos.ma",
    role: PHARMACIST,
    status: "active",
    createdAt: "2026-01-08T09:15:00.000Z",
    lastLoginAt: "2026-04-27T09:42:00.000Z",
  },
  {
    _id: "usr-assistant-1",
    fullName: "Sara Bennani",
    email: "sara@pharmaos.ma",
    role: ASSISTANT,
    status: "active",
    createdAt: "2026-02-14T11:20:00.000Z",
    lastLoginAt: "2026-04-26T15:12:00.000Z",
  },
  {
    _id: "usr-cashier-1",
    fullName: "Ahmed Naciri",
    email: "ahmed@pharmaos.ma",
    role: CASHIER,
    status: "active",
    createdAt: "2026-03-03T10:05:00.000Z",
    lastLoginAt: "2026-04-24T18:06:00.000Z",
  },
  {
    _id: "usr-assistant-2",
    fullName: "Meryem Zahraoui",
    email: "meryem@pharmaos.ma",
    role: ASSISTANT,
    status: "deactivated",
    createdAt: "2026-02-01T08:35:00.000Z",
    lastLoginAt: "2026-03-31T12:18:00.000Z",
  },
];

const EMPTY_CREATE_FORM = {
  fullName: "",
  email: "",
  role: ASSISTANT,
  password: "",
  confirmPassword: "",
};

function roleLabel(role) {
  return {
    [PHARMACIST]: "Pharmacist",
    [ASSISTANT]: "Assistant",
    [CASHIER]: "Cashier",
  }[role] ?? role;
}

function roleBadgeClass(role) {
  return {
    [PHARMACIST]: styles.rolePharmacist,
    [ASSISTANT]: styles.roleAssistant,
    [CASHIER]: styles.roleCashier,
  }[role] ?? styles.roleCashier;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lastLoginText(value) {
  if (!value) return "Never";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  return formatDate(value);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createId() {
  return `usr-${Date.now()}`;
}

function normalizeApiUser(user) {
  return {
    ...user,
    _id: user._id || user.id,
    status: user.isActive === false ? "deactivated" : "active",
  };
}

export default function SettingsUsersPage({ user }) {
  const currentUserId = user?._id ?? user?.sub ?? "mock-pharmacist";
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [recentlyCreatedId, setRecentlyCreatedId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [statusUser, setStatusUser] = useState(null);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/api/users", { params: { status: "all", limit: 100 } });
      const rows = data.data || data.users || [];
      setUsers(rows.map(normalizeApiUser));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, sortBy, statusFilter]);

  const filteredUsers = useMemo(() => {
    const rows = users.filter((entry) => {
      if (debouncedSearch && !`${entry.fullName} ${entry.email}`.toLowerCase().includes(debouncedSearch)) return false;
      if (roleFilter !== "all" && entry.role !== roleFilter) return false;
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      return true;
    });

    rows.sort((a, b) => {
      if (sortBy === "name-desc") return b.fullName.localeCompare(a.fullName);
      if (sortBy === "role") return roleLabel(a.role).localeCompare(roleLabel(b.role)) || a.fullName.localeCompare(b.fullName);
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "status") return a.status.localeCompare(b.status) || a.fullName.localeCompare(b.fullName);
      return a.fullName.localeCompare(b.fullName);
    });

    return rows;
  }, [debouncedSearch, roleFilter, sortBy, statusFilter, users]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasOnlyOwner = users.length === 1 && users[0]._id === currentUserId;
  const hasFilters = Boolean(debouncedSearch || roleFilter !== "all" || statusFilter !== "all");

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("name-asc");
  }

  async function createUser(form, setErrors) {
    const errors = validateCreateForm(form, users);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const { data } = await api.post("/api/users", {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      const newUser = normalizeApiUser(data.data || data.user);
      setUsers((current) => [newUser, ...current.filter((entry) => entry._id !== newUser._id)]);
      setRecentlyCreatedId(newUser._id);
      setCreateOpen(false);
      toast.success(`${newUser.fullName}'s account has been created`);
      window.setTimeout(() => setRecentlyCreatedId(""), 2200);
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ email: "An account with this email already exists" });
        return;
      }
      toast.error(error.response?.data?.message || "Unable to create user");
    }
  }

  async function updateUser(form, setErrors) {
    if (!editUser) return;
    const errors = validateEditForm(form, users, editUser._id);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
      };
      if (editUser._id !== currentUserId) payload.role = form.role;

      const { data } = await api.patch(`/api/users/${editUser._id}`, payload);
      const updatedUser = normalizeApiUser(data.data || data.user);
      setUsers((current) => current.map((entry) => (entry._id === updatedUser._id ? updatedUser : entry)));
      setEditUser(null);
      toast.success(`${updatedUser.fullName}'s account updated`);
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ email: "An account with this email already exists" });
        return;
      }
      toast.error(error.response?.data?.message || "Unable to update user");
    }
  }

  async function resetPassword(passwordForm, setErrors) {
    if (!resetUser) return;
    const errors = validatePasswordForm(passwordForm);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await api.patch(`/api/users/${resetUser._id}/reset-password`, {
        newPassword: passwordForm.password,
        confirmPassword: passwordForm.confirmPassword,
      });
      setResetUser(null);
      toast.success(`Password reset for ${resetUser.fullName} - they must change it on next login`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password");
    }
  }

  async function changeStatus() {
    if (!statusUser) return;
    const nextStatus = statusUser.status === "active" ? "deactivated" : "active";
    try {
      const action = nextStatus === "active" ? "reactivate" : "deactivate";
      const { data } = await api.patch(`/api/users/${statusUser._id}/${action}`);
      const updatedUser = normalizeApiUser(data.data || { ...statusUser, isActive: nextStatus === "active" });
      setUsers((current) => current.map((entry) => (entry._id === statusUser._id ? updatedUser : entry)));
      setStatusUser(null);
      toast.success(`${statusUser.fullName}'s account has been ${nextStatus === "active" ? "reactivated" : "deactivated"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update account status");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Users</h1>
          <p className={styles.subtitle}>Staff accounts and role assignments</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} />
          Create User
        </button>
      </header>

      <div className={styles.notice}>
        <ShieldCheck size={18} />
        <span>Role changes take effect immediately. Staff members currently logged in will be affected on their next request.</span>
      </div>

      <section className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
          />
        </div>
        <label className={styles.filterField}>
          <span>Role</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All</option>
            <option value={PHARMACIST}>Pharmacist</option>
            <option value={ASSISTANT}>Assistant</option>
            <option value={CASHIER}>Cashier</option>
          </select>
        </label>
        <label className={styles.filterField}>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </label>
        <label className={styles.filterField}>
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="role">Role</option>
            <option value="recent">Most Recent</option>
            <option value="status">Status</option>
          </select>
        </label>
      </section>

      <section className={styles.tableCard}>
        {loadingUsers ? (
          <div className={styles.emptyState}>
            <h2>Loading users...</h2>
          </div>
        ) : visibleUsers.length === 0 ? (
          <EmptyState hasOnlyOwner={hasOnlyOwner} hasFilters={hasFilters} clearFilters={clearFilters} openCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((entry) => (
                    <UserRow
                      key={entry._id}
                      user={entry}
                      isSelf={entry._id === currentUserId}
                      isNew={entry._id === recentlyCreatedId}
                      onEdit={() => setEditUser(entry)}
                      onReset={() => setResetUser(entry)}
                      onStatus={() => setStatusUser(entry)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} setPage={setPage} total={filteredUsers.length} />
          </>
        )}
      </section>

      <RoleReference />

      <CreateUserModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createUser}
      />
      <EditUserModal
        user={editUser}
        isSelf={editUser?._id === currentUserId}
        users={users}
        onClose={() => setEditUser(null)}
        onSubmit={updateUser}
      />
      <ResetPasswordModal
        user={resetUser}
        onClose={() => setResetUser(null)}
        onSubmit={resetPassword}
      />
      <StatusModal
        user={statusUser}
        onClose={() => setStatusUser(null)}
        onConfirm={changeStatus}
      />
    </div>
  );
}

SettingsUsersPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

function UserRow({ user, isSelf, isNew, onEdit, onReset, onStatus }) {
  const isDeactivated = user.status === "deactivated";
  return (
    <tr className={[
      isSelf ? styles.selfRow : "",
      isDeactivated ? styles.deactivatedRow : "",
      isNew ? styles.newRow : "",
    ].filter(Boolean).join(" ")}>
      <td>
        <div className={styles.userCell}>
          <strong>{user.fullName}</strong>
          {isSelf && <span className={styles.youTag}>You</span>}
          <small>{user.email}</small>
        </div>
      </td>
      <td><span className={`${styles.roleBadge} ${roleBadgeClass(user.role)}`}>{roleLabel(user.role)}</span></td>
      <td><span className={`${styles.statusBadge} ${isDeactivated ? styles.statusDeactivated : styles.statusActive}`}>{isDeactivated ? "Deactivated" : "Active"}</span></td>
      <td>{formatDate(user.createdAt)}</td>
      <td><span title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}>{lastLoginText(user.lastLoginAt)}</span></td>
      <td>
        <div className={styles.actionGroup}>
          {isDeactivated ? (
            <IconButton label="Reactivate" onClick={onStatus}><RotateCcw size={15} /></IconButton>
          ) : (
            <>
              <IconButton label="Edit" onClick={onEdit}><Edit3 size={15} /></IconButton>
              {!isSelf && <IconButton label="Reset Password" onClick={onReset}><KeyRound size={15} /></IconButton>}
              {!isSelf && <IconButton label="Deactivate" danger onClick={onStatus}><UserMinus size={15} /></IconButton>}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function IconButton({ children, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.iconBtn} ${danger ? styles.iconDanger : ""}`}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Pagination({ page, pageCount, setPage, total }) {
  return (
    <div className={styles.pagination}>
      <span>{total} user{total === 1 ? "" : "s"} found</span>
      <div>
        <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pageCount}</span>
        <button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function EmptyState({ hasOnlyOwner, hasFilters, clearFilters, openCreate }) {
  if (hasFilters) {
    return (
      <div className={styles.emptyState}>
        <h2>No users match your search</h2>
        <button type="button" className={styles.secondaryBtn} onClick={clearFilters}>Clear filters</button>
      </div>
    );
  }
  return (
    <div className={styles.emptyState}>
      <h2>{hasOnlyOwner ? "No additional staff accounts" : "No users match your search"}</h2>
      {hasOnlyOwner && <p>Create accounts for your assistant and cashier staff</p>}
      <button type="button" className={styles.primaryBtn} onClick={openCreate}>
        <UserPlus size={16} />
        Create User
      </button>
    </div>
  );
}

function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_CREATE_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_CREATE_FORM);
      setErrors({});
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Staff Account"
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primaryBtn} onClick={() => onSubmit(form, setErrors)}>Create Account</button>
        </>
      )}
    >
      <div className={styles.modalForm}>
        <TextField label="Full Name" value={form.fullName} error={errors.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
        <TextField label="Email Address" type="email" value={form.email} error={errors.email} onChange={(value) => setForm({ ...form, email: value })} />
        <label className={styles.field}>
          <span>Role</span>
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value={ASSISTANT}>Assistant</option>
            <option value={CASHIER}>Cashier</option>
          </select>
          <small>The pharmacist role is reserved for the pharmacy owner account</small>
          {errors.role && <em>{errors.role}</em>}
        </label>
        <PasswordField
          label="Temporary Password"
          value={form.password}
          visible={showPassword}
          error={errors.password}
          helper="The staff member must change this password on their first login"
          toggle={() => setShowPassword((current) => !current)}
          onChange={(value) => setForm({ ...form, password: value })}
        />
        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          visible={showConfirm}
          error={errors.confirmPassword}
          toggle={() => setShowConfirm((current) => !current)}
          onChange={(value) => setForm({ ...form, confirmPassword: value })}
        />
      </div>
    </Modal>
  );
}

function EditUserModal({ user, isSelf, onClose, onSubmit }) {
  const [form, setForm] = useState({ fullName: "", email: "", role: ASSISTANT });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName, email: user.email, role: user.role });
      setErrors({});
    }
  }, [user]);

  if (!user) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Edit - ${user.fullName}`}
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primaryBtn} onClick={() => onSubmit(form, setErrors)}>Save Changes</button>
        </>
      )}
    >
      <div className={styles.modalForm}>
        <TextField label="Full Name" value={form.fullName} error={errors.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
        <TextField label="Email Address" type="email" value={form.email} error={errors.email} onChange={(value) => setForm({ ...form, email: value })} />
        <label className={styles.field}>
          <span>Role</span>
          <select disabled={isSelf} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value={PHARMACIST}>Pharmacist</option>
            <option value={ASSISTANT}>Assistant</option>
            <option value={CASHIER}>Cashier</option>
          </select>
          {isSelf && <small>You cannot change your own role</small>}
        </label>
        <p className={styles.modalNote}>Role changes take effect immediately for the next API request this user makes.</p>
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ password: "", confirmPassword: "" });
      setErrors({});
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [user]);

  if (!user) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Reset Password - ${user.fullName}`}
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.warningBtn} onClick={() => onSubmit(form, setErrors)}>Reset Password</button>
        </>
      )}
    >
      <div className={styles.modalForm}>
        <p className={styles.modalNote}>Set a new temporary password for this account. {user.fullName} will be required to change it on their next login.</p>
        <PasswordField
          label="New Password"
          value={form.password}
          visible={showPassword}
          error={errors.password}
          toggle={() => setShowPassword((current) => !current)}
          onChange={(value) => setForm({ ...form, password: value })}
        />
        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          visible={showConfirm}
          error={errors.confirmPassword}
          toggle={() => setShowConfirm((current) => !current)}
          onChange={(value) => setForm({ ...form, confirmPassword: value })}
        />
      </div>
    </Modal>
  );
}

function StatusModal({ user, onClose, onConfirm }) {
  if (!user) return null;
  const isDeactivation = user.status === "active";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${isDeactivation ? "Deactivate" : "Reactivate"} ${user.fullName}`}
      footer={(
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={isDeactivation ? styles.dangerBtn : styles.primaryBtn} onClick={onConfirm}>
            {isDeactivation ? "Deactivate" : "Reactivate"}
          </button>
        </>
      )}
    >
      {isDeactivation ? (
        <div className={styles.modalForm}>
          <p>{user.fullName} will immediately lose access to PharmaMS.</p>
          <p>Any active sessions will be terminated.</p>
          <p>Their account history and audit trail records will be preserved.</p>
          <p>You can reactivate this account at any time.</p>
          {user.role === CASHIER && <div className={styles.warningBanner}>Ensure another staff member can cover POS operations.</div>}
          {user.role === ASSISTANT && <div className={styles.warningBanner}>Ensure another staff member can handle reservations.</div>}
        </div>
      ) : (
        <div className={styles.modalForm}>
          <p>{user.fullName} will regain access to PharmaMS with their {roleLabel(user.role)} permissions.</p>
          <p>They can log in immediately after reactivation.</p>
        </div>
      )}
    </Modal>
  );
}

function TextField({ label, type = "text", value, error, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <em>{error}</em>}
    </label>
  );
}

function PasswordField({ label, value, visible, error, helper, toggle, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.passwordBox}>
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" onClick={toggle} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error ? <em>{error}</em> : helper && <small>{helper}</small>}
    </label>
  );
}

function validateCreateForm(form, users) {
  const errors = validateEditForm(form, users);
  if (!form.role) errors.role = "Role is required";
  if (form.role === PHARMACIST) errors.role = "The pharmacist role cannot be created here";
  Object.assign(errors, validatePasswordForm(form));
  return errors;
}

function validateEditForm(form, users, ignoreId = "") {
  const errors = {};
  const name = form.fullName.trim();
  const email = form.email.trim().toLowerCase();
  if (name.length < 2) errors.fullName = "Full Name must be at least 2 characters";
  if (name.length > 100) errors.fullName = "Full Name must be 100 characters or less";
  if (!validateEmail(email)) errors.email = "Enter a valid email address";
  if (users.some((entry) => entry._id !== ignoreId && entry.email.toLowerCase() === email)) {
    errors.email = "An account with this email already exists";
  }
  return errors;
}

function validatePasswordForm(form) {
  const errors = {};
  if (!form.password || form.password.length < 8) errors.password = "Password must be at least 8 characters";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords must match";
  return errors;
}

function RoleReference() {
  const columns = [
    {
      role: PHARMACIST,
      title: "Pharmacist (Administrator)",
      allowed: [
        "All building blocks",
        "Approve / Reject Reservations",
        "Void Sales",
        "Pharmacist Validation Gate",
        "Manage Stock, Suppliers, Users",
        "Audit Logs, Reports, Transactions",
        "AI Decision Support",
      ],
      denied: [],
    },
    {
      role: ASSISTANT,
      title: "Assistant",
      allowed: [
        "POS - process sales",
        "Reservations - view, mark ready, convert",
        "AI Decision Support",
        "Products - view only",
        "Stock - view alerts only",
      ],
      denied: [
        "Cannot approve / reject reservations",
        "Cannot void sales",
        "No access to reports, audit logs, suppliers, users",
      ],
    },
    {
      role: CASHIER,
      title: "Cashier",
      allowed: [
        "POS - process sales only",
        "Reservations - view, mark ready, convert",
      ],
      denied: [
        "Cannot void sales",
        "No AI, no products, no stock",
        "No reports, no audit logs",
        "Sales history: own sales only",
      ],
    },
  ];

  return (
    <section className={styles.roleReference}>
      <h2>Role Permissions Reference</h2>
      <div className={styles.roleGrid}>
        {columns.map((column) => (
          <article key={column.role}>
            <header>
              <strong>{column.title}</strong>
              <span className={`${styles.roleBadge} ${roleBadgeClass(column.role)}`}>{roleLabel(column.role)}</span>
            </header>
            {[...column.allowed.map((item) => ({ item, ok: true })), ...column.denied.map((item) => ({ item, ok: false }))].map(({ item, ok }) => (
              <p key={item} className={ok ? styles.allowed : styles.denied}>
                <span>{ok ? "OK" : "NO"}</span>
                {item}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
