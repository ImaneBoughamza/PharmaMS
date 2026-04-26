import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Search, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ReservationTable from "@/components/reservations/ReservationTable";
import DemandAlert from "@/components/reservations/DemandAlert";
import DemandModal from "@/components/reservations/DemandModal";
import styles from "@/styles/ReservationsPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([ROLES.PHARMACIST, ROLES.ASSISTANT, ROLES.CASHIER]);

const MOCK_USER = { id: "u1", role: "pharmacist", name: "Imane B." };

const PAGE_SIZE = 20;

const STATUSES = ["all", "pending", "confirmed", "ready", "expired", "cancelled"];

const SORT_OPTIONS = [
  { value: "newest",         label: "Newest First" },
  { value: "oldest",         label: "Oldest First" },
  { value: "pickup-soonest", label: "Pickup Date (Soonest)" },
  { value: "name-az",        label: "Customer Name A-Z" },
  { value: "status",         label: "Status" },
];

const STATUS_ORDER = { pending: 0, confirmed: 1, ready: 2, expired: 3, cancelled: 4 };

// Alerts derived from 30-day demand data (products with >30% increase)
const MOCK_ALERTS = [
  { id: "alert-sunscreen",        productName: "Sunscreen SPF50+",     changePercent: 80 },
  { id: "alert-paracetamol",      productName: "Paracetamol 500mg",    changePercent: 75 },
  { id: "alert-hand-sanitizer",   productName: "Hand Sanitizer 500ml", changePercent: 67 },
];

const MOCK_RESERVATIONS = [
  {
    _id: "r1",
    trackingCode: "RES-2026-001",
    customerName: "Ahmed Benali",
    phone: "+212 612345678",
    items: [
      { productName: "Paracetamol 500mg", productType: "medicine", qty: 2, unitPrice: 18 },
    ],
    pickupDate: "2026-04-28",
    paymentMethod: "Pay on Pickup",
    status: "pending",
    notes: "",
    createdAt: "2026-04-26T09:00:00.000Z",
  },
  {
    _id: "r2",
    trackingCode: "RES-2026-002",
    customerName: "Fatima Zahra",
    phone: "+212 698765432",
    items: [
      { productName: "Vitamin C 1000mg", productType: "medicine",     qty: 1, unitPrice: 42 },
      { productName: "Sunscreen SPF50+", productType: "parapharmacy", qty: 1, unitPrice: 85 },
    ],
    pickupDate: "2026-04-29",
    paymentMethod: "Online Payment",
    status: "confirmed",
    notes: "Please pack separately.",
    createdAt: "2026-04-25T14:30:00.000Z",
  },
  {
    _id: "r3",
    trackingCode: "RES-2026-003",
    customerName: "Youssef El Amrani",
    phone: "+212 655443322",
    items: [
      { productName: "Ibuprofen 400mg",      productType: "medicine",     qty: 3, unitPrice: 24 },
      { productName: "Hand Sanitizer 500ml", productType: "parapharmacy", qty: 2, unitPrice: 28 },
      { productName: "Efferalgan 500mg",     productType: "medicine",     qty: 1, unitPrice: 21 },
    ],
    pickupDate: "2026-04-27",
    paymentMethod: "Pay on Pickup",
    status: "ready",
    notes: "",
    createdAt: "2026-04-24T11:00:00.000Z",
  },
  {
    _id: "r4",
    trackingCode: "RES-2026-004",
    customerName: "Nadia Chraibi",
    phone: "+212 677889900",
    items: [
      { productName: "Cough Syrup", productType: "medicine", qty: 1, unitPrice: 39 },
    ],
    pickupDate: "2026-04-20",
    paymentMethod: "Pay on Pickup",
    status: "expired",
    notes: "",
    createdAt: "2026-04-17T16:00:00.000Z",
  },
  {
    _id: "r5",
    trackingCode: "RES-2026-005",
    customerName: "Karim Mansouri",
    phone: "+212 661122334",
    items: [
      { productName: "Vitamin D3", productType: "medicine", qty: 2, unitPrice: 48 },
    ],
    pickupDate: "2026-04-22",
    paymentMethod: "Online Payment",
    status: "cancelled",
    notes: "Customer changed mind.",
    createdAt: "2026-04-19T08:30:00.000Z",
  },
  {
    _id: "r6",
    trackingCode: "RES-2026-006",
    customerName: "Sara El Idrissi",
    phone: "+212 677001122",
    items: [
      { productName: "Baby Shampoo",     productType: "parapharmacy", qty: 2, unitPrice: 35 },
      { productName: "Sunscreen SPF50+", productType: "parapharmacy", qty: 1, unitPrice: 85 },
    ],
    pickupDate: "2026-04-20",
    paymentMethod: "Online Payment",
    status: "pending",
    notes: "",
    createdAt: "2026-04-18T10:00:00.000Z",
  },
];

