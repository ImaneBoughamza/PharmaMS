import styles from "@/components/ai/RecommendationPanel.module.css";

export default function RecommendationPanel({ suggestions }) {
  const items = suggestions ?? [];

  if (items.length === 0) return null;

  return (
    <div className={styles.panel}>
      <p className={styles.sectionLabel}>Parapharmacy Suggestions</p>
      <p className={styles.note}>
        Complementary in-stock products — not OTC medicines. Final decision remains with the pharmacist.
      </p>
      <div className={styles.list}>
        {items.map((s) => (
          <div key={s._id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemName}>{s.name}</span>
              {s.brand && <span className={styles.itemBrand}>{s.brand}</span>}
            </div>
            <p className={styles.rationale}>{s.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
