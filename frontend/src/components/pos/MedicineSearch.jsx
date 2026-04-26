import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import styles from "./MedicineSearch.module.css";

// TODO: replace with useSWR("/api/pos/search") when backend is ready
const MOCK_MEDICINES = [
  { _id: "1", name: "Paracetamol 500mg", genericName: "Paracetamol",       category: "non-prescription", salePrice: 22.5, stock: 8,  type: "medicine", unit: "tablet" },
  { _id: "2", name: "Amoxicillin 1g",    genericName: "Amoxicillin",        category: "prescription",     salePrice: 65.0, stock: 42, type: "medicine", unit: "tablet" },
  { _id: "3", name: "Ibuprofen 400mg",   genericName: "Ibuprofen",          category: "non-prescription", salePrice: 28.0, stock: 19, type: "medicine", unit: "tablet" },
  { _id: "4", name: "Vitamin C 1000mg",  genericName: "Ascorbic Acid",      category: "non-prescription", salePrice: 18.0, stock: 63, type: "medicine", unit: "tablet" },
  { _id: "5", name: "Diazepam 5mg",      genericName: "Diazepam",           category: "regulated",        salePrice: 80.0, stock: 0,  type: "medicine", unit: "tablet" },
  { _id: "6", name: "Metformin 500mg",   genericName: "Metformin",          category: "prescription",     salePrice: 35.0, stock: 55, type: "medicine", unit: "tablet" },
];

const MOCK_PARAPHARMACY = [
  { _id: "p1", name: "Vitamin D3 1000 IU",  brand: "Sanofi",    category: "supplements",    salePrice: 85,  stock: 48, type: "parapharmacy" },
  { _id: "p2", name: "Micellar Water 400ml", brand: "Bioderma",  category: "cosmetics",      salePrice: 120, stock: 12, type: "parapharmacy" },
  { _id: "p3", name: "Digital Thermometer",  brand: "Omron",     category: "medical-device", salePrice: 220, stock: 3,  type: "parapharmacy" },
  { _id: "p4", name: "Hand Sanitiser 500ml", brand: "Dettol",    category: "hygiene",        salePrice: 45,  stock: 0,  type: "parapharmacy" },
  { _id: "p5", name: "Omega-3 Fish Oil",     brand: "Nutrident", category: "supplements",    salePrice: 150, stock: 30, type: "parapharmacy" },
];

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

function categoryVariant(category) {
  if (category === "regulated")        return "regulated";
  if (category === "prescription")     return "pending";
  return "neutral";
}

export default function MedicineSearch({ onAdd }) {
  const [query,           setQuery]           = useState("");
  const [debouncedQuery,  setDebouncedQuery]  = useState("");
  const [results,         setResults]         = useState({ medicines: [], parapharmacy: [] });
  const [outOfStockId,    setOutOfStockId]    = useState(null);
  const wrapperRef = useRef(null);

  // 300ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Search
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ medicines: [], parapharmacy: [] });
      return;
    }
    const q = debouncedQuery.toLowerCase();
    const medicines = MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.genericName ?? "").toLowerCase().includes(q)
    );
    const parapharmacy = MOCK_PARAPHARMACY.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
    );
    setResults({ medicines, parapharmacy });
  }, [debouncedQuery]);

  // Click outside → close dropdown
  useEffect(() => {
    function onMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults({ medicines: [], parapharmacy: [] });
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setQuery("");
      setResults({ medicines: [], parapharmacy: [] });
    }
  }

  function handleClear() {
    setQuery("");
    setResults({ medicines: [], parapharmacy: [] });
  }

  function handleSelect(item) {
    if (item.stock === 0) {
      setOutOfStockId(item._id);
      setTimeout(() => setOutOfStockId(null), 2500);
      return;
    }
    onAdd(item);
    setQuery("");
    setResults({ medicines: [], parapharmacy: [] });
  }

  const hasResults = results.medicines.length > 0 || results.parapharmacy.length > 0;
  const showDropdown = debouncedQuery.length >= 2;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.input}
          type="text"
          placeholder="Search medicines and parapharmacy products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button className={styles.clearBtn} onClick={handleClear} type="button" aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {!hasResults && (
            <p className={styles.noResults}>No products found for &ldquo;{debouncedQuery}&rdquo;</p>
          )}
          {results.medicines.length > 0 && (
            <div className={styles.group}>
              <p className={styles.groupHeader}>MEDICINES</p>
              {results.medicines.map((m) => (
                <button
                  key={m._id}
                  className={[styles.resultRow, m.stock === 0 ? styles.outOfStock : ""].join(" ")}
                  onClick={() => handleSelect(m)}
                  type="button"
                >
                  <div className={styles.resultLeft}>
                    <span className={styles.resultName}>{m.name}</span>
                    {m.genericName && <span className={styles.resultSub}>{m.genericName}</span>}
                    <div className={styles.resultMeta}>
                      <Badge variant={categoryVariant(m.category)} size="xs">{m.category}</Badge>
                      <span className={m.stock > 0 ? styles.inStock : styles.noStock}>
                        {m.stock > 0 ? `${m.stock} units available` : "Out of stock"}
                      </span>
                      {outOfStockId === m._id && (
                        <span className={styles.outOfStockMsg}>This item is out of stock</span>
                      )}
                    </div>
                  </div>
                  <span className={styles.resultPrice}>{fmtMAD(m.salePrice)}</span>
                </button>
              ))}
            </div>
          )}

          {results.parapharmacy.length > 0 && (
            <div className={styles.group}>
              <p className={styles.groupHeader}>PARAPHARMACY</p>
              {results.parapharmacy.map((p) => (
                <button
                  key={p._id}
                  className={[styles.resultRow, p.stock === 0 ? styles.outOfStock : ""].join(" ")}
                  onClick={() => handleSelect(p)}
                  type="button"
                >
                  <div className={styles.resultLeft}>
                    <span className={styles.resultName}>{p.name}</span>
                    {p.brand && <span className={styles.resultSub}>{p.brand}</span>}
                    <div className={styles.resultMeta}>
                      <Badge variant="neutral" size="xs">{p.category}</Badge>
                      <span className={p.stock > 0 ? styles.inStock : styles.noStock}>
                        {p.stock > 0 ? `${p.stock} units available` : "Out of stock"}
                      </span>
                      {outOfStockId === p._id && (
                        <span className={styles.outOfStockMsg}>This item is out of stock</span>
                      )}
                    </div>
                  </div>
                  <span className={styles.resultPrice}>{fmtMAD(p.salePrice)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
