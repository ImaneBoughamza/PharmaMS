import { useRouter } from "next/router";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import styles from "@/styles/Topbar.module.css";

const PAGE_TITLES = {
  "/dashboard":        "Dashboard",
  "/inventory":        "Inventory",
  "/inventory/add":    "Add Medicine",
  "/pos":              "Point of Sale",
  "/reservations":     "Reservations",
  "/reservations/new": "New Reservation",
  "/suppliers":        "Suppliers",
  "/suppliers/add":    "Add Supplier",
  "/suppliers/delivery/new": "Register Delivery",
  "/reports":          "Reports",
  "/audit-logs":       "Audit Logs",
  "/ai-assistant":     "AI Assistant",
  "/profile":          "Profile",
  "/settings/users":   "User Management",
};

const ROLE_VARIANT = {
  pharmacist: "info",
  assistant:  "success",
  cashier:    "warning",
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useRouter();
  const { user, role, logout } = useAuth();

  const title = PAGE_TITLES[pathname] ?? "PharmaOS";
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        {role && (
          <Badge variant={ROLE_VARIANT[role] ?? "neutral"}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        )}

        <div className={styles.avatar} title={user?.fullName ?? ""}>
          {initials}
        </div>

        <button className={styles.logout} onClick={logout} aria-label="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
