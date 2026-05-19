import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import AddMedicineForm from "@/components/inventory/AddMedicineForm";
import api from "@/lib/axios";
import styles from "@/styles/InventoryAddPage.module.css";

export default function ProductsAddPage() {
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

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        genericName: formData.genericName || "",
        category: formData.category,
        unit: formData.unit,
        supplierId: formData.supplierId,
        purchasePrice: formData.purchasePrice,
        salePrice: formData.salePrice,
        minStockLevel: formData.minStockLevel,
        initialBatch: {
          batchNumber: formData.batchNumber,
          expiryDate: new Date(`${formData.expiryDate}T00:00:00.000Z`).toISOString(),
          receivedQty: formData.initialQty,
        },
      };

      await api.post("/api/medicines", payload);
      toast.success("Medicine added successfully.");
      router.push("/products?tab=medicines");
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
      <AddMedicineForm onSubmit={handleSubmit} isLoading={isLoading} suppliers={suppliers} />
    </div>
  );
}

ProductsAddPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
