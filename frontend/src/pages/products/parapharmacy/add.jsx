import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddParapharmacyForm from "@/components/products/AddParapharmacyForm";
import api from "@/lib/axios";
import styles from "@/styles/ParapharmacyPage.module.css";

export default function ParapharmacyAddPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      try {
        const { data } = await api.get("/api/suppliers", { params: { status: "active", limit: 200 } });
        const list = data.data ?? [];
        if (!cancelled) setSuppliers(list.filter((supplier) => supplier.isActive !== false));
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message ?? "Failed to load suppliers.");
      }
    }

    loadSuppliers();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      await api.post("/api/parapharmacy", data);
      toast.success("Product added successfully.");
      router.push("/products?tab=parapharmacy");
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
      <AddParapharmacyForm onSubmit={handleSubmit} isLoading={isLoading} suppliers={suppliers} />
    </div>
  );
}

ParapharmacyAddPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
