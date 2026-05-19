import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Clock, X } from "lucide-react";
import {
  ApproveModal,
  RejectModal,
} from "@/components/reservations/ReservationActionModals";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils/formatCurrency";
import { pharmacistData } from "./dashboardMockData";
import {
  DashboardHeader,
  KpiBlock,
  KpiGrid,
  MiniLink,
  Panel,
  StatusBanner,
  TypeBadge,
  formatDate,
  itemCountLabel,
  useDashboardResource,
} from "./DashboardPrimitives";
import styles from "@/styles/Dashboard.module.css";

export default function PharmacistDashboard({ user }) {
  const [pendingRows, setPendingRows] = useState(
    pharmacistData.pendingReservations,
  );
  const [action, setAction] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { data } = useDashboardResource(
    "/api/dashboard/pharmacist",
    pharmacistData,
  );
  const kpis = data.kpis;

  async function loadApprovalRequests({ silent = false } = {}) {
    try {
      const { data: response } = await api.get("/api/sales/approval-requests");
      setApprovalRequests(response.data || []);
    } catch (error) {
      if (!silent)
        toast.error(
          error?.response?.data?.message ??
            "Failed to load sale approval requests",
        );
    }
  }

  useEffect(() => {
    setMounted(true);
    loadApprovalRequests({ silent: true });
    const timer = setInterval(
      () => loadApprovalRequests({ silent: true }),
      3000,
    );
    return () => clearInterval(timer);
  }, []);

  async function respondToSaleRequest(request, approved) {
    const reason = approved
      ? ""
      : window.prompt("Reason for rejecting this sale request") || "";
    if (!approved && reason.trim().length < 3) {
      toast.error("A rejection reason is required");
      return;
    }

    try {
      await api.post(
        `/api/sales/approval-requests/${request.requestId}/respond`,
        {
          approved,
          reason: reason.trim() || undefined,
        },
      );
      setApprovalRequests((requests) =>
        requests.filter((item) => item.requestId !== request.requestId),
      );
      toast.success(
        approved ? "Sale request approved" : "Sale request rejected",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Failed to respond to sale request",
      );
      loadApprovalRequests({ silent: true });
    }
  }

  function approveReservation() {
    setPendingRows((rows) =>
      rows.filter((row) => row._id !== action.reservation._id),
    );
    toast.success(
      `Reservation ${action.reservation.trackingCode} confirmed - customer notified`,
    );
    setAction(null);
  }

  function rejectReservation() {
    setPendingRows((rows) =>
      rows.filter((row) => row._id !== action.reservation._id),
    );
    toast.success(
      `Reservation ${action.reservation.trackingCode} rejected - customer notified`,
    );
    setAction(null);
  }

  return (
    <div className={styles.page}>
      <DashboardHeader user={user} roleLabel="Pharmacist" />

      <KpiGrid>
        <KpiBlock
          value={formatCurrency(kpis.revenueToday)}
          label="Revenue Today"
          subtext={`${kpis.completedSales} completed sales`}
          border="green"
        />
        <KpiBlock
          value={kpis.pendingReservations}
          label="Pending Reservations"
          subtext="Need pharmacist review"
          border={kpis.pendingReservations > 0 ? "amber" : "gray"}
          href="/reservations?status=pending"
        />
        <KpiBlock
          value={kpis.lowStockItems}
          label="Low Stock"
          subtext="Below minimum threshold"
          border={kpis.lowStockItems > 0 ? "red" : "gray"}
          href="/stock?tab=low-stock"
        />
        <KpiBlock
          value={kpis.nearExpiryBatches}
          label="Near Expiry"
          subtext={`Within ${kpis.expiryThresholdDays} days`}
          border={kpis.nearExpiryBatches > 0 ? "red" : "gray"}
          href="/stock?tab=expiry"
        />
      </KpiGrid>

      <main className={styles.pharmacistGrid}>
        <div className={styles.column}>
          <SaleApprovalRequests
            requests={approvalRequests}
            mounted={mounted}
            onApprove={(request) => respondToSaleRequest(request, true)}
            onReject={(request) => respondToSaleRequest(request, false)}
          />
          <PendingReservations
            rows={pendingRows.slice(0, 5)}
            onApprove={(reservation) =>
              setAction({ type: "approve", reservation })
            }
            onReject={(reservation) =>
              setAction({ type: "reject", reservation })
            }
          />
        </div>
        <OperationalAlerts
          lowStock={data.lowStock.slice(0, 4)}
          expiryBatches={data.expiryBatches.slice(0, 4)}
        />
      </main>

      {action?.type === "approve" && (
        <ApproveModal
          reservation={action.reservation}
          onClose={() => setAction(null)}
          onConfirm={approveReservation}
        />
      )}
      {action?.type === "reject" && (
        <RejectModal
          reservation={action.reservation}
          onClose={() => setAction(null)}
          onConfirm={rejectReservation}
        />
      )}
    </div>
  );
}

