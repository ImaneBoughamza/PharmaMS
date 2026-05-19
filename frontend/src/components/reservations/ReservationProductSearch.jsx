import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./ReservationProductSearch.module.css";

// TODO: replace with API call when backend is ready.
// Public reservation search only exposes products above their minimum threshold.
export const RESERVATION_PRODUCTS = [
  { id: "m1", name: "Paracetamol 500mg", type: "medicine", category: "Non-prescription", stock: 8, minStockLevel: 3, price: 18 },
  { id: "m2", name: "Ibuprofen 400mg", type: "medicine", category: "Non-prescription", stock: 19, minStockLevel: 5, price: 24 },
  { id: "m3", name: "Vitamin C 1000mg", type: "medicine", category: "Supplement", stock: 63, minStockLevel: 8, price: 42 },
  { id: "m4", name: "Cough Syrup", type: "medicine", category: "OTC", stock: 11, minStockLevel: 4, price: 39 },
  { id: "m5", name: "Efferalgan 500mg", type: "medicine", category: "Non-prescription", stock: 15, minStockLevel: 5, price: 21 },
  { id: "m6", name: "Vitamin D3", type: "medicine", category: "Supplement", stock: 24, minStockLevel: 5, price: 48 },
  { id: "p1", name: "Sunscreen SPF50+", type: "parapharmacy", brand: "DermaCare", category: "Skincare", stock: 12, minStockLevel: 4, price: 85 },
  { id: "p2", name: "Baby Shampoo", type: "parapharmacy", brand: "BabySoft", category: "Baby Care", stock: 30, minStockLevel: 5, price: 35 },
  { id: "p3", name: "Hand Sanitizer 500ml", type: "parapharmacy", brand: "CleanPlus", category: "Hygiene", stock: 45, minStockLevel: 10, price: 28 },
];

export default function ReservationProductSearch({ onAdd, excludeIds = [] }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const q = debouncedQuery.trim().toLowerCase();
  const canSearch = q.length >= 2;
  const pool = RESERVATION_PRODUCTS.filter((product) => product.stock > product.minStockLevel && !excludeIds.includes(product.id));
  const matches = canSearch ? pool.filter((product) => product.name.toLowerCase().includes(q)) : [];
  const medicines = matches.filter((product) => product.type === "medicine");
  const parapharmacy = matches.filter((product) => product.type !== "medicine");
  const hasResults = medicines.length > 0 || parapharmacy.length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function handleSelect(product) {
    onAdd(product);
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  }

  function renderProduct(product) {
    const description = product.type === "medicine" ? product.category : `${product.brand} - ${product.category}`;
    return (
      <button key={product.id} type="button" className={styles.row} onClick={() => handleSelect(product)}>
        <span className={styles.rowName}>
          {product.name}
          <em>{description}</em>
        </span>
        <span className={styles.rowMeta} dir="ltr">{product.stock} in stock - {product.price} MAD</span>
      </button>
    );
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
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setOpen(true);
            }}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className={styles.dropdown}>
          {!canSearch ? (
            <p className={styles.empty}>Type at least 2 characters to search.</p>
          ) : !hasResults ? (
            <p className={styles.empty}>No products match "{query}"</p>
          ) : (
            <>
              {medicines.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupHeader}>Medicines</p>
                  {medicines.map(renderProduct)}
                </div>
              )}
              {parapharmacy.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupHeader}>Parapharmacy</p>
                  {parapharmacy.map(renderProduct)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
