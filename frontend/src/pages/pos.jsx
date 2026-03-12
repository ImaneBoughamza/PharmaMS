import { useMemo, useState } from "react";
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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const CashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 9h.01M18 15h.01" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 118 0v3" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, href: "/dashboard" },
  { label: "Inventory", icon: <BoxesIcon />, href: "/inventory" },
  { label: "POS", icon: <CartIcon />, href: "/pos", active: true },
  { label: "Reservations", icon: <CalendarIcon />, href: "/reservations" },
  { label: "Reports", icon: <FileIcon />, href: "/reports" },
  { label: "Users", icon: <UsersIcon />, href: "/users" },
  { label: "Audit Logs", icon: <ShieldIcon />, href: "/audit-logs" },
];

const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Non-Prescription",
    batch: "PC-2401",
    price: 18,
    stock: 8,
    regulated: false,
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    category: "Non-Prescription",
    batch: "IB-8420",
    price: 24,
    stock: 19,
    regulated: false,
  },
  {
    id: 3,
    name: "Diazepam 5mg",
    category: "Regulated",
    batch: "DZ-9921",
    price: 36,
    stock: 14,
    regulated: true,
  },
  {
    id: 4,
    name: "Vitamin C 1000mg",
    category: "Non-Prescription",
    batch: "VC-1143",
    price: 42,
    stock: 63,
    regulated: false,
  },
  {
    id: 5,
    name: "Amoxicillin 1g",
    category: "Prescription",
    batch: "AMX-2318",
    price: 55,
    stock: 42,
    regulated: false,
  },
  {
    id: 6,
    name: "Cough Syrup",
    category: "Non-Prescription",
    batch: "CS-3302",
    price: 39,
    stock: 11,
    regulated: false,
  },
];

