import { useEffect, useState } from "react";
import { CheckCircle, Upload, XCircle } from "lucide-react";
import styles from "./PharmacistApprovalModal.module.css";

const COUNTDOWN = 120;

export default function PharmacistApprovalModal({
  isOpen,
  status,
  regulatedItems = [],
  approvedBy,
  rejectedBy,
  rejectionReason,
  onSubmitPrescription,
  onCancel,
  onTimeout,
  onBackToCart,
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

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

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");

    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Only JPEG and PNG prescription images are accepted");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large - maximum size is 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile(file);
      setPreviewUrl(String(reader.result || ""));
    };
    reader.onerror = () => {
      setUploadError("Could not read the prescription image");
    };
    reader.readAsDataURL(file);
  }

  function handleSubmitPrescription() {
    if (!selectedFile || !previewUrl) {
      setUploadError(
        "Upload the prescription before requesting pharmacist approval",
      );
      return;
    }

    onSubmitPrescription?.({
      filename: selectedFile.name,
      mimeType: selectedFile.type,
      size: selectedFile.size,
      dataUrl: previewUrl,
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Pharmacist Approval Required</h2>
          <p className={styles.subtitle}>
            This sale contains regulated medicines
          </p>
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
                <span className={styles.statusText}>
                  Waiting for pharmacist approval...
                </span>
              </div>
              <p className={styles.countdown}>
                {secondsLeft} seconds remaining
              </p>
              <div className={styles.timerBar}>
                <div
                  className={styles.timerFill}
                  style={{ width: `${(secondsLeft / COUNTDOWN) * 100}%` }}
                />
              </div>
            </>
          )}

          {status === "upload" && (
            <div className={styles.uploadBox}>
              <label className={styles.uploadLabel}>
                <Upload size={18} />
                <span>Upload prescription image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </label>
              {previewUrl && (
                <div className={styles.previewWrap}>
                  <img src={previewUrl} alt="Prescription preview" />
                  <p>{selectedFile?.name}</p>
                </div>
              )}
              {uploadError && (
                <p className={styles.uploadError}>{uploadError}</p>
              )}
              <p className={styles.uploadHint}>
                The pharmacist will review this image with the regulated
                medicines before approving the sale.
              </p>
            </div>
          )}

          {status === "approved" && (
            <>
              <CheckCircle
                size={38}
                className={styles.iconSuccess}
                strokeWidth={1.75}
              />
              <p className={styles.statusTextSuccess}>
                Approved by {approvedBy ?? "Pharmacist"}
              </p>
              <p className={styles.autoNote}>
                Proceeding to checkout in 1 second…
              </p>
            </>
          )}

          {status === "rejected" && (
            <>
              <XCircle
                size={38}
                className={styles.iconError}
                strokeWidth={1.75}
              />
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
              <XCircle
                size={38}
                className={styles.iconError}
                strokeWidth={1.75}
              />
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
            <button
              type="button"
              className={styles.backBtn}
              onClick={onBackToCart}
            >
              Back to Cart
            </button>
          ) : status === "upload" ? (
            <div className={styles.uploadActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onCancel}
              >
                Cancel Sale
              </button>
              <button
                type="button"
                className={styles.sendBtn}
                onClick={handleSubmitPrescription}
                disabled={!previewUrl}
              >
                Send to Pharmacist
              </button>
            </div>
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
