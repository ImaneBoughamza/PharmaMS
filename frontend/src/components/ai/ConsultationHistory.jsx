import styles from "@/components/ai/ConsultationHistory.module.css";

// TODO: replace with useSWR("/api/ai/consultations") when backend is ready
const MOCK_HISTORY = [
  {
    _id: "c1",
    createdAt: "2026-04-18T10:30:00Z",
    extractedCount: 3,
    suggestionCount: 2,
    scannedBy: "Dr. Imane",
  },
  {
    _id: "c2",
    createdAt: "2026-04-17T14:15:00Z",
    extractedCount: 1,
    suggestionCount: 3,
    scannedBy: "Dr. Imane",
  },
  {
    _id: "c3",
    createdAt: "2026-04-15T09:00:00Z",
    extractedCount: 2,
    suggestionCount: 1,
    scannedBy: "Sara (Assistant)",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ConsultationHistory() {
  return (
    <div className={styles.panel}>
      <p className={styles.sectionLabel}>Recent Consultations</p>
      {MOCK_HISTORY.length === 0 ? (
        <p className={styles.empty}>No consultations yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Medicines</th>
              <th>Suggestions</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HISTORY.map((c) => (
              <tr key={c._id}>
                <td className={styles.date}>{formatDate(c.createdAt)}</td>
                <td className={styles.count}>{c.extractedCount}</td>
                <td className={styles.count}>{c.suggestionCount}</td>
                <td className={styles.by}>{c.scannedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
