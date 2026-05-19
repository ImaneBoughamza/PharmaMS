import { useState } from "react";
import { Copy, Check, TriangleAlert, X } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./ReservationDetail.module.css";

const STATUS_LABEL = {
  pending:   "Pending",
  confirmed: "Confirmed",
  ready:     "Ready for Pickup",
  expired:   "Expired",
  cancelled: "Cancelled",
};

const BADGE_CLASS = {
  pending:   styles.badgeWarning,
  confirmed: styles.badgeInfo,
  ready:     styles.badgeSuccess,
  expired:   styles.badgeNeutral,
  cancelled: styles.badgeError,
};

const DOT_CLASS = {
  active: styles.dotActive,
  done:   styles.dotDone,
  idle:   styles.dotIdle,
};

const LABEL_CLASS = {
  active: styles.stepLabelActive,
  done:   styles.stepLabelDone,
  idle:   styles.stepLabelIdle,
};

const CONNECTOR_CLASS = {
  active: styles.connectorDone,
  done:   styles.connectorDone,
  idle:   styles.connectorIdle,
};

function getPrescriptionRequired(reservation) {
  return reservation.prescriptionRequired ||
    reservation.items?.some((item) => item.productType === "medicine" && item.category === "prescription");
}

function getVerifierName(reservation) {
  return reservation.prescriptionVerifiedByName ||
    reservation.prescriptionVerifiedBy?.fullName ||
    reservation.prescriptionVerifiedBy?.name ||
    "pharmacist";
}

function getTimelineSteps(status) {
  const FLOW_IDX = { pending: 0, confirmed: 1, ready: 2 };
  const activeIdx = FLOW_IDX[status] ?? null;

  const terminalStep =
    status === "cancelled" ? { key: "cancelled", label: "Cancelled" } :
    status === "expired"   ? { key: "expired",   label: "Expired" } :
                             { key: "converted",  label: "Converted to Sale" };

  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "confirmed", label: "Confirmed" },
    { key: "ready",     label: "Ready for Pickup" },
    terminalStep,
  ];

  return steps.map((step, i) => {
    if (activeIdx !== null) {
      if (i < activeIdx) return { ...step, state: "done" };
      if (i === activeIdx) return { ...step, state: "active" };
      return { ...step, state: "idle" };
    }
    // Terminal status: submitted=done, middle=idle, last=active
    if (i === 0) return { ...step, state: "done" };
    if (i === steps.length - 1) return { ...step, state: "active" };
    return { ...step, state: "idle" };
  });
}

function getExpiryInfo(status, pickupDate) {
  const today    = new Date().toISOString().slice(0, 10);
  const diffDays = Math.round(
    (new Date(pickupDate + "T00:00:00") - new Date(today + "T00:00:00")) / 86400000
  );

  if (status === "expired") {
    const ago = Math.abs(diffDays);
    return {
      text: ago === 0 ? "Expired today" : `Expired ${ago} day${ago !== 1 ? "s" : ""} ago`,
      variant: "red",
    };
  }

  if (["pending", "confirmed"].includes(status)) {
    if (diffDays < 0) {
      const ago = Math.abs(diffDays);
      return {
        text: `Pickup date passed ${ago} day${ago !== 1 ? "s" : ""} ago`,
        variant: "red",
      };
    }
    if (diffDays === 0) return { text: "Pickup is today",           variant: "amber" };
    if (diffDays <= 2)  return { text: `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`, variant: "amber" };
  }

  return null;
}

