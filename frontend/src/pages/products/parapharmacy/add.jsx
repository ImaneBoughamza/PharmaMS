import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddParapharmacyForm from "@/components/products/AddParapharmacyForm";
import styles from "@/styles/ParapharmacyPage.module.css";

export default function ParapharmacyAddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      // TODO: await api.post("/api/parapharmacy", data);
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Product added successfully.");
      router.push("/products");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to add product.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button className={styles.back} onClick={() => router.push("/products")}>
            ← Products
          </button>
          <h1 className={styles.title} style={{ marginTop: 6 }}>Add Parapharmacy Product</h1>
        </div>
      </div>
      <AddParapharmacyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

ParapharmacyAddPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
