import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import styles from "@/styles/ParapharmacyDetailPage.module.css";

const adjustSchema = z.object({
  mode:   z.enum(["add", "subtract"]),
  qty:    z.coerce.number().int().min(1, "Must be ≥ 1"),
  reason: z.string().min(10, "At least 10 characters required"),
});

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ParapharmacyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState(false);

  async function loadProduct() {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/api/parapharmacy/${id}`);
      setProduct(data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.formHint}>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => router.push("/products")}>
          ← Back to Products
        </button>
        <p className={styles.formError}>Product not found</p>
      </div>
    );
  }

  const isLow = product.stockQty > 0 && product.stockQty <= product.minStockLevel;
  const stockStatus =
    !product.isActive  ? "expired" :
    product.stockQty === 0 ? "cancelled" :
    isLow              ? "pending"   : "confirmed";
  const stockLabel =
    !product.isActive  ? "Inactive"     :
    product.stockQty === 0 ? "Out of Stock" :
    isLow              ? "Low Stock"   : "In Stock";

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(adjustSchema),
    defaultValues: { mode: "add", qty: 1, reason: "" },
  });

  const mode = watch("mode");

  async function handleAdjust(data) {
    try {
      await api.patch("/api/stock/adjust", {
        productType: "parapharmacy",
        productId: product._id,
        adjustmentType: data.mode,
        quantity: data.qty,
        reason: data.reason,
      });
      await loadProduct();
      toast.success(`Stock ${data.mode === "add" ? "increased" : "decreased"} by ${data.qty} units`);
      reset({ mode: "add", qty: 1, reason: "" });
      setAdjustModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Failed to adjust stock");
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.push("/products")}>
        ← Back to Products
      </button>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{product.name}</h1>
          {product.brand && <p className={styles.subtitle}>{product.brand}</p>}
        </div>
        <div className={styles.headerActions}>
          <Badge variant={stockStatus}>{stockLabel}</Badge>
          <button className={styles.adjustBtn} onClick={() => setAdjustModal(true)}>
            <RefreshCw size={13} /> Adjust Stock
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Product Information</p>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Category</span>
              <span className={styles.infoValue} style={{ textTransform: "capitalize" }}>{product.category}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Brand</span>
              <span className={styles.infoValue}>{product.brand || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Supplier</span>
              <span className={styles.infoValue}>{product.supplier?.name || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Added</span>
              <span className={styles.infoValue}>{fmtDate(product.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>{product.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Pricing</p>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sale Price</span>
              <span className={[styles.infoValue, styles.mono].join(" ")}>{fmtMAD(product.salePrice)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Purchase Price</span>
              <span className={[styles.infoValue, styles.mono].join(" ")}>{fmtMAD(product.purchasePrice)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Margin</span>
              <span className={[styles.infoValue, styles.mono].join(" ")}>
                {fmtMAD(product.salePrice - product.purchasePrice)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Stock</p>
          <div className={styles.stockBig}>
            <span className={[
              styles.stockNum,
              product.stockQty === 0 ? styles.stockErr :
              isLow ? styles.stockWarn : ""
            ].join(" ")}>{product.stockQty}</span>
            <span className={styles.stockLbl}>units</span>
          </div>
          <div className={styles.stockMeta}>
            <span className={styles.infoLabel}>Min Stock Level</span>
            <span className={styles.mono} style={{ fontSize: 13 }}>{product.minStockLevel}</span>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModal}
        onClose={() => { setAdjustModal(false); reset(); }}
        title="Adjust Stock"
        size="sm"
        footer={
          <>
            <button
              className={styles.ghostBtn}
              onClick={() => { setAdjustModal(false); reset(); }}
            >
              Cancel
            </button>
            <button
              className={mode === "subtract" ? styles.dangerBtn : styles.primaryBtn}
              type="submit"
              form="adjust-form"
            >
              {mode === "add" ? "Add Stock" : "Subtract Stock"}
            </button>
          </>
        }
      >
        <form id="adjust-form" onSubmit={handleSubmit(handleAdjust)} noValidate>
          <div className={styles.modeRow}>
            <label className={styles.modeOption}>
              <input type="radio" value="add" {...register("mode")} />
              <span>Add stock</span>
            </label>
            <label className={styles.modeOption}>
              <input type="radio" value="subtract" {...register("mode")} />
              <span>Subtract stock</span>
            </label>
          </div>

          <div className={styles.formFields}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Quantity *</label>
              <input
                type="number"
                className={styles.formInput}
                {...register("qty")}
                min="1"
                placeholder="1"
              />
              {errors.qty && <p className={styles.formError}>{errors.qty.message}</p>}
              {mode === "subtract" && (
                <p className={styles.formHint}>Current stock: {product.stockQty} units</p>
              )}
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reason *</label>
              <textarea
                className={styles.formTextarea}
                rows={2}
                placeholder={mode === "add" ? "e.g. Restock from supplier" : "e.g. Damaged goods, returned"}
                {...register("reason")}
              />
              {errors.reason && <p className={styles.formError}>{errors.reason.message}</p>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

ParapharmacyDetailPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
