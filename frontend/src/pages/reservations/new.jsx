import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/ReservationNewPage.module.css";

// TODO: replace with real API call: api.post("/api/reservations", payload)

const PRODUCTS = [
  { id: 1, name: "Paracetamol 500mg",   type: "medicine",      category: "OTC",       stock: 8,  price: 18 },
  { id: 2, name: "Ibuprofen 400mg",      type: "medicine",      category: "OTC",       stock: 19, price: 24 },
  { id: 3, name: "Vitamin C 1000mg",     type: "medicine",      category: "OTC",       stock: 63, price: 42 },
  { id: 4, name: "Cough Syrup",          type: "medicine",      category: "OTC",       stock: 11, price: 39 },
  { id: 5, name: "Efferalgan 500mg",     type: "medicine",      category: "OTC",       stock: 15, price: 21 },
  { id: 6, name: "Vitamin D3",           type: "medicine",      category: "OTC",       stock: 24, price: 48 },
  { id: 7, name: "Sunscreen SPF50+",     type: "parapharmacy",  category: "Skincare",  stock: 12, price: 85 },
  { id: 8, name: "Baby Shampoo",         type: "parapharmacy",  category: "Baby Care", stock: 30, price: 35 },
  { id: 9, name: "Hand Sanitizer 500ml", type: "parapharmacy",  category: "Hygiene",   stock: 45, price: 28 },
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

  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [cart, setCart]               = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone]             = useState("");
  const [pickupDate, setPickupDate]   = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay on Pickup");
  const [notes, setNotes]             = useState("");
  const [errors, setErrors]           = useState({});
  const [successCode, setSuccessCode] = useState(null);

  const filtered = PRODUCTS.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(i.qty + 1, product.stock) }
            : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  }

  function updateQty(id, qty, stock) {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === id ? { ...i, qty: Math.min(qty, stock) } : i
      )
    );
  }

  function validate() {
    const e = {};
    if (!customerName.trim()) e.customerName = "Full name is required.";
    if (!phone.trim())        e.phone = "Phone number is required.";
    if (cart.length === 0)    e.cart = "Please add at least one item.";
    if (!pickupDate)          e.pickupDate = "Please select a pickup date.";
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

  if (successCode) {
    return (
      <div className={styles.root}>
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
        <main className={styles.main}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}><CheckIcon /></div>
            <h2 className={styles.successTitle}>Reservation Submitted!</h2>
            <p className={styles.successDesc}>
              Your reservation request has been received and is awaiting pharmacist review.
            </p>
            <div className={styles.successCodeBox}>
              <span className={styles.successCodeLabel}>Your tracking code</span>
              <span className={styles.successCodeValue}>{successCode}</span>
            </div>
            <p className={styles.successHint}>
              Save this code to track your reservation status at any time.
            </p>
            <div className={styles.successActions}>
              <button
                className={styles.trackBtn}
                onClick={() => router.push(`/reservations/track/${successCode}`)}
              >
                Track My Reservation
              </button>
              <button
                className={styles.newBtn}
                onClick={() => {
                  setSuccessCode(null);
                  setCart([]);
                  setCustomerName("");
                  setPhone("");
                  setPickupDate("");
                  setNotes("");
                  setErrors({});
                }}
              >
                Make Another Reservation
              </button>
            </div>
          </div>
        </main>
      </div>
    );
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
          <h1 className={styles.heroTitle}>Reserve your medicines online.</h1>
          <p className={styles.heroDesc}>
            Browse available products, add them to your reservation, then choose a pickup date.
            Your order will be ready when the pharmacy confirms it.
          </p>
        </div>
      </section>

      <main className={styles.main}>
        {/* Info cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>How it works</h3>
            <p>Add one or more OTC medicines or parapharmacy products, fill in your details, and submit.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Payment options</h3>
            <p>Pay online or directly at pickup — your choice when submitting the reservation.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Important note</h3>
            <p>Only non-prescription products can be reserved. Prescription drugs require a valid ordonnance at pickup.</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left — product picker */}
          <section className={styles.panel}>
            <p className={styles.panelKicker}>Step 1</p>
            <h2 className={styles.panelTitle}>Add items</h2>

            <div className={styles.searchBox}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.typeFilterRow}>
              {[
                { value: "all",          label: "All" },
                { value: "medicine",     label: "Medicines" },
                { value: "parapharmacy", label: "Parapharmacy" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.typeFilterBtn}${typeFilter === value ? " " + styles.typeFilterActive : ""}`}
                  onClick={() => setTypeFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={styles.medicineList}>
              {filtered.length === 0 && (
                <p className={styles.noResults}>No products match your search.</p>
              )}
              {filtered.map((p) => {
                const cartItem = cart.find((i) => i.product.id === p.id);
                return (
                  <div key={p.id} className={styles.medicineCard}>
                    <div className={styles.medicineInfo}>
                      <p className={styles.medicineName}>{p.name}</p>
                      <p className={styles.medicineCategory}>
                        {p.category} · {p.type === "parapharmacy" ? "Parapharmacy" : "Medicine"}
                      </p>
                    </div>
                    <div className={styles.medicineMeta}>
                      <span className={styles.medicineStock}>{p.stock} in stock</span>
                      <span className={styles.medicinePrice}>{p.price} MAD</span>
                    </div>
                    <div className={styles.medicineActions}>
                      {cartItem ? (
                        <div className={styles.qtyInline}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(p.id, cartItem.qty - 1, p.stock)}
                          >
                            −
                          </button>
                          <span className={styles.qtyNum}>{cartItem.qty}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            disabled={cartItem.qty >= p.stock}
                            onClick={() => updateQty(p.id, cartItem.qty + 1, p.stock)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.addBtn}
                          onClick={() => addToCart(p)}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.cart && <p className={styles.error} style={{ marginTop: "0.75rem" }}>{errors.cart}</p>}
          </section>

          {/* Right — cart + form */}
          <section className={styles.panel}>
            <p className={styles.panelKicker}>Step 2</p>
            <h2 className={styles.panelTitle}>Your reservation</h2>

            {/* Cart */}
            <div className={styles.cartSection}>
              <p className={styles.cartSectionTitle}>
                Selected items
                {cart.length > 0 && <span className={styles.cartCount}>{cart.length}</span>}
              </p>
              {cart.length === 0 ? (
                <p className={styles.cartEmpty}>No items yet — search and add from the left.</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.product.id} className={styles.cartItem}>
                      <div className={styles.cartItemLeft}>
                        <span className={styles.cartItemName}>{item.product.name}</span>
                        <span className={styles.cartItemLineTotal}>
                          {item.product.price * item.qty} MAD
                        </span>
                      </div>
                      <div className={styles.cartItemRight}>
                        <div className={styles.qtyInline}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQty(item.product.id, item.qty - 1, item.product.stock)}
                          >
                            −
                          </button>
                          <span className={styles.qtyNum}>{item.qty}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            disabled={item.qty >= item.product.stock}
                            onClick={() => updateQty(item.product.id, item.qty + 1, item.product.stock)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className={styles.cartTotal}>
                    <span>Estimated Total</span>
                    <span className={styles.cartTotalValue}>{cartTotal} MAD</span>
                  </div>
                </>
              )}
            </div>

            {/* Customer form */}
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
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
