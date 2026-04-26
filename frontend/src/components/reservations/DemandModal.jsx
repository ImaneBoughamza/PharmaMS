import { useState } from "react";
import { X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { toast } from "sonner";
import styles from "./DemandModal.module.css";

function computeChange(last, curr) {
  if (last === 0 && curr === 0) return 0;
  if (last === 0) return 100;
  return Math.round(((curr - last) / last) * 100);
}

const MOCK_DEMAND_BY_PERIOD = {
  "7": [
    { productName: "Paracetamol 500mg",    productType: "medicine",     lastPeriod: 2, thisPeriod: 4 },
    { productName: "Vitamin C 1000mg",     productType: "medicine",     lastPeriod: 3, thisPeriod: 2 },
    { productName: "Sunscreen SPF50+",     productType: "parapharmacy", lastPeriod: 1, thisPeriod: 2 },
    { productName: "Ibuprofen 400mg",      productType: "medicine",     lastPeriod: 2, thisPeriod: 2 },
    { productName: "Hand Sanitizer 500ml", productType: "parapharmacy", lastPeriod: 1, thisPeriod: 2 },
    { productName: "Efferalgan 500mg",     productType: "medicine",     lastPeriod: 2, thisPeriod: 1 },
  ],
  "14": [
    { productName: "Paracetamol 500mg",    productType: "medicine",     lastPeriod: 4, thisPeriod: 7 },
    { productName: "Vitamin C 1000mg",     productType: "medicine",     lastPeriod: 6, thisPeriod: 4 },
    { productName: "Sunscreen SPF50+",     productType: "parapharmacy", lastPeriod: 2, thisPeriod: 4 },
    { productName: "Ibuprofen 400mg",      productType: "medicine",     lastPeriod: 4, thisPeriod: 4 },
    { productName: "Hand Sanitizer 500ml", productType: "parapharmacy", lastPeriod: 2, thisPeriod: 3 },
    { productName: "Efferalgan 500mg",     productType: "medicine",     lastPeriod: 3, thisPeriod: 2 },
  ],
  "30": [
    { productName: "Paracetamol 500mg",    productType: "medicine",     lastPeriod: 8,  thisPeriod: 14 },
    { productName: "Vitamin C 1000mg",     productType: "medicine",     lastPeriod: 12, thisPeriod: 9  },
    { productName: "Sunscreen SPF50+",     productType: "parapharmacy", lastPeriod: 5,  thisPeriod: 9  },
    { productName: "Ibuprofen 400mg",      productType: "medicine",     lastPeriod: 7,  thisPeriod: 7  },
    { productName: "Hand Sanitizer 500ml", productType: "parapharmacy", lastPeriod: 3,  thisPeriod: 5  },
    { productName: "Efferalgan 500mg",     productType: "medicine",     lastPeriod: 6,  thisPeriod: 4  },
  ],
};

const PERIODS = [
  { value: "7",  label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

export default function DemandModal({ isOpen, userRole, onClose }) {
  const [period, setPeriod] = useState("30");

  if (!isOpen) return null;

  const rows = MOCK_DEMAND_BY_PERIOD[period].map((d) => ({
    ...d,
    change: computeChange(d.lastPeriod, d.thisPeriod),
  }));

  const highDemand = rows.filter((r) => r.change > 20);
  const lowDemand  = rows.filter((r) => r.change < -20);
  const hasInterp  = highDemand.length > 0 || lowDemand.length > 0;

  function handleAlertPharmacist() {
    // TODO: replace with real notification API call
    toast.success("Demand alert sent to the pharmacist.");
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Reservation Demand Analysis</h2>
            <p className={styles.subtitle}>
              Based on reservation patterns over the last 30 days
            </p>
          </div>
          <button
            type="button"
            className={styles.closeIconBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Period selector */}
          <div className={styles.periodRow}>
            <span className={styles.periodLabel}>Period</span>
            <div className={styles.periodGroup}>
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.periodBtn}${period === value ? " " + styles.periodActive : ""}`}
                  onClick={() => setPeriod(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Product</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Last Period</th>
                  <th className={`${styles.th} ${styles.thRight}`}>This Period</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Change</th>
                  <th className={`${styles.th} ${styles.thCenter}`}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.td}>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>{row.productName}</span>
                        <span className={row.productType === "medicine" ? styles.typeMed : styles.typePara}>
                          {row.productType === "medicine" ? "Medicine" : "Parapharmacy"}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>{row.lastPeriod}</td>
                    <td className={`${styles.td} ${styles.tdRight}`}>{row.thisPeriod}</td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      <span className={
                        row.change > 0 ? styles.changePos :
                        row.change < 0 ? styles.changeNeg :
                        styles.changeFlat
                      }>
                        {row.change > 0 ? `+${row.change}%` : `${row.change}%`}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdCenter}`}>
                      {row.change > 0 ? (
                        <ArrowUp size={15} className={styles.trendUp} />
                      ) : row.change < 0 ? (
                        <ArrowDown size={15} className={styles.trendDown} />
                      ) : (
                        <Minus size={15} className={styles.trendFlat} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interpretation */}
          {hasInterp && (
            <div className={styles.interpretation}>
              {highDemand.length > 0 && (
                <div className={styles.interpSection}>
                  <p className={styles.interpTitle}>High demand products (&gt;20% increase)</p>
                  {highDemand.map((r, i) => (
                    <p key={i} className={styles.interpItem}>
                      <span className={styles.interpDotHigh} />
                      <strong>{r.productName}</strong> — consider increasing stock order
                    </p>
                  ))}
                </div>
              )}
              {lowDemand.length > 0 && (
                <div className={styles.interpSection}>
                  <p className={styles.interpTitle}>Low demand products (&gt;20% decrease)</p>
                  {lowDemand.map((r, i) => (
                    <p key={i} className={styles.interpItem}>
                      <span className={styles.interpDotLow} />
                      <strong>{r.productName}</strong> — consider reducing stock order
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {userRole === "assistant" && (
            <button
              type="button"
              className={styles.alertPharmBtn}
              onClick={handleAlertPharmacist}
            >
              Alert Pharmacist
            </button>
          )}
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
