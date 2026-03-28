import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "@/styles/SupplierDetailPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

const MOCK_SUPPLIERS = {
  s1: {
    _id: "s1",
    name: "MedPharma Distribution",
    contactPerson: "Hassan Ouali",
    email: "contact@medpharma.ma",
    phone: "+212 522334455",
    address: "Casablanca, Maarif",
    notes: "Preferred supplier for generic medicines.",
  },
  s2: {
    _id: "s2",
    name: "BioLab Morocco",
    contactPerson: "Samira Tazi",
    email: "samira@biolab.ma",
    phone: "+212 537112233",
    address: "Rabat, Agdal",
    notes: "",
  },
};

const MOCK_DELIVERIES = {
  s1: [
    {
      _id: "d1",
      medicine: { name: "Paracetamol 500mg" },
      batchNumber: "BATCH-2026-001",
      quantity: 100,
      purchasePrice: 12,
      salePrice: 18,
      expiryDate: "2027-06-30",
      deliveredAt: "2026-03-10",
    },
    {
      _id: "d2",
      medicine: { name: "Ibuprofen 400mg" },
      batchNumber: "BATCH-2026-002",
      quantity: 60,
      purchasePrice: 16,
      salePrice: 24,
      expiryDate: "2027-09-15",
      deliveredAt: "2026-03-15",
    },
  ],
  s2: [
    {
      _id: "d3",
      medicine: { name: "Vitamin C 1000mg" },
      batchNumber: "BATCH-2026-003",
      quantity: 200,
      purchasePrice: 28,
      salePrice: 42,
      expiryDate: "2028-01-01",
      deliveredAt: "2026-03-20",
    },
  ],
};

export default function SupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // TODO: replace with real SWR fetch
  const supplier = id ? MOCK_SUPPLIERS[id] ?? null : null;
  const deliveries = id ? MOCK_DELIVERIES[id] ?? [] : [];

  if (!id) return null;

  if (!supplier) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.push("/suppliers")}>
          ← Back to Suppliers
        </button>
        <p>Supplier not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/suppliers")}>
        ← Back to Suppliers
      </button>

      <div className={styles.topBar}>
        <h1 className={styles.name}>{supplier.name}</h1>
        <Button
          variant="primary"
          onClick={() => router.push(`/suppliers/${id}/delivery/new`)}
        >
          + Log Delivery
        </Button>
      </div>

      {/* Info cards */}
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Contact</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Contact Person</dt>
              <dd>{supplier.contactPerson ?? "—"}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Phone</dt>
              <dd>{supplier.phone ?? "—"}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Email</dt>
              <dd>{supplier.email ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Details</h3>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Address</dt>
              <dd>{supplier.address ?? "—"}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Deliveries</dt>
              <dd>{deliveries.length}</dd>
            </div>
            {supplier.notes && (
              <div className={styles.dlRow}>
                <dt>Notes</dt>
                <dd>{supplier.notes}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      {/* Deliveries */}
      <div>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Delivery History</h2>
        </div>
      </div>

      <div className={styles.deliveryTable}>
        {deliveries.length === 0 ? (
          <p className={styles.empty}>No deliveries recorded yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Expiry</th>
                <th>Delivered</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d._id}>
                  <td>{d.medicine?.name ?? "—"}</td>
                  <td className={styles.batchNo}>{d.batchNumber}</td>
                  <td>{d.quantity}</td>
                  <td>{formatCurrency(d.purchasePrice)}</td>
                  <td>{formatCurrency(d.salePrice)}</td>
                  <td>{formatDate(d.expiryDate)}</td>
                  <td>{formatDate(d.deliveredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

SupplierDetailPage.getLayout = AppLayout.getLayout;
