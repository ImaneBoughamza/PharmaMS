import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import OrderForm from "@/components/products/OrderForm";
import api from "@/lib/axios";
import styles from "@/styles/ProductOrdersPage.module.css";

export default function NewOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [parapharmacy, setParapharmacy] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [supplierResponse, medicineResponse, parapharmacyResponse] = await Promise.all([
          api.get("/api/suppliers", { params: { status: "active", limit: 500 } }),
          api.get("/api/medicines", { params: { status: "active", limit: 500 } }),
          api.get("/api/parapharmacy", { params: { status: "active", limit: 500 } }),
        ]);

        if (cancelled) return;

        setSuppliers((supplierResponse.data.data ?? []).filter((supplier) => supplier.isActive !== false));
        setMedicines((medicineResponse.data.data ?? []).filter((medicine) => medicine.isActive !== false));
        setParapharmacy((parapharmacyResponse.data.data ?? []).filter((product) => product.isActive !== false));
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message ?? "Failed to load purchase order options.");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      const productTypes = [...new Set(data.items.map((item) => item.productType))];
      if (productTypes.length > 1) {
        toast.error("Create separate purchase orders for medicines and parapharmacy products.");
        return;
      }

      await api.post("/api/orders", {
        supplierId: data.supplierId,
        productType: productTypes[0],
        items: data.items.map(({ productId, orderedQty }) => ({ productId, orderedQty })),
        notes: data.notes,
      });
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
        <OrderForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          suppliers={suppliers}
          medicines={medicines}
          parapharmacy={parapharmacy}
          loadingOptions={loadingOptions}
        />
      </div>
    </div>
  );
}

NewOrderPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
