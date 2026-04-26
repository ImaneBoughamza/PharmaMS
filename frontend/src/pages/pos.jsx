import { useState, useEffect } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MedicineSearch from "@/components/pos/MedicineSearch";
import Cart from "@/components/pos/Cart";
import CheckoutPanel from "@/components/pos/CheckoutPanel";
import BillView from "@/components/pos/BillView";
import PharmacistApprovalModal from "@/components/pos/PharmacistApprovalModal";
import SalesHistory from "@/components/pos/SalesHistory";
import styles from "@/styles/PosPage.module.css";

const MOCK_USER = { id: "u1", role: "cashier", name: "Imane B." };

function buildReceipt(cartData, paymentMethod, cashierName) {
  const now = new Date();
  const pad  = (n) => String(n).padStart(2, "0");
  const medicines = cartData
    .filter((i) => i.item.type === "medicine")
    .map((i)  => ({ name: i.item.name, qty: i.qty, unitPrice: i.item.salePrice, total: i.item.salePrice * i.qty }));
  const parapharmacy = cartData
    .filter((i) => i.item.type !== "medicine")
    .map((i)  => ({ name: i.item.name, qty: i.qty, unitPrice: i.item.salePrice, total: i.item.salePrice * i.qty }));
  const medSubtotal  = medicines.reduce((s, i)    => s + i.total, 0);
  const paraSubtotal = parapharmacy.reduce((s, i) => s + i.total, 0);
  return {
    receiptNumber: `RCP-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    pharmacyName: "PharmaOS Central",
    date: now.toLocaleDateString("fr-MA"),
    time: now.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" }),
    cashierName,
    paymentMethod,
    medicines,
    parapharmacy,
    medSubtotal,
    paraSubtotal,
    total: medSubtotal + paraSubtotal,
  };
}

export default function PosPage() {
  const [cart,          setCart]          = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [receipt,       setReceipt]       = useState(null);
  const [approvalState, setApprovalState] = useState(null);
  // approvalState: null | { status, regulatedItems, cartSnapshot, paymentMethod, approvedBy, rejectedBy, rejectionReason }

  const approvalStatus = approvalState ? approvalState.status : null;

  // Socket.io setup — connect on mount, disconnect on unmount
  useEffect(() => {
    // TODO: uncomment when backend is ready
    // const socket = io(process.env.NEXT_PUBLIC_API_URL);
    // socket.on("APPROVAL_RESPONSE", ({ saleRequestId, status, pharmacistName }) => {
    //   setApprovalState((prev) => {
    //     if (!prev || prev.saleRequestId !== saleRequestId) return prev;
    //     return {
    //       ...prev,
    //       status,
    //       approvedBy:  status === "approved" ? pharmacistName : null,
    //       rejectedBy:  status === "rejected" ? pharmacistName : null,
    //     };
    //   });
    // });
    // return () => socket.disconnect();
  }, []);

  // Mock socket: simulate pharmacist approving after 8 s (remove when real socket is connected)
  useEffect(() => {
    if (approvalStatus !== "waiting") return;
    const t = setTimeout(() => {
      setApprovalState((prev) =>
        prev ? { ...prev, status: "approved", approvedBy: "Dr. Benali" } : null
      );
    }, 8000);
    return () => clearTimeout(t);
  }, [approvalStatus]);

  // Auto-proceed 1 s after approval
  useEffect(() => {
    if (approvalStatus !== "approved" || !approvalState) return;
    const { cartSnapshot, paymentMethod } = approvalState;
    const t = setTimeout(() => {
      setApprovalState(null);
      doSale(cartSnapshot, paymentMethod);
    }, 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalStatus]);

  /* ── Cart actions ── */
  function handleAdd(item) {
    setCart((prev) => {
      const existing = prev.find((i) => i.item._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.item._id === item._id ? { ...i, qty: Math.min(i.qty + 1, item.stock) } : i
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function handleQtyChange(id, qty) {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) => i.item._id === id ? { ...i, qty: Math.min(qty, i.item.stock) } : i)
    );
  }

  function handleRemove(id) {
    setCart((prev) => prev.filter((i) => i.item._id !== id));
  }

  function handleClearCart() {
    setCart([]);
  }

  /* ── Checkout flow ── */
  function handleCheckout(paymentMethod) {
    // Step 1: guard (also enforced by disabled button, but belt-and-suspenders)
    if (cart.length === 0) return;
    const hasOverStock = cart.some((i) => i.qty > i.item.stock);
    if (hasOverStock) return;

    // Step 2: regulated medicine check
    const regulatedItems = cart.filter(
      (i) => i.item.type === "medicine" && i.item.category === "regulated"
    );

    if (regulatedItems.length > 0) {
      if (MOCK_USER.role === "pharmacist") {
        // Pharmacist is their own approver — skip gate, notice shown inline in CheckoutPanel
        doSale(cart, paymentMethod);
      } else {
        // Non-pharmacist: requires pharmacist approval via gate
        setApprovalState({
          status: "waiting",
          regulatedItems,
          cartSnapshot: cart,
          paymentMethod,
          approvedBy: null,
          rejectedBy: null,
          rejectionReason: null,
        });
      }
      return;
    }

    // Step 4: no regulated items — proceed directly
    doSale(cart, paymentMethod);
  }

  async function doSale(cartData, paymentMethod) {
    setIsLoading(true);
    try {
      // TODO: replace with real API call
      // const { data } = await api.post("/api/sales", {
      //   items: cartData.map((i) => ({ productId: i.item._id, productType: i.item.type, qty: i.qty })),
      //   paymentMethod,
      // });
      // const rec = buildReceipt(cartData, paymentMethod, data.cashierName ?? MOCK_USER.name);
      await new Promise((r) => setTimeout(r, 700));
      const rec = buildReceipt(cartData, paymentMethod, MOCK_USER.name);
      setCart([]);
      setReceipt(rec);
      toast.success(`Sale completed — Receipt #${rec.receiptNumber}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewSale() {
    setReceipt(null);
    setCart([]);
  }

  /* ── Approval modal callbacks ── */
  function handleApprovalCancel() {
    setApprovalState(null);
    // cart remains intact
  }

  function handleApprovalTimeout() {
    setApprovalState((prev) => prev ? { ...prev, status: "timeout" } : null);
  }

  function handleApprovalBackToCart() {
    setApprovalState(null);
    // cart remains intact
  }

  return (
    <>
      <div className={styles.wrapper}>
        {/* ── POS area (viewport-filling) ── */}
        <div className={styles.page}>
          {/* Left column */}
          <div className={styles.left}>
            {receipt ? (
              <BillView receipt={receipt} onNewSale={handleNewSale} />
            ) : (
              <>
                <div className={styles.searchSection}>
                  <MedicineSearch onAdd={handleAdd} />
                </div>
                <div className={styles.cartSection}>
                  <div className={styles.cartHeader}>
                    <h2 className={styles.sectionTitle}>Cart</h2>
                    {cart.length > 0 && (
                      <span className={styles.cartCount}>
                        {cart.length} item{cart.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {cart.length > 0 && (
                      <button className={styles.clearCartBtn} onClick={handleClearCart}>
                        Clear all
                      </button>
                    )}
                  </div>
                  <Cart items={cart} onQtyChange={handleQtyChange} onRemove={handleRemove} />
                </div>
              </>
            )}
          </div>

          {/* Right column */}
          <div className={styles.right}>
            <div className={styles.cartCard}>
              <CheckoutPanel
                cart={cart}
                onCheckout={handleCheckout}
                isLoading={isLoading}
                receipt={receipt}
                onNewSale={handleNewSale}
                pharmacistNotice={
                  MOCK_USER.role === "pharmacist" &&
                  cart.some((i) => i.item.type === "medicine" && i.item.category === "regulated")
                }
              />
            </div>
          </div>
        </div>

        {/* ── Sales History (scrolls below) ── */}
        <hr className={styles.separator} />
        <SalesHistory userRole={MOCK_USER.role} userId={MOCK_USER.id} />
      </div>

      {/* ── Pharmacist Approval Modal (fixed overlay) ── */}
      {approvalState && (
        <PharmacistApprovalModal
          isOpen
          status={approvalState.status}
          regulatedItems={approvalState.regulatedItems}
          approvedBy={approvalState.approvedBy}
          rejectedBy={approvalState.rejectedBy}
          rejectionReason={approvalState.rejectionReason}
          onCancel={handleApprovalCancel}
          onTimeout={handleApprovalTimeout}
          onBackToCart={handleApprovalBackToCart}
        />
      )}
    </>
  );
}

PosPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT, CASHIER]);
