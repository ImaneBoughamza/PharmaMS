import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { PHARMACIST } from "@/constants/roles";
import styles from "@/styles/StockPage.module.css";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getDaysLeft(iso) {
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

export default function ExpiryTab({ batches, threshold, onSaveThreshold, onReturnBatch, onDeactivateBatch, role }) {
  const [thresholdInput, setThresholdInput] = useState(String(threshold));

  function handleSave() {
    const val = parseInt(thresholdInput);
    if (isNaN(val) || val < 1 || val > 365) return;
    onSaveThreshold(val);
  }

  return (
    <div className={styles.tabContent}>
      {/* Near-Expiry Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Near-Expiry Batches</h2>
          {batches.length > 0 && (
            <span className={[styles.sectionBadge, styles.warn].join(" ")}>{batches.length}</span>
          )}
        </div>

        {batches.length === 0 ? (
          <div className={styles.alertBannerGreen} style={{ margin: "1rem 1.25rem" }}>
            ✓ No batches expiring within {threshold} days
          </div>
        ) : (
          <>
            <div className={styles.alertBannerRed} style={{ margin: "0.75rem 1.25rem 0" }}>
              ⚠ {batches.length} medicine batch{batches.length !== 1 ? "es are" : " is"} expiring within {threshold} days
            </div>
            <div className={styles.tableWrap} style={{ margin: "0.75rem 1.25rem 1.25rem", border: "none", borderRadius: 0, boxShadow: "none" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch Number</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                    <th>Remaining Qty</th>
                    {role === PHARMACIST && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => {
                    const days = getDaysLeft(b.expiryDate);
                    return (
                      <tr key={b._id}>
                        <td>
                          <Link href={`/products/${b.medicine._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                            {b.medicine.name}
                          </Link>
                        </td>
                        <td className={styles.monoCell}>{b.batchNumber}</td>
                        <td className={styles.expiredText} style={{ fontWeight: 700 }}>{fmtDate(b.expiryDate)}</td>
                        <td className={styles.expiredText} style={{ fontWeight: 700 }}>{days} day{days !== 1 ? "s" : ""}</td>
                        <td className={styles.monoCell}>{b.remainingQty} {b.medicine.unit}s</td>
                        {role === PHARMACIST && (
                          <td>
                            <div className={styles.actionGroup}>
                              <button className={styles.dangerActionBtn} onClick={() => onReturnBatch(b)}>
                                Return to Supplier
                              </button>
                              {b.remainingQty === b.initialQty && (
                                <button className={styles.actionBtn} onClick={() => onDeactivateBatch(b._id, b.medicine._id)}>
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Configure Expiry Threshold (pharmacist only) */}
      {role === PHARMACIST && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Near-Expiry Detection Setting</h2>
          </div>
          <div style={{ padding: "1rem 1.25rem" }}>
            <p className={styles.sectionLabel} style={{ marginBottom: 4 }}>Current Setting</p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text)", marginBottom: 12 }}>
              <strong>{threshold} days</strong> before expiry
            </p>
            <div className={styles.thresholdForm}>
              <span className={styles.thresholdFormLabel}>Alert when expiry is within</span>
              <input
                type="number"
                min="1"
                max="365"
                className={styles.thresholdFormInput}
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
              />
              <span className={styles.thresholdFormLabel}>days</span>
              <button className={styles.successBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
