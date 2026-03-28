import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "@/lib/axios";
import Spinner from "@/components/ui/Spinner";
import styles from "./MedicineSearch.module.css";

// TEMP mock — remove when backend is ready
const MOCK_MEDICINES = [
  { _id: "1", name: "Paracetamol 500mg", genericName: "Paracetamol", category: "OTC",          salePrice: 22.5,  totalStock: 8  },
  { _id: "2", name: "Amoxicillin 1g",    genericName: "Amoxicillin",  category: "Prescription", salePrice: 45.0,  totalStock: 42 },
  { _id: "3", name: "Ibuprofen 400mg",   genericName: "Ibuprofen",    category: "OTC",          salePrice: 18.0,  totalStock: 19 },
  { _id: "4", name: "Vitamin C 1000mg",  genericName: "Ascorbic Acid",category: "OTC",          salePrice: 35.0,  totalStock: 63 },
  { _id: "5", name: "Diazepam 5mg",      genericName: "Diazepam",     category: "Regulated",    salePrice: 12.0,  totalStock: 14 },
  { _id: "6", name: "Cough Syrup",       genericName: "Dextromethorphan", category: "OTC",      salePrice: 28.5,  totalStock: 11 },
];

export default function MedicineSearch({ onAdd }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    // TODO: replace with real API call when backend is ready
    // const controller = new AbortController();
    // setLoading(true);
    // api.get(`/api/medicines?search=${encodeURIComponent(query)}`, { signal: controller.signal })
    //   .then(r => setResults(r.data))
    //   .catch(() => {})
    //   .finally(() => setLoading(false));
    // return () => controller.abort();

    const filtered = MOCK_MEDICINES.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      (m.genericName ?? "").toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.icon} />
        <input
          className={styles.input}
          type="text"
          placeholder="Search medicines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {loading && <Spinner size="sm" />}
      </div>

      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((m) => (
            <li key={m._id} className={styles.result}>
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{m.name}</span>
                <span className={styles.resultMeta}>
                  {m.category} · {m.totalStock} in stock · {m.salePrice} MAD
                </span>
              </div>
              <button
                className={styles.addBtn}
                onClick={() => { onAdd(m); setQuery(""); setResults([]); }}
                disabled={m.totalStock === 0}
              >
                {m.totalStock === 0 ? "Out" : "+ Add"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
