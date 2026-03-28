import { useRouter } from "next/router";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import styles from "./ReservationTable.module.css";

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "info",
  ready: "success",
  completed: "neutral",
  cancelled: "error",
};

export default function ReservationTable({ reservations }) {
  const router = useRouter();

  if (reservations.length === 0) {
    return <p className={styles.empty}>No reservations found.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Customer</th>
            <th>Medicine</th>
            <th>Qty</th>
            <th>Pickup Date</th>
            <th>Payment</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r._id}>
              <td className={styles.code}>{r.trackingCode}</td>
              <td>
                <div className={styles.customer}>
                  <span>{r.customerName}</span>
                  <span className={styles.phone}>{r.phone}</span>
                </div>
              </td>
              <td>{r.medicine?.name ?? "—"}</td>
              <td>{r.qty}</td>
              <td>{formatDate(r.pickupDate)}</td>
              <td className={styles.payment}>{r.paymentMethod}</td>
              <td>
                <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>
                  {r.status}
                </Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/reservations/${r._id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
