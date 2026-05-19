import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Check, Copy, Search } from "lucide-react";
import ProductSearch from "@/components/ProductSearch";
import api from "@/lib/axios";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/ReservationTrackPage.module.css";

const STATUS_INFO = {
  pending: {
    label: "Pending Review",
    tone: "warning",
    lines: ["Your reservation is awaiting pharmacist review.", "We will notify you by email once it is confirmed."],
  },
  confirmed: {
    label: "Confirmed",
    tone: "info",
    lines: ["Your reservation has been approved.", "We will notify you when it is ready for pickup."],
  },
  ready: {
    label: "Ready for Pickup",
    tone: "success",
    lines: ["Your reservation is ready for pickup."],
  },
  expired: {
    label: "Expired",
    tone: "neutral",
    lines: ["This reservation has expired.", "Please submit a new reservation if you still need these items."],
  },
  cancelled: {
    label: "Cancelled",
    tone: "error",
    lines: ["This reservation has been cancelled."],
  },
};

const BADGE_CLASS = {
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
  success: styles.badgeSuccess,
  neutral: styles.badgeNeutral,
  error: styles.badgeError,
};

function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getMaxDate() {
  const date = new Date();
  date.setHours(date.getHours() + 48);
  return date.toISOString().slice(0, 10);
}

function paymentLabel(value) {
  if (value === "card" || value === "Online Payment") return "Online Payment";
  if (value === "insurance") return "Insurance";
  return "Pay on Pickup";
}

function paymentToApi(value) {
  return value === "Online Payment" ? "online" : "pay-on-pickup";
}

function getCode(reservation) {
  return reservation?.trackingCode ?? reservation?.confirmationCode ?? reservation?.code ?? "";
}

function normalizeItem(item, index) {
  const product = item.medicineId && typeof item.medicineId === "object" ? item.medicineId : null;
  return {
    id: item.productId ?? product?._id ?? item.medicineId ?? `item-${index}`,
    productName: item.productName ?? product?.name ?? item.name ?? "Reserved item",
    productType: item.productType ?? item.type ?? "medicine",
    qty: item.qty ?? item.quantity ?? 1,
    unitPrice: item.unitPrice ?? item.price ?? 0,
  };
}

function normalizeReservation(data) {
  return {
    ...data,
    trackingCode: getCode(data),
    customerName: data.customerName ?? data.name ?? "Customer",
    email: data.email ?? data.customerEmail ?? "",
    paymentMethod: paymentLabel(data.paymentMethod),
    items: (data.items ?? []).map(normalizeItem),
  };
}

function getLocalReservation(code) {
  if (typeof window === "undefined") return null;
  const reservations = JSON.parse(window.localStorage.getItem("pharmaos_reservations") || "{}");
  return reservations[code] ?? null;
}

function BrandButton({ onClick }) {
  return (
    <button className={styles.brand} onClick={onClick} type="button">
      <img className={styles.brandLogo} src="/pharmaos-logo.svg" alt="" aria-hidden="true" />
      <span className={styles.brandName}>PharmaMS</span>
    </button>
  );
}

