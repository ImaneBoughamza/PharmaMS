import { useState } from "react";
import { useRouter } from "next/router";

const PillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const BoxesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.2 10.2a1 1 0 001 .8H19a1 1 0 001-.8L22 7H7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h3l4 4v4h-7z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 006 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
  { label: "Suppliers", icon: <TruckIcon />, href: "/suppliers/delivery/new", active: true },
];

const suppliers = [
  "Pharma Distrib",
  "MediSupply",
  "Secure Pharma",
  "NutriMed",
  "Grossiste Atlas",
];

const medicineOptions = [
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Vitamin C 1000mg",
  "Amoxicillin 1g",
  "Cough Syrup",
  "Diazepam 5mg",
];

const emptyLine = {
  medicineName: "",
  batchNumber: "",
  expiryDate: "",
  quantity: "",
  purchasePrice: "",
};

export default function NewDeliveryPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    supplier: "",
    deliveryReference: "",
    deliveryDate: "",
    receivedBy: "",
    notes: "",
  });

  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
    setSaved(false);
  };

  const addLine = () => {
    setLines((prev) => [...prev, { ...emptyLine }]);
    setSaved(false);
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.supplier) newErrors.supplier = "Supplier is required.";
    if (!form.deliveryReference.trim()) newErrors.deliveryReference = "Delivery reference is required.";
    if (!form.deliveryDate) newErrors.deliveryDate = "Delivery date is required.";
    if (!form.receivedBy.trim()) newErrors.receivedBy = "Receiver name is required.";

    lines.forEach((line, index) => {
      if (!line.medicineName) newErrors[`medicineName-${index}`] = "Medicine is required.";
      if (!line.batchNumber.trim()) newErrors[`batchNumber-${index}`] = "Batch number is required.";
      if (!line.expiryDate) newErrors[`expiryDate-${index}`] = "Expiry date is required.";
      if (!line.quantity) newErrors[`quantity-${index}`] = "Quantity is required.";
      if (!line.purchasePrice) newErrors[`purchasePrice-${index}`] = "Purchase price is required.";
    });

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      setSaved(false);
      return;
    }

    setSaved(true);
    console.log("Delivery header:", form);
    console.log("Delivery lines:", lines);
  };

  const totalQuantity = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const totalValue = lines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.purchasePrice) || 0),
    0
  );

  return (
    <>
      <div className="del-root">
        <aside className="del-sidebar">
          <div>
            <div className="del-brand">
              <div className="del-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="del-brand-title">PharmaOS</div>
                <div className="del-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="del-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`del-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="del-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="del-sidebar-card">
            <div className="del-sidebar-card-badge">Stock Entry</div>
            <h4>Supplier delivery intake</h4>
            <p>Each delivery line creates or updates stock through batch-level registration.</p>
          </div>
        </aside>

        <main className="del-main">
          <header className="del-topbar">
            <div>
              <p className="del-topbar-label">Suppliers / Delivery / New</p>
              <h1>Register New Delivery</h1>
            </div>

            <div className="del-topbar-actions">
              <div className="del-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="del-icon-btn">
                <BellIcon />
              </button>

              <div className="del-user">
                <div className="del-user-avatar">DA</div>
                <div>
                  <div className="del-user-name">Dr. Admin</div>
                  <div className="del-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="del-hero">
            <div className="del-hero-text">
              <span className="del-hero-badge">Delivery Intake + Batch Creation</span>
              <h2>Register supplier deliveries and create the batch records that bring new stock into the system.</h2>
              <p>
                This screen models the inbound stock workflow: supplier selection,
                delivery registration, medicine lines, and batch-level stock creation.
              </p>
            </div>

            <div className="del-hero-actions">
              <button
                type="button"
                className="del-secondary-btn"
                onClick={() => router.push("/inventory")}
              >
                Back to Inventory
              </button>
            </div>
          </section>

          <div className="del-layout">
            <form className="del-form-panel" onSubmit={handleSubmit}>
              <div className="del-panel-head">
                <div>
                  <p className="del-panel-kicker">Step 1</p>
                  <h3>Delivery Header</h3>
                </div>
              </div>

              <div className="del-grid two">
                <div className="del-field">
                  <label>Supplier</label>
                  <select value={form.supplier} onChange={(e) => updateField("supplier", e.target.value)}>
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier}>{supplier}</option>
                    ))}
                  </select>
                  {errors.supplier && <p className="del-error">{errors.supplier}</p>}
                </div>

                <div className="del-field">
                  <label>Delivery Reference</label>
                  <input
                    type="text"
                    value={form.deliveryReference}
                    onChange={(e) => updateField("deliveryReference", e.target.value)}
                    placeholder="e.g. DEL-2026-001"
                  />
                  {errors.deliveryReference && <p className="del-error">{errors.deliveryReference}</p>}
                </div>
              </div>

              <div className="del-grid two">
                <div className="del-field">
                  <label>Delivery Date</label>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => updateField("deliveryDate", e.target.value)}
                  />
                  {errors.deliveryDate && <p className="del-error">{errors.deliveryDate}</p>}
                </div>

                <div className="del-field">
                  <label>Received By</label>
                  <input
                    type="text"
                    value={form.receivedBy}
                    onChange={(e) => updateField("receivedBy", e.target.value)}
                    placeholder="e.g. Dr. Admin"
                  />
                  {errors.receivedBy && <p className="del-error">{errors.receivedBy}</p>}
                </div>
              </div>

              <div className="del-field">
                <label>Notes</label>
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Optional notes about the supplier delivery..."
                />
              </div>

              <div className="del-panel-head del-panel-head-lines">
                <div>
                  <p className="del-panel-kicker">Step 2</p>
                  <h3>Delivery Line Items</h3>
                </div>

                <button type="button" className="del-outline-btn" onClick={addLine}>
                  <PlusIcon /> Add Line
                </button>
              </div>

              <div className="del-line-list">
                {lines.map((line, index) => (
                  <div className="del-line-card" key={index}>
                    <div className="del-line-top">
                      <h4>Line #{index + 1}</h4>
                      <button
                        type="button"
                        className="del-delete-btn"
                        onClick={() => removeLine(index)}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="del-grid two">
                      <div className="del-field">
                        <label>Medicine</label>
                        <select
                          value={line.medicineName}
                          onChange={(e) => updateLine(index, "medicineName", e.target.value)}
                        >
                          <option value="">Select medicine</option>
                          {medicineOptions.map((medicine) => (
                            <option key={medicine}>{medicine}</option>
                          ))}
                        </select>
                        {errors[`medicineName-${index}`] && (
                          <p className="del-error">{errors[`medicineName-${index}`]}</p>
                        )}
                      </div>

                      <div className="del-field">
                        <label>Batch Number</label>
                        <input
                          type="text"
                          value={line.batchNumber}
                          onChange={(e) => updateLine(index, "batchNumber", e.target.value)}
                          placeholder="e.g. BT-2401"
                        />
                        {errors[`batchNumber-${index}`] && (
                          <p className="del-error">{errors[`batchNumber-${index}`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="del-grid three">
                      <div className="del-field">
                        <label>Expiry Date</label>
                        <input
                          type="date"
                          value={line.expiryDate}
                          onChange={(e) => updateLine(index, "expiryDate", e.target.value)}
                        />
                        {errors[`expiryDate-${index}`] && (
                          <p className="del-error">{errors[`expiryDate-${index}`]}</p>
                        )}
                      </div>

                      <div className="del-field">
                        <label>Received Quantity</label>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, "quantity", e.target.value)}
                          placeholder="e.g. 50"
                        />
                        {errors[`quantity-${index}`] && (
                          <p className="del-error">{errors[`quantity-${index}`]}</p>
                        )}
                      </div>

                      <div className="del-field">
                        <label>Purchase Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.purchasePrice}
                          onChange={(e) => updateLine(index, "purchasePrice", e.target.value)}
                          placeholder="e.g. 12.50"
                        />
                        {errors[`purchasePrice-${index}`] && (
                          <p className="del-error">{errors[`purchasePrice-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="del-actions">
                <button type="submit" className="del-primary-btn">
                  <SaveIcon /> Save Delivery
                </button>
              </div>

              {saved && (
                <div className="del-success">
                  <CheckIcon />
                  Delivery registered successfully. Batch records are ready to enter stock.
                </div>
              )}
            </form>

            <aside className="del-summary-panel">
              <div className="del-panel-head">
                <div>
                  <p className="del-panel-kicker">Live Summary</p>
                  <h3>Incoming Stock Overview</h3>
                </div>
              </div>

              <div className="del-summary-card">
                <span className="del-summary-label">Supplier</span>
                <strong>{form.supplier || "—"}</strong>
              </div>

              <div className="del-summary-card">
                <span className="del-summary-label">Delivery Reference</span>
                <strong>{form.deliveryReference || "—"}</strong>
              </div>

              <div className="del-summary-card">
                <span className="del-summary-label">Number of Lines</span>
                <strong>{lines.length}</strong>
              </div>

              <div className="del-summary-card">
                <span className="del-summary-label">Total Quantity</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div className="del-summary-card">
                <span className="del-summary-label">Estimated Total Value</span>
                <strong>{totalValue.toFixed(2)} MAD</strong>
              </div>

              <div className="del-flow-box">
                <h4>Stock Entry Flow</h4>
                <ol>
                  <li>Select supplier and register delivery header.</li>
                  <li>Add medicine lines included in the shipment.</li>
                  <li>Create batch numbers, expiry dates, and quantities.</li>
                  <li>Validate purchase prices.</li>
                  <li>Save delivery to inject new stock into inventory.</li>
                </ol>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        body {
          margin: 0;
          background: #f5f3ee;
          font-family: "Outfit", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .del-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .del-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .del-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .del-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.32);
        }

        .del-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .del-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .del-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .del-nav-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #a8bdd7;
          min-height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          transition: all 0.2s ease;
          text-align: left;
        }

        .del-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .del-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .del-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .del-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .del-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .del-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .del-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .del-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .del-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .del-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .del-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .del-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .del-search {
          width: 280px;
          height: 48px;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          color: #7b8ba1;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .del-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .del-icon-btn {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .del-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .del-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .del-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .del-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .del-hero {
          background: linear-gradient(135deg, #0b1c35, #163257);
          color: white;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 22px;
          box-shadow: 0 16px 40px rgba(11, 28, 53, 0.16);
        }

        .del-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .del-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .del-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .del-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .del-layout {
          display: grid;
          grid-template-columns: 1.7fr 0.9fr;
          gap: 18px;
        }

        .del-form-panel,
        .del-summary-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .del-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .del-panel-head-lines {
          margin-top: 8px;
        }

        .del-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .del-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .del-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 16px;
        }

        .del-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .del-grid.three {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .del-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .del-field label {
          font-size: 13px;
          color: #5d6d82;
          font-weight: 500;
        }

        .del-field input,
        .del-field select,
        .del-field textarea {
          width: 100%;
          border: 1px solid #dbe3ed;
          background: #f8fafc;
          border-radius: 14px;
          padding: 14px 14px;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
          outline: none;
        }

        .del-field textarea {
          resize: vertical;
        }

        .del-field input:focus,
        .del-field select:focus,
        .del-field textarea:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .del-error {
          margin: 0;
          color: #dc2626;
          font-size: 12px;
        }

        .del-line-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 18px;
        }

        .del-line-card {
          border: 1px solid #e7edf4;
          background: #fbfdff;
          border-radius: 18px;
          padding: 16px;
        }

        .del-line-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .del-line-top h4 {
          margin: 0;
          font-size: 16px;
          color: #0b1c35;
        }

        .del-delete-btn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid #f1d4d4;
          background: #fff5f5;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .del-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .del-primary-btn,
        .del-secondary-btn,
        .del-outline-btn {
          font-family: "Outfit", sans-serif;
          cursor: pointer;
          border-radius: 14px;
          height: 46px;
          padding: 0 18px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .del-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
        }

        .del-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .del-outline-btn {
          border: 1px solid #dbe4ef;
          background: #fff;
          color: #2563eb;
        }

        .del-success {
          margin-top: 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #ecfdf5;
          color: #047857;
          font-size: 13px;
          font-weight: 500;
        }

        .del-summary-card {
          border: 1px solid #e8eef5;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
          background: #fbfdff;
        }

        .del-summary-label {
          display: block;
          font-size: 12px;
          color: #7a8a9b;
          margin-bottom: 6px;
        }

        .del-summary-card strong {
          color: #0b1c35;
          font-size: 15px;
        }

        .del-flow-box {
          margin-top: 16px;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(135deg, #eff6ff, #f8fbff);
          border: 1px solid #dbeafe;
        }

        .del-flow-box h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #0b1c35;
        }

        .del-flow-box ol {
          margin: 0;
          padding-left: 18px;
          color: #516275;
          line-height: 1.8;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .del-layout {
            grid-template-columns: 1fr;
          }

          .del-grid.three {
            grid-template-columns: 1fr 1fr;
          }

          .del-search {
            width: 220px;
          }
        }

        @media (max-width: 900px) {
          .del-root {
            flex-direction: column;
          }

          .del-sidebar {
            width: 100%;
            gap: 20px;
          }

          .del-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .del-topbar-actions {
            flex-wrap: wrap;
          }

          .del-search {
            width: 100%;
          }

          .del-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .del-grid.two,
          .del-grid.three {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .del-main {
            padding: 18px;
          }

          .del-topbar h1 {
            font-size: 34px;
          }

          .del-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}