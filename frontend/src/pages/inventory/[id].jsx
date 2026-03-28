import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import BatchList from "@/components/inventory/BatchList";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import styles from "@/styles/InventoryDetailPage.module.css";

// TEMP: mock data for visual testing — remove when backend is ready
const MOCK = {
  _id: "1",
  name: "Paracetamol 500mg",
  genericName: "Paracetamol",
  category: "OTC",
  unit: "tablet",
  minStockLevel: 20,
  batches: [
    { _id: "b1", batchNumber: "PC-2401", expiryDate: "2026-05-18", initialQty: 100, remainingQty: 8,  salePrice: 22.5,  purchasePrice: 15 },
    { _id: "b2", batchNumber: "PC-2312", expiryDate: "2025-11-30", initialQty: 200, remainingQty: 0,  salePrice: 22.5,  purchasePrice: 14.5 },
  ],
};

export default function InventoryDetailPage() {
  const router = useRouter();

  // TODO: replace mock with real SWR when backend is ready
  // const { data, error, isLoading } = useSWR(id ? `/api/medicines/${id}` : null, fetcher);
  const data = MOCK;
  const isLoading = false;
  const error = null;

  if (isLoading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (error)     return <Alert variant="error">Failed to load medicine details.</Alert>;
  if (!data)     return null;

  const totalStock = data.batches?.reduce((s, b) => s + b.remainingQty, 0) ?? 0;
  const status = totalStock === 0
    ? "Critical"
    : totalStock < data.minStockLevel
    ? "Low"
    : "OK";
  const statusVariant = status === "Critical" ? "error" : status === "Low" ? "warning" : "success";

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/inventory")}>
        ← Back to Inventory
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{data.name}</h1>
          {data.genericName && (
            <p className={styles.generic}>{data.genericName}</p>
          )}
        </div>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Category</span>
          <span className={styles.metaValue}>{data.category}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Unit</span>
          <span className={styles.metaValue}>{data.unit}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Total Stock</span>
          <span className={styles.metaValue}>{totalStock} {data.unit}s</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Min Stock Level</span>
          <span className={styles.metaValue}>{data.minStockLevel}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Batches</h2>
        <BatchList batches={data.batches ?? []} />
      </div>
    </div>
  );
}

InventoryDetailPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