export default function POSPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showValidation, setShowValidation] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saleDone, setSaleDone] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.batch.toLowerCase().includes(q)
    );
  }, [search]);

  const addToCart = (product) => {
    setSaleDone(false);
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: Math.min(item.qty + 1, product.stock),
              }
            : item
        )
      );
    } else {
      setCart((prev) => [...prev, { ...product, qty: 1 }]);
    }

    if (product.regulated) {
      setShowValidation(true);
      setValidated(false);
    }
  };

  const updateQty = (id, action) => {
    setSaleDone(false);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = action === "inc" ? item.qty + 1 : item.qty - 1;
          return { ...item, qty: Math.max(0, Math.min(newQty, item.stock)) };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setSaleDone(false);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const containsRegulated = cart.some((item) => item.regulated);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.0;
  const total = subtotal + tax;

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;
    if (containsRegulated && !validated) {
      setShowValidation(true);
      return;
    }
    setSaleDone(true);
  };

  return (
    <>
      <div className="pos-root">
        <aside className="pos-sidebar">
          <div>
            <div className="pos-brand">
              <div className="pos-brand-icon">
                <PillIcon />
              </div>
              <div>
                <div className="pos-brand-title">PharmaOS</div>
                <div className="pos-brand-sub">Management System</div>
              </div>
            </div>

            <nav className="pos-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`pos-nav-item${item.active ? " active" : ""}`}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                >
                  <span className="pos-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="pos-sidebar-card">
            <div className="pos-sidebar-card-badge">POS Rules</div>
            <h4>FIFO + regulation awareness</h4>
            <p>Regulated items require pharmacist validation before finalizing the sale.</p>
          </div>
        </aside>

        <main className="pos-main">
          <header className="pos-topbar">
            <div>
              <p className="pos-topbar-label">Sales / Point of Sale</p>
              <h1>Pharmacy POS</h1>
            </div>

            <div className="pos-topbar-actions">
              <div className="pos-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search medicine, category, batch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="button" className="pos-icon-btn">
                <BellIcon />
              </button>

              <div className="pos-user">
                <div className="pos-user-avatar">DA</div>
                <div>
                  <div className="pos-user-name">Dr. Admin</div>
                  <div className="pos-user-role">Pharmacist</div>
                </div>
              </div>
            </div>
          </header>

          <section className="pos-hero">
            <div className="pos-hero-text">
              <span className="pos-hero-badge">Sales Workflow</span>
              <h2>Initiate sales, add medicines, verify regulated items, and finalize transactions.</h2>
              <p>
                This POS screen matches your capstone requirements for stock verification,
                regulated medicine control, payment processing, and sale finalization.
              </p>
            </div>

            <div className="pos-hero-actions">
              <button type="button" className="pos-secondary-btn" onClick={() => router.push("/inventory")}>
                View Inventory
              </button>
            </div>
          </section>

          <div className="pos-layout">
            <section className="pos-products-panel">
              <div className="pos-panel-head">
                <div>
                  <p className="pos-panel-kicker">Available Medicines</p>
                  <h3>Product list</h3>
                </div>
              </div>

              <div className="pos-products-grid">
                {filteredProducts.map((product) => (
                  <div className="pos-product-card" key={product.id}>
                    <div className="pos-product-top">
                      <div>
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      {product.regulated ? (
                        <span className="pos-badge regulated">Regulated</span>
                      ) : product.category === "Prescription" ? (
                        <span className="pos-badge prescription">Prescription</span>
                      ) : (
                        <span className="pos-badge otc">OTC</span>
                      )}
                    </div>

                    <div className="pos-product-meta">
                      <span>Batch: {product.batch}</span>
                      <span>Stock: {product.stock}</span>
                    </div>

                    <div className="pos-product-bottom">
                      <strong>{product.price} MAD</strong>
                      <button type="button" className="pos-add-btn" onClick={() => addToCart(product)}>
                        <PlusIcon /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="pos-cart-panel">
              <div className="pos-panel-head">
                <div>
                  <p className="pos-panel-kicker">Current Sale</p>
                  <h3>Cart Summary</h3>
                </div>
              </div>

              <div className="pos-cart-list">
                {cart.length === 0 ? (
                  <div className="pos-empty">
                    No medicines added yet.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="pos-cart-item" key={item.id}>
                      <div className="pos-cart-item-top">
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.batch}</p>
                        </div>
                        <button type="button" className="pos-delete-btn" onClick={() => removeItem(item.id)}>
                          <TrashIcon />
                        </button>
                      </div>

                      <div className="pos-cart-item-bottom">
                        <div className="pos-qty">
                          <button type="button" onClick={() => updateQty(item.id, "dec")}>-</button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.id, "inc")}>+</button>
                        </div>
                        <strong>{item.qty * item.price} MAD</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pos-payment-box">
                <p className="pos-payment-title">Payment Method</p>

                <div className="pos-payment-options">
                  <button
                    type="button"
                    className={`pos-payment-btn${paymentMethod === "Cash" ? " active" : ""}`}
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    <CashIcon /> Cash
                  </button>

                  <button
                    type="button"
                    className={`pos-payment-btn${paymentMethod === "Electronic" ? " active" : ""}`}
                    onClick={() => setPaymentMethod("Electronic")}
                  >
                    <CreditCardIcon /> Electronic
                  </button>
                </div>

                {containsRegulated && (
                  <div className="pos-validation-box">
                    <div className="pos-validation-head">
                      <LockIcon />
                      <span>Regulated medicine detected</span>
                    </div>
                    <p>Pharmacist validation is required before the sale can be completed.</p>

                    <button
                      type="button"
                      className={`pos-validate-btn${validated ? " done" : ""}`}
                      onClick={() => {
                        setValidated(true);
                        setShowValidation(false);
                      }}
                    >
                      {validated ? <><CheckIcon /> Validated</> : "Validate Sale"}
                    </button>
                  </div>
                )}

                <div className="pos-total-box">
                  <div className="pos-line">
                    <span>Subtotal</span>
                    <strong>{subtotal.toFixed(2)} MAD</strong>
                  </div>
                  <div className="pos-line">
                    <span>Tax</span>
                    <strong>{tax.toFixed(2)} MAD</strong>
                  </div>
                  <div className="pos-line total">
                    <span>Total</span>
                    <strong>{total.toFixed(2)} MAD</strong>
                  </div>
                </div>

                <button type="button" className="pos-finalize-btn" onClick={handleFinalizeSale}>
                  Finalize Sale
                </button>

                {showValidation && containsRegulated && !validated && (
                  <div className="pos-warning">
                    <AlertIcon />
                    Pharmacist validation must be completed before finalizing this sale.
                  </div>
                )}

                {saleDone && (
                  <div className="pos-success">
                    <CheckIcon />
                    Sale recorded successfully. Receipt can now be generated.
                  </div>
                )}
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

        .pos-root {
          min-height: 100vh;
          display: flex;
          background: #f5f3ee;
          color: #0b1c35;
          font-family: "Outfit", sans-serif;
        }

        .pos-sidebar {
          width: 275px;
          background: #0b1c35;
          color: #d7e2f0;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 10px 0 30px rgba(11, 28, 53, 0.12);
        }

        .pos-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding: 4px 6px;
        }

        .pos-brand-icon {
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

        .pos-brand-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }

        .pos-brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #87a1c0;
          margin-top: 4px;
        }

        .pos-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pos-nav-item {
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

        .pos-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .pos-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
          color: #fff;
          border: 1px solid rgba(147, 197, 253, 0.18);
        }

        .pos-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pos-sidebar-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 16px;
        }

        .pos-sidebar-card-badge {
          display: inline-block;
          font-size: 11px;
          border-radius: 999px;
          padding: 5px 10px;
          background: rgba(52, 211, 153, 0.14);
          color: #8ef0cb;
          margin-bottom: 10px;
        }

        .pos-sidebar-card h4 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 15px;
        }

        .pos-sidebar-card p {
          margin: 0;
          color: #99afc8;
          font-size: 13px;
          line-height: 1.6;
        }

        .pos-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        .pos-topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }

        .pos-topbar-label {
          margin: 0 0 8px;
          color: #748397;
          font-size: 13px;
        }

        .pos-topbar h1 {
          margin: 0;
          font-size: 44px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          color: #0b1c35;
        }

        .pos-topbar-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pos-search {
          width: 320px;
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

        .pos-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: "Outfit", sans-serif;
          font-size: 14px;
          color: #0b1c35;
        }

        .pos-icon-btn {
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

        .pos-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .pos-user-avatar {
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

        .pos-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0b1c35;
        }

        .pos-user-role {
          font-size: 12px;
          color: #6b7a90;
        }

        .pos-hero {
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

        .pos-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c8daf1;
          font-size: 12px;
        }

        .pos-hero h2 {
          margin: 0 0 12px;
          max-width: 760px;
          font-size: 30px;
          line-height: 1.25;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .pos-hero p {
          margin: 0;
          max-width: 760px;
          color: #b9cce2;
          line-height: 1.7;
          font-size: 14px;
        }

        .pos-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pos-secondary-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 500;
          font-family: "Outfit", sans-serif;
          cursor: pointer;
        }

        .pos-layout {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr;
          gap: 18px;
        }

        .pos-products-panel,
        .pos-cart-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
        }

        .pos-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .pos-panel-kicker {
          margin: 0 0 6px;
          color: #7a8a9b;
          font-size: 12px;
        }

        .pos-panel-head h3 {
          margin: 0;
          font-size: 24px;
          color: #0b1c35;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
        }

        .pos-products-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .pos-product-card {
          border: 1px solid #e8eef5;
          background: #fbfdff;
          border-radius: 18px;
          padding: 16px;
        }

        .pos-product-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .pos-product-top h4 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #0b1c35;
        }

        .pos-product-top p {
          margin: 0;
          font-size: 13px;
          color: #6b7a90;
        }

        .pos-badge {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          display: inline-block;
          height: fit-content;
        }

        .pos-badge.otc {
          background: #eff6ff;
          color: #2563eb;
        }

        .pos-badge.prescription {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .pos-badge.regulated {
          background: #fef2f2;
          color: #dc2626;
        }

        .pos-product-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #6b7a90;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .pos-product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pos-product-bottom strong {
          color: #0b1c35;
          font-size: 17px;
        }

        .pos-add-btn {
          border: none;
          background: #2563eb;
          color: white;
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
        }

        .pos-cart-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 18px;
        }

        .pos-empty {
          border: 1px dashed #d8e1eb;
          border-radius: 16px;
          padding: 18px;
          color: #7a8a9b;
          font-size: 14px;
          text-align: center;
          background: #fbfdff;
        }

        .pos-cart-item {
          border: 1px solid #e8eef5;
          background: #fbfdff;
          border-radius: 16px;
          padding: 14px;
        }

        .pos-cart-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .pos-cart-item-top h4 {
          margin: 0 0 4px;
          font-size: 15px;
          color: #0b1c35;
        }

        .pos-cart-item-top p {
          margin: 0;
          font-size: 13px;
          color: #6b7a90;
        }

        .pos-delete-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #f1d4d4;
          background: #fff5f5;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .pos-cart-item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pos-qty {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 6px 10px;
        }

        .pos-qty button {
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 8px;
          background: #fff;
          color: #0b1c35;
          cursor: pointer;
          font-size: 15px;
        }

        .pos-payment-box {
          border-top: 1px solid #edf2f7;
          padding-top: 18px;
        }

        .pos-payment-title {
          margin: 0 0 12px;
          font-size: 13px;
          color: #6b7a90;
          font-weight: 500;
        }

        .pos-payment-options {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pos-payment-btn {
          flex: 1;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #dbe4ef;
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

        .pos-payment-btn.active {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .pos-validation-box {
          border: 1px solid #fee2e2;
          background: #fff7f7;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .pos-validation-head {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b91c1c;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .pos-validation-box p {
          margin: 0 0 12px;
          color: #7f1d1d;
          font-size: 13px;
          line-height: 1.6;
        }

        .pos-validate-btn {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          border: none;
          background: #dc2626;
          color: white;
          cursor: pointer;
          font-family: "Outfit", sans-serif;
          font-weight: 500;
        }

        .pos-validate-btn.done {
          background: #059669;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .pos-total-box {
          border-top: 1px solid #edf2f7;
          padding-top: 14px;
          margin-top: 8px;
        }

        .pos-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #516275;
          font-size: 14px;
        }

        .pos-line.total {
          font-size: 16px;
          color: #0b1c35;
          font-weight: 600;
          margin-top: 12px;
        }

        .pos-finalize-btn {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          border: none;
          background: #2563eb;
          color: white;
          font-family: "Outfit", sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.28);
        }

        .pos-warning,
        .pos-success {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
        }

        .pos-warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .pos-success {
          background: #ecfdf5;
          color: #047857;
        }

        @media (max-width: 1200px) {
          .pos-layout {
            grid-template-columns: 1fr;
          }

          .pos-products-grid {
            grid-template-columns: 1fr 1fr;
          }

          .pos-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .pos-root {
            flex-direction: column;
          }

          .pos-sidebar {
            width: 100%;
            gap: 20px;
          }

          .pos-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .pos-topbar-actions {
            flex-wrap: wrap;
          }

          .pos-search {
            width: 100%;
          }

          .pos-hero {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 700px) {
          .pos-main {
            padding: 18px;
          }

          .pos-products-grid {
            grid-template-columns: 1fr;
          }

          .pos-topbar h1 {
            font-size: 34px;
          }

          .pos-panel-head h3 {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}