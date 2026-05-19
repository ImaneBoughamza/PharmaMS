import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST } from "@/constants/roles";
import api from "@/lib/axios";
import { withRoleGuard } from "@/utils/roleGuard";
import styles from "@/styles/StockPage.module.css";

const EXPIRY_THRESHOLD = 90;

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getDaysLeft(iso) {
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

function getExpiryClass(days) {
  if (days < 0) return styles.expiredText;
  if (days <= EXPIRY_THRESHOLD) return styles.warnText;
  return styles.okText;
}

function batchStatus(batch) {
  if (batch.status) return batch.status;
  if (batch.isActive === false) return "deactivated";
  if ((batch.remainingQty ?? 0) <= 0) return "depleted";
  if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) return "expired";
  return "active";
}

export default function StockReportPage() {
  const { role } = useAuth();
  const [generatedAt] = useState(() => new Date());
  const [medicines, setMedicines] = useState([]);
  const [parapharmacy, setParapharmacy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/api/reports/stock");
      setMedicines(data.data?.medicines ?? []);
      setParapharmacy(data.data?.parapharmacy ?? []);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Failed to load stock report");
      setMedicines([]);
      setParapharmacy([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const enrichedMedicines = useMemo(() =>
    medicines.map((m) => {
      const active     = (m.batches ?? []).filter((b) => batchStatus(b) === "active");
      const totalStock = active.reduce((s, b) => s + b.remainingQty, 0);
      const totalValue = active.reduce((s, b) => s + b.remainingQty * b.purchasePrice, 0);
      return { ...m, totalStock, totalValue, activeBatches: active };
    }),
  [medicines]);

  const lowStockMeds = enrichedMedicines.filter((m) => m.totalStock < m.minStockLevel);
  const lowStockPara = parapharmacy.filter((p) => p.stockQty < p.minStockLevel);
  const allClear     = lowStockMeds.length === 0 && lowStockPara.length === 0;

  const nearExpiryBatches = useMemo(() => {
    const result = [];
    for (const m of enrichedMedicines) {
      for (const b of m.activeBatches) {
        if (getDaysLeft(b.expiryDate) <= EXPIRY_THRESHOLD) result.push({ ...b, medicine: m });
      }
    }
    return result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [enrichedMedicines]);

  const totalMedValue  = enrichedMedicines.reduce((s, m) => s + m.totalValue, 0);
  const totalParaValue = parapharmacy.reduce((s, p) => s + p.stockQty * p.purchasePrice, 0);
  const totalInventory = totalMedValue + totalParaValue;
  const totalRiskValue = nearExpiryBatches.reduce((s, b) => s + b.remainingQty * b.purchasePrice, 0);

  const dateStr = generatedAt.toISOString().slice(0, 10);
  const timestampDisplay =
    generatedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
    " at " +
    generatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  function handleExportCSV() {
    const rows = [
      [`PharmaMS Stock Management Report — ${generatedAt.toLocaleString("en-GB")}`],
      [],
      ["=== REPORT SUMMARY ==="],
      ["Total Medicine Value (purchase cost)", totalMedValue.toFixed(2)],
      ["Total Parapharmacy Value (purchase cost)", totalParaValue.toFixed(2)],
      ["Total Inventory Value", totalInventory.toFixed(2)],
      [],
      ["=== LOW STOCK MEDICINES ==="],
      ["Medicine", "Category", "Total Stock", "Min Threshold", "Deficit"],
      ...lowStockMeds.map((m) => [m.name, m.category, m.totalStock, m.minStockLevel, m.minStockLevel - m.totalStock]),
      [],
      ["=== LOW STOCK PARAPHARMACY ==="],
      ["Product", "Category", "Stock Qty", "Min Threshold", "Deficit"],
      ...lowStockPara.map((p) => [p.name, p.category, p.stockQty, p.minStockLevel, p.minStockLevel - p.stockQty]),
      [],
      ["=== NEAR-EXPIRY BATCHES ==="],
      ["Medicine", "Batch Number", "Expiry Date", "Days Remaining", "Remaining Qty", "Value at Risk (purchase)"],
      ...nearExpiryBatches.map((b) => [b.medicine.name, b.batchNumber, fmtDate(b.expiryDate), getDaysLeft(b.expiryDate), b.remainingQty, (b.remainingQty * b.purchasePrice).toFixed(2)]),
      [],
      ["=== FULL MEDICINE STOCK BY BATCH ==="],
      ["Medicine", "Batch Number", "Expiry Date", "Remaining Qty", "Purchase Price", "Sale Price", "Value"],
      ...enrichedMedicines.flatMap((m) =>
        m.activeBatches.map((b) => [m.name, b.batchNumber, fmtDate(b.expiryDate), b.remainingQty, b.purchasePrice, b.salePrice, (b.remainingQty * b.purchasePrice).toFixed(2)])
      ),
      [],
      ["=== FULL PARAPHARMACY STOCK ==="],
      ["Product", "Brand", "Category", "Stock Qty", "Purchase Price", "Sale Price", "Stock Value"],
      ...parapharmacy.map((p) => [p.name, p.brand, p.category, p.stockQty, p.purchasePrice, p.salePrice, (p.stockQty * p.purchasePrice).toFixed(2)]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `PharmaMS_StockReport_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <Link href="/stock" className={styles.back}>← Back to Stock</Link>
          <h1 className={styles.title} style={{ marginTop: 6 }}>Stock Management Report</h1>
          <p className={styles.reportSubtitle}>Current inventory snapshot — {timestampDisplay}</p>
        </div>
        {role === PHARMACIST && (
          <div className={styles.reportActions}>
            <button className={styles.primaryBtn} onClick={handleExportCSV}>
              <Download size={13} /> Export Report
            </button>
            <button className={styles.secondaryBtn} onClick={loadReport}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* ── Section 1: Report Summary ── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total Medicine Value</p>
          <p className={styles.kpiValue} style={{ fontSize: 20 }}>{fmtMAD(totalMedValue)}</p>
          <p className={styles.kpiSub}>at purchase cost</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total Parapharmacy Value</p>
          <p className={styles.kpiValue} style={{ fontSize: 20 }}>{fmtMAD(totalParaValue)}</p>
          <p className={styles.kpiSub}>at purchase cost</p>
        </div>
        <div className={styles.kpiCard} style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-primary-action)" }}>
          <p className={styles.kpiLabel}>Total Inventory Value</p>
          <p className={styles.kpiValue} style={{ fontSize: 20, fontWeight: 800, color: "var(--color-primary-action)" }}>{fmtMAD(totalInventory)}</p>
          <p className={styles.kpiSub}>medicine + parapharmacy</p>
        </div>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Generated At</p>
          <p className={styles.kpiValue} style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>
            {generatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className={styles.kpiSub}>{generatedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
      </div>

      {/* ── Section 2: Low-Stock Summary ── */}
      <div className={styles.reportSection}>
        <h2 className={styles.reportSectionTitle}>Low-Stock Summary</h2>

        {allClear ? (
          <div className={styles.alertBannerGreen} style={{ margin: "1rem 1.25rem" }}>
            ✓ All products are sufficiently stocked
          </div>
        ) : (
          <>
            {/* Low-Stock Medicines */}
            <div style={{ padding: "0.9rem 1.25rem 0.5rem" }}>
              <p className={styles.sectionLabel}>Low-Stock Medicines</p>
            </div>
            {lowStockMeds.length === 0 ? (
              <div className={styles.alertBannerGreen} style={{ margin: "0 1.25rem 1rem" }}>
                ✓ All medicines are above minimum stock level
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Total Stock</th>
                      <th>Min Threshold</th>
                      <th>Deficit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockMeds.map((m) => (
                      <tr key={m._id}>
                        <td style={{ fontWeight: 500 }}>{m.name}</td>
                        <td><Badge variant={m.category === "regulated" ? "regulated" : "neutral"}>{m.category}</Badge></td>
                        <td className={styles.lowStockVal}>{m.totalStock}</td>
                        <td className={styles.monoCell}>{m.minStockLevel}</td>
                        <td className={styles.deficitVal}>−{m.minStockLevel - m.totalStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.reportTableFoot}>
                  {lowStockMeds.length} medicine{lowStockMeds.length !== 1 ? "s" : ""} below minimum threshold
                </div>
              </>
            )}

            {/* Low-Stock Parapharmacy */}
            <div style={{ padding: "0.9rem 1.25rem 0.5rem", borderTop: "1px solid var(--color-border)" }}>
              <p className={styles.sectionLabel}>Low-Stock Parapharmacy Products</p>
            </div>
            {lowStockPara.length === 0 ? (
              <div className={styles.alertBannerGreen} style={{ margin: "0 1.25rem 1rem" }}>
                ✓ All parapharmacy products are above minimum stock level
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock Qty</th>
                      <th>Min Threshold</th>
                      <th>Deficit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockPara.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td><Badge variant="neutral" style={{ textTransform: "capitalize" }}>{p.category}</Badge></td>
                        <td className={styles.lowStockVal}>{p.stockQty}</td>
                        <td className={styles.monoCell}>{p.minStockLevel}</td>
                        <td className={styles.deficitVal}>−{p.minStockLevel - p.stockQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.reportTableFoot}>
                  {lowStockPara.length} product{lowStockPara.length !== 1 ? "s" : ""} below minimum threshold
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Section 3: Near-Expiry Batches ── */}
      <div className={styles.reportSection}>
        <h2 className={styles.reportSectionTitle}>Near-Expiry Batches</h2>
        {nearExpiryBatches.length === 0 ? (
          <div className={styles.alertBannerGreen} style={{ margin: "1rem 1.25rem" }}>
            ✓ No batches expiring within the threshold window
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Remaining Qty</th>
                  <th>Value at Risk</th>
                </tr>
              </thead>
              <tbody>
                {nearExpiryBatches.map((b) => {
                  const days = getDaysLeft(b.expiryDate);
                  const cls  = getExpiryClass(days);
                  return (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>{b.medicine.name}</td>
                      <td className={styles.monoCell}>{b.batchNumber}</td>
                      <td className={styles.expiredText} style={{ fontWeight: 700 }}>{fmtDate(b.expiryDate)}</td>
                      <td className={cls} style={{ fontWeight: 700 }}>
                        {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days} day${days !== 1 ? "s" : ""}`}
                      </td>
                      <td className={styles.monoCell}>{b.remainingQty} {b.medicine.unit}s</td>
                      <td className={styles.monoCell} style={{ fontWeight: 600 }}>{fmtMAD(b.remainingQty * b.purchasePrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.reportTableFoot}>
              <span>{nearExpiryBatches.length} batch{nearExpiryBatches.length !== 1 ? "es" : ""} expiring within {EXPIRY_THRESHOLD} days</span>
              <span style={{ marginLeft: 16 }}>Total value at risk: <strong>{fmtMAD(totalRiskValue)}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* ── Section 4: Full Medicine Stock by Batch ── */}
      <div className={styles.reportSection}>
        <h2 className={styles.reportSectionTitle}>Full Medicine Stock by Batch</h2>
        {enrichedMedicines.map((m, idx) => {
          const groupStock = m.activeBatches.reduce((s, b) => s + b.remainingQty, 0);
          const groupValue = m.activeBatches.reduce((s, b) => s + b.remainingQty * b.purchasePrice, 0);
          return (
            <div
              key={m._id}
              className={styles.medicineGroup}
              style={idx < enrichedMedicines.length - 1 ? { borderBottom: "2px solid var(--color-border)" } : {}}
            >
              <div className={styles.medicineGroupHeader}>
                <span>{m.name}</span>
                {m.genericName && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-text-muted)", marginLeft: 6 }}>
                    {m.genericName}
                  </span>
                )}
                <span style={{ marginLeft: "auto" }}>
                  <Badge variant={m.category === "regulated" ? "regulated" : "neutral"}>{m.category}</Badge>
                </span>
              </div>
              {m.activeBatches.length === 0 ? (
                <p className={styles.emptyCell} style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
                  No active batches.
                </p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Batch Number</th>
                      <th>Expiry Date</th>
                      <th>Remaining Qty</th>
                      <th>Purchase Price</th>
                      <th>Sale Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.activeBatches.map((b) => {
                      const days = getDaysLeft(b.expiryDate);
                      return (
                        <tr key={b._id}>
                          <td className={styles.monoCell}>{b.batchNumber}</td>
                          <td className={getExpiryClass(days)}>{fmtDate(b.expiryDate)}</td>
                          <td className={b.remainingQty === 0 ? styles.lowStockVal : styles.monoCell} style={{ fontWeight: 700 }}>
                            {b.remainingQty}
                          </td>
                          <td className={styles.monoCell}>{fmtMAD(b.purchasePrice)}</td>
                          <td className={styles.monoCell}>{fmtMAD(b.salePrice)}</td>
                          <td className={styles.monoCell}>{fmtMAD(b.remainingQty * b.purchasePrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <div className={styles.medicineGroupFoot}>
                Total Remaining: <strong>{groupStock} {m.unit}s</strong>
                <span style={{ margin: "0 8px", color: "var(--color-border)" }}>|</span>
                Total Value: <strong>{fmtMAD(groupValue)}</strong>
              </div>
            </div>
          );
        })}
        <div className={styles.reportTableFoot}>
          Grand total medicine inventory value: <strong>{fmtMAD(totalMedValue)}</strong>
        </div>
      </div>

      {/* ── Section 5: Full Parapharmacy Stock ── */}
      <div className={styles.reportSection}>
        <h2 className={styles.reportSectionTitle}>Full Parapharmacy Stock</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Stock Qty</th>
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>Stock Value</th>
            </tr>
          </thead>
          <tbody>
            {parapharmacy.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: "var(--color-text-secondary)" }}>{p.brand}</td>
                <td><Badge variant="neutral" style={{ textTransform: "capitalize" }}>{p.category}</Badge></td>
                <td className={p.stockQty < p.minStockLevel ? styles.lowStockVal : styles.monoCell} style={{ fontWeight: 700 }}>
                  {p.stockQty}
                </td>
                <td className={styles.monoCell}>{fmtMAD(p.purchasePrice)}</td>
                <td className={styles.monoCell}>{fmtMAD(p.salePrice)}</td>
                <td className={styles.monoCell}>{fmtMAD(p.stockQty * p.purchasePrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.reportTableFoot}>
          Total Parapharmacy Stock Value: <strong>{fmtMAD(totalParaValue)}</strong>
        </div>
      </div>
    </div>
  );
}

StockReportPage.getLayout = AppLayout.getLayout;

export const getServerSideProps = withRoleGuard([PHARMACIST]);
