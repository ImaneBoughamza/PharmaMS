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
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory", active: true },
  { label: "POS", icon: <CartIcon />, href: "/pos" },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
];

const supplierOptions = [
  "Pharma Distrib",
  "MediSupply",
  "Secure Pharma",
  "NutriMed",
  "Other",
];

const emptyBatch = {
  batchNumber: "",
  expiryDate: "",
  quantity: "",
};

export default function AddInventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    medicineName: "",
    activeSubstance: "",
    category: "Non-Prescription",
    supplier: "",
    purchasePrice: "",
    salePrice: "",
    minStockThreshold: "",
    description: "",
  });

  const [batches, setBatches] = useState([{ ...emptyBatch }]);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updateBatch = (index, field, value) => {
    const updated = [...batches];
    updated[index][field] = value;
    setBatches(updated);
    setSaved(false);
  };

  const addBatchRow = () => {
    setBatches((prev) => [...prev, { ...emptyBatch }]);
    setSaved(false);
  };

  const removeBatchRow = (index) => {
    if (batches.length === 1) return;
    setBatches((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.medicineName.trim()) newErrors.medicineName = "Medicine name is required.";
    if (!form.activeSubstance.trim()) newErrors.activeSubstance = "Active substance is required.";
    if (!form.supplier) newErrors.supplier = "Supplier is required.";
    if (!form.purchasePrice) newErrors.purchasePrice = "Purchase price is required.";
    if (!form.salePrice) newErrors.salePrice = "Sale price is required.";
    if (!form.minStockThreshold) newErrors.minStockThreshold = "Minimum stock threshold is required.";

    batches.forEach((batch, index) => {
      if (!batch.batchNumber.trim()) newErrors[`batchNumber-${index}`] = "Batch number is required.";
      if (!batch.expiryDate) newErrors[`expiryDate-${index}`] = "Expiry date is required.";
      if (!batch.quantity) newErrors[`quantity-${index}`] = "Quantity is required.";
    });

    return newErrors;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSaved(false);
      return;
    }

    setSaved(true);
    console.log("Medicine form:", form);
    console.log("Batch list:", batches);
  };

  const totalBatchQty = batches.reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0);

  return (
    <>
      <div className="add-root">
        <aside className="add-sidebar">
          <div>
            <div className="add-brand">
              <div className="add-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="add-brand-title">PharmaOS</div>
                <div className="add-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="add-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`add-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="add-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="add-sidebar-card">
            <div className="add-sidebar-card-badge">Data Flow</div>
            <h4>Medicine + Batch registration</h4>
            <p>Step 1: create medicine record. Step 2: register one or more incoming batches.</p>
          </div>
        </aside>

        <main className="add-main">
          <header className="add-topbar">
            <div>
              <p className="add-topbar-label">Inventory / Add</p>
              <h1>Add Medicine & Register Batches</h1>
            </div>

            <div className="add-topbar-actions">
              <div className="add-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="add-icon-btn">
                <BellIcon />
              </button>

              <div className="add-user">
                <div className="add-user-avatar">DA</div>
                <div>
                  <div className="add-user-name">Dr. Admin</div>
                  <div className="add-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="add-hero">
            <div className="add-hero-text">
              <span className="add-hero-badge">Form Design + Batch Registration</span>
              <h2>Create the medicine record first, then register supplier-linked batches with expiry and quantity details.</h2>
              <p>
                This page reflects the inventory requirements of your capstone by combining
                medicine information, batch-level traceability, and structured input flow.
              </p>
            </div>

            <div className="add-hero-actions">
              <button
                type="button"
                className="add-secondary-btn"
                onClick={() => router.push("/inventory")}
              >
                Back to Inventory
              </button>
            </div>
          </section>

          <div className="add-layout">
            <form className="add-form-panel" onSubmit={handleSave}>
              <div className="add-panel-head">
                <div>
                  <p className="add-panel-kicker">Step 1</p>
                  <h3>Medicine Information</h3>
                </div>
              </div>

              <div className="add-grid two">
                <div className="add-field">
                  <label>Medicine Name</label>
                  <input
                    type="text"
                    value={form.medicineName}
                    onChange={(e) => updateField("medicineName", e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                  />
                  {errors.medicineName && <p className="add-error">{errors.medicineName}</p>}
                </div>

                <div className="add-field">
                  <label>Active Substance</label>
                  <input
                    type="text"
                    value={form.activeSubstance}
                    onChange={(e) => updateField("activeSubstance", e.target.value)}
                    placeholder="e.g. Paracetamol"
                  />
                  {errors.activeSubstance && <p className="add-error">{errors.activeSubstance}</p>}
                </div>
              </div>

              <div className="add-grid three">
                <div className="add-field">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    <option>Non-Prescription</option>
                    <option>Prescription</option>
                    <option>Regulated</option>
                  </select>
                </div>

                <div className="add-field">
                  <label>Supplier</label>
                  <select
                    value={form.supplier}
                    onChange={(e) => updateField("supplier", e.target.value)}
                  >
                    <option value="">Select supplier</option>
                    {supplierOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {errors.supplier && <p className="add-error">{errors.supplier}</p>}
                </div>

                <div className="add-field">
                  <label>Minimum Stock Threshold</label>
                  <input
                    type="number"
                    value={form.minStockThreshold}
                    onChange={(e) => updateField("minStockThreshold", e.target.value)}
                    placeholder="e.g. 20"
                  />
                  {errors.minStockThreshold && <p className="add-error">{errors.minStockThreshold}</p>}
                </div>
              </div>

              <div className="add-grid two">
                <div className="add-field">
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", e.target.value)}
                    placeholder="e.g. 12.50"
                  />
                  {errors.purchasePrice && <p className="add-error">{errors.purchasePrice}</p>}
                </div>

                <div className="add-field">
                  <label>Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => updateField("salePrice", e.target.value)}
                    placeholder="e.g. 18.00"
                  />
                  {errors.salePrice && <p className="add-error">{errors.salePrice}</p>}
                </div>
              </div>

              <div className="add-field">
                <label>Description / Notes</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Optional notes about the medicine, packaging, or internal instructions..."
                />
              </div>

              <div className="add-panel-head add-panel-head-batches">
                <div>
                  <p className="add-panel-kicker">Step 2</p>
                  <h3>Batch Registration</h3>
                </div>

                <button type="button" className="add-outline-btn" onClick={addBatchRow}>
                  <PlusIcon /> Add Batch
                </button>
              </div>

              <div className="add-batch-list">
                {batches.map((batch, index) => (
                  <div className="add-batch-card" key={index}>
                    <div className="add-batch-top">
                      <h4>Batch #{index + 1}</h4>
                      <button
                        type="button"
                        className="add-delete-btn"
                        onClick={() => removeBatchRow(index)}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="add-grid three">
                      <div className="add-field">
                        <label>Batch Number</label>
                        <input
                          type="text"
                          value={batch.batchNumber}
                          onChange={(e) => updateBatch(index, "batchNumber", e.target.value)}
                          placeholder="e.g. BT-2401"
                        />
                        {errors[`batchNumber-${index}`] && (
                          <p className="add-error">{errors[`batchNumber-${index}`]}</p>
                        )}
                      </div>

                      <div className="add-field">
                        <label>Expiry Date</label>
                        <input
                          type="date"
                          value={batch.expiryDate}
                          onChange={(e) => updateBatch(index, "expiryDate", e.target.value)}
                        />
                        {errors[`expiryDate-${index}`] && (
                          <p className="add-error">{errors[`expiryDate-${index}`]}</p>
                        )}
                      </div>

                      <div className="add-field">
                        <label>Received Quantity</label>
                        <input
                          type="number"
                          value={batch.quantity}
                          onChange={(e) => updateBatch(index, "quantity", e.target.value)}
                          placeholder="e.g. 50"
                        />
                        {errors[`quantity-${index}`] && (
                          <p className="add-error">{errors[`quantity-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-actions">
                <button type="submit" className="add-primary-btn">
                  <SaveIcon /> Save Medicine
                </button>
              </div>

              {saved && (
                <div className="add-success">
                  <CheckIcon />
                  Medicine and batch information validated successfully.
                </div>
              )}
            </form>

            <aside className="add-summary-panel">
              <div className="add-panel-head">
                <div>
                  <p className="add-panel-kicker">Live Summary</p>
                  <h3>Input Flow Overview</h3>
                </div>
              </div>

              <div className="add-summary-card">
                <span className="add-summary-label">Medicine Name</span>
                <strong>{form.medicineName || "—"}</strong>
              </div>

              <div className="add-summary-card">
                <span className="add-summary-label">Category</span>
                <strong>{form.category || "—"}</strong>
              </div>

              <div className="add-summary-card">
                <span className="add-summary-label">Supplier</span>
                <strong>{form.supplier || "—"}</strong>
              </div>

              <div className="add-summary-card">
                <span className="add-summary-label">Number of Batches</span>
                <strong>{batches.length}</strong>
              </div>

              <div className="add-summary-card">
                <span className="add-summary-label">Total Received Quantity</span>
                <strong>{totalBatchQty}</strong>
              </div>

              <div className="add-flow-box">
                <h4>Workflow</h4>
                <ol>
                  <li>Enter medicine master information.</li>
                  <li>Select category and supplier.</li>
                  <li>Define prices and stock threshold.</li>
                  <li>Register one or more delivery batches.</li>
                  <li>Save the full medicine record.</li>
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

        .add-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .add-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .add-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .add-brand-icon {
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

        .add-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .add-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .add-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .add-nav-item {
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

        .add-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .add-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .add-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .add-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .add-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .add-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .add-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .add-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .add-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .add-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .add-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .add-search {
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

        .add-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .add-icon-btn {
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

        .add-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .add-user-avatar {
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

        .add-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .add-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .add-hero {
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

        .add-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .add-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .add-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .add-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .add-layout {
          display: grid;
          grid-template-columns: 1.7fr 0.9fr;
          gap: 18px;
        }

        .add-form-panel,
        .add-summary-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .add-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .add-panel-head-batches {
          margin-top: 8px;
        }

        .add-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .add-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .add-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 16px;
        }

        .add-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .add-grid.three {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .add-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .add-field label {
          font-size: 13px;
          color: #5d6d82;
          font-weight: 500;
        }

        .add-field input,
        .add-field select,
        .add-field textarea {
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

        .add-field textarea {
          resize: vertical;
        }

        .add-field input:focus,
        .add-field select:focus,
        .add-field textarea:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .add-error {
          margin: 0;
          color: #dc2626;
          font-size: 12px;
        }

        .add-batch-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 18px;
        }

        .add-batch-card {
          border: 1px solid #e7edf4;
          background: #fbfdff;
          border-radius: 18px;
          padding: 16px;
        }

        .add-batch-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .add-batch-top h4 {
          margin: 0;
          font-size: 16px;
          color: #0b1c35;
        }

        .add-delete-btn {
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

        .add-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .add-primary-btn,
        .add-secondary-btn,
        .add-outline-btn {
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

        .add-primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.32);
        }

        .add-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .add-outline-btn {
          border: 1px solid #dbe4ef;
          background: #fff;
          color: #2563eb;
        }

        .add-success {
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

        .add-summary-card {
          border: 1px solid #e8eef5;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
          background: #fbfdff;
        }

        .add-summary-label {
          display: block;
          font-size: 12px;
          color: #7a8a9b;
          margin-bottom: 6px;
        }

        .add-summary-card strong {
          color: #0b1c35;
          font-size: 15px;
        }

        .add-flow-box {
          margin-top: 16px;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(135deg, #eff6ff, #f8fbff);
          border: 1px solid #dbeafe;
        }

        .add-flow-box h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #0b1c35;
        }

        .add-flow-box ol {
          margin: 0;
          padding-left: 18px;
          color: #516275;
          line-height: 1.8;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .add-layout {
            grid-template-columns: 1fr;
          }

          .add-grid.three {
            grid-template-columns: 1fr 1fr;
          }

          .add-search {
            width: 220px;
          }
        }

        @media (max-width: 900px) {
          .add-root {
            flex-direction: column;
          }

          .add-sidebar {
            width: 100%;
            gap: 20px;
          }

          .add-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .add-topbar-actions {
            flex-wrap: wrap;
          }

          .add-search {
            width: 100%;
          }

          .add-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .add-grid.two,
          .add-grid.three {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .add-main {
            padding: 18px;
          }

          .add-topbar h1 {
            font-size: 34px;
          }

          .add-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}