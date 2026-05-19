import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MedicineSearch from "@/components/pos/MedicineSearch";
import Cart from "@/components/pos/Cart";
import CheckoutPanel from "@/components/pos/CheckoutPanel";
import BillView from "@/components/pos/BillView";
import PharmacistApprovalModal from "@/components/pos/PharmacistApprovalModal";
import SalesHistory from "@/components/pos/SalesHistory";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { withRoleGuard } from "@/utils/roleGuard";
import { PHARMACIST, ASSISTANT, CASHIER } from "@/constants/roles";
import styles from "@/styles/PosPage.module.css";

function buildReceipt(cartData, paymentMethod, cashierName, sale) {
  const now = sale?.createdAt ? new Date(sale.createdAt) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const medicines = cartData
    .filter((i) => i.item.type === "medicine")
    .map((i) => ({
      name: i.item.name,
      qty: i.qty,
      unitPrice: i.item.salePrice,
      total: i.item.salePrice * i.qty,
    }));
  const parapharmacy = cartData
    .filter((i) => i.item.type !== "medicine")
    .map((i) => ({
      name: i.item.name,
      qty: i.qty,
      unitPrice: i.item.salePrice,
      total: i.item.salePrice * i.qty,
    }));
  const medSubtotal = medicines.reduce((s, i) => s + i.total, 0);
  const paraSubtotal = parapharmacy.reduce((s, i) => s + i.total, 0);
  return {
    receiptNumber:
      sale?.invoice?.receiptNumber ??
      `RCP-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    pharmacyName: "PharmaMS Central",
    date: now.toLocaleDateString("fr-MA"),
    time: now.toLocaleTimeString("fr-MA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    cashierName,
    paymentMethod,
    medicines,
    parapharmacy,
    medSubtotal,
    paraSubtotal,
    total: medSubtotal + paraSubtotal,
  };
}

function requiresPharmacistGate(cartItems) {
  return cartItems.some(
    (i) => i.item.type === "medicine" && i.item.category === "regulated",
  );
}

export default function PosPage({ user: serverUser }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = authUser ?? serverUser;

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [approvalState, setApprovalState] = useState(null);
  const [reservationBanner, setReservationBanner] = useState(null);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState("Cash");
  const [salesHistoryRefresh, setSalesHistoryRefresh] = useState(0);

  // Pre-populate cart when navigating from a reservation's Convert to Sale button
  useEffect(() => {
    const { reservationId } = router.query;
    if (!reservationId) return;
    let cancelled = false;

    async function loadReservationCart() {
      try {
        const { data } = await api.post(
          `/api/reservations/${reservationId}/convert`,
        );
        if (cancelled) return;
        const res = data.data;
        const cartItems = (res.cartItems || []).map((item) => ({
          item: {
            _id: item.productId,
            name: item.name,
            type: item.productType,
            category: item.category || "non-prescription",
            stock: item.qty,
            salePrice: item.unitPrice,
          },
          qty: item.qty,
        }));
        setCart(cartItems);
        setReservationBanner({
          code: res.confirmationCode,
          customerName: res.customerName,
        });
        setInitialPaymentMethod(
          res.paymentMethod === "online" ? "Card" : "Cash",
        );
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err.response?.data?.message ||
              "Could not load reservation into POS",
          );
        }
      }
    }

    loadReservationCart();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.reservationId]);
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
    if (approvalStatus !== "never") return;
    const t = setTimeout(() => {
      setApprovalState((prev) =>
        prev ? { ...prev, status: "approved", approvedBy: "Dr. Benali" } : null,
      );
    }, 8000);
    return () => clearTimeout(t);
  }, [approvalStatus]);

  // Auto-proceed 1 s after approval
  useEffect(() => {
    if (approvalStatus !== "approved" || !approvalState) return;
    const t = setTimeout(() => {
      setApprovalState(null);
      // Sale already completed after the backend gate response.
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
          i.item._id === item._id
            ? { ...i, qty: Math.min(i.qty + 1, item.stock) }
            : i,
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function handleQtyChange(id, qty) {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) =>
        i.item._id === id ? { ...i, qty: Math.min(qty, i.item.stock) } : i,
      ),
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
      (i) => i.item.type === "medicine" && i.item.category === "regulated",
    );

    if (regulatedItems.length > 0) {
      if (user?.role === PHARMACIST) {
        // Pharmacist is their own approver — skip gate, notice shown inline in CheckoutPanel
        doSale(cart, paymentMethod);
      } else {
        // Non-pharmacist: attach prescription first, then backend waits for pharmacist response.
        setApprovalState({
          status: "upload",
          regulatedItems,
          cartSnapshot: cart,
          paymentMethod,
          prescriptionImage: null,
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

  async function doSale(cartData, paymentMethod, options = {}) {
    setIsLoading(true);
    try {
      const salePayload = {
        items: cartData
          .filter((i) => i.item.type === "medicine")
          .map((i) => ({ medicineId: i.item._id, qty: i.qty })),
        parapharmacyItems: cartData
          .filter((i) => i.item.type !== "medicine")
          .map((i) => ({ productId: i.item._id, qty: i.qty })),
        paymentMethod: paymentMethod.toLowerCase(),
      };

      if (options.prescriptionImage) {
        salePayload.prescriptionImage = options.prescriptionImage;
      }

      if (
        router.query.reservationId &&
        /^[a-f\d]{24}$/i.test(String(router.query.reservationId))
      ) {
        salePayload.reservationId = String(router.query.reservationId);
      }

      const { data } = await api.post("/api/sales", salePayload);
      const sale = data.data;
      const cashierName = user?.fullName ?? user?.email ?? "Staff";
      const rec = buildReceipt(cartData, paymentMethod, cashierName, sale);
      setCart([]);
      setReceipt(rec);
      setSalesHistoryRefresh((value) => value + 1);
      if (options.requiresApproval) {
        setApprovalState((prev) =>
          prev
            ? { ...prev, status: "approved", approvedBy: "Pharmacist" }
            : null,
        );
      }
      toast.success(`Sale completed - Receipt #${rec.receiptNumber}`);
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Checkout failed. Please try again.";
      if (options.requiresApproval) {
        const rejected = message.toLowerCase().includes("rejected");
        setApprovalState((prev) =>
          prev
            ? {
                ...prev,
                status: rejected ? "rejected" : "timeout",
                rejectedBy: rejected ? "Pharmacist" : null,
                rejectionReason: rejected ? message : null,
              }
            : null,
        );
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrescriptionSubmit(prescriptionImage) {
    if (!approvalState) return;
    const cartSnapshot = approvalState.cartSnapshot || cart;
    const paymentMethod = approvalState.paymentMethod;
    setApprovalState((prev) =>
      prev ? { ...prev, status: "waiting", prescriptionImage } : null,
    );
    doSale(cartSnapshot, paymentMethod, {
      requiresApproval: true,
      prescriptionImage,
    });
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
    setApprovalState((prev) => (prev ? { ...prev, status: "timeout" } : null));
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
                  {reservationBanner && (
                    <div className={styles.reservationBanner}>
                      Converting reservation{" "}
                      <strong>{reservationBanner.code}</strong> —{" "}
                      {reservationBanner.customerName}
                    </div>
                  )}
                  <div className={styles.cartHeader}>
                    <h2 className={styles.sectionTitle}>Cart</h2>
                    {cart.length > 0 && (
                      <span className={styles.cartCount}>
                        {cart.length} item{cart.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {cart.length > 0 && (
                      <button
                        className={styles.clearCartBtn}
                        onClick={handleClearCart}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <Cart
                    items={cart}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
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
                initialPaymentMethod={initialPaymentMethod}
                pharmacistNotice={
                  user?.role === PHARMACIST && requiresPharmacistGate(cart)
                }
              />
            </div>
          </div>
        </div>

        {/* ── Sales History (scrolls below) ── */}
        <hr className={styles.separator} />
        <SalesHistory
          userRole={user?.role}
          userId={user?.userId ?? user?.sub}
          refreshKey={salesHistoryRefresh}
        />
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
          onSubmitPrescription={handlePrescriptionSubmit}
          onCancel={handleApprovalCancel}
          onTimeout={handleApprovalTimeout}
          onBackToCart={handleApprovalBackToCart}
        />
      )}
    </>
  );
}

PosPage.getLayout = AppLayout.getLayout;

export const getServerSideProps = withRoleGuard([
  PHARMACIST,
  ASSISTANT,
  CASHIER,
]);
