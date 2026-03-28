import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import MedicineTable from "@/components/inventory/MedicineTable";
import StockAlertBanner from "@/components/inventory/StockAlertBanner";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST } from "@/constants/roles";
import styles from "@/styles/InventoryPage.module.css";

// TEMP: mock data for visual testing — remove when backend is ready
const MOCK = [
  { _id: "1", name: "Paracetamol 500mg", genericName: "Paracetamol", category: "OTC",          unit: "tablet", batchCount: 2, totalStock: 8,   status: "Critical" },
  { _id: "2", name: "Amoxicillin 1g",    genericName: "Amoxicillin",  category: "Prescription", unit: "tablet", batchCount: 1, totalStock: 42,  status: "OK" },
  { _id: "3", name: "Ibuprofen 400mg",   genericName: "Ibuprofen",    category: "OTC",          unit: "tablet", batchCount: 3, totalStock: 19,  status: "Low" },
  { _id: "4", name: "Vitamin C 1000mg",  genericName: "Ascorbic Acid",category: "OTC",          unit: "tablet", batchCount: 1, totalStock: 63,  status: "OK" },
  { _id: "5", name: "Diazepam 5mg",      genericName: "Diazepam",     category: "Regulated",    unit: "tablet", batchCount: 1, totalStock: 14,  status: "Low" },
];

export default function InventoryPage() {
  const { role } = useAuth();

  // TODO: replace with useSWR("/api/medicines", fetcher) when backend is ready
  const data = MOCK;
  const isLoading = false;
  const error = null;

  const lowStockCount = data?.filter((m) => m.status === "Low" || m.status === "Critical").length ?? 0;

  if (isLoading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (error) return <Alert variant="error">Failed to load inventory.</Alert>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory</h1>
        {role === PHARMACIST && (
          <Link href="/inventory/add" className={styles.addBtn}>
            + Add Medicine
          </Link>
        )}
      </div>

      <StockAlertBanner count={lowStockCount} />
      <MedicineTable medicines={data ?? []} />
    </div>
  );
}

InventoryPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
