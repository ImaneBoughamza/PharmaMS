import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Edit3, Eye, EyeOff } from "lucide-react";
import api from "@/lib/axios";
import AppLayout from "@/components/layout/AppLayout";
import { ASSISTANT, CASHIER, PHARMACIST } from "@/constants/roles";
import { getServerAuthUser } from "@/utils/serverAuth";
import styles from "@/styles/ProfilePage.module.css";

const ROLE_LABELS = {
  [PHARMACIST]: "Pharmacist",
  [ASSISTANT]: "Assistant",
  [CASHIER]: "Cashier",
};

const USED_EMAILS = [
  "sara@pharmaos.ma",
  "ahmed@pharmaos.ma",
  "meryem@pharmaos.ma",
];

const PHARMACY = {
  name: "PharmaMS Central Pharmacy",
  location: "Casablanca, Morocco",
};

function fallbackEmail(role) {
  if (role === ASSISTANT) return "sara@pharmaos.ma";
  if (role === CASHIER) return "ahmed@pharmaos.ma";
  return "imane@pharmaos.ma";
}

function normalizeUser(user) {
  return {
    _id: user?.sub ?? user?._id ?? "mock-profile",
    fullName: user?.fullName ?? user?.name ?? "Imane Boughamza",
    email: user?.email ?? fallbackEmail(user?.role),
    role: user?.role ?? PHARMACIST,
    mustChangePassword: Boolean(user?.mustChangePassword),
    createdAt: user?.createdAt ?? "2026-01-08T09:15:00.000Z",
    lastLoginAt: user?.lastLoginAt ?? "2026-04-27T14:32:00.000Z",
    language: user?.language ?? "fr",
  };
}

