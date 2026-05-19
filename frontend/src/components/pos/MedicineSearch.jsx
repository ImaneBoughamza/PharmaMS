import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import api from "@/lib/axios";
import styles from "./MedicineSearch.module.css";

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
  const [catalog,         setCatalog]         = useState({ medicines: [], parapharmacy: [] });
  const [outOfStockId,    setOutOfStockId]    = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const [medicineResponse, parapharmacyResponse] = await Promise.all([
          api.get("/api/medicines", { params: { status: "active", limit: 500 } }),
          api.get("/api/parapharmacy", { params: { status: "active", limit: 500 } }),
        ]);

        if (cancelled) return;

        setCatalog({
          medicines: (medicineResponse.data.data ?? []).map((m) => ({
            ...m,
            stock: m.totalStock ?? m.stock?.totalStock ?? 0,
            type: "medicine",
          })),
          parapharmacy: (parapharmacyResponse.data.data ?? []).map((p) => ({
            ...p,
            stock: p.stockQty ?? 0,
            type: "parapharmacy",
          })),
        });
      } catch (err) {
        if (!cancelled) setCatalog({ medicines: [], parapharmacy: [] });
      }
    }

    loadCatalog();
    return () => { cancelled = true; };
  }, []);

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
    const medicines = catalog.medicines.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.genericName ?? "").toLowerCase().includes(q)
    );
    const parapharmacy = catalog.parapharmacy.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
    );
    setResults({ medicines, parapharmacy });
  }, [debouncedQuery, catalog]);

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