export default function ReservationTrackPage() {
  const router = useRouter();
  const rawCode = router.query.code;
  const urlCode = Array.isArray(rawCode) ? rawCode[0] : rawCode;

  const [inputCode, setInputCode] = useState("");
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updItems, setUpdItems] = useState([]);
  const [updDate, setUpdDate] = useState("");
  const [updPayment, setUpdPayment] = useState("Pay on Pickup");

  async function fetchReservation(code) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    setLoading(true);
    setMessage("");
    setShowCancel(false);
    setShowUpdate(false);

    try {
      const { data } = await api.get(`/api/reservations/track/${encodeURIComponent(normalized)}`);
      setReservation(normalizeReservation(data?.data ?? data));
      setInputCode(normalized);
    } catch (error) {
      const localReservation = getLocalReservation(normalized);
      if (localReservation) {
        setReservation(normalizeReservation(localReservation));
        setInputCode(normalized);
        return;
      }
      setReservation("not_found");
      setMessage(error.response?.data?.message ?? "No reservation found for this code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!urlCode) return;
    fetchReservation(urlCode);
  }, [urlCode]);

  function handleSearch(event) {
    event.preventDefault();
    const normalized = inputCode.trim().toUpperCase();
    if (!normalized) return;
    router.push(`/track/${normalized}`);
  }

  function handleCopyCode() {
    if (!reservation || reservation === "not_found") return;
    navigator.clipboard.writeText(reservation.trackingCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function openUpdateForm() {
    if (!reservation || reservation === "not_found") return;
    setUpdItems(
      reservation.items.map((item) => ({
        id: item.id,
        name: item.productName,
        type: item.productType,
        stock: 99,
        price: item.unitPrice,
        qty: item.qty,
      }))
    );
    setUpdDate(reservation.pickupDate ? String(reservation.pickupDate).slice(0, 10) : "");
    setUpdPayment(paymentLabel(reservation.paymentMethod));
    setShowUpdate(true);
    setShowCancel(false);
    setMessage("");
  }

  function addUpdItem(product) {
    setUpdItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
            : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  }

  function removeUpdItem(id) {
    setUpdItems((current) => current.filter((item) => item.id !== id));
  }

  function updateUpdQty(id, delta, stock) {
    setUpdItems((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        const nextQty = item.qty + delta;
        if (nextQty < 1) return [];
        return [{ ...item, qty: Math.min(nextQty, stock) }];
      })
    );
  }

  async function handleSaveUpdate() {
    if (!reservation || reservation === "not_found" || updItems.length === 0 || !updDate) return;
    setLoading(true);
    setMessage("");

    const payload = {
      pickupDate: updDate,
      paymentMethod: paymentToApi(updPayment),
      items: updItems.map((item) => ({
        medicineId: item.id,
        productId: item.id,
        productType: item.type,
        qty: item.qty,
      })),
    };

    try {
      const { data } = await api.patch(`/api/reservations/track/${encodeURIComponent(reservation.trackingCode)}`, payload);
      setReservation(normalizeReservation(data?.data ?? data));
      setShowUpdate(false);
      setMessage("Your reservation has been updated. Its status may return to Pending for pharmacist review.");
    } catch (error) {
      setMessage(error.response?.data?.message ?? "Failed to update this reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelConfirm() {
    if (!reservation || reservation === "not_found") return;
    setLoading(true);
    setMessage("");

    try {
      await api.delete(`/api/reservations/track/${encodeURIComponent(reservation.trackingCode)}`);
      setReservation((current) => normalizeReservation({ ...current, status: "cancelled" }));
      setShowCancel(false);
      setMessage("Your reservation has been cancelled.");
    } catch (error) {
      setMessage(error.response?.data?.message ?? "Failed to cancel this reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const res = reservation && reservation !== "not_found" ? reservation : null;
  const statusInfo = res ? STATUS_INFO[res.status] ?? { label: res.status, tone: "neutral", lines: [] } : null;
  const canAct = res && (res.status === "pending" || res.status === "confirmed");
  const minDate = getTomorrow();
  const maxDate = getMaxDate();

  return (
    <main className={styles.page}>
      <div className={styles.main}>
        <BrandButton onClick={() => router.push("/")} />

        {!res && (
          <section className={styles.searchCard}>
            <h1 className={styles.heading}>Track Your Reservation</h1>
            <p className={styles.subheading}>Enter the tracking code you received after submitting your reservation.</p>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputWrap}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Enter your confirmation code, e.g. RES-2026-001"
                  value={inputCode}
                  onChange={(event) => setInputCode(event.target.value.toUpperCase())}
                />
              </div>
              <button type="submit" className={styles.searchBtn} disabled={loading}>
                {loading ? "Checking..." : "Track Reservation"}
              </button>
            </form>
          </section>
        )}

        {reservation === "not_found" && <p className={styles.notFound}>{message}</p>}

        {res && (
          <section className={styles.resultCard}>
            <div className={styles.codeRow}>
              <div>
                <p className={styles.codeLabel}>Confirmation Code</p>
                <p className={styles.codeValue}>{res.trackingCode}</p>
              </div>
              <button type="button" className={styles.copyBtn} onClick={handleCopyCode}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className={styles.customerName}>Reservation for {res.customerName}</p>

            <div className={styles.statusCard}>
              <span className={`${styles.statusBadge} ${BADGE_CLASS[statusInfo.tone]}`}>
                {statusInfo.label}
              </span>
              <div className={styles.statusLines}>
                {statusInfo.lines.map((line) => (
                  <p key={line} className={styles.statusLine}>{line}</p>
                ))}
                {res.status === "ready" && res.expiresAt && (
                  <p className={styles.statusLine}>Please visit the pharmacy before <strong>{formatDate(res.expiresAt)}</strong>.</p>
                )}
                {res.status === "cancelled" && res.rejectionReason && (
                  <p className={styles.statusLine}>Reason: <em>{res.rejectionReason}</em></p>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>Reserved Items</p>
              <div className={styles.itemsList}>
                {res.items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.productName}</span>
                    <span className={`${styles.typeBadge} ${item.productType === "medicine" ? styles.typeMed : styles.typePara}`}>
                      {item.productType === "medicine" ? "Medicine" : "Parapharmacy"}
                    </span>
                    <span className={styles.itemQty}>x {item.qty}</span>
                    <span className={styles.itemPrice}>{item.unitPrice * item.qty} MAD</span>
                  </div>
                ))}
              </div>
            </div>

            <dl className={styles.dl}>
              <div className={styles.dlRow}>
                <dt>Pickup Date</dt>
                <dd>{res.pickupDate ? formatDate(res.pickupDate) : "Not selected"}</dd>
              </div>
              <div className={styles.dlRow}>
                <dt>Payment</dt>
                <dd>{paymentLabel(res.paymentMethod)}</dd>
              </div>
            </dl>

            {message && reservation !== "not_found" && <p className={styles.inlineMessage}>{message}</p>}

            {canAct && !showCancel && !showUpdate && (
              <div className={styles.actions}>
                <button type="button" className={styles.updateBtn} onClick={openUpdateForm}>
                  Update Reservation
                </button>
                <button type="button" className={styles.cancelLink} onClick={() => setShowCancel(true)}>
                  Cancel Reservation
                </button>
              </div>
            )}

            {showCancel && (
              <div className={styles.cancelConfirm}>
                <p className={styles.cancelConfirmText}>
                  Are you sure you want to cancel this reservation?<br />
                  All reserved stock will be released immediately.
                </p>
                <div className={styles.cancelConfirmBtns}>
                  <button type="button" className={styles.keepBtn} onClick={() => setShowCancel(false)}>
                    Keep My Reservation
                  </button>
                  <button type="button" className={styles.yesCancelBtn} onClick={handleCancelConfirm} disabled={loading}>
                    {loading ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            )}

            {showUpdate && (
              <div className={styles.updateForm}>
                <p className={styles.updateFormTitle}>Update Reservation</p>
                <div className={styles.updateSection}>
                  <p className={styles.updateLabel}>Items</p>
                  <ProductSearch onAdd={addUpdItem} excludeIds={updItems.map((item) => item.id)} />
                  {updItems.length > 0 && (
                    <div className={styles.updItemsList}>
                      {updItems.map((item) => (
                        <div key={item.id} className={styles.updItemRow}>
                          <span className={styles.updItemName}>{item.name}</span>
                          <span className={`${styles.typeBadge} ${item.type === "medicine" ? styles.typeMed : styles.typePara}`}>
                            {item.type === "medicine" ? "Medicine" : "Parapharmacy"}
                          </span>
                          <div className={styles.qtyControls}>
                            <button type="button" className={styles.qtyBtn} onClick={() => updateUpdQty(item.id, -1, item.stock)}>-</button>
                            <span className={styles.qtyNum}>{item.qty}</span>
                            <button type="button" className={styles.qtyBtn} disabled={item.qty >= item.stock} onClick={() => updateUpdQty(item.id, 1, item.stock)}>+</button>
                          </div>
                          <button type="button" className={styles.updRemoveBtn} onClick={() => removeUpdItem(item.id)}>x</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.updateSection}>
                  <label className={styles.updateLabel} htmlFor="update-pickup">Pickup Date</label>
                  <input
                    id="update-pickup"
                    className={styles.updInput}
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={updDate}
                    onChange={(event) => setUpdDate(event.target.value)}
                  />
                </div>

                <div className={styles.updateSection}>
                  <span className={styles.updateLabel}>Payment Method</span>
                  <div className={styles.radioGroup}>
                    {["Pay on Pickup", "Online Payment"].map((method) => (
                      <label key={method} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="update-payment"
                          className={styles.radioInput}
                          value={method}
                          checked={updPayment === method}
                          onChange={() => setUpdPayment(method)}
                        />
                        <span className={styles.radioCustom} />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>

                <p className={styles.updateNote}>Updating your reservation may reset its status to Pending and require pharmacist review.</p>

                <div className={styles.updateFormBtns}>
                  <button type="button" className={styles.saveBtn} onClick={handleSaveUpdate} disabled={loading || updItems.length === 0 || !updDate}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className={styles.discardBtn} onClick={() => setShowUpdate(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
