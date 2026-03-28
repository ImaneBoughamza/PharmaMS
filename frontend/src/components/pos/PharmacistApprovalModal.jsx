import { useEffect, useState } from "react";
import styles from "./PharmacistApprovalModal.module.css";

const COUNTDOWN = 120;

export default function PharmacistApprovalModal({ isOpen, status, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);

  useEffect(() => {
    if (!isOpen || status !== "waiting") return;
    setSecondsLeft(COUNTDOWN);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, status]);

  if (!isOpen) return null;

  const progress = (secondsLeft / COUNTDOWN) * 100;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {status === "waiting" && (
          <>
            <div className={styles.iconWrap}>
              <div className={styles.pulse} />
              <span className={styles.icon}>⏳</span>
            </div>
            <h2 className={styles.title}>Awaiting Pharmacist Approval</h2>
            <p className={styles.desc}>
              This sale contains a regulated item and requires pharmacist approval.
              A notification has been sent to all online pharmacists.
            </p>
            <div className={styles.timerWrap}>
              <div className={styles.timerBar}>
                <div className={styles.timerFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.timerText}>{secondsLeft}s remaining</span>
            </div>
            {secondsLeft === 0 && (
              <p className={styles.timeout}>No response received. Sale cancelled.</p>
            )}
          </>
        )}

        {status === "approved" && (
          <>
            <div className={styles.iconWrap}>
              <span className={styles.iconSuccess}>✓</span>
            </div>
            <h2 className={styles.titleSuccess}>Sale Approved</h2>
            <p className={styles.desc}>The pharmacist has approved this sale. Processing…</p>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className={styles.iconWrap}>
              <span className={styles.iconError}>✕</span>
            </div>
            <h2 className={styles.titleError}>Sale Rejected</h2>
            <p className={styles.desc}>The pharmacist has rejected this sale. Please review the items.</p>
            <button className={styles.closeBtn} onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}
