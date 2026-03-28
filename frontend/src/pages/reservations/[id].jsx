import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import ReservationDetail from "@/components/reservations/ReservationDetail";
import styles from "@/styles/ReservationDetailPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist", "assistant", "cashier"]);

const MOCK_RESERVATIONS = {
  r1: {
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
  r2: {
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
  r3: {
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
};

export default function ReservationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // TODO: replace with real SWR fetch: useSWR(id ? `/api/reservations/${id}` : null, fetcher)
  const [reservation, setReservation] = useState(
    id ? MOCK_RESERVATIONS[id] ?? null : null
  );

  if (!id) return null;

  if (!reservation) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.push("/reservations")}>
          ← Back to Reservations
        </button>
        <p>Reservation not found.</p>
      </div>
    );
  }

  async function handleStatusChange(newStatus) {
    // TODO: replace with real API call: await api.patch(`/api/reservations/${id}/status`, { status: newStatus })
    setReservation((prev) => ({ ...prev, status: newStatus }));
    toast.success(`Reservation marked as ${newStatus}.`);
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/reservations")}>
        ← Back to Reservations
      </button>
      <div className={styles.card}>
        <ReservationDetail
          reservation={reservation}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}

ReservationDetailPage.getLayout = AppLayout.getLayout;
