import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  FlaskConical,
  Layers,
  ShoppingCart,
  CalendarCheck,
  ArrowLeftRight,
  Truck,
  BarChart2,
  ClipboardList,
  Bot,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST, ASSISTANT } from "@/constants/roles";
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
      { label: "Products",      href: "/products",     icon: FlaskConical,   roles: [PHARMACIST, ASSISTANT] },
      { label: "Stock",         href: "/stock",        icon: Layers,         roles: [PHARMACIST, ASSISTANT] },
      { label: "Point of Sale", href: "/pos",          icon: ShoppingCart,   roles: [] },
      { label: "Reservations",  href: "/reservations", icon: CalendarCheck,  roles: [] },
      { label: "Customers",     href: "/customers",    icon: Users,          roles: [PHARMACIST, ASSISTANT] },
      { label: "Transactions",  href: "/transactions", icon: ArrowLeftRight, roles: [PHARMACIST] },
      { label: "Suppliers",     href: "/suppliers",    icon: Truck,          roles: [PHARMACIST] },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Reports",      href: "/reports",      icon: BarChart2,     roles: [PHARMACIST] },
      { label: "Audit Logs",   href: "/audit-logs",   icon: ClipboardList, roles: [PHARMACIST] },
      { label: "AI Assistant", href: "/ai-assistant", icon: Bot,           roles: [PHARMACIST, ASSISTANT] },
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
  const { role } = useAuth();

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={[styles.sidebar, isOpen ? styles.open : ""].join(" ")}>

        {/* Logo */}
        <div className={styles.logo}>
          <img className={styles.logoMark} src="/pharmaos-logo.svg" alt="" aria-hidden="true" />
          <span className={styles.logoText}>PharmaMS</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV.map(({ group, items }, groupIndex) => {
            const visible = items.filter(
              (item) => item.roles.length === 0 || item.roles.includes(role)
            );
            if (visible.length === 0) return null;

            return (
              <div key={group} className={styles.group}>
                {groupIndex > 0 && <div className={styles.groupDivider} />}
                <span className={styles.groupLabel}>{group}</span>
                {visible.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[styles.link, active ? styles.active : ""].join(" ")}
                    >
                      <Icon size={15} className={styles.icon} />
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
