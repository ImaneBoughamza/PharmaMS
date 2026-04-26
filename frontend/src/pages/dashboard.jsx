import { useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import AlertFeed from "@/components/dashboard/AlertFeed";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST, ASSISTANT, CASHIER } from "@/constants/roles";
import styles from "@/styles/Dashboard.module.css";

const MOCK = {
  [PHARMACIST]: {
    revenueToday: 12480,
    revenueTrend: 11.3,
    lowStockCount: 23,
    expiringSoonCount: 14,
    pendingApprovals: 2,
    salesChart: [
      { date: "Mon", total: 8200 },
      { date: "Tue", total: 9400 },
      { date: "Wed", total: 7800 },
      { date: "Thu", total: 11200 },
      { date: "Fri", total: 10500 },
      { date: "Sat", total: 13400 },
      { date: "Sun", total: 12480 },
    ],
    stockAlerts: [
      { medicineName: "Paracetamol 500mg", message: "8 units left", type: "low" },
      { medicineName: "Amoxicillin Batch AX493", message: "Expires in 18 days", type: "expiry" },
      { medicineName: "Ibuprofen 400mg", message: "5 units left", type: "low" },
    ],
    approvalQueue: [
      { _id: "s1", cashier: "Sara Benali", itemCount: 3, total: 340, regulated: "Tramadol 50mg" },
      { _id: "s2", cashier: "Ahmed Tazi", itemCount: 1, total: 95, regulated: "Codeine 30mg" },
    ],
  },
  [ASSISTANT]: {
    lowStockCount: 23,
    expiringSoonCount: 14,
    pendingReservations: 5,
    stockAlerts: [
      { medicineName: "Paracetamol 500mg", message: "8 units left", type: "low" },
      { medicineName: "Amoxicillin Batch AX493", message: "Expires in 18 days", type: "expiry" },
      { medicineName: "Ibuprofen 400mg", message: "5 units left", type: "low" },
    ],
    upcomingReservations: [
      { _id: "r1", patientName: "M. El Fassi", medicine: "Metformin 500mg", qty: 2, status: "confirmed" },
      { _id: "r2", patientName: "L. Benali", medicine: "Levothyrox 50mcg", qty: 1, status: "pending" },
      { _id: "r3", patientName: "K. Alaoui", medicine: "Amoxicillin 500mg", qty: 3, status: "confirmed" },
    ],
  },
  [CASHIER]: {
    mySalesToday: 7,
    readyForPickup: 3,
    recentSales: [
      { _id: "sale1", receipt: "RC-20260424-001", items: 2, total: 340, time: "10:30" },
      { _id: "sale2", receipt: "RC-20260424-002", items: 1, total: 95, time: "11:15" },
      { _id: "sale3", receipt: "RC-20260424-003", items: 4, total: 580, time: "12:00" },
    ],
    readyReservations: [
      { _id: "r1", patientName: "M. El Fassi", code: "RES-001", medicine: "Metformin 500mg" },
      { _id: "r2", patientName: "K. Alaoui", code: "RES-003", medicine: "Amoxicillin 500mg" },
      { _id: "r3", patientName: "N. Tahiri", code: "RES-005", medicine: "Omeprazole 20mg" },
    ],
  },
};

function PharmacistDashboard({ data }) {
  return (
    <>
      <div className={styles.kpiRow}>
        <KpiCard
          label="Revenue Today"
          value={formatCurrency(data.revenueToday)}
          trend={`${data.revenueTrend}%`}
          trendUp={data.revenueTrend >= 0}
        />
        <KpiCard label="Low Stock Items" value={data.lowStockCount} />
        <KpiCard label="Expiring Soon" value={data.expiringSoonCount} />
        <KpiCard label="Pending Approvals" value={data.pendingApprovals} />
      </div>

      <div className={styles.mainGrid}>
        <SalesChart data={data.salesChart} />
        <AlertFeed alerts={data.stockAlerts} />
      </div>

      {data.approvalQueue.length > 0 && (
        <div className={styles.panel}>
          <p className={styles.sectionTitle}>Pharmacist Approval Queue</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cashier</th>
                <th>Items</th>
                <th>Regulated Medicine</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.approvalQueue.map((a) => (
                <tr key={a._id}>
                  <td>{a.cashier}</td>
                  <td>{a.itemCount}</td>
                  <td className={styles.regulated}>{a.regulated}</td>
                  <td>{formatCurrency(a.total)}</td>
                  <td>
                    <div className={styles.approvalActions}>
                      <button className={styles.approveBtn}>Approve</button>
                      <button className={styles.rejectBtn}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function AssistantDashboard({ data }) {
  return (
    <>
      <div className={styles.kpiRow3}>
        <KpiCard label="Low Stock Items" value={data.lowStockCount} />
        <KpiCard label="Expiring Soon" value={data.expiringSoonCount} />
        <KpiCard label="Pending Reservations" value={data.pendingReservations} />
      </div>

      <div className={styles.mainGrid}>
        <AlertFeed alerts={data.stockAlerts} />
        <div className={styles.panel}>
          <p className={styles.sectionTitle}>Upcoming Reservations</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.upcomingReservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.patientName}</td>
                  <td>{r.medicine}</td>
                  <td>{r.qty}</td>
                  <td><Badge variant={r.status}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CashierDashboard({ data }) {
  return (
    <>
      <div className={styles.kpiRow2}>
        <KpiCard label="My Sales Today" value={data.mySalesToday} />
        <KpiCard label="Ready for Pickup" value={data.readyForPickup} />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.panel}>
          <p className={styles.sectionTitle}>My Recent Sales</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSales.map((s) => (
                <tr key={s._id}>
                  <td className={styles.mono}>{s.receipt}</td>
                  <td>{s.items}</td>
                  <td>{formatCurrency(s.total)}</td>
                  <td className={styles.mono}>{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <p className={styles.sectionTitle}>Ready for Pickup</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Code</th>
                <th>Medicine</th>
              </tr>
            </thead>
            <tbody>
              {data.readyReservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.patientName}</td>
                  <td className={styles.mono}>{r.code}</td>
                  <td>{r.medicine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const SUBTITLE = {
  [PHARMACIST]: "Pharmacy overview — revenue, stock health, and pending approvals.",
  [ASSISTANT]: "Stock alerts and upcoming reservations.",
  [CASHIER]: "Your sales activity and reservations ready for pickup.",
};

export default function DashboardPage() {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !role) router.replace("/login");
  }, [isLoading, role, router]);

  if (isLoading || !role) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.subtitle}>Loading…</p>
        </div>
      </div>
    );
  }

  const data = MOCK[role] ?? MOCK[PHARMACIST];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>{SUBTITLE[role]}</p>
      </div>

      {role === PHARMACIST && <PharmacistDashboard data={data} />}
      {role === ASSISTANT && <AssistantDashboard data={data} />}
      {role === CASHIER && <CashierDashboard data={data} />}
    </div>
  );
}

DashboardPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([]);
