import { useState } from "react";
import styles from "./ReservationActionModals.module.css";

function TypeBadge({ type }) {
  return (
    <span className={type === "medicine" ? styles.typeMed : styles.typePara}>
      {type === "medicine" ? "Medicine" : "Parapharmacy"}
    </span>
  );
}

function ItemList({ items }) {
  return (
    <div className={styles.itemList}>
      {items.map((item, i) => (
        <div key={i} className={styles.itemRow}>
          <span className={styles.itemName}>{item.productName}</span>
          <span className={styles.itemQty}>×{item.qty}</span>
          <TypeBadge type={item.productType} />
        </div>
      ))}
    </div>
  );
}

function getPrescriptionRequired(reservation) {
  return reservation.prescriptionRequired ||
    reservation.items?.some((item) => item.productType === "medicine" && item.category === "prescription");
}

function ModalBase({ title, onClose, children, footer }) {
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={handleBackdropClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  );
}

export function ApproveModal({ reservation, onClose, onConfirm }) {
  const prescriptionRequired = getPrescriptionRequired(reservation);
  const prescriptionImage = reservation.prescriptionImage || reservation.prescriptionImageUrl;

  return (
    <ModalBase
      title={`Approve Reservation ${reservation.trackingCode}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnSuccess}`} onClick={onConfirm}>
            Confirm Approval
          </button>
        </>
      }
    >
      <p className={styles.bodyText}>
        You are confirming the availability of the following reserved items:
      </p>
      <ItemList items={reservation.items} />
      {prescriptionRequired && (
        <div className={styles.prescriptionReview}>
          <p className={styles.prescriptionNote}>
            Preliminary review only - physical verification required at pickup.
          </p>
          {prescriptionImage && (
            <img src={prescriptionImage} alt="Uploaded prescription" />
          )}
        </div>
      )}
      <p className={`${styles.bodyText} ${styles.bodyTextMuted}`}>
        The customer will be notified by email.
      </p>
    </ModalBase>
  );
}

export function RejectModal({ reservation, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const hasError = touched && reason.trim().length < 10;

  function handleSubmit() {
    setTouched(true);
    if (reason.trim().length < 10) return;
    onConfirm(reason.trim());
  }

  return (
    <ModalBase
      title={`Reject Reservation ${reservation.trackingCode}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleSubmit}>
            Reject Reservation
          </button>
        </>
      }
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="reject-reason">Reason</label>
        <textarea
          id="reject-reason"
          className={styles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Provide a reason for rejection (sent to customer by email)"
        />
        {hasError && (
          <p className={styles.fieldError}>Reason must be at least 10 characters.</p>
        )}
      </div>
    </ModalBase>
  );
}

export function MarkReadyModal({ reservation, onClose, onConfirm }) {
  return (
    <ModalBase
      title={`Mark Ready for Pickup — ${reservation.trackingCode}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onConfirm}>
            Mark as Ready
          </button>
        </>
      }
    >
      <p className={styles.bodyText}>
        Confirm that the following items have been prepared for pickup:
      </p>
      <ItemList items={reservation.items} />
      <p className={`${styles.bodyText} ${styles.bodyTextMuted}`}>
        The customer will be notified by email that their reservation is ready.
      </p>
    </ModalBase>
  );
}

export function CancelModal({ reservation, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  return (
    <ModalBase
      title={`Cancel Reservation ${reservation.trackingCode}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Keep Reservation
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => onConfirm(reason.trim() || null)}
          >
            Cancel Reservation
          </button>
        </>
      }
    >
      <p className={styles.bodyText}>
        This will cancel the reservation and release all reserved stock quantities.
      </p>
      <p className={`${styles.bodyText} ${styles.bodyTextMuted}`}>
        The customer will be notified by email.
      </p>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="cancel-reason">Reason</label>
        <textarea
          id="cancel-reason"
          className={styles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional: reason for cancellation"
        />
      </div>
    </ModalBase>
  );
}
