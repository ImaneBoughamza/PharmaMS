import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ArrowLeft, Check, Package, Ban, ShoppingCart } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ReservationDetail from "@/components/reservations/ReservationDetail";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/ReservationDetailPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([ROLES.PHARMACIST, ROLES.ASSISTANT, ROLES.CASHIER]);

const MOCK_USER = { id: "u1", role: "pharmacist", name: "Imane B." };

const MOCK_RESERVATIONS = {
  r1: {
    _id: "r1",
    trackingCode: "RES-2026-001",
    customerName: "Ahmed Benali",
    phone: "+212 612345678",
    email: "ahmed.benali@example.com",
    items: [
      { productName: "Paracetamol 500mg", productType: "medicine", qty: 2, unitPrice: 18 },
    ],
    pickupDate: "2026-04-28",
    paymentMethod: "Pay on Pickup",
    status: "pending",
    notes: "",
    createdAt: "2026-04-26T09:00:00.000Z",
  },
  r2: {
    _id: "r2",
    trackingCode: "RES-2026-002",
    customerName: "Fatima Zahra",
    phone: "+212 698765432",
    email: "fatima.zahra@example.com",
    items: [
      { productName: "Vitamin C 1000mg",  productType: "medicine",     qty: 1, unitPrice: 42 },
      { productName: "Sunscreen SPF50+",  productType: "parapharmacy", qty: 1, unitPrice: 85 },
    ],
    pickupDate: "2026-04-27",
    paymentMethod: "Online Payment",
    status: "confirmed",
    notes: "Please pack separately.",
    createdAt: "2026-04-25T14:30:00.000Z",
  },
  r3: {
    _id: "r3",
    trackingCode: "RES-2026-003",
    customerName: "Youssef El Amrani",
    phone: "+212 655443322",
    email: "youssef.elamrani@example.com",
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
  r4: {
    _id: "r4",
    trackingCode: "RES-2026-004",
    customerName: "Nadia Chraibi",
    phone: "+212 677889900",
    email: "nadia.chraibi@example.com",
    items: [
      { productName: "Cough Syrup", productType: "medicine", qty: 1, unitPrice: 39 },
    ],
    pickupDate: "2026-04-20",
    paymentMethod: "Pay on Pickup",
    status: "expired",
    notes: "",
    createdAt: "2026-04-17T16:00:00.000Z",
  },
  r5: {
    _id: "r5",
    trackingCode: "RES-2026-005",
    customerName: "Karim Mansouri",
    phone: "+212 661122334",
    email: "karim.mansouri@example.com",
    items: [
      { productName: "Vitamin D3", productType: "medicine", qty: 2, unitPrice: 48 },
    ],
    pickupDate: "2026-04-22",
    paymentMethod: "Online Payment",
    status: "cancelled",
    notes: "Customer changed mind.",
    rejectionReason: "Customer called to cancel — they found the medication at another pharmacy.",
    createdAt: "2026-04-19T08:30:00.000Z",
  },
  r6: {
    _id: "r6",
    trackingCode: "RES-2026-006",
    customerName: "Sara El Idrissi",
    phone: "+212 677001122",
    email: "sara.elidrissi@example.com",
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
};

export default function ReservationDetailPage() {
  const router  = useRouter();
  const { id }  = router.query;

  const [reservation, setReservation] = useState(
    id ? MOCK_RESERVATIONS[id] ?? null : null
  );

  if (!id) return null;

  if (!reservation) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.push("/reservations")}>
          <ArrowLeft size={15} />
          Back to Reservations
        </button>
        <p className={styles.notFound}>Reservation not found.</p>
      </div>
    );
  }

  const { status }   = reservation;
  const userRole     = MOCK_USER.role;

  function handleStatusChange(newStatus) {
    setReservation((prev) => ({ ...prev, status: newStatus }));
    const label =
      newStatus === "confirmed" ? "Reservation confirmed." :
      newStatus === "ready"     ? "Reservation marked as ready." :
      newStatus === "cancelled" ? "Reservation cancelled." :
      `Reservation marked as ${newStatus}.`;
    toast.success(label);
  }

  function handleConvertToSale() {
    toast.success("Opening POS — reservation items pre-loaded.");
    router.push("/pos");
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.back} onClick={() => router.push("/reservations")}>
            <ArrowLeft size={15} />
            Back to Reservations
          </button>
          <div>
            <h1 className={styles.title}>Reservation {reservation.trackingCode}</h1>
            <p className={styles.subtitle}>
              Submitted {formatDate(reservation.createdAt)} by {reservation.customerName}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {status === "pending" && userRole === "pharmacist" && (
            <>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                onClick={() => handleStatusChange("confirmed")}
              >
                <Check size={15} />
                Confirm Reservation
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                onClick={() => handleStatusChange("cancelled")}
              >
                <Ban size={15} />
                Cancel
              </button>
            </>
          )}

          {status === "confirmed" && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => handleStatusChange("ready")}
            >
              <Package size={15} />
              Mark as Ready
            </button>
          )}
          {status === "confirmed" && userRole === "pharmacist" && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={() => handleStatusChange("cancelled")}
            >
              <Ban size={15} />
              Cancel
            </button>
          )}

          {status === "ready" && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
              onClick={handleConvertToSale}
            >
              <ShoppingCart size={15} />
              Convert to Sale
            </button>
          )}
          {status === "ready" && userRole === "pharmacist" && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={() => handleStatusChange("cancelled")}
            >
              <Ban size={15} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Two-column content */}
      <ReservationDetail reservation={reservation} />
    </div>
  );
}

ReservationDetailPage.getLayout = AppLayout.getLayout;
