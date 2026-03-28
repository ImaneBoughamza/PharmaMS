import { useState } from "react";
import { useRouter } from "next/router";
import Badge from "@/components/ui/Badge";
import styles from "./MedicineTable.module.css";

function statusVariant(status) {
  if (status === "Critical") return "error";
  if (status === "Low")      return "warning";
  return "success";
}

export default function MedicineTable({ medicines = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.genericName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search by name, category, generic name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Medicine</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Batches</th>
              <th className={styles.th}>Total Stock</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>No medicines found.</td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m._id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.name}>{m.name}</span>
                    {m.genericName && (
                      <span className={styles.generic}>{m.genericName}</span>
                    )}
                  </td>
                  <td className={styles.td}>{m.category}</td>
                  <td className={styles.td}>{m.batchCount ?? 0}</td>
                  <td className={styles.td}>{m.totalStock ?? 0} {m.unit}</td>
                  <td className={styles.td}>
                    <Badge variant={statusVariant(m.status)}>{m.status ?? "OK"}</Badge>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => router.push(`/inventory/${m._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