function SaleApprovalRequests({ requests, mounted, onApprove, onReject }) {
  return (
    <Panel
      title="Regulated Sale Requests"
      subtitle="Direct pharmacist validation gate"
    >
      {requests.length === 0 ? (
        <StatusBanner>
          <Check size={15} /> No sale requests waiting for validation
        </StatusBanner>
      ) : (
        <div className={styles.approvalQueue}>
          {requests.map((request) => (
            <div className={styles.approvalCard} key={request.requestId}>
              <div>
                <strong>Validation request</strong>
                <small suppressHydrationWarning>
                  <Clock size={12} /> Expires{" "}
                  {mounted ? formatTimeLeft(request.expiresAt) : "--"}
                </small>
              </div>
              <ul>
                {request.items.map((item, index) => (
                  <li key={`${request.requestId}-${index}`}>
                    {item.medicineName} <span>×{item.qty}</span>
                  </li>
                ))}
              </ul>
              {request.prescriptionImage?.dataUrl ? (
                <a
                  className={styles.approvalPrescription}
                  href={request.prescriptionImage.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={request.prescriptionImage.dataUrl}
                    alt="Prescription submitted for validation"
                  />
                  <span>Open prescription image</span>
                </a>
              ) : (
                <p className={styles.prescriptionMissing}>
                  No prescription image attached
                </p>
              )}
              <div className={styles.approvalActions}>
                <button
                  type="button"
                  className={styles.approveBtn}
                  onClick={() => onApprove(request)}
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  type="button"
                  className={styles.rejectBtn}
                  onClick={() => onReject(request)}
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function formatTimeLeft(expiresAt) {
  const seconds = Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
  return `in ${seconds}s`;
}

function PendingReservations({ rows, onApprove, onReject }) {
  return (
    <Panel
      title="Pending Reservations"
      subtitle="Approve or reject customer requests"
      action={<MiniLink href="/reservations?status=pending">View All</MiniLink>}
    >
      {rows.length === 0 ? (
        <StatusBanner>
          <Check size={15} /> No pending reservations
        </StatusBanner>
      ) : (
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Pickup</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td className={styles.code}>{row.trackingCode}</td>
                <td>{row.customerName}</td>
                <td>{itemCountLabel(row.items)}</td>
                <td>{formatDate(row.pickupDate)}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconSuccess}
                      title="Approve"
                      onClick={() => onApprove(row)}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconDanger}
                      title="Reject"
                      onClick={() => onReject(row)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function OperationalAlerts({ lowStock, expiryBatches }) {
  const hasAlerts = lowStock.length > 0 || expiryBatches.length > 0;

  return (
    <Panel
      title="Operational Alerts"
      subtitle="Stock issues that need attention"
      action={<MiniLink href="/stock">Open Stock</MiniLink>}
    >
      {!hasAlerts ? (
        <StatusBanner>
          <Check size={15} /> No urgent stock alerts
        </StatusBanner>
      ) : (
        <div className={styles.stackedSections}>
          <section className={styles.subPanel}>
            <div className={styles.subPanelHeader}>
              <h3>Low Stock</h3>
              <MiniLink href="/stock?tab=low-stock">View All</MiniLink>
            </div>
            {lowStock.length === 0 ? (
              <p className={styles.mutedText}>No low-stock items</p>
            ) : (
              <div className={styles.alertList}>
                {lowStock.map((row) => (
                  <div className={styles.alertRow} key={row._id}>
                    <div>
                      <strong>{row.name}</strong>
                      <TypeBadge type={row.productType} />
                    </div>
                    <span>
                      {row.stock} / {row.minStock}
                    </span>
                    <a
                      title="Order"
                      href={`/products/orders/new?productId=${row._id}`}
                    >
                      Order
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.subPanel}>
            <div className={styles.subPanelHeader}>
              <h3>Near Expiry</h3>
              <MiniLink href="/stock?tab=expiry">View All</MiniLink>
            </div>
            {expiryBatches.length === 0 ? (
              <p className={styles.mutedText}>No batches expiring soon</p>
            ) : (
              <div className={styles.expiryList}>
                {expiryBatches.map((row) => (
                  <div className={styles.expiryRow} key={row._id}>
                    <strong>{row.medicineName}</strong>
                    <span className={styles.mono}>{row.batchNumber}</span>
                    <b>{formatDate(row.expiryDate)}</b>
                    <span>{row.remainingQty} units</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Panel>
  );
}
