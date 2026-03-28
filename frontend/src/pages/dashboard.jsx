import AppLayout from "@/components/layout/AppLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import AlertFeed from "@/components/dashboard/AlertFeed";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "@/styles/Dashboard.module.css";

// TEMP: mock data for visual testing — remove when backend is ready
const data = {
  salesToday: 12480,
  salesTrend: 11.3,
  lowStockCount: 23,
  expiringSoonCount: 14,
  salesChart: [
    { date: "Mon", total: 8200 },
    { date: "Tue", total: 9400 },
    { date: "Wed", total: 7800 },
    { date: "Thu", total: 11200 },
    { date: "Fri", total: 10500 },
    { date: "Sat", total: 13400 },
    { date: "Sun", total: 12480 },
  ],
  alerts: [
    { medicineName: "Paracetamol 500mg", message: "Only 8 units left", type: "low" },
    { medicineName: "Amoxicillin Batch AX493", message: "Expires in 18 days", type: "expiry" },
    { medicineName: "Ibuprofen 400mg", message: "Only 5 units left", type: "low" },
  ],
};

export default function DashboardPage() {
  const kpis = [
    {
      label: "Total Sales Today",
      value: formatCurrency(data.salesToday),
      trend: data.salesTrend,
      trendUp: data.salesTrend >= 0,
    },
    {
      label: "Low Stock Items",
      value: data.lowStockCount,
    },
    {
      label: "Expiring Soon",
      value: data.expiringSoonCount,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className={styles.mainGrid}>
        <SalesChart data={data?.salesChart ?? []} />
        <AlertFeed alerts={data?.alerts ?? []} />
      </div>
    </div>
  );
}

DashboardPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([]);
