import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/ReservationNewPage.module.css";

// TODO: replace with real API call: api.post("/api/reservations", payload)

const MEDICINES = [
  { id: 1, name: "Paracetamol 500mg", category: "OTC", stock: 8, price: 18 },
  { id: 2, name: "Ibuprofen 400mg", category: "OTC", stock: 19, price: 24 },
  { id: 3, name: "Vitamin C 1000mg", category: "OTC", stock: 63, price: 42 },
  { id: 4, name: "Cough Syrup", category: "OTC", stock: 11, price: 39 },
  { id: 5, name: "Efferalgan 500mg", category: "OTC", stock: 15, price: 21 },
  { id: 6, name: "Vitamin D3", category: "OTC", stock: 24, price: 48 },
];

function PillIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
      <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ReservationNewPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [pickupDate, setPickupDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay on Pickup");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [successCode, setSuccessCode] = useState(null);

  const filtered = MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = MEDICINES.find((m) => m.id === selectedId);

  function validate() {
    const e = {};
    if (!customerName.trim()) e.customerName = "Full name is required.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    if (!selectedId) e.medicine = "Please select a medicine.";
    if (!pickupDate) e.pickupDate = "Please select a pickup date.";
    if (!qty || qty < 1) e.qty = "Quantity must be at least 1.";
    if (selected && qty > selected.stock) e.qty = "Exceeds available stock.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // TODO: replace with real API call
    const code = `RES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setSuccessCode(code);
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push("/")}>
          <div className={styles.brandIcon}><PillIcon /></div>
          <div>
            <div className={styles.brandTitle}>PharmaOS</div>
            <div className={styles.brandSub}>Online Reservation</div>
          </div>
        </div>
        <button className={styles.loginBtn} onClick={() => router.push("/login")}>
          Staff Login
        </button>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Public Reservation Portal</span>
          <h1 className={styles.heroTitle}>Reserve your over-the-counter medicines online.</h1>
          <p className={styles.heroDesc}>
            Check availability, choose your pickup date, and collect your reservation
            directly from the pharmacy without waiting in line.
          </p>
        </div>
      </section>

      <main className={styles.main}>
        {/* Info cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>How it works</h3>
            <p>Select an OTC medicine, choose the quantity, then submit your pickup request.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Payment options</h3>
            <p>You may pay online or directly at pickup depending on your preference.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Important note</h3>
            <p>Only non-prescription medicines can be reserved through this page.</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Step 1 — Choose medicine */}
          <section className={styles.panel}>
            <p className={styles.panelKicker}>Step 1</p>
            <h2 className={styles.panelTitle}>Choose your medicine</h2>

            <div className={styles.searchBox}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search OTC medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.medicineList}>
              {filtered.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={`${styles.medicineCard}${selectedId === m.id ? " " + styles.selected : ""}`}
                  onClick={() => setSelectedId(m.id)}
                >
                  <div>
                    <p className={styles.medicineName}>{m.name}</p>
                    <p className={styles.medicineCategory}>{m.category}</p>
                  </div>
                  <div className={styles.medicineMeta}>
                    <span className={styles.medicineStock}>{m.stock} in stock</span>
                    <span className={styles.medicinePrice}>{m.price} MAD</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.medicine && <p className={styles.error} style={{ marginTop: "0.5rem" }}>{errors.medicine}</p>}
          </section>

          {/* Step 2 — Reservation form */}
          <section className={styles.panel}>
            <p className={styles.panelKicker}>Step 2</p>
            <h2 className={styles.panelTitle}>Your reservation</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Full Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {errors.customerName && <p className={styles.error}>{errors.customerName}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="+212 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <p className={styles.error}>{errors.phone}</p>}
              </div>

              <div className={styles.inputRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Quantity</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                  {errors.qty && <p className={styles.error}>{errors.qty}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Pickup Date</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                  {errors.pickupDate && <p className={styles.error}>{errors.pickupDate}</p>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Payment Method</label>
                <div className={styles.paymentGrid}>
                  {["Pay on Pickup", "Online Payment"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`${styles.payBtn}${paymentMethod === method ? " " + styles.activePayBtn : ""}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Additional Notes</label>
                <textarea
                  className={styles.input}
                  rows={3}
                  placeholder="Optional notes for the pharmacist..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className={styles.noteBox}>
                <InfoIcon />
                <span>Reservation requests are reviewed by the pharmacy before final confirmation.</span>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit Reservation
              </button>

              {successCode && (
                <div className={styles.success}>
                  <CheckIcon />
                  <span>
                    Submitted! Your tracking code: <span className={styles.successCode}>{successCode}</span>
                  </span>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