export default function ReservationDetail({ reservation }) {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { status } = reservation;
  const items     = reservation.items ?? [];
  const medItems  = items.filter((i) => i.productType === "medicine");
  const paraItems = items.filter((i) => i.productType !== "medicine");
  const medTotal  = medItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const paraTotal = paraItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total     = medTotal + paraTotal;
  const hasMixed  = medItems.length > 0 && paraItems.length > 0;

  const today     = new Date().toISOString().slice(0, 10);
  const isOverdue = reservation.pickupDate < today && ["pending", "confirmed"].includes(status);

  const timelineSteps = getTimelineSteps(status);
  const expiryInfo    = getExpiryInfo(status, reservation.pickupDate);
  const prescriptionRequired = getPrescriptionRequired(reservation);
  const prescriptionVerified = Boolean(reservation.prescriptionVerified);
  const prescriptionImage = reservation.prescriptionImage || reservation.prescriptionImageUrl;

  function handleCopy() {
    navigator.clipboard.writeText(reservation.trackingCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.twoCol}>
      {/* ── LEFT COLUMN ── */}
      <div className={styles.leftCol}>

        {/* Reserved Items */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Reserved Items</h3>
          <div className={styles.tableWrap}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Product</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Qty</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Unit Price</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className={styles.td}>
                      <span className={item.productType === "medicine" ? styles.typeMed : styles.typePara}>
                        {item.productType === "medicine" ? "Medicine" : "Parapharmacy"}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.productName}`}>{item.productName}</td>
                    <td className={`${styles.td} ${styles.tdRight}`}>{item.qty}</td>
                    <td className={`${styles.td} ${styles.tdRight}`}>{formatCurrency(item.unitPrice)}</td>
                    <td className={`${styles.td} ${styles.tdRight}`}>{formatCurrency(item.unitPrice * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.itemsFooter}>
            {hasMixed && (
              <>
                <div className={styles.footerRow}>
                  <span className={styles.footerLabel}>Medicines Subtotal</span>
                  <span className={styles.footerValue}>{formatCurrency(medTotal)}</span>
                </div>
                <div className={styles.footerRow}>
                  <span className={styles.footerLabel}>Parapharmacy Subtotal</span>
                  <span className={styles.footerValue}>{formatCurrency(paraTotal)}</span>
                </div>
                <div className={styles.footerDivider} />
              </>
            )}
            <div className={styles.footerRow}>
              <span className={styles.footerTotalLabel}>Total</span>
              <span className={styles.footerTotalValue}>{formatCurrency(total)}</span>
            </div>
          </div>
        </section>

        {prescriptionRequired && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Prescription</h3>
            {!prescriptionVerified ? (
              <div className={styles.prescriptionBannerAmber}>
                <TriangleAlert size={17} />
                <p>Customer must present original prescription at pickup. Verify before converting to sale.</p>
              </div>
            ) : (
              <div className={styles.prescriptionBannerGreen}>
                <Check size={17} />
                <p>Prescription verified at pickup by {getVerifierName(reservation)}</p>
              </div>
            )}

            {prescriptionImage ? (
              <div className={styles.prescriptionImageBlock}>
                <button type="button" className={styles.prescriptionThumbBtn} onClick={() => setLightboxOpen(true)}>
                  <img src={prescriptionImage} alt="Uploaded prescription" />
                </button>
                <button type="button" className={styles.viewFullLink} onClick={() => setLightboxOpen(true)}>
                  View Full Size
                </button>
              </div>
            ) : (
              <p className={styles.prescriptionMissing}>No prescription image was uploaded.</p>
            )}
          </section>
        )}

        {/* Customer Information */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Customer Information</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Full Name</dt>
              <dd>{reservation.customerName}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Phone</dt>
              <dd>{reservation.phone}</dd>
            </div>
            {reservation.email && (
              <div className={styles.dlRow}>
                <dt>Email</dt>
                <dd>{reservation.email}</dd>
              </div>
            )}
            <div className={styles.dlRow}>
              <dt>Payment</dt>
              <dd>{reservation.paymentMethod}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Pickup Date</dt>
              <dd className={isOverdue ? styles.overdueDate : undefined}>
                {formatDate(reservation.pickupDate)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className={styles.rightCol}>

        {/* Status card */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Status</h3>

          <div className={styles.statusWrap}>
            <span className={`${styles.statusBadgeLg} ${BADGE_CLASS[status] ?? styles.badgeNeutral}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
            {prescriptionRequired && !prescriptionVerified && (
              <span className={`${styles.statusBadgeLg} ${styles.prescriptionRequiredBadge}`}>Prescription Required</span>
            )}
            {prescriptionRequired && prescriptionVerified && (
              <span className={`${styles.statusBadgeLg} ${styles.prescriptionVerifiedBadge}`}>Prescription Verified</span>
            )}
          </div>

          <button
            type="button"
            className={styles.codeBtn}
            onClick={handleCopy}
            title={copied ? "Copied!" : "Click to copy"}
            aria-label="Copy confirmation code"
          >
            <span className={styles.codeText}>{reservation.trackingCode}</span>
            <span className={styles.copyIcon}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </span>
            {copied && <span className={styles.copiedHint}>Copied!</span>}
          </button>

          {expiryInfo && (
            <p className={`${styles.expiryText} ${expiryInfo.variant === "red" ? styles.expiryRed : styles.expiryAmber}`}>
              {expiryInfo.text}
            </p>
          )}
        </section>

        {/* Status Timeline */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Timeline</h3>
          <div className={styles.timeline}>
            {timelineSteps.map((step, i) => (
              <div key={step.key} className={styles.timelineStep}>
                <div className={styles.dotWrap}>
                  <span className={`${styles.dot} ${DOT_CLASS[step.state]}`} />
                  {i < timelineSteps.length - 1 && (
                    <span className={`${styles.connector} ${CONNECTOR_CLASS[step.state]}`} />
                  )}
                </div>
                <div className={`${styles.stepContent} ${i < timelineSteps.length - 1 ? styles.stepContentSpaced : ""}`}>
                  <span className={`${styles.stepLabel} ${LABEL_CLASS[step.state]}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        {reservation.notes && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes</h3>
            <p className={styles.notes}>{reservation.notes}</p>
          </section>
        )}

        {/* Rejection / Cancellation Reason */}
        {status === "cancelled" && reservation.rejectionReason && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cancellation Reason</h3>
            <div className={styles.rejectionBox}>
              <p className={styles.rejectionText}>{reservation.rejectionReason}</p>
            </div>
          </section>
        )}
      </div>

      {lightboxOpen && prescriptionImage && (
        <div className={styles.lightbox} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setLightboxOpen(false);
        }}>
          <div className={styles.lightboxPanel}>
            <button type="button" className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close prescription preview">
              <X size={18} />
            </button>
            <img src={prescriptionImage} alt="Prescription full size" />
          </div>
        </div>
      )}
    </div>
  );
}
