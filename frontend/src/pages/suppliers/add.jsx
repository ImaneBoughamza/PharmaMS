import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddSupplierForm from "@/components/suppliers/AddSupplierForm";
import styles from "@/styles/SupplierAddPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

export default function SupplierAddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      // TODO: replace with real API call: await api.post("/api/suppliers", data)
      toast.success("Supplier added successfully.");
      router.push("/suppliers");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to add supplier.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => router.push("/suppliers")}>
          ← Back
        </button>
        <h1 className={styles.title}>Add Supplier</h1>
      </div>
      <div className={styles.card}>
        <AddSupplierForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

SupplierAddPage.getLayout = AppLayout.getLayout;
