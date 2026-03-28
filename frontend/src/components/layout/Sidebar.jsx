import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  FlaskConical,
  ShoppingCart,
  CalendarCheck,
  Truck,
  BarChart2,
  ClipboardList,
  Bot,
  Settings,
  User,
  X,
} from "lucide-react";
// TODO: restore useAuth when backend is ready
// import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST, ASSISTANT } from "@/constants/roles";

const MOCK_ROLE = PHARMACIST; // gives full sidebar access during development
import styles from "@/styles/Sidebar.module.css";

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: [] },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Inventory",     href: "/inventory",    icon: FlaskConical,   roles: [PHARMACIST, ASSISTANT] },
      { label: "Point of Sale", href: "/pos",           icon: ShoppingCart,   roles: [] },
      { label: "Reservations",  href: "/reservations", icon: CalendarCheck,  roles: [PHARMACIST, ASSISTANT] },
      { label: "Suppliers",     href: "/suppliers",    icon: Truck,          roles: [PHARMACIST] },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Reports",    href: "/reports",      icon: BarChart2,     roles: [PHARMACIST] },
      { label: "Audit Logs", href: "/audit-logs",   icon: ClipboardList, roles: [PHARMACIST] },
      { label: "AI Assistant", href: "/ai-assistant", icon: Bot,          roles: [PHARMACIST, ASSISTANT] },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Profile",  href: "/profile",        icon: User,     roles: [] },
      { label: "Users",    href: "/settings/users", icon: Settings, roles: [PHARMACIST] },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useRouter();
  // TODO: restore when backend is ready: const { role } = useAuth();
  const role = MOCK_ROLE;

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={[styles.sidebar, isOpen ? styles.open : ""].join(" ")}>
        <div className={styles.logo}>
          <span className={styles.logoText}>PharmaOS</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ group, items }) => {
            const visible = items.filter(
              (item) => item.roles.length === 0 || item.roles.includes(role)
            );
            if (visible.length === 0) return null;

            return (
              <div key={group} className={styles.group}>
                <p className={styles.groupLabel}>{group}</p>
                {visible.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[styles.link, active ? styles.active : ""].join(" ")}
                    >
                      <Icon size={17} className={styles.icon} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
