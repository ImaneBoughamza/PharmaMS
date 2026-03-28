import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./ReservationDetail.module.css";

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "info",
  ready: "success",
  completed: "neutral",
  cancelled: "error",
};

export default function ReservationDetail({ reservation, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action) {
    setIsLoading(true);
    try {
      await onStatusChange(action);
    } finally {
      setIsLoading(false);
    }
  }

  const { status } = reservation;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.codeLabel}>Reservation Code</p>
          <h2 className={styles.code}>{reservation.trackingCode}</h2>
        </div>
        <Badge variant={STATUS_VARIANT[status] ?? "neutral"} size="lg">
          {status}
        </Badge>
      </div>

      <div className={styles.grid}>
        {/* Customer Info */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Customer</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Name</dt>
              <dd>{reservation.customerName}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Phone</dt>
              <dd>{reservation.phone}</dd>
            </div>
          </dl>
        </section>

        {/* Medicine Info */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Medicine</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Name</dt>
              <dd>{reservation.medicine?.name ?? "—"}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Quantity</dt>
              <dd>{reservation.qty}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Unit Price</dt>
              <dd>{reservation.medicine?.salePrice != null ? formatCurrency(reservation.medicine.salePrice) : "—"}</dd>
            </div>
          </dl>
        </section>

        {/* Reservation Info */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Details</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Pickup Date</dt>
              <dd>{formatDate(reservation.pickupDate)}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Payment</dt>
              <dd>{reservation.paymentMethod}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Created</dt>
              <dd>{formatDate(reservation.createdAt)}</dd>
            </div>
          </dl>
        </section>

        {/* Notes */}
        {reservation.notes && (
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Notes</h3>
            <p className={styles.notes}>{reservation.notes}</p>
          </section>
        )}
      </div>

      {/* Actions */}
      {status !== "completed" && status !== "cancelled" && (
        <div className={styles.actions}>
          {status === "pending" && (
            <>
              <Button
                variant="primary"
                isLoading={isLoading}
                onClick={() => handleAction("confirmed")}
              >
                Confirm Reservation
              </Button>
              <Button
                variant="danger"
                isLoading={isLoading}
                onClick={() => handleAction("cancelled")}
              >
                Cancel
              </Button>
            </>
          )}
          {status === "confirmed" && (
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => handleAction("ready")}
            >
              Mark as Ready
            </Button>
          )}
          {status === "ready" && (
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => handleAction("completed")}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
