import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { Camera, Check, Copy, FolderOpen, Plus, TriangleAlert } from "lucide-react";
import ProductSearch from "@/components/ProductSearch";
import api from "@/lib/axios";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/ReservationNewPage.module.css";

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

function validatePhone(value) {
  const cleaned = value.replace(/[\s\-().]/g, "");
  return /^(\+212[0-9]{9}|0[67][0-9]{8})$/.test(cleaned);
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function paymentToApi(value) {
  return value === "Online Payment" ? "online" : "pay-on-pickup";
}

function getConfirmationCode(data) {
  const payload = data?.data ?? data;
  return payload?.trackingCode ?? payload?.confirmationCode ?? payload?.code ?? "";
}

function createLocalConfirmationCode() {
  return `RES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
}

function saveLocalReservation(reservation) {
  if (typeof window === "undefined") return;
  const current = JSON.parse(window.localStorage.getItem("pharmaos_reservations") || "{}");
  current[reservation.trackingCode] = reservation;
  window.localStorage.setItem("pharmaos_reservations", JSON.stringify(current));
}

function BrandMark() {
  return (
    <div className={styles.brand}>
      <img className={styles.brandLogo} src="/pharmaos-logo.svg" alt="" aria-hidden="true" />
      <span className={styles.brandName}>PharmaMS</span>
    </div>
  );
}

export default function ReservationHomePage() {
  const router = useRouter();
  const searchRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([]);
  const [pickupDate, setPickupDate] = useState("");
  const [payment, setPayment] = useState("Pay on Pickup");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [prescriptionData, setPrescriptionData] = useState("");
  const [prescriptionError, setPrescriptionError] = useState("");

  const minDate = getTomorrow();
  const maxDate = getMaxDate();

  function addItem(product) {
    setItems((current) => {
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
    setTouched((current) => ({ ...current, items: true }));
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function updateQty(id, delta, stock) {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        const nextQty = item.qty + delta;
        if (nextQty < 1) return [];
        return [{ ...item, qty: Math.min(nextQty, stock) }];
      })
    );
  }

  function handlePrescriptionFile(file) {
    setPrescriptionError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPrescriptionError("Prescription image must be a JPEG or PNG file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPrescriptionError("Prescription image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPrescriptionFile(file);
      setPrescriptionPreview(result);
      setPrescriptionData(result);
      setTouched((current) => ({ ...current, prescription: true }));
    };
    reader.onerror = () => setPrescriptionError("Failed to upload image. Please try again.");
    reader.readAsDataURL(file);
  }

  function removePrescriptionFile() {
    setPrescriptionFile(null);
    setPrescriptionPreview("");
    setPrescriptionData("");
    setPrescriptionError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate() {
    const nextErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = "Full name must be at least 2 characters.";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!validatePhone(phone)) {
      nextErrors.phone = "Enter a valid Moroccan number (+212 6XX XXX XXX or 06XXXXXXXX).";
    }
    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (items.length === 0) {
      nextErrors.items = "Please add at least one item.";
    }
    if (hasPrescriptionMedicine && !prescriptionData) {
      nextErrors.prescription = "Please upload your prescription to continue";
    }
    if (!pickupDate) {
      nextErrors.pickupDate = "Please select a pickup date.";
    } else if (pickupDate < minDate) {
      nextErrors.pickupDate = "Pickup date must be in the future.";
    } else if (pickupDate > maxDate) {
      nextErrors.pickupDate = "Pickup date must be within the next 48 hours.";
    }
    return nextErrors;
  }

  function handleBlur(field) {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, phone: true, email: true, items: true, pickupDate: true });

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      email: email.trim(),
      pickupDate,
      paymentMethod: paymentToApi(payment),
      notes: notes.trim(),
      prescriptionImage: hasPrescriptionMedicine ? prescriptionData : undefined,
      prescriptionImageName: hasPrescriptionMedicine ? prescriptionFile?.name : undefined,
      prescriptionImageType: hasPrescriptionMedicine ? prescriptionFile?.type : undefined,
      items: items.map((item) => ({
        medicineId: item.id,
        productId: item.id,
        productType: item.type,
        qty: item.qty,
      })),
    };

    try {
      const { data } = await api.post("/api/reservations", payload);
      const code = getConfirmationCode(data) || createLocalConfirmationCode();
      saveLocalReservation({
        trackingCode: code,
        customerName: payload.customerName,
        email,
        customerEmail: email,
        pickupDate,
        paymentMethod: payment,
        status: data?.status ?? "pending",
        items: items.map((item) => ({
          productName: item.name,
          productType: item.type,
          category: item.category,
          qty: item.qty,
          unitPrice: item.price,
        })),
        prescriptionUploaded: hasPrescriptionMedicine && Boolean(prescriptionData),
      });
      setSuccessData({
        code,
        email,
        pickupDate,
        payment,
        items: [...items],
        prescriptionUploaded: hasPrescriptionMedicine && Boolean(prescriptionData),
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production" && !error.response) {
        const code = createLocalConfirmationCode();
        saveLocalReservation({
          trackingCode: code,
          customerName: payload.customerName,
          email,
          customerEmail: email,
          pickupDate,
          paymentMethod: payment,
          status: "pending",
          items: items.map((item) => ({
            productName: item.name,
            productType: item.type,
            category: item.category,
            qty: item.qty,
            unitPrice: item.price,
          })),
          prescriptionUploaded: hasPrescriptionMedicine && Boolean(prescriptionData),
        });
        setSuccessData({
          code,
          email,
          pickupDate,
          payment,
          items: [...items],
          prescriptionUploaded: hasPrescriptionMedicine && Boolean(prescriptionData),
        });
        return;
      }
      setSubmitError(error.response?.data?.message ?? "Failed to submit reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyCode() {
    if (!successData?.code) return;
    navigator.clipboard.writeText(successData.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function resetForm() {
    setSuccessData(null);
    setName("");
    setPhone("");
    setEmail("");
    setItems([]);
    setPickupDate("");
    setPayment("Pay on Pickup");
    setNotes("");
    removePrescriptionFile();
    setErrors({});
    setTouched({});
    setCopied(false);
  }

  const estimatedTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasPrescriptionMedicine = items.some((item) => item.type === "medicine" && item.category === "prescription");
  const prescriptionMissing = hasPrescriptionMedicine && !prescriptionData;
  const isDisabled = submitting || !name.trim() || !phone.trim() || !email.trim() || !pickupDate || items.length === 0 || prescriptionMissing;

  if (successData) {
    return (
      <main className={styles.page}>
        <section className={styles.successWrap}>
          <div className={styles.successIcon}><Check size={30} /></div>
          <h1 className={styles.successTitle}>Reservation Submitted</h1>
          <p className={styles.successSubtitle}>Your reservation has been received.</p>

          <div className={styles.codeCard}>
            <p className={styles.codeCardLabel}>Your confirmation code</p>
            <p className={styles.codeValue}>{successData.code}</p>
            <button type="button" className={styles.copyBtn} onClick={handleCopyCode}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>

          <p className={styles.infoText}>Save this code. You will need it to track or modify your reservation.</p>
          <p className={styles.infoText}>A confirmation email will be sent to <strong>{successData.email}</strong>.</p>

          <div className={styles.pickupInfo}>
            <span className={styles.pickupLabel}>Expected pickup</span>
            <span className={styles.pickupDate}>{formatDate(successData.pickupDate)}</span>
          </div>

          <div className={styles.successItems}>
            {successData.items.map((item) => (
              <div key={item.id} className={styles.successItem}>
                <span className={styles.successItemName}>{item.name}</span>
                <span className={`${styles.typeBadge} ${item.type === "medicine" ? styles.typeMed : styles.typePara}`}>
                  {item.type === "medicine" ? "Medicine" : "Parapharmacy"}
                </span>
                <span className={styles.successItemQty}>x {item.qty}</span>
              </div>
            ))}
          </div>

          {successData.prescriptionUploaded && (
            <div className={styles.prescriptionSuccessNotice}>
              <TriangleAlert size={16} />
              <p>Remember to bring your original prescription at pickup. The pharmacist will verify it before releasing your medicines.</p>
            </div>
          )}

          <button type="button" className={styles.trackBtn} onClick={() => router.push(`/track/${successData.code}`)}>
            Track My Reservation
          </button>
          <button type="button" className={styles.anotherBtn} onClick={resetForm}>
            Make Another Reservation
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.brandWrap}>
        <BrandMark />
        <p className={styles.tagline}>Reserve your medicines online</p>
      </div>

      <section className={styles.formOuter}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.cardIntro}>
              <h1>New Reservation</h1>
              <p>Fill in your details and select the products you need.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Information</h2>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="customer-name">Full Name</label>
                <input
                  id="customer-name"
                  className={`${styles.input}${errors.name && touched.name ? ` ${styles.inputError}` : ""}`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Enter your full name"
                  type="text"
                />
                {errors.name && touched.name && <p className={styles.err}>{errors.name}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="customer-phone">Phone Number</label>
                <input
                  id="customer-phone"
                  className={`${styles.input}${errors.phone && touched.phone ? ` ${styles.inputError}` : ""}`}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+212 6XX XXX XXX"
                  type="tel"
                />
                {errors.phone && touched.phone && <p className={styles.err}>{errors.phone}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="customer-email">Email Address</label>
                <input
                  id="customer-email"
                  className={`${styles.input}${errors.email && touched.email ? ` ${styles.inputError}` : ""}`}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="your@email.com"
                  type="email"
                />
                <p className={styles.hint}>Your confirmation code and updates will be sent here.</p>
                {errors.email && touched.email && <p className={styles.err}>{errors.email}</p>}
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Reserve Items</h2>
              <div ref={searchRef}>
                <label className={styles.label}>Add Products</label>
                <ProductSearch onAdd={addItem} excludeIds={items.map((item) => item.id)} />
              </div>
              {errors.items && touched.items && <p className={styles.err}>{errors.items}</p>}

              {items.length === 0 ? (
                <p className={styles.emptyItems}>No items added yet. Search above to add products.</p>
              ) : (
                <div className={styles.itemsList}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={`${styles.typeBadge} ${item.type === "medicine" ? styles.typeMed : styles.typePara}`}>
                          {item.type === "medicine" ? "Medicine" : "Parapharmacy"}
                        </span>
                      </div>
                      <div className={styles.itemRight}>
                        <div className={styles.qtyControls}>
                          <button type="button" className={styles.qtyBtn} onClick={() => updateQty(item.id, -1, item.stock)}>-</button>
                          <span className={styles.qtyNum}>{item.qty}</span>
                          <button type="button" className={styles.qtyBtn} disabled={item.qty >= item.stock} onClick={() => updateQty(item.id, 1, item.stock)}>+</button>
                        </div>
                        <span className={styles.itemSubtotal}>{item.price * item.qty} MAD</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className={styles.totalBox}>
                  <strong>Estimated Total: <span dir="ltr">{estimatedTotal} MAD</span></strong>
                  <small>Final amount confirmed at pickup.</small>
                </div>
              )}

              {hasPrescriptionMedicine && (
                <div className={styles.prescriptionSection}>
                  <div className={styles.prescriptionNotice}>
                    <TriangleAlert size={18} />
                    <p>This reservation includes prescription medicines. You must bring the original prescription when collecting. The pharmacist will verify it before dispensing.</p>
                  </div>

                  <div className={styles.prescriptionUpload}>
                    <span className={styles.uploadLabel}>Upload Your Prescription <strong>(required)</strong></span>
                    {!prescriptionPreview ? (
                      <div className={styles.uploadZone}>
                        <TriangleAlert size={34} />
                        <p>Take a photo or upload a JPEG or PNG image of your prescription.</p>
                        <div className={styles.uploadActions}>
                          <button type="button" className={styles.uploadBtn} onClick={() => cameraInputRef.current?.click()}>
                            <Camera size={15} />
                            Take Photo
                          </button>
                          <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                            <FolderOpen size={15} />
                            Upload File
                          </button>
                        </div>
                        <span>Accepted: JPEG and PNG - max 5MB</span>
                      </div>
                    ) : (
                      <div className={styles.prescriptionPreview}>
                        <img src={prescriptionPreview} alt="Prescription preview" />
                        <div className={styles.previewMeta}>
                          <span>{prescriptionFile?.name}</span>
                          <button type="button" onClick={removePrescriptionFile}>Remove</button>
                        </div>
                      </div>
                    )}
                    <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png" capture="environment" hidden onChange={(event) => handlePrescriptionFile(event.target.files?.[0])} />
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" hidden onChange={(event) => handlePrescriptionFile(event.target.files?.[0])} />
                    {(prescriptionError || prescriptionMissing) && (
                      <p className={styles.err}>{prescriptionError || errors.prescription || "Please upload your prescription to continue"}</p>
                    )}
                  </div>
                </div>
              )}

              <button type="button" className={styles.addAnotherBtn} onClick={() => {
                const input = searchRef.current?.querySelector("input");
                input?.focus();
                input?.click();
              }}>
                <Plus size={14} /> Add Another Item
              </button>
            </div>

            <hr className={styles.divider} />

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Pickup Details</h2>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="pickup-date">Pickup Date</label>
                <input
                  id="pickup-date"
                  className={`${styles.input}${errors.pickupDate && touched.pickupDate ? ` ${styles.inputError}` : ""}`}
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={pickupDate}
                  onChange={(event) => setPickupDate(event.target.value)}
                  onBlur={() => handleBlur("pickupDate")}
                />
                {errors.pickupDate && touched.pickupDate && <p className={styles.err}>{errors.pickupDate}</p>}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Payment Method</span>
                <div className={styles.radioGroup}>
                  {["Pay on Pickup", "Online Payment"].map((method) => (
                    <label key={method} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="payment"
                        className={styles.radioInput}
                        value={method}
                        checked={payment === method}
                        onChange={() => setPayment(method)}
                      />
                      <span className={styles.radioCustom} />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="reservation-notes">Notes</label>
                <textarea
                  id="reservation-notes"
                  className={`${styles.input} ${styles.textarea}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes for the pharmacy"
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.submitWrap}>
              {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
              <button type="submit" className={styles.submitBtn} disabled={isDisabled}>
                {submitting ? "Submitting..." : "Submit Reservation"}
              </button>
            </div>
          </form>
        </div>

        <p className={styles.footNote}>
          Already submitted? Open your tracking link with your confirmation code.
        </p>
      </section>
    </main>
  );
}