function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function ReservationsPage() {
  const [reservations,    setReservations]    = useState(MOCK_RESERVATIONS);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [typeFilter,      setTypeFilter]      = useState("all");
  const [payFilter,       setPayFilter]       = useState("all");
  const [pickupFrom,      setPickupFrom]      = useState("");
  const [pickupTo,        setPickupTo]        = useState("");
  const [sortBy,          setSortBy]          = useState("newest");
  const [currentPage,     setCurrentPage]     = useState(1);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

  const canSeeDemand = MOCK_USER.role === "pharmacist" || MOCK_USER.role === "assistant";

  // 300 ms debounce on search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters / sort change
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

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (typeFilter === "medicines") {
      list = list.filter((r) => r.items.every((i) => i.productType === "medicine"));
    } else if (typeFilter === "parapharmacy") {
      list = list.filter((r) => r.items.every((i) => i.productType !== "medicine"));
    } else if (typeFilter === "mixed") {
      list = list.filter((r) => {
        const hasMed  = r.items.some((i) => i.productType === "medicine");
        const hasPara = r.items.some((i) => i.productType !== "medicine");
        return hasMed && hasPara;
      });
    }

    if (payFilter === "online") {
      list = list.filter((r) => r.paymentMethod === "Online Payment");
    } else if (payFilter === "pickup") {
      list = list.filter((r) => r.paymentMethod === "Pay on Pickup");
    }

    if (pickupFrom) list = list.filter((r) => r.pickupDate >= pickupFrom);
    if (pickupTo)   list = list.filter((r) => r.pickupDate <= pickupTo);

    switch (sortBy) {
      case "newest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
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
    }

    return list;
  }, [reservations, debouncedSearch, statusFilter, typeFilter, payFilter, pickupFrom, pickupTo, sortBy]);

  const totalPages          = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedReservations = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const paginationRange     = getPaginationRange(currentPage, totalPages);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    payFilter !== "all" ||
    pickupFrom !== "" ||
    pickupTo !== "";

  const visibleAlerts = canSeeDemand
    ? MOCK_ALERTS.filter((a) => !dismissedAlerts.has(a.id)).slice(0, 3)
    : [];

  function handleDismissAlert(id) {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  }

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPayFilter("all");
    setPickupFrom("");
    setPickupTo("");
  }

  function handleStatusChange(id, newStatus) {
    // TODO: replace with real API call: await api.patch(`/api/reservations/${id}/status`, { status: newStatus })
    setReservations((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
    );
    const label =
      newStatus === "confirmed" ? "Reservation approved." :
      newStatus === "ready"     ? "Reservation marked as ready." :
      newStatus === "cancelled" ? "Reservation cancelled." :
      `Reservation marked as ${newStatus}.`;
    toast.success(label);
  }

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Reservations</h1>
            <p className={styles.subtitle}>Customer reservation requests</p>
          </div>
          {canSeeDemand && (
            <button
              type="button"
              className={styles.monitorBtn}
              onClick={() => setIsDemandModalOpen(true)}
            >
              <TrendingUp size={15} />
              Monitor Demand
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Row 1 — search */}
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
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Row 2 — filters */}
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

            <select
              className={styles.select}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="medicines">Medicines Only</option>
              <option value="parapharmacy">Parapharmacy Only</option>
              <option value="mixed">Mixed</option>
            </select>

            <select
              className={styles.select}
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="online">Online</option>
              <option value="pickup">Pay on Pickup</option>
            </select>

            <div className={styles.dateRange}>
              <input
                type="date"
                className={styles.dateInput}
                value={pickupFrom}
                onChange={(e) => setPickupFrom(e.target.value)}
                aria-label="Pickup date from"
              />
              <span className={styles.dateRangeSep}>—</span>
              <input
                type="date"
                className={styles.dateInput}
                value={pickupTo}
                onChange={(e) => setPickupTo(e.target.value)}
                aria-label="Pickup date to"
              />
            </div>

            <select
              className={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Demand alert banners */}
        {visibleAlerts.length > 0 && (
          <div className={styles.alertsStack}>
            {visibleAlerts.map((alert) => (
              <DemandAlert
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
                onViewDemand={() => setIsDemandModalOpen(true)}
              />
            ))}
          </div>
        )}

        {/* Table card */}
        <div className={styles.card}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              {!hasActiveFilters ? (
                <>
                  <p className={styles.emptyTitle}>No reservations found</p>
                  <p className={styles.emptySubtext}>
                    Customers can submit reservations through the public portal
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.emptyTitle}>No reservations match your filters</p>
                  <button
                    type="button"
                    className={styles.clearFiltersBtn}
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <ReservationTable
              reservations={paginatedReservations}
              userRole={MOCK_USER.role}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              aria-label="Previous page"
            >
              ←
            </button>

            {paginationRange.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`${styles.pageBtn}${currentPage === page ? " " + styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Demand modal — rendered outside page flow to avoid z-index issues */}
      <DemandModal
        isOpen={isDemandModalOpen}
        userRole={MOCK_USER.role}
        onClose={() => setIsDemandModalOpen(false)}
      />
    </>
  );
}

ReservationsPage.getLayout = AppLayout.getLayout;
