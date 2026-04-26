import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { PHARMACIST } from "@/constants/roles";
import styles from "@/styles/StockPage.module.css";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LowStockTab({
  lowStockMeds,
  lowStockPara,
  medicines,
  parapharmacy,
  onSaveMedThresholds,
  onSaveParaThresholds,
  onOrderStock,
  onAdjustStock,
  role,
}) {
  const [expanded, setExpanded] = useState(false);

  // Local threshold state for inline editing
  const medRefs = useRef({});
  const paraRefs = useRef({});

  function handleSaveMedThresholds() {
    const updates = {};
    medicines.forEach((m) => {
      const val = parseInt(medRefs.current[m._id]?.value ?? m.minStockLevel);
      if (!isNaN(val) && val >= 0) updates[m._id] = val;
    });
    onSaveMedThresholds(updates);
  }

  function handleSaveParaThresholds() {
    const updates = {};
    parapharmacy.forEach((p) => {
      const val = parseInt(paraRefs.current[p._id]?.value ?? p.minStockLevel);
      if (!isNaN(val) && val >= 0) updates[p._id] = val;
    });
    onSaveParaThresholds(updates);
  }

  return (
    <div className={styles.tabContent}>
      {/* ── Low-Stock Medicines ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Low-Stock Medicines</h2>
          {lowStockMeds.length > 0 && (
            <span className={styles.sectionBadge}>{lowStockMeds.length}</span>
          )}
        </div>
        <div style={{ padding: "0 1.25rem" }}>
          <p className={styles.alertMeta} style={{ padding: "0.6rem 0", borderBottom: "1px solid var(--color-border-light)" }}>
            Medicines where total available stock is below the minimum threshold
          </p>
        </div>
        {lowStockMeds.length === 0 ? (
          <div className={styles.alertBannerGreen} style={{ margin: "1rem 1.25rem" }}>
            ✓ All medicines are above minimum stock level
          </div>
        ) : (
          <>
            <div className={styles.alertBannerAmber} style={{ margin: "0.75rem 1.25rem 0" }}>
              ⚠ {lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""} require restocking
            </div>
            <div className={styles.tableWrap} style={{ margin: "0.75rem 1.25rem 1.25rem", border: "none", borderRadius: 0, boxShadow: "none" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Total Stock</th>
                    <th>Min Threshold</th>
                    <th>Deficit</th>
                    <th>Nearest Expiry</th>
                    {role === PHARMACIST && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {lowStockMeds.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <Link href={`/products/${m._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                          {m.name}
                        </Link>
                      </td>
                      <td><Badge variant={m.category === "regulated" ? "regulated" : "neutral"}>{m.category}</Badge></td>
                      <td className={styles.lowStockVal}>{m.totalStock} {m.unit}s</td>
                      <td className={styles.monoCell}>{m.minStockLevel}</td>
                      <td className={styles.deficitVal}>−{m.minStockLevel - m.totalStock}</td>
                      <td className={styles.monoCell}>{fmtDate(m.nearestExpiry)}</td>
                      {role === PHARMACIST && (
                        <td>
                          <button className={styles.orderBtn} onClick={() => onOrderStock(m)}>
                            Order Stock
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Low-Stock Parapharmacy ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Low-Stock Parapharmacy Products</h2>
          {lowStockPara.length > 0 && (
            <span className={styles.sectionBadge}>{lowStockPara.length}</span>
          )}
        </div>
        <div style={{ padding: "0 1.25rem" }}>
          <p className={styles.alertMeta} style={{ padding: "0.6rem 0", borderBottom: "1px solid var(--color-border-light)" }}>
            Products where current stock is below the minimum threshold
          </p>
        </div>
        {lowStockPara.length === 0 ? (
          <div className={styles.alertBannerGreen} style={{ margin: "1rem 1.25rem" }}>
            ✓ All parapharmacy products are above minimum stock level
          </div>
        ) : (
          <>
            <div className={styles.alertBannerAmber} style={{ margin: "0.75rem 1.25rem 0" }}>
              ⚠ {lowStockPara.length} parapharmacy product{lowStockPara.length > 1 ? "s" : ""} require restocking
            </div>
            <div className={styles.tableWrap} style={{ margin: "0.75rem 1.25rem 1.25rem", border: "none", borderRadius: 0, boxShadow: "none" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                    <th>Deficit</th>
                    {role === PHARMACIST && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {lowStockPara.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <Link href={`/products/parapharmacy/${p._id}`} style={{ color: "var(--color-primary-action)", textDecoration: "none", fontWeight: 500 }}>
                          {p.name}
                        </Link>
                        {p.brand && <span className={styles.cellSub}>{p.brand}</span>}
                      </td>
                      <td><Badge variant="neutral" style={{ textTransform: "capitalize" }}>{p.category}</Badge></td>
                      <td className={styles.lowStockVal}>{p.stockQty}</td>
                      <td className={styles.monoCell}>{p.minStockLevel}</td>
                      <td className={styles.deficitVal}>−{p.minStockLevel - p.stockQty}</td>
                      {role === PHARMACIST && (
                        <td>
                          <div className={styles.actionGroup}>
                            <button className={styles.orderBtn} onClick={() => onOrderStock(p)}>Order Stock</button>
                            <button className={styles.actionBtn} onClick={() => onAdjustStock(p)}>Adjust Stock</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Configure Minimum Stock Thresholds (pharmacist only) ── */}
      {role === PHARMACIST && (
        <div className={styles.collapsibleSection}>
          <div className={styles.collapsibleHeader} onClick={() => setExpanded((v) => !v)}>
            <span className={styles.collapsibleTitle}>
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Configure Minimum Stock Thresholds
            </span>
          </div>
          {expanded && (
            <div className={styles.collapsibleBody}>
              <p className={styles.collapsibleHint}>
                Set the minimum stock level for each product. An alert is triggered when stock falls below this value.
              </p>

              <p className={styles.sectionLabel} style={{ marginBottom: 8 }}>Medicine Thresholds</p>
              <table className={styles.thresholdTable}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td>{m.category}</td>
                      <td className={styles.monoCell}>{m.totalStock ?? "—"}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className={styles.thresholdInput}
                          defaultValue={m.minStockLevel}
                          ref={(el) => { medRefs.current[m._id] = el; }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className={styles.saveThresholdBtn} onClick={handleSaveMedThresholds}>
                Save All Changes
              </button>

              <p className={styles.sectionLabel} style={{ marginBottom: 8, marginTop: 24 }}>Parapharmacy Thresholds</p>
              <table className={styles.thresholdTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                  </tr>
                </thead>
                <tbody>
                  {parapharmacy.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                      <td className={styles.monoCell}>{p.stockQty}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className={styles.thresholdInput}
                          defaultValue={p.minStockLevel}
                          ref={(el) => { paraRefs.current[p._id] = el; }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className={styles.saveThresholdBtn} onClick={handleSaveParaThresholds}>
                Save All Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
