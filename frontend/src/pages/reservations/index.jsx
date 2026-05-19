import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Search, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ReservationTable from "@/components/reservations/ReservationTable";
import DemandAlert from "@/components/reservations/DemandAlert";
import DemandModal from "@/components/reservations/DemandModal";
import api from "@/lib/axios";
import { withRoleGuard } from "@/utils/roleGuard";
import styles from "@/styles/ReservationsPage.module.css";

export const getServerSideProps = withRoleGuard(["pharmacist", "assistant", "cashier"]);

const PAGE_SIZE = 20;
const STATUSES = ["all", "pending", "confirmed", "ready", "expired", "cancelled"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "pickup-soonest", label: "Pickup Date (Soonest)" },
  { value: "name-az", label: "Customer Name A-Z" },
  { value: "status", label: "Status" },
];
const STATUS_ORDER = { pending: 0, confirmed: 1, ready: 2, expired: 3, cancelled: 4 };

function paymentLabel(value) {
  if (value === "online" || value === "card") return "Online Payment";
  return "Pay on Pickup";
}

function normalizeReservation(reservation) {
  return {
    ...reservation,
    trackingCode: reservation.confirmationCode,
    phone: reservation.customerPhone || reservation.customerId?.phone || "",
    email: reservation.customerEmail || reservation.customerId?.email || "",
    pickupDate: (reservation.pickupDate || reservation.expiresAt || reservation.createdAt || "").slice(0, 10),
    paymentMethod: paymentLabel(reservation.paymentMethod),
    items: (reservation.items || []).map((item) => ({
      ...item,
      productName: item.name || item.product?.name || item.productName || "Unknown product",
      unitPrice: Number(item.salePrice ?? item.unitPrice ?? item.product?.salePrice ?? 0),
    })),
  };
}

