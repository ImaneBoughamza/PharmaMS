import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddMedicineForm from "@/components/inventory/AddMedicineForm";
import styles from "@/styles/InventoryAddPage.module.css";

export default function ProductsAddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      // TODO: replace with real API call when backend is ready
      // await api.post("/api/medicines", formData);
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Medicine added successfully.");
      router.push("/products");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to add medicine.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div>
        <button className={styles.back} onClick={() => router.push("/products")}>
          ← Back to Products
        </button>
        <h1 className={styles.title} style={{ marginTop: 8 }}>Add Medicine</h1>
      </div>
      <AddMedicineForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

ProductsAddPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
