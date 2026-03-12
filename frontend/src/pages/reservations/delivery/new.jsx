import { useState } from "react";
import { useRouter } from "next/router";

const PillIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const CashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 9h.01M18 15h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const medicines = [
  { id: 1, name: "Paracetamol 500mg", category: "OTC", stock: 8, price: 18 },
  { id: 2, name: "Ibuprofen 400mg", category: "OTC", stock: 19, price: 24 },
  { id: 3, name: "Vitamin C 1000mg", category: "OTC", stock: 63, price: 42 },
  { id: 4, name: "Cough Syrup", category: "OTC", stock: 11, price: 39 },
  { id: 5, name: "Efferalgan 500mg", category: "OTC", stock: 15, price: 21 },
  { id: 6, name: "Vitamin D3", category: "OTC", stock: 24, price: 48 },
];

export default function NewReservationPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Pay on Pickup");
  const [pickupDate, setPickupDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMedicineObj = medicines.find((m) => m.name === selectedMedicine);

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Full name is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!selectedMedicine) newErrors.selectedMedicine = "Please select a medicine.";
    if (!pickupDate) newErrors.pickupDate = "Please select a pickup date.";
    if (!quantity || quantity < 1) newErrors.quantity = "Quantity must be at least 1.";

    if (selectedMedicineObj && quantity > selectedMedicineObj.stock) {
      newErrors.quantity = "Requested quantity exceeds available stock.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
    console.log({
      customerName,
      phone,
      selectedMedicine,
      quantity,
      paymentMethod,
      pickupDate,
      notes,
    });
  };

  return (
    <>
      <div className="pub-root">
        <header className="pub-header">
          <div className="pub-brand" onClick={() => router.push("/")}>
            <div className="pub-brand-icon">
              <PillIcon />
            </div>
            <div>
              <div className="pub-brand-title">PharmaOS</div>
              <div className="pub-brand-sub">Online Reservation</div>
            </div>
          </div>

          <button
            type="button"
            className="pub-header-btn"
            onClick={() => router.push("/login")}
          >
            Staff Login
          </button>
        </header>

        <section className="pub-hero">
          <div className="pub-hero-overlay" />
          <div className="pub-hero-content">
            <span className="pub-badge">Public Reservation Portal</span>
            <h1>Reserve your over-the-counter medicines online.</h1>
            <p>
              Check availability, choose your pickup date, and collect your reservation
              directly from the pharmacy without waiting in line.
            </p>
          </div>
        </section>

        <main className="pub-main">
          <section className="pub-info-grid">
            <div className="pub-info-card">
              <h3>How it works</h3>
              <p>Select an OTC medicine, choose the quantity, then submit your pickup request.</p>
            </div>
            <div className="pub-info-card">
              <h3>Payment options</h3>
              <p>You may pay online or directly at pickup depending on your preference.</p>
            </div>
            <div className="pub-info-card">
              <h3>Important note</h3>
              <p>Only non-prescription medicines can be reserved through this page.</p>
            </div>
          </section>

          <div className="pub-layout">
            <section className="pub-panel pub-panel-large">
              <div className="pub-panel-head">
                <div>
                  <p className="pub-panel-kicker">Step 1</p>
                  <h2>Choose your medicine</h2>
                </div>
              </div>

              <div className="pub-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search OTC medicine..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="pub-medicine-list">
                {filteredMedicines.map((medicine) => (
                  <button
                    type="button"
                    key={medicine.id}
                    className={`pub-medicine-card${selectedMedicine === medicine.name ? " active" : ""}`}
                    onClick={() => setSelectedMedicine(medicine.name)}
                  >
                    <div>
                      <h4>{medicine.name}</h4>
                      <p>{medicine.category}</p>
                    </div>
                    <div className="pub-medicine-meta">
                      <span>{medicine.stock} in stock</span>
                      <strong>{medicine.price} MAD</strong>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="pub-panel">
              <div className="pub-panel-head">
                <div>
                  <p className="pub-panel-kicker">Step 2</p>
                  <h2>Your reservation</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="pub-form">
                <div className="pub-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && <p className="pub-error">{errors.customerName}</p>}
                </div>

                <div className="pub-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 ..."
                  />
                  {errors.phone && <p className="pub-error">{errors.phone}</p>}
                </div>

                <div className="pub-field">
                  <label>Selected Medicine</label>
                  <input
                    type="text"
                    value={selectedMedicine}
                    readOnly
                    placeholder="Select a medicine from the list"
                  />
                  {errors.selectedMedicine && <p className="pub-error">{errors.selectedMedicine}</p>}
                </div>

                <div className="pub-row">
                  <div className="pub-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    {errors.quantity && <p className="pub-error">{errors.quantity}</p>}
                  </div>

                  <div className="pub-field">
                    <label>Pickup Date</label>
                    <div className="pub-input-icon">
                      <CalendarIcon />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                    {errors.pickupDate && <p className="pub-error">{errors.pickupDate}</p>}
                  </div>
                </div>

                <div className="pub-field">
                  <label>Payment Method</label>
                  <div className="pub-payment-grid">
                    <button
                      type="button"
                      className={`pub-pay-btn${paymentMethod === "Pay on Pickup" ? " active" : ""}`}
                      onClick={() => setPaymentMethod("Pay on Pickup")}
                    >
                      <CashIcon />
                      Pay on Pickup
                    </button>

                    <button
                      type="button"
                      className={`pub-pay-btn${paymentMethod === "Online Payment" ? " active" : ""}`}
                      onClick={() => setPaymentMethod("Online Payment")}
                    >
                      <CreditCardIcon />
                      Online Payment
                    </button>
                  </div>
                </div>

                <div className="pub-field">
                  <label>Additional Notes</label>
                  <textarea
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes for the pharmacist..."
                  />
                </div>

                <div className="pub-note-box">
                  <InfoIcon />
                  <span>
                    Reservation requests are reviewed by the pharmacy before final confirmation.
                  </span>
                </div>

                <button type="submit" className="pub-submit-btn">
                  Submit Reservation
                </button>

                {submitted && (
                  <div className="pub-success">
                    <CheckIcon />
                    Your reservation request has been submitted successfully.
                  </div>
                )}
              </form>
            </section>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        body {
          margin: 0;
          background: #f8f5ef;
          font-family: "Outfit", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .pub-root {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 30%),
            linear-gradient(180deg, #f8f5ef 0%, #f4f1ea 100%);
          color: #0b1c35;
        }

        .pub-header {
          height: 84px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pub-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .pub-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
        }

        .pub-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 28px;
          font-weight: 600;
          line-height: 1;
          color: #0b1c35;
        }

        .pub-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #73849a;
          margin-top: 4px;
        }

        .pub-header-btn {
          height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid #dbe4ef;
          background: rgba(255, 255, 255, 0.75);
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
          font-weight: 500;
          cursor: pointer;
        }

        .pub-hero {
          position: relative;
          margin: 0 40px 24px;
          border-radius: 28px;
          overflow: hidden;
          background: linear-gradient(135deg, #0b1c35, #163257);
          min-height: 300px;
          display: flex;
          align-items: center;
          box-shadow: 0 20px 48px rgba(11, 28, 53, 0.18);
        }

        .pub-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 20%),
            radial-gradient(circle at 80% 30%, rgba(37,99,235,0.28), transparent 22%),
            radial-gradient(circle at 75% 75%, rgba(52,211,153,0.18), transparent 20%);
        }

        .pub-hero-content {
          position: relative;
          z-index: 2;
          padding: 42px;
          max-width: 760px;
          color: white;
        }

        .pub-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          color: #d7e6f8;
          font-size: 12px;
        }

        .pub-hero h1 {
          margin: 0 0 14px;
          font-family: "Cormorant Garamond", serif;
          font-size: 52px;
          line-height: 1.08;
          font-weight: 600;
        }

        .pub-hero p {
          margin: 0;
          max-width: 620px;
          color: #c0d2e6;
          font-size: 15px;
          line-height: 1.8;
        }

        .pub-main {
          padding: 0 40px 40px;
        }

        .pub-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .pub-info-card {
          background: rgba(255,255,255,0.72);
          border: 1px solid #e5ebf2;
          border-radius: 20px;
          padding: 18px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
        }

        .pub-info-card h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #0b1c35;
        }

        .pub-info-card p {
          margin: 0;
          color: #607086;
          font-size: 14px;
          line-height: 1.7;
        }

        .pub-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 20px;
        }

        .pub-panel {
          background: rgba(255,255,255,0.76);
          border: 1px solid #e5ebf2;
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.04);
        }

        .pub-panel-large {
          min-height: 620px;
        }

        .pub-panel-head {
          margin-bottom: 18px;
        }

        .pub-panel-kicker {
          margin: 0 0 6px;
          font-size: 12px;
          color: #7a8a9b;
        }

        .pub-panel-head h2 {
          margin: 0;
          font-family: "Cormorant Garamond", serif;
          font-size: 32px;
          font-weight: 600;
          color: #0b1c35;
        }

        .pub-search {
          height: 50px;
          border-radius: 14px;
          border: 1px solid #dce4ee;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          margin-bottom: 18px;
          color: #789;
        }

        .pub-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .pub-medicine-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pub-medicine-card {
          width: 100%;
          border: 1px solid #e7edf4;
          background: #fbfdff;
          border-radius: 18px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          text-align: left;
          transition: 0.2s ease;
        }

        .pub-medicine-card:hover {
          border-color: #c9d8ea;
          background: #fff;
        }

        .pub-medicine-card.active {
          border-color: #bfdbfe;
          background: #eff6ff;
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
        }

        .pub-medicine-card h4 {
          margin: 0 0 6px;
          font-size: 16px;
          color: #0b1c35;
        }

        .pub-medicine-card p {
          margin: 0;
          font-size: 13px;
          color: #66778d;
        }

        .pub-medicine-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          color: #66778d;
          font-size: 13px;
        }

        .pub-medicine-meta strong {
          color: #0b1c35;
          font-size: 15px;
        }

        .pub-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pub-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pub-field label {
          font-size: 13px;
          color: #5f7086;
          font-weight: 500;
        }

        .pub-field input,
        .pub-field textarea {
          width: 100%;
          border: 1px solid #dce4ee;
          background: #fff;
          border-radius: 14px;
          padding: 14px 14px;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
          outline: none;
        }

        .pub-field textarea {
          resize: vertical;
        }

        .pub-field input:focus,
        .pub-field textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .pub-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .pub-input-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #dce4ee;
          background: #fff;
          border-radius: 14px;
          padding: 0 14px;
          color: #789;
        }

        .pub-input-icon input {
          border: none;
          box-shadow: none;
          padding-left: 0;
          padding-right: 0;
        }

        .pub-payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .pub-pay-btn {
          height: 48px;
          border-radius: 14px;
          border: 1px solid #dce4ee;
          background: #fff;
          color: #0b1c35;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
          font-weight: 500;
        }

        .pub-pay-btn.active {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .pub-note-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          border-radius: 14px;
          padding: 14px;
          font-size: 13px;
          line-height: 1.7;
        }

        .pub-submit-btn {
          height: 50px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-family: "Outfit", sans-serif;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.28);
        }

        .pub-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ecfdf5;
          color: #047857;
          font-size: 13px;
          font-weight: 500;
        }

        .pub-error {
          margin: 0;
          color: #dc2626;
          font-size: 12px;
        }

        @media (max-width: 1100px) {
          .pub-layout {
            grid-template-columns: 1fr;
          }

          .pub-info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .pub-header {
            padding: 0 20px;
          }

          .pub-hero {
            margin: 0 20px 20px;
          }

          .pub-main {
            padding: 0 20px 24px;
          }

          .pub-hero-content {
            padding: 28px;
          }

          .pub-hero h1 {
            font-size: 38px;
          }

          .pub-row,
          .pub-payment-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .pub-header {
            height: auto;
            padding: 18px 16px;
            gap: 14px;
            flex-direction: column;
            align-items: flex-start;
          }

          .pub-hero {
            margin: 0 16px 16px;
          }

          .pub-main {
            padding: 0 16px 20px;
          }

          .pub-panel {
            padding: 18px;
          }

          .pub-hero h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </>
  );
}