import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import DeliveryForm from "@/components/suppliers/DeliveryForm";
import styles from "@/styles/SupplierAddPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

// Reuse SupplierAddPage styles (same layout: back + title + card)

export default function SupplierDeliveryNewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      // TODO: replace with real API call: await api.post(`/api/suppliers/${id}/deliveries`, data)
      toast.success("Delivery logged successfully.");
      router.push(`/suppliers/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to log delivery.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => router.push(`/suppliers/${id}`)}>
          ← Back
        </button>
        <h1 className={styles.title}>Log Delivery</h1>
      </div>
      <div className={styles.card}>
        <DeliveryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

SupplierDeliveryNewPage.getLayout = AppLayout.getLayout;
