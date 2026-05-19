import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import api from "@/lib/axios";
import styles from "./ProductSearch.module.css";

const DEMO_PRODUCTS = [
  { _id: "demo-paracetamol", id: "demo-paracetamol", name: "Paracetamol 500mg", type: "medicine", category: "non-prescription", stock: 24, price: 18 },
  { _id: "demo-amoxicillin", id: "demo-amoxicillin", name: "Amoxicillin 500mg", type: "medicine", category: "prescription", stock: 16, price: 42 },
  { _id: "demo-vitamin-c", id: "demo-vitamin-c", name: "Vitamin C 1000mg", type: "medicine", category: "non-prescription", stock: 18, price: 42 },
  { _id: "demo-sunscreen", id: "demo-sunscreen", name: "Sunscreen SPF50+", type: "parapharmacy", category: "cosmetics", stock: 12, price: 85 },
  { _id: "demo-sanitizer", id: "demo-sanitizer", name: "Hand Sanitizer 500ml", type: "parapharmacy", category: "hygiene", stock: 30, price: 28 },
];

// Requires backend to expose GET /api/reservations/products without auth.
// Expected response: { medicines: [{_id, name, stock, salePrice}], parapharmacy: [{_id, name, stockQty, salePrice}] }
export default function ProductSearch({ onAdd, excludeIds = [] }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [query,    setQuery]    = useState("");
  const [open,     setOpen]     = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/api/reservations/products")
      .then(({ data }) => {
        const payload = data.data ?? data;
        const combined = Array.isArray(payload) ? payload : null;
        const medicineSource = combined
          ? combined.filter((item) => (item.productType ?? item.type) === "medicine")
          : payload.medicines ?? [];
        const parapharmacySource = combined
          ? combined.filter((item) => (item.productType ?? item.type) === "parapharmacy")
          : payload.parapharmacy ?? [];
        const medicines = medicineSource.map((m) => ({
          _id: m._id, id: m._id,
          name: m.name, type: "medicine",
          category: m.category,
          stock: m.stock ?? 99, price: m.salePrice ?? 0,
        }));
        const para = parapharmacySource.map((p) => ({
          _id: p._id, id: p._id,
          name: p.name, type: "parapharmacy",
          category: p.category,
          stock: p.stockQty ?? p.stock ?? 99, price: p.salePrice ?? 0,
        }));
        setProducts([...medicines, ...para]);
      })
      .catch(() => {
        if (process.env.NODE_ENV !== "production") {
          setProducts(DEMO_PRODUCTS);
          setError("");
          return;
        }
        setProducts([]);
        setError("Products could not be loaded. Please check the API connection.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const q = query.trim().toLowerCase();
  const pool     = products.filter((p) => p.stock > 0 && !excludeIds.includes(p.id) && !excludeIds.includes(p._id));
  const matches  = q ? pool.filter((p) => p.name.toLowerCase().includes(q)) : pool;
  const medicines = matches.filter((p) => p.type === "medicine");
  const parapharm = matches.filter((p) => p.type !== "medicine");
  const hasResults = medicines.length > 0 || parapharm.length > 0;

  function handleSelect(product) {
    onAdd(product);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.inputWrap}>
        <Search size={15} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder="Search medicines or parapharmacy products..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => { setQuery(""); setOpen(true); }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className={styles.dropdown}>
          {!hasResults ? (
            <p className={styles.empty}>
              {loading
                ? "Loading products…"
                : error || (q ? `No products match "${query}"` : "No products available.")}
            </p>
          ) : (
            <>
              {medicines.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupHeader}>Medicines</p>
                  {medicines.map((p) => (
                    <button key={p.id} type="button" className={styles.row} onClick={() => handleSelect(p)}>
                      <span className={styles.rowName}>{p.name}</span>
                      <span className={styles.rowMeta}>
                        {p.stock} in stock{p.price > 0 ? ` · ${p.price} MAD` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {parapharm.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupHeader}>Parapharmacy</p>
                  {parapharm.map((p) => (
                    <button key={p.id} type="button" className={styles.row} onClick={() => handleSelect(p)}>
                      <span className={styles.rowName}>{p.name}</span>
                      <span className={styles.rowMeta}>
                        {p.stock} in stock{p.price > 0 ? ` · ${p.price} MAD` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