function initials(name = "") {
  const cleaned = name
    .replace(/\([^)]*\)/g, "")
    .replace(/^Dr\.\s*/i, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function roleClass(role) {
  if (role === ASSISTANT) return styles.assistant;
  if (role === CASHIER) return styles.cashier;
  return styles.pharmacist;
}

function formatMemberSince(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function formatLastLogin(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", " at");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(password) {
  if (!password || password.length < 8 || /^[a-z]+$/.test(password)) {
    return { label: "Weak", value: 33, className: styles.weak };
  }
  const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 8 && hasMixed && hasNumber && hasSymbol) {
    return { label: "Strong", value: 100, className: styles.strong };
  }
  return { label: "Fair", value: 66, className: styles.fair };
}

export default function ProfilePage({ user }) {
  const initialProfile = useMemo(() => normalizeUser(user), [user]);
  const [profile, setProfile] = useState(initialProfile);
  const [systemUrl, setSystemUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: initialProfile.fullName, email: initialProfile.email });
  const [editErrors, setEditErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({ current: false, next: false, confirm: false });
  const [language, setLanguage] = useState(initialProfile.language);

  const strength = passwordStrength(passwordForm.newPassword);

  useEffect(() => {
    setSystemUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!editing) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") cancelEdit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  function startEdit() {
    setEditForm({ fullName: profile.fullName, email: profile.email });
    setEditErrors({});
    setEditing(true);
  }

  function cancelEdit() {
    setEditForm({ fullName: profile.fullName, email: profile.email });
    setEditErrors({});
    setEditing(false);
  }

  function saveProfile() {
    const errors = {};
    const fullName = editForm.fullName.trim();
    const email = editForm.email.trim().toLowerCase();
    if (fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
    if (fullName.length > 100) errors.fullName = "Full name must be 100 characters or less";
    if (!validateEmail(email)) errors.email = "Enter a valid email address";
    if (email !== profile.email.toLowerCase() && USED_EMAILS.includes(email)) {
      errors.email = "This email is already in use by another account";
    }
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setProfile((current) => ({ ...current, fullName, email }));
    setEditing(false);
    toast.success("Profile updated");
  }

  async function updatePassword() {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required";
    if (passwordForm.newPassword.length < 8) errors.newPassword = "New password must be at least 8 characters";
    if (passwordForm.confirmPassword !== passwordForm.newPassword) errors.confirmPassword = "Passwords must match";
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await api.patch("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      setProfile((current) => ({ ...current, mustChangePassword: false }));
      toast.success("Password updated successfully");
      await window.location.assign("/dashboard");
    } catch (error) {
      if (error.response?.status === 400) {
        setPasswordErrors({ currentPassword: error.response.data?.message || "Current password is incorrect" });
        return;
      }
      toast.error(error.response?.data?.message || "Password update failed");
    }
  }

  function changeLanguage(nextLanguage) {
    const previousLanguage = language;
    try {
      setLanguage(nextLanguage);
      document.documentElement.lang = nextLanguage;
      document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
      setProfile((current) => ({ ...current, language: nextLanguage }));
      toast.success(`Language updated to ${nextLanguage === "ar" ? "العربية" : "Français"}`);
    } catch {
      setLanguage(previousLanguage);
      document.documentElement.lang = previousLanguage;
      document.documentElement.dir = previousLanguage === "ar" ? "rtl" : "ltr";
      toast.error("Failed to update language - please try again");
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(systemUrl);
    toast.success("URL copied to clipboard");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </header>
      {profile.mustChangePassword && (
        <div className={styles.securityCard}>
          <h2>Password Change Required</h2>
          <p>Your pharmacist created this account with a temporary password. Update it before continuing.</p>
        </div>
      )}

      <div className={styles.profileGrid}>
        <aside className={styles.leftColumn}>
          <section className={styles.profileCard}>
            <div className={`${styles.avatar} ${roleClass(profile.role)}`}>{initials(profile.fullName)}</div>
            <h2>{profile.fullName}</h2>
            <span className={`${styles.roleBadge} ${roleClass(profile.role)}`}>{ROLE_LABELS[profile.role]}</span>
            <p>{profile.email}</p>
            <small>Member since {formatMemberSince(profile.createdAt)}</small>
          </section>

          <section className={styles.infoCard}>
            <h2>Pharmacy</h2>
            <InfoRow label="Pharmacy Name" value={PHARMACY.name} />
            <InfoRow label="Location" value={PHARMACY.location} />
            <div className={styles.infoRow}>
              <span>System URL</span>
              <div className={styles.copyRow}>
                <code>{systemUrl || "Loading..."}</code>
                <button type="button" onClick={copyUrl} disabled={!systemUrl} aria-label="Copy system URL" title="Copy system URL">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </section>
        </aside>

        <main className={styles.settingsColumn}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Personal Information</h2>
              {!editing && <button type="button" className={styles.secondaryBtn} onClick={startEdit}><Edit3 size={14} />Edit</button>}
            </div>
            {!editing ? (
              <div className={styles.displayRows}>
                <InfoRow label="Full Name" value={profile.fullName} />
                <InfoRow label="Email" value={profile.email} />
              </div>
            ) : (
              <div className={styles.formGrid}>
                <TextField label="Full Name" value={editForm.fullName} error={editErrors.fullName} onChange={(value) => setEditForm({ ...editForm, fullName: value })} />
                <TextField label="Email" type="email" value={editForm.email} error={editErrors.email} onChange={(value) => setEditForm({ ...editForm, email: value })} />
                <div className={styles.formActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={cancelEdit}>Cancel</button>
                  <button type="button" className={styles.primaryBtn} onClick={saveProfile}>Save Changes</button>
                </div>
              </div>
            )}
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Change Password</h2>
            </div>
            <div className={styles.formGrid}>
              <PasswordField
                label="Current Password"
                value={passwordForm.currentPassword}
                visible={visiblePasswords.current}
                error={passwordErrors.currentPassword}
                toggle={() => setVisiblePasswords((current) => ({ ...current, current: !current.current }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
              />
              <PasswordField
                label="New Password"
                value={passwordForm.newPassword}
                visible={visiblePasswords.next}
                error={passwordErrors.newPassword}
                toggle={() => setVisiblePasswords((current) => ({ ...current, next: !current.next }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              />
              {passwordForm.newPassword && (
                <div className={`${styles.strength} ${strength.className}`}>
                  <div><span style={{ width: `${strength.value}%` }} /></div>
                  <strong>{strength.label}</strong>
                </div>
              )}
              <PasswordField
                label="Confirm Password"
                value={passwordForm.confirmPassword}
                visible={visiblePasswords.confirm}
                error={passwordErrors.confirmPassword}
                toggle={() => setVisiblePasswords((current) => ({ ...current, confirm: !current.confirm }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
              />
              <div className={styles.formActions}>
                <button type="button" className={styles.primaryBtn} onClick={updatePassword}>Update Password</button>
              </div>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Language & Display</h2>
            </div>
            <span className={styles.fieldLabel}>Interface Language</span>
            <div className={styles.languageGrid}>
              <button type="button" className={language === "fr" ? styles.languageActive : ""} onClick={() => changeLanguage("fr")}>
                <strong>Français</strong>
                <small>Left-to-right layout</small>
              </button>
              <button type="button" className={language === "ar" ? styles.languageActive : ""} onClick={() => changeLanguage("ar")}>
                <strong>العربية</strong>
                <small>Right-to-left layout - RTL</small>
              </button>
            </div>
          </section>
        </main>
      </div>

      <section className={styles.securityCard}>
        <h2>Security</h2>
        <InfoRow label="Last Login" value={formatLastLogin(profile.lastLoginAt)} />
        <p>
          {profile.role === PHARMACIST
            ? "You are the pharmacy administrator. If you suspect unauthorised access, change your password immediately."
            : "If you notice any unfamiliar login activity, contact the pharmacist immediately to reset your password."}
        </p>
      </section>
    </div>
  );
}

ProfilePage.getLayout = AppLayout.getLayout;

export async function getServerSideProps(context) {
  const user = await getServerAuthUser(context);
  if (!user) return { redirect: { destination: "/login", permanent: false } };
  if (![PHARMACIST, ASSISTANT, CASHIER].includes(user.role)) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { user } };
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

function PasswordField({ label, value, visible, error, toggle, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.passwordBox}>
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} />
        <button type="button" onClick={toggle} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <em>{error}</em>}
    </label>
  );
}
