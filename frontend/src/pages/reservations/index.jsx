import { useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import ReservationTable from "@/components/reservations/ReservationTable";
import Button from "@/components/ui/Button";
import styles from "@/styles/ReservationsPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist", "assistant", "cashier"]);

const STATUSES = ["all", "pending", "confirmed", "ready", "completed", "cancelled"];

const MOCK_RESERVATIONS = [
  {
    _id: "r1",
    trackingCode: "RES-2026-001",
    customerName: "Ahmed Benali",
    phone: "+212 612345678",
    medicine: { name: "Paracetamol 500mg", salePrice: 18 },
    qty: 2,
    pickupDate: "2026-04-10",
    paymentMethod: "Pay on Pickup",
    status: "pending",
    notes: "",
    createdAt: "2026-03-28",
  },
  {
    _id: "r2",
    trackingCode: "RES-2026-002",
    customerName: "Fatima Zahra",
    phone: "+212 698765432",
    medicine: { name: "Vitamin C 1000mg", salePrice: 42 },
    qty: 1,
    pickupDate: "2026-04-11",
    paymentMethod: "Online Payment",
    status: "confirmed",
    notes: "Please pack separately.",
    createdAt: "2026-03-27",
  },
  {
    _id: "r3",
    trackingCode: "RES-2026-003",
    customerName: "Youssef El Amrani",
    phone: "+212 655443322",
    medicine: { name: "Ibuprofen 400mg", salePrice: 24 },
    qty: 3,
    pickupDate: "2026-04-09",
    paymentMethod: "Pay on Pickup",
    status: "ready",
    notes: "",
    createdAt: "2026-03-26",
  },
  {
    _id: "r4",
    trackingCode: "RES-2026-004",
    customerName: "Nadia Chraibi",
    phone: "+212 677889900",
    medicine: { name: "Cough Syrup", salePrice: 39 },
    qty: 1,
    pickupDate: "2026-04-05",
    paymentMethod: "Pay on Pickup",
    status: "completed",
    notes: "",
    createdAt: "2026-03-24",
  },
  {
    _id: "r5",
    trackingCode: "RES-2026-005",
    customerName: "Karim Mansouri",
    phone: "+212 661122334",
    medicine: { name: "Vitamin D3", salePrice: 48 },
    qty: 2,
    pickupDate: "2026-04-08",
    paymentMethod: "Online Payment",
    status: "cancelled",
    notes: "Customer changed mind.",
    createdAt: "2026-03-25",
  },
];

export default function ReservationsPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState("all");

  // TODO: replace with real SWR fetch
  const reservations = MOCK_RESERVATIONS;

  const filtered =
    activeStatus === "all"
      ? reservations
      : reservations.filter((r) => r.status === activeStatus);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Reservations</h1>
        <Button variant="primary" onClick={() => router.push("/reservations/staff/new")}>
          + New Reservation
        </Button>
      </div>

      <div className={styles.filters}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn}${activeStatus === s ? " " + styles.active : ""}`}
            onClick={() => setActiveStatus(s)}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <ReservationTable reservations={filtered} />
      </div>
    </div>
  );
}

ReservationsPage.getLayout = AppLayout.getLayout;
