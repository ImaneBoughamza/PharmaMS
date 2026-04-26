import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import OrderForm from "@/components/products/OrderForm";
import styles from "@/styles/ProductOrdersPage.module.css";

export default function NewOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      // TODO: await api.post("/api/orders", data);
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Purchase order submitted.");
      router.push("/products/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit order.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button className={styles.back} onClick={() => router.push("/products/orders")}>
            ← Back to Orders
          </button>
          <h1 className={styles.title} style={{ marginTop: 8 }}>New Purchase Order</h1>
        </div>
      </div>
      <div className={styles.card}>
        <OrderForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

NewOrderPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
