import { useRouter } from "next/router";
import { toast } from "sonner";
import { Bot, Check } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { assistantData } from "./dashboardMockData";
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

export default function AssistantDashboard({ user }) {
  const router = useRouter();
  const { data } = useDashboardResource(`/api/dashboard/assistant?staffId=${user?.sub ?? ""}`, assistantData);
  const kpis = data.kpis;
  const hasReservationActions = data.confirmedReservations.length > 0 || data.readyReservations.length > 0;

  return (
    <div className={styles.page}>
      <DashboardHeader user={user} roleLabel="Assistant" />

      <KpiGrid>
        <KpiBlock value={kpis.readyReservations} label="Ready for Pickup" subtext="Customer can collect" border={kpis.readyReservations > 0 ? "green" : "gray"} href="/reservations?status=ready" />
        <KpiBlock value={kpis.pendingReservations} label="Awaiting Review" subtext="Submitted reservations" border={kpis.pendingReservations > 0 ? "amber" : "gray"} />
        <KpiBlock value={kpis.mySalesToday} label="My Sales Today" subtext={formatCurrency(kpis.myRevenueToday)} border="green" />
        <KpiBlock value={kpis.aiConsultationsToday} label="AI Consultations" subtext="Today" border="purple" href="/ai-assistant" />
      </KpiGrid>

      <main className={styles.assistantGrid}>
        <Panel title="Reservation Work" subtitle="Prepare confirmed reservations and process pickups">
          {!hasReservationActions ? (
            <StatusBanner><Check size={15} /> No reservations requiring action right now</StatusBanner>
          ) : (
            <div className={styles.stackedSections}>
              <ReservationActionTable
                title="Confirmed - Prepare Items"
                rows={data.confirmedReservations.slice(0, 4)}
                actionLabel="Mark Ready"
                onAction={(row) => toast.success(`Reservation ${row.trackingCode} is ready for pickup - customer notified`)}
                link={<MiniLink href="/reservations?status=confirmed">View All</MiniLink>}
              />
              <ReservationActionTable
                title="Ready for Pickup"
                rows={data.readyReservations.slice(0, 4)}
                actionLabel="Convert"
                onAction={(row) => router.push(`/pos?reservationId=${row._id}`)}
                link={<MiniLink href="/reservations?status=ready">View All</MiniLink>}
              />
            </div>
          )}
        </Panel>

        <div className={styles.column}>
          <AIShortcut onStart={() => router.push("/ai-assistant")} />
          <ReadOnlyStockAlerts rows={data.lowStock.slice(0, 4)} />
        </div>
      </main>
    </div>
  );
}

function ReservationActionTable({ title, rows, actionLabel, onAction, link }) {
  return (
    <section className={styles.subPanel}>
      <div className={styles.subPanelHeader}>
        <h3>{title}</h3>
        {link}
      </div>
      {rows.length === 0 ? (
        <p className={styles.mutedText}>No reservations in this status</p>
      ) : (
        <table className={styles.compactTable}>
          <thead><tr><th>Code</th><th>Customer</th><th>Items</th><th>Pickup</th><th /></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td className={styles.code}>{row.trackingCode}</td>
                <td>{row.customerName}</td>
                <td>{itemCountLabel(row.items)}</td>
                <td>{formatDate(row.pickupDate)}</td>
                <td><button type="button" className={styles.primaryTinyBtn} onClick={() => onAction(row)}>{actionLabel}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function AIShortcut({ onStart }) {
  return (
    <Panel title="AI Assistant">
      <div className={styles.aiCard}>
        <Bot size={32} />
        <h3>Prescription Scan</h3>
        <p>Start an AI-assisted prescription review</p>
        <button type="button" onClick={onStart}>Open AI Assistant</button>
      </div>
    </Panel>
  );
}

function ReadOnlyStockAlerts({ rows }) {
  return (
    <Panel title="Stock Alerts" subtitle="Read-only - contact pharmacist to adjust" action={<MiniLink href="/stock">View All</MiniLink>}>
      {rows.length === 0 ? (
        <StatusBanner><Check size={15} /> Stock levels are healthy</StatusBanner>
      ) : (
        <div className={styles.alertList}>
          {rows.map((row) => (
            <div className={styles.alertRow} key={row._id}>
              <div><strong>{row.name}</strong><TypeBadge type={row.productType} /></div>
              <span>{row.stock} / {row.minStock}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