function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function ReservationsPage({ user }) {
  const [reservations, setReservations] = useState([]);
  const [demandAlerts, setDemandAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [pickupFrom, setPickupFrom] = useState("");
  const [pickupTo, setPickupTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

  const canSeeDemand = user.role === "pharmacist" || user.role === "assistant";

  async function loadReservations() {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await api.get("/api/reservations", { params: { limit: 500 } });
      setReservations((response.data.data || []).map(normalizeReservation));
    } catch (err) {
      setLoadError(err.response?.data?.message || "Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (!canSeeDemand) return;
    api
      .get("/api/reservations/demand")
      .then((response) => setDemandAlerts(response.data.data || []))
      .catch(() => setDemandAlerts([]));
  }, [canSeeDemand]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, payFilter, pickupFrom, pickupTo, sortBy]);

  const filtered = useMemo(() => {
    let list = [...reservations];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.trackingCode.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);

    if (typeFilter === "medicines") {
      list = list.filter((r) => r.items.every((i) => i.productType === "medicine"));
    } else if (typeFilter === "parapharmacy") {
      list = list.filter((r) => r.items.every((i) => i.productType !== "medicine"));
    } else if (typeFilter === "mixed") {
      list = list.filter((r) => {
        const hasMed = r.items.some((i) => i.productType === "medicine");
        const hasPara = r.items.some((i) => i.productType !== "medicine");
        return hasMed && hasPara;
      });
    }

    if (payFilter === "online") list = list.filter((r) => r.paymentMethod === "Online Payment");
    if (payFilter === "pickup") list = list.filter((r) => r.paymentMethod === "Pay on Pickup");
    if (pickupFrom) list = list.filter((r) => r.pickupDate >= pickupFrom);
    if (pickupTo) list = list.filter((r) => r.pickupDate <= pickupTo);

    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "pickup-soonest":
        list.sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
        break;
      case "name-az":
        list.sort((a, b) => a.customerName.localeCompare(b.customerName));
        break;
      case "status":
        list.sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [reservations, debouncedSearch, statusFilter, typeFilter, payFilter, pickupFrom, pickupTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedReservations = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const paginationRange = getPaginationRange(currentPage, totalPages);
  const hasActiveFilters =
    debouncedSearch !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    payFilter !== "all" ||
    pickupFrom !== "" ||
    pickupTo !== "";

  const visibleAlerts = canSeeDemand
    ? demandAlerts
        .filter((alert) => Math.abs(alert.changePercent || 0) >= 20)
        .filter((alert) => !dismissedAlerts.has(alert.productId || alert.id))
        .slice(0, 3)
        .map((alert) => ({
          id: alert.productId || `${alert.productName}-${alert.changePercent}`,
          productName: alert.productName,
          changePercent: alert.changePercent,
        }))
    : [];

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPayFilter("all");
    setPickupFrom("");
    setPickupTo("");
  }

  async function handleStatusChange(id, newStatus) {
    try {
      if (newStatus === "confirmed") await api.patch(`/api/reservations/${id}/confirm`);
      if (newStatus === "ready") await api.patch(`/api/reservations/${id}/ready`);
      if (newStatus === "cancelled") {
        const reservation = reservations.find((item) => item._id === id);
        if (reservation?.status === "pending" && user.role === "pharmacist") {
          await api.patch(`/api/reservations/${id}/reject`, { reason: "Rejected from reservations list" });
        } else {
          await api.patch(`/api/reservations/${id}/cancel`);
        }
      }
      await loadReservations();
      const label =
        newStatus === "confirmed" ? "Reservation approved." :
        newStatus === "ready" ? "Reservation marked as ready." :
        newStatus === "cancelled" ? "Reservation cancelled." :
        `Reservation marked as ${newStatus}.`;
      toast.success(label);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation action failed");
    }
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Reservations</h1>
            <p className={styles.subtitle}>Customer reservation requests</p>
          </div>
          {canSeeDemand && (
            <button type="button" className={styles.monitorBtn} onClick={() => setIsDemandModalOpen(true)}>
              <TrendingUp size={15} />
              Monitor Demand
            </button>
          )}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Search size={16} /></span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by customer name, phone, or confirmation code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className={styles.clearSearch} onClick={() => setSearch("")} aria-label="Clear search">
                x
              </button>
            )}
          </div>

          <div className={styles.filterRow}>
            <div className={styles.statusGroup}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.statusBtn}${statusFilter === s ? " " + styles.statusActive : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            <div className={styles.filterSpacer} />

            <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="medicines">Medicines Only</option>
              <option value="parapharmacy">Parapharmacy Only</option>
              <option value="mixed">Mixed</option>
            </select>

            <select className={styles.select} value={payFilter} onChange={(e) => setPayFilter(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="online">Online</option>
              <option value="pickup">Pay on Pickup</option>
            </select>

            <div className={styles.dateRange}>
              <input type="date" className={styles.dateInput} value={pickupFrom} onChange={(e) => setPickupFrom(e.target.value)} aria-label="Pickup date from" />
              <span className={styles.dateRangeSep}>-</span>
              <input type="date" className={styles.dateInput} value={pickupTo} onChange={(e) => setPickupTo(e.target.value)} aria-label="Pickup date to" />
            </div>

            <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {visibleAlerts.length > 0 && (
          <div className={styles.alertsStack}>
            {visibleAlerts.map((alert) => (
              <DemandAlert
                key={alert.id}
                alert={alert}
                onDismiss={(id) => setDismissedAlerts((prev) => new Set([...prev, id]))}
                onViewDemand={() => setIsDemandModalOpen(true)}
              />
            ))}
          </div>
        )}

        <div className={styles.card}>
          {loadError ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>{loadError}</p>
              <button type="button" className={styles.clearFiltersBtn} onClick={loadReservations}>Retry</button>
            </div>
          ) : isLoading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>Loading reservations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              {!hasActiveFilters ? (
                <>
                  <p className={styles.emptyTitle}>No reservations found</p>
                  <p className={styles.emptySubtext}>Customers can submit reservations through the public portal</p>
                </>
              ) : (
                <>
                  <p className={styles.emptyTitle}>No reservations match your filters</p>
                  <button type="button" className={styles.clearFiltersBtn} onClick={handleClearFilters}>Clear filters</button>
                </>
              )}
            </div>
          ) : (
            <ReservationTable reservations={paginatedReservations} userRole={user.role} onStatusChange={handleStatusChange} />
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button type="button" className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} aria-label="Previous page">
              &lt;
            </button>
            {paginationRange.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>...</span>
              ) : (
                <button key={page} type="button" className={`${styles.pageBtn}${currentPage === page ? " " + styles.pageBtnActive : ""}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              )
            )}
            <button type="button" className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} aria-label="Next page">
              &gt;
            </button>
          </div>
        )}
      </div>

      <DemandModal isOpen={isDemandModalOpen} userRole={user.role} onClose={() => setIsDemandModalOpen(false)} />
    </>
  );
}

ReservationsPage.getLayout = AppLayout.getLayout;
