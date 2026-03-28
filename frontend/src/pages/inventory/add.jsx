import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddMedicineForm from "@/components/inventory/AddMedicineForm";
import api from "@/lib/axios";
import styles from "@/styles/InventoryAddPage.module.css";

export default function InventoryAddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      await api.post("/api/medicines", formData);
      toast.success("Medicine added successfully.");
      router.push("/inventory");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to add medicine.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add Medicine</h1>
      <AddMedicineForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

InventoryAddPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
