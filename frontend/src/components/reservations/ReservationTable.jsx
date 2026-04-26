import { useRouter } from "next/router";
import { Check, X, Package, Ban, ShoppingCart, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatDate";
import styles from "./ReservationTable.module.css";

const STATUS_VARIANT = {
  pending:   "warning",
  confirmed: "info",
  ready:     "success",
  expired:   "neutral",
  cancelled: "error",
};

function getItemsSummary(items) {
  if (!items?.length) return { lines: ["—"], extra: 0, tooltip: "" };
  const all   = items.map((i) => `${i.productName} ×${i.qty}`);
  const shown = all.slice(0, 2);
  const extra = Math.max(0, all.length - 2);
  return { lines: shown, extra, tooltip: all.join("\n") };
}

function ActionBtn({ icon: Icon, label, className, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.actionBtn} ${className}`}
      title={label}
      onClick={onClick}
      aria-label={label}
    >
      <Icon size={14} />
    </button>
  );
}

export default function ReservationTable({ reservations, userRole, onStatusChange }) {
  const router = useRouter();
  const today  = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Pickup Date</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => {
            const isOverdue  = r.pickupDate < today && (r.status === "pending" || r.status === "confirmed");
            const { lines, extra, tooltip } = getItemsSummary(r.items);

            return (
              <tr key={r._id}>
                {/* Code — clickable */}
                <td>
                  <button
                    type="button"
                    className={styles.codeBtn}
                    onClick={() => router.push(`/reservations/${r._id}`)}
                  >
                    {r.trackingCode}
                  </button>
                </td>

                {/* Customer */}
                <td>
                  <div className={styles.customer}>
                    <span className={styles.customerName}>{r.customerName}</span>
                    <span className={styles.phone}>{r.phone}</span>
                  </div>
                </td>

                {/* Items — with native title tooltip */}
                <td title={tooltip}>
                  <div className={styles.itemsWrap}>
                    {lines.map((line, i) => (
                      <span key={i} className={styles.itemLine}>{line}</span>
                    ))}
                    {extra > 0 && (
                      <span className={styles.moreHint}>+{extra} more</span>
                    )}
                  </div>
                </td>

                {/* Pickup Date — red if overdue */}
                <td className={isOverdue ? styles.overdueDate : undefined}>
                  {formatDate(r.pickupDate)}
                </td>

                {/* Payment badge */}
                <td>
                  <span className={r.paymentMethod === "Online Payment" ? styles.payOnline : styles.payPickup}>
                    {r.paymentMethod === "Online Payment" ? "Online" : "Pay on Pickup"}
                  </span>
                </td>

                {/* Status badge */}
                <td>
                  <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>
                    {r.status}
                  </Badge>
                </td>

                {/* Actions — role + status based */}
                <td>
                  <div className={styles.actions}>
                    {/* Pending: Approve + Reject for pharmacist only */}
                    {r.status === "pending" && userRole === "pharmacist" && (
                      <>
                        <ActionBtn
                          icon={Check}
                          label="Approve"
                          className={styles.actionApprove}
                          onClick={() => onStatusChange(r._id, "confirmed")}
                        />
                        <ActionBtn
                          icon={X}
                          label="Reject"
                          className={styles.actionReject}
                          onClick={() => onStatusChange(r._id, "cancelled")}
                        />
                      </>
                    )}

                    {/* Confirmed: Mark Ready for all; Cancel for pharmacist only */}
                    {r.status === "confirmed" && (
                      <ActionBtn
                        icon={Package}
                        label="Mark Ready"
                        className={styles.actionReady}
                        onClick={() => onStatusChange(r._id, "ready")}
                      />
                    )}
                    {r.status === "confirmed" && userRole === "pharmacist" && (
                      <ActionBtn
                        icon={Ban}
                        label="Cancel"
                        className={styles.actionCancel}
                        onClick={() => onStatusChange(r._id, "cancelled")}
                      />
                    )}

                    {/* Ready: Convert to Sale for all; Cancel for pharmacist only */}
                    {r.status === "ready" && (
                      <ActionBtn
                        icon={ShoppingCart}
                        label="Convert to Sale"
                        className={styles.actionConvert}
                        onClick={() => router.push("/pos")}
                      />
                    )}
                    {r.status === "ready" && userRole === "pharmacist" && (
                      <ActionBtn
                        icon={Ban}
                        label="Cancel"
                        className={styles.actionCancel}
                        onClick={() => onStatusChange(r._id, "cancelled")}
                      />
                    )}

                    {/* View — always shown */}
                    <ActionBtn
                      icon={Eye}
                      label="View"
                      className={styles.actionView}
                      onClick={() => router.push(`/reservations/${r._id}`)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
