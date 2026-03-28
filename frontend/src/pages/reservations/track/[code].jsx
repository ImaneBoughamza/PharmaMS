import { useState } from "react";
import { useRouter } from "next/router";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/ReservationTrackPage.module.css";

// TODO: replace with real API call: api.get(`/api/reservations/track/${code}`)

const MOCK_DB = {
  "RES-2026-001": {
    trackingCode: "RES-2026-001",
    customerName: "Ahmed Benali",
    medicine: { name: "Paracetamol 500mg" },
    qty: 2,
    pickupDate: "2026-04-10",
    paymentMethod: "Pay on Pickup",
    status: "pending",
  },
  "RES-2026-002": {
    trackingCode: "RES-2026-002",
    customerName: "Fatima Zahra",
    medicine: { name: "Vitamin C 1000mg" },
    qty: 1,
    pickupDate: "2026-04-11",
    paymentMethod: "Online Payment",
    status: "confirmed",
  },
  "RES-2026-003": {
    trackingCode: "RES-2026-003",
    customerName: "Youssef El Amrani",
    medicine: { name: "Ibuprofen 400mg" },
    qty: 3,
    pickupDate: "2026-04-09",
    paymentMethod: "Pay on Pickup",
    status: "ready",
  },
};

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "info",
  ready: "success",
  completed: "neutral",
  cancelled: "error",
};

const ALL_STEPS = ["pending", "confirmed", "ready", "completed"];

function stepState(step, currentStatus) {
  if (currentStatus === "cancelled") return "done";
  const currentIdx = ALL_STEPS.indexOf(currentStatus);
  const stepIdx = ALL_STEPS.indexOf(step);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "idle";
}

function PillIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
      <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function ReservationTrackPage() {
  const router = useRouter();
  const { code: urlCode } = router.query;

  const [inputCode, setInputCode] = useState(urlCode ?? "");
  const [result, setResult] = useState(urlCode ? MOCK_DB[urlCode] ?? "not_found" : null);

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) return;
    // TODO: replace with real API call
    const found = MOCK_DB[trimmed];
    setResult(found ?? "not_found");
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push("/")}>
          <div className={styles.brandIcon}><PillIcon /></div>
          <div className={styles.brandTitle}>PharmaOS</div>
        </div>
        <button className={styles.newResBtn} onClick={() => router.push("/reservations/new")}>
          Make a Reservation
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.heading}>Track Your Reservation</h1>
        <p className={styles.subheading}>
          Enter the tracking code you received after submitting your reservation.
        </p>

        <div className={styles.searchCard}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputWrap}>
              <SearchIcon />
              <input
                type="text"
                placeholder="e.g. RES-2026-001"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.searchBtn}>
              Track Reservation
            </button>
          </form>
        </div>

        {result === "not_found" && (
          <div className={styles.notFound}>
            No reservation found with that code. Please check and try again.
          </div>
        )}

        {result && result !== "not_found" && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.codeLabel}>Tracking Code</p>
                <h2 className={styles.codeValue}>{result.trackingCode}</h2>
              </div>
              <Badge variant={STATUS_VARIANT[result.status] ?? "neutral"}>
                {result.status}
              </Badge>
            </div>

            <dl className={styles.dl}>
              <div className={styles.dlRow}>
                <dt>Customer</dt>
                <dd>{result.customerName}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Medicine</dt>
                <dd>{result.medicine?.name ?? "—"}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Quantity</dt>
                <dd>{result.qty}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Pickup Date</dt>
                <dd>{formatDate(result.pickupDate)}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Payment</dt>
                <dd>{result.paymentMethod}</dd>
              </div>
            </dl>

            {result.status !== "cancelled" && (
              <div className={styles.statusTimeline}>
                <p className={styles.timelineTitle}>Progress</p>
                {ALL_STEPS.map((step) => {
                  const state = stepState(step, result.status);
                  return (
                    <div key={step} className={styles.step}>
                      <div className={`${styles.stepDot}${state !== "idle" ? " " + styles[state] : ""}`} />
                      <span className={`${styles.stepLabel}${state !== "idle" ? " " + styles[state] : ""}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
