import { useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MedicineSearch from "@/components/pos/MedicineSearch";
import Cart from "@/components/pos/Cart";
import CheckoutPanel from "@/components/pos/CheckoutPanel";
import PharmacistApprovalModal from "@/components/pos/PharmacistApprovalModal";
import api from "@/lib/axios";
import styles from "@/styles/PosPage.module.css";

export default function PosPage() {
  const [cart, setCart]                   = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, status: "waiting" });

  const total = cart.reduce((sum, i) => sum + i.medicine.salePrice * i.qty, 0);

  function handleAdd(medicine) {
    setCart((prev) => {
      const existing = prev.find((i) => i.medicine._id === medicine._id);
      if (existing) {
        return prev.map((i) =>
          i.medicine._id === medicine._id
            ? { ...i, qty: Math.min(i.qty + 1, medicine.totalStock) }
            : i
        );
      }
      return [...prev, { medicine, qty: 1 }];
    });
  }

  function handleQtyChange(id, qty) {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) => (i.medicine._id === id ? { ...i, qty } : i))
    );
  }

  function handleRemove(id) {
    setCart((prev) => prev.filter((i) => i.medicine._id !== id));
  }

  async function handleCheckout(paymentMethod) {
    if (cart.length === 0) return;
    setIsLoading(true);

    const payload = {
      items: cart.map((i) => ({ medicineId: i.medicine._id, qty: i.qty })),
      paymentMethod,
    };

    try {
      const { data } = await api.post("/api/sales", payload);

      if (data.requiresApproval) {
        setApprovalModal({ isOpen: true, status: "waiting" });
        // Socket.io approval response will update the status in a real implementation
        return;
      }

      toast.success("Sale completed successfully.");
      setCart([]);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Checkout failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={styles.page}>
        {/* ── Left: search ── */}
        <div className={styles.left}>
          <h2 className={styles.sectionTitle}>Add Items</h2>
          <MedicineSearch onAdd={handleAdd} />
        </div>

        {/* ── Right: cart + checkout ── */}
        <div className={styles.right}>
          <div className={styles.cartCard}>
            <h2 className={styles.sectionTitle}>Cart ({cart.length})</h2>
            <Cart
              items={cart}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
            />
            <CheckoutPanel
              total={total}
              onCheckout={handleCheckout}
              isLoading={isLoading}
              disabled={cart.length === 0}
            />
          </div>
        </div>
      </div>

      <PharmacistApprovalModal
        isOpen={approvalModal.isOpen}
        status={approvalModal.status}
        onClose={() => { setApprovalModal({ isOpen: false, status: "waiting" }); setCart([]); }}
      />
    </>
  );
}

PosPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([]);
