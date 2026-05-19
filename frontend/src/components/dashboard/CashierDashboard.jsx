import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Eye, ShoppingCart } from "lucide-react";
import SaleDetailModal from "@/components/pos/SaleDetailModal";
import { formatCurrency } from "@/utils/formatCurrency";
import { cashierData } from "./dashboardMockData";
import {
  DashboardHeader,
  KpiBlock,
  KpiGrid,
  MiniLink,
  Panel,
  formatDate,
  formatTime,
  itemCountLabel,
  useDashboardResource,
} from "./DashboardPrimitives";
import styles from "@/styles/Dashboard.module.css";

export default function CashierDashboard({ user }) {
  const router = useRouter();
  const [selectedSale, setSelectedSale] = useState(null);
  const [gate, setGate] = useState(cashierData.pharmacistGate);
  const { data } = useDashboardResource(`/api/dashboard/cashier?cashierId=${user?.sub ?? ""}`, cashierData);
  const kpis = data.kpis;

  useEffect(() => {
    setGate(data.pharmacistGate);
  }, [data.pharmacistGate]);

  return (
    <div className={styles.page}>
      <DashboardHeader user={user} roleLabel="Cashier" />

      <KpiGrid>
        <KpiBlock value={kpis.mySalesToday} label="My Sales Today" subtext={formatCurrency(kpis.myRevenueToday)} border="green" />
        <KpiBlock value={formatCurrency(kpis.myRevenueToday)} label="Revenue Today" subtext={`Cash ${formatCurrency(kpis.cashRevenue)} | Card ${formatCurrency(kpis.cardRevenue)}`} border="green" />
        <KpiBlock value={<span className={styles.gateValue}><i className={gate.available ? styles.greenDot : styles.redDot} />{gate.available ? "Available" : "Unavailable"}</span>} label="Pharmacist Status" subtext="Required for regulated medicines" border={gate.available ? "green" : "red"} />
        <KpiBlock value={kpis.readyReservations} label="Ready for Pickup" subtext="Customers can collect" border={kpis.readyReservations > 0 ? "amber" : "gray"} href="/reservations?status=ready" />
      </KpiGrid>

      <main className={styles.cashierGrid}>
        <div className={styles.column}>
          <div className={styles.posShortcut}>
            <ShoppingCart size={42} />
            <h2>Point of Sale</h2>
            <p>Process a new sale</p>
            <button type="button" onClick={() => router.push("/pos")}>Open POS</button>
          </div>
          <RecentSales rows={data.recentSales.slice(0, 5)} onView={setSelectedSale} />
        </div>
        <div className={styles.column}>
          <PharmacistGate gate={gate} />
          <ReadyReservations rows={data.readyReservations.slice(0, 5)} onConvert={(row) => router.push(`/pos?reservationId=${row._id}`)} />
        </div>
      </main>

      <SaleDetailModal sale={selectedSale} isPharmacist={false} onClose={() => setSelectedSale(null)} />
    </div>
  );
}

function RecentSales({ rows, onView }) {
  return (
    <Panel title="My Recent Sales" subtitle="Today's transactions">
      {rows.length === 0 ? (
        <p className={styles.mutedText}>No sales processed today</p>
      ) : (
        <table className={styles.compactTable}>
          <thead><tr><th>Receipt #</th><th>Time</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td className={styles.code}>{row.receiptNumber}</td>
                <td>{formatTime(row.createdAt)}</td>
                <td>{itemCountLabel(row.items)}</td>
                <td>{formatCurrency(row.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0))}</td>
                <td>{row.paymentMethod}</td>
                <td><span className={styles.statusCompleted}>Completed</span></td>
                <td><button type="button" className={styles.iconBtn} title="View" onClick={() => onView(row)}><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function PharmacistGate({ gate }) {
  return (
    <Panel title="Pharmacist Gate">
      <div className={gate.available ? styles.gateCardOk : styles.gateCardBad}>
        <strong><i />{gate.available ? "Available" : "Unavailable"}</strong>
        {gate.available ? (
          <>
            <span>{gate.pharmacistName} is online</span>
            <p>Regulated medicines can be processed</p>
          </>
        ) : (
          <>
            <span>No pharmacist is currently online</span>
            <p>Regulated medicine sales will be placed on hold</p>
            <small>Sales containing only non-prescription medicines and parapharmacy products can still be processed</small>
          </>
        )}
      </div>
    </Panel>
  );
}

function ReadyReservations({ rows, onConvert }) {
  return (
    <Panel title="Ready for Pickup" action={<MiniLink href="/reservations?status=ready">View All Ready</MiniLink>}>
      {rows.length === 0 ? (
        <p className={styles.mutedText}>No reservations ready for pickup</p>
      ) : (
        <div className={styles.readyList}>
          {rows.map((row) => (
            <div className={styles.readyRow} key={row._id}>
              <span className={styles.code}>{row.trackingCode}</span>
              <strong>{row.customerName}</strong>
              <small>{itemCountLabel(row.items)} - {formatDate(row.pickupDate)}</small>
              <button type="button" onClick={() => onConvert(row)}>Convert to Sale</button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
