import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import styles from "./PharmacistApprovalModal.module.css";

const COUNTDOWN = 120;

export default function PharmacistApprovalModal({
  isOpen,
  status,
  regulatedItems = [],
  approvedBy,
  rejectedBy,
  rejectionReason,
  onCancel,
  onTimeout,
  onBackToCart,
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);

  useEffect(() => {
    if (!isOpen || status !== "waiting") return;
    setSecondsLeft(COUNTDOWN);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          onTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen, status]);

  if (!isOpen) return null;

  const isTerminal = status === "rejected" || status === "timeout";

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Pharmacist Approval Required</h2>
          <p className={styles.subtitle}>This sale contains regulated medicines</p>
        </div>

        {/* Regulated items list */}
        <div className={styles.itemsList}>
          {regulatedItems.map((ci) => (
            <div key={ci.item._id} className={styles.itemRow}>
              <span className={styles.itemName}>{ci.item.name}</span>
              <span className={styles.itemQty}>
                {ci.qty} unit{ci.qty !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Status area */}
        <div className={styles.statusArea}>
          {status === "waiting" && (
            <>
              <div className={styles.waitingRow}>
                <span className={styles.pulseDot} />
                <span className={styles.statusText}>Waiting for pharmacist approval...</span>
              </div>
              <p className={styles.countdown}>{secondsLeft} seconds remaining</p>
              <div className={styles.timerBar}>
                <div
                  className={styles.timerFill}
                  style={{ width: `${(secondsLeft / COUNTDOWN) * 100}%` }}
                />
              </div>
            </>
          )}

          {status === "approved" && (
            <>
              <CheckCircle size={38} className={styles.iconSuccess} strokeWidth={1.75} />
              <p className={styles.statusTextSuccess}>
                Approved by {approvedBy ?? "Pharmacist"}
              </p>
              <p className={styles.autoNote}>Proceeding to checkout in 1 second…</p>
            </>
          )}

          {status === "rejected" && (
            <>
              <XCircle size={38} className={styles.iconError} strokeWidth={1.75} />
              <p className={styles.statusTextError}>
                Rejected by {rejectedBy ?? "Pharmacist"}
              </p>
              {rejectionReason && (
                <p className={styles.rejectionReason}>{rejectionReason}</p>
              )}
            </>
          )}

          {status === "timeout" && (
            <>
              <XCircle size={38} className={styles.iconError} strokeWidth={1.75} />
              <p className={styles.statusTextError}>
                No pharmacist responded within 120 seconds
              </p>
              <p className={styles.rejectionReason}>Sale has been cancelled</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isTerminal ? (
            <button type="button" className={styles.backBtn} onClick={onBackToCart}>
              Back to Cart
            </button>
          ) : (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={status === "approved"}
            >
              Cancel Sale
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
