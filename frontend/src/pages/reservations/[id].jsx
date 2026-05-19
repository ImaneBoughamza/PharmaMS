import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ArrowLeft, Check, Package, Ban, ShoppingCart, X, TriangleAlert } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ReservationDetail from "@/components/reservations/ReservationDetail";
import {
  ApproveModal,
  RejectModal,
  MarkReadyModal,
  CancelModal,
} from "@/components/reservations/ReservationActionModals";
import api from "@/lib/axios";
import { withRoleGuard } from "@/utils/roleGuard";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/ReservationDetailPage.module.css";

export const getServerSideProps = withRoleGuard(["pharmacist", "assistant", "cashier"]);

function paymentLabel(value) {
  if (value === "online" || value === "card") return "Online Payment";
  return "Pay on Pickup";
}

function normalizeReservation(reservation) {
  return {
    ...reservation,
    trackingCode: reservation.confirmationCode,
    phone: reservation.customerPhone || reservation.customerId?.phone || "",
    email: reservation.customerEmail || reservation.customerId?.email || "",
    pickupDate: (reservation.pickupDate || reservation.expiresAt || reservation.createdAt || "").slice(0, 10),
    paymentMethod: paymentLabel(reservation.paymentMethod),
    items: (reservation.items || []).map((item) => ({
      ...item,
      productName: item.name || item.product?.name || item.productName || "Unknown product",
      unitPrice: Number(item.salePrice ?? item.unitPrice ?? item.product?.salePrice ?? 0),
    })),
  };
}

export default function ReservationDetailPage({ user }) {
  const router = useRouter();
  const { id } = router.query;

  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [showVerifyStep, setShowVerifyStep] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);

  async function loadReservation() {
    if (!id) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await api.get(`/api/reservations/${id}`);
      setReservation(normalizeReservation(response.data.data));
    } catch (err) {
      setReservation(null);
      setLoadError(err.response?.data?.message || "Reservation not found");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReservation();
    setShowVerifyStep(false);
    setVerificationChecked(false);
  }, [id]);

  if (!id) return null;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Loading reservation...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.push("/reservations")}>
          <ArrowLeft size={15} />
          Back to Reservations
        </button>
        <p className={styles.notFound}>{loadError || "Reservation not found."}</p>
      </div>
    );
  }

  const { status, trackingCode } = reservation;
  const userRole = user.role;
  const prescriptionRequired = reservation.prescriptionRequired ||
    reservation.items?.some((item) => item.productType === "medicine" && item.category === "prescription");
  const prescriptionVerified = Boolean(reservation.prescriptionVerified);
  const prescriptionImage = reservation.prescriptionImage || reservation.prescriptionImageUrl;

  async function runAction(callback, successMessage) {
    try {
      const response = await callback();
      if (response?.data?.data) setReservation(normalizeReservation(response.data.data));
      await loadReservation();
      setActiveModal(null);
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation action failed");
    }
  }

  function handleApproveConfirm() {
    runAction(
      () => api.patch(`/api/reservations/${reservation._id}/confirm`),
      `Reservation ${trackingCode} confirmed - customer notified`
    );
  }

  function handleRejectConfirm(reason) {
    runAction(
      () => api.patch(`/api/reservations/${reservation._id}/reject`, { reason }),
      `Reservation ${trackingCode} rejected - customer notified`
    );
  }

  function handleMarkReadyConfirm() {
    runAction(
      () => api.patch(`/api/reservations/${reservation._id}/ready`),
      `Reservation ${trackingCode} marked as ready`
    );
  }

  function handleCancelConfirm(reason) {
    runAction(
      () => api.patch(`/api/reservations/${reservation._id}/cancel`, { reason }),
      `Reservation ${trackingCode} cancelled`
    );
  }

  function handleConvertToSale() {
    if (prescriptionRequired && !prescriptionVerified) {
      setShowVerifyStep(true);
      setVerificationChecked(false);
      toast.error("Please verify the prescription before dispensing");
      return;
    }
    router.push(`/pos?reservationId=${reservation._id}`);
  }

  async function handleConfirmPrescriptionAndContinue() {
    if (!verificationChecked) {
      toast.error("Please verify the prescription before dispensing");
      return;
    }
    try {
      await api.patch(`/api/reservations/${reservation._id}/verify-prescription`, { verified: true });
      toast.success("Prescription verified - sale can proceed");
      router.push(`/pos?reservationId=${reservation._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Prescription verification failed");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.back} onClick={() => router.push("/reservations")}>
            <ArrowLeft size={15} />
            Back to Reservations
          </button>
          <div>
            <h1 className={styles.title}>Reservation {trackingCode}</h1>
            <p className={styles.subtitle}>
              Submitted {formatDate(reservation.createdAt)} by {reservation.customerName}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {status === "pending" && userRole === "pharmacist" && (
            <>
              <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setActiveModal("approve")}>
                <Check size={15} />
                Approve
              </button>
              <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setActiveModal("reject")}>
                <X size={15} />
                Reject
              </button>
            </>
          )}

          {status === "confirmed" && (
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setActiveModal("markReady")}>
              <Package size={15} />
              Mark as Ready
            </button>
          )}
          {status === "confirmed" && (userRole === "pharmacist" || userRole === "assistant") && (
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setActiveModal("cancel")}>
              <Ban size={15} />
              Cancel
            </button>
          )}

          {status === "ready" && (
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={handleConvertToSale}>
              <ShoppingCart size={15} />
              Convert to Sale
            </button>
          )}
          {status === "ready" && (userRole === "pharmacist" || userRole === "assistant") && (
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setActiveModal("cancel")}>
              <Ban size={15} />
              Cancel
            </button>
          )}
        </div>
      </div>

      <ReservationDetail reservation={reservation} />

      {showVerifyStep && (
        <section className={styles.verifyPanel}>
          <div className={styles.verifyHeader}>
            <TriangleAlert size={19} />
            <div>
              <h2>Verify Prescription Before Dispensing</h2>
              <p>Confirm the original prescription presented by the customer before continuing to POS.</p>
            </div>
          </div>

          {prescriptionImage && (
            <img className={styles.verifyImage} src={prescriptionImage} alt="Uploaded prescription" />
          )}

          <label className={styles.verifyCheckbox}>
            <input
              type="checkbox"
              checked={verificationChecked}
              onChange={(event) => setVerificationChecked(event.target.checked)}
            />
            <span>I have verified the original prescription presented by the customer matches the uploaded image and authorise dispensing</span>
          </label>

          <div className={styles.verifyActions}>
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => setShowVerifyStep(false)}>
              Cancel
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} disabled={!verificationChecked} onClick={handleConfirmPrescriptionAndContinue}>
              Confirm and Continue
            </button>
          </div>
        </section>
      )}

      {activeModal === "approve" && (
        <ApproveModal reservation={reservation} onClose={() => setActiveModal(null)} onConfirm={handleApproveConfirm} />
      )}
      {activeModal === "reject" && (
        <RejectModal reservation={reservation} onClose={() => setActiveModal(null)} onConfirm={handleRejectConfirm} />
      )}
      {activeModal === "markReady" && (
        <MarkReadyModal reservation={reservation} onClose={() => setActiveModal(null)} onConfirm={handleMarkReadyConfirm} />
      )}
      {activeModal === "cancel" && (
        <CancelModal reservation={reservation} onClose={() => setActiveModal(null)} onConfirm={handleCancelConfirm} />
      )}
    </div>
  );
}

ReservationDetailPage.getLayout = AppLayout.getLayout;
