import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "@/styles/ProfilePage.module.css";

// TODO: replace with useAuth() hook when auth is ready
const MOCK_USER = {
  _id: "u1",
  fullName: "Imane Boughamza",
  email: "imane@pharmaos.ma",
  role: "pharmacist",
  phone: "+212 6 00 11 22 33",
  createdAt: "2025-09-01T00:00:00.000Z",
};

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function getStrength(password) {
  if (!password) return { level: 0, label: "", cls: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: "Weak",   cls: styles.strengthWeak };
  if (score === 2) return { level: 2, label: "Fair",   cls: styles.strengthFair };
  if (score === 3) return { level: 3, label: "Good",   cls: styles.strengthGood };
  return              { level: 4, label: "Strong", cls: styles.strengthStrong };
}

function getSegmentColor(segIndex, level) {
  if (level === 0 || segIndex >= level) return undefined;
  // Map level → colour
  const colors = { 1: "#ef4444", 2: "#f59e0b", 3: "#0891b2", 4: "#10b981" };
  return { background: colors[level] };
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const user = MOCK_USER;
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const newPasswordValue = watch("newPassword", "");
  const strength = getStrength(newPasswordValue);

  async function onSubmit(data) {
    setIsSaving(true);
    try {
      // TODO: await api.patch("/api/auth/change-password", { currentPassword: data.currentPassword, newPassword: data.newPassword });
      await new Promise((r) => setTimeout(r, 700)); // simulate network
      toast.success("Password updated successfully");
      reset();
    } catch (_e) {
      toast.error("Failed to update password. Please check your current password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.grid}>
        {/* Profile card */}
        <div className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{initials(user.fullName)}</div>
          </div>

          <div className={styles.info}>
            <p className={styles.fullName}>{user.fullName}</p>
            <p className={styles.email}>{user.email}</p>
            <Badge variant={user.role === "pharmacist" ? "primary" : user.role === "assistant" ? "info" : "default"}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>

          <div className={styles.divider} />

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Phone</span>
              <span className={styles.metaValue}>{user.phone || "—"}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Role</span>
              <span className={styles.metaValue}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Member since</span>
              <span className={styles.metaValue}>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Password card */}
        <div className={styles.passwordCard}>
          <h2 className={styles.cardTitle}>Change Password</h2>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />

            <Input
              id="newPassword"
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            {/* Strength indicator */}
            {newPasswordValue && (
              <div className={`${styles.strengthWrap} ${strength.cls}`}>
                <div className={styles.strengthBar}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={styles.strengthSegment}
                      style={getSegmentColor(i, strength.level)}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel}>{strength.label}</span>
              </div>
            )}

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className={styles.formActions}>
              <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

ProfilePage.getLayout = AppLayout.getLayout;
