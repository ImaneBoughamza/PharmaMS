import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./OTCAssistantPanel.module.css";

const SYMPTOM_OPTIONS = [
  "Headache", "Fever", "Cough", "Sore Throat", "Runny Nose",
  "Nasal Congestion", "Body Pain", "Fatigue", "Upset Stomach",
  "Heartburn", "Diarrhea", "Minor Allergy",
];

const PRODUCT_CATALOG = [
  { name: "Paracetamol 500mg",  category: "Pain / Fever",    stock: 8,  tags: ["Headache", "Fever", "Body Pain"],           note: "Common OTC option for mild pain and fever relief." },
  { name: "Ibuprofen 400mg",   category: "Pain / Inflammation", stock: 19, tags: ["Headache", "Body Pain", "Fever"],        note: "May help with pain and inflammation when appropriate." },
  { name: "Cough Syrup",       category: "Respiratory",      stock: 11, tags: ["Cough", "Sore Throat"],                    note: "Supportive relief for mild cough symptoms." },
  { name: "Vitamin C 1000mg",  category: "Supplements",      stock: 63, tags: ["Fatigue", "Minor Allergy", "Runny Nose"],  note: "Frequently requested supplement for mild immune support." },
  { name: "Antacid Tablets",   category: "Digestive",        stock: 24, tags: ["Heartburn", "Upset Stomach"],              note: "OTC option for temporary acid discomfort relief." },
  { name: "ORS Sachets",       category: "Digestive",        stock: 17, tags: ["Diarrhea", "Fatigue"],                     note: "Useful for hydration support in mild digestive cases." },
];

// Simulated streaming response for text mode (used until backend is ready)
const STREAM_MOCK = () =>
  `Advisory OTC suggestions based on your input:\n\n` +
  `Based on the described symptoms, the following over-the-counter products may offer supportive relief:\n\n` +
  `• Paracetamol 500mg — suitable for general pain and fever management in adults.\n` +
  `• Vitamin C 1000mg — supportive supplement for immune health.\n` +
  `• Cough Syrup — if respiratory symptoms are present.\n\n` +
  `⚠ These are advisory suggestions only. Final dispensing decisions must be made by a qualified pharmacist. Prescription and regulated items are excluded from this tool.`;

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.disclaimerIcon}>
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function OTCAssistantPanel({ onSuggest }) {
  const [mode, setMode] = useState("symptoms"); // "symptoms" | "text"
  const [patientCategory, setPatientCategory] = useState("Adult");
  const [productCategory, setProductCategory] = useState("All");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [freeText, setFreeText] = useState("");
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef(null);

  function toggleSymptom(symptom) {
    setGenerated(false);
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  const suggestions = useMemo(() => {
    if (mode !== "symptoms" || !generated) return [];
    let items = PRODUCT_CATALOG.filter((p) => p.stock > 0);
    if (productCategory !== "All") items = items.filter((p) => p.category === productCategory);
    if (selectedSymptoms.length > 0) {
      items = items
        .map((p) => ({ ...p, score: p.tags.filter((t) => selectedSymptoms.includes(t)).length }))
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score);
    }
    return items;
  }, [mode, generated, selectedSymptoms, productCategory]);

  // Simulate streaming for text mode
  function simulateStream(fullText) {
    setStreamedText("");
    setIsStreaming(true);
    let i = 0;
    streamRef.current = setInterval(() => {
      i += 3;
      setStreamedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(streamRef.current);
        setIsStreaming(false);
      }
    }, 18);
  }

  useEffect(() => {
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, []);

  async function handleGenerate() {
    if (mode === "symptoms") {
      setGenerated(true);
      return;
    }
    // Text mode — call API or simulate
    if (!freeText.trim()) return;
    setIsLoading(true);
    setStreamedText("");
    try {
      // TODO: replace with real streaming API call: await api.post("/api/ai/suggest", { text: freeText, patientCategory })
      await new Promise((r) => setTimeout(r, 600)); // simulate network
      simulateStream(STREAM_MOCK());
      if (onSuggest) onSuggest({ text: freeText, patientCategory });
    } finally {
      setIsLoading(false);
    }
  }

  const canGenerate = mode === "symptoms"
    ? selectedSymptoms.length > 0
    : freeText.trim().length > 0;

  return (
    <>
      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <AlertIcon />
        <div className={styles.disclaimerText}>
          <strong>For informational use only.</strong>
          This tool proposes advisory OTC suggestions based on symptoms and available stock.
          It does not replace pharmacist judgment and must not be used for prescription or regulated medicines.
        </div>
      </div>

      {/* Input + Output panels */}
      <div className={styles.layout}>
        {/* Input panel */}
        <div className={styles.panel}>
          <div>
            <p className={styles.panelKicker}>Input Controls</p>
            <h3 className={styles.panelTitle}>Symptom-based request</h3>
          </div>

          {/* Mode tabs */}
          <div className={styles.modeTabs}>
            <button
              className={mode === "symptoms" ? styles.modeTabActive : styles.modeTab}
              onClick={() => { setMode("symptoms"); setGenerated(false); }}
            >
              Symptom Selector
            </button>
            <button
              className={mode === "text" ? styles.modeTabActive : styles.modeTab}
              onClick={() => { setMode("text"); setGenerated(false); setStreamedText(""); }}
            >
              Free Text (AI)
            </button>
          </div>

          {/* Category selectors */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Patient Category</label>
              <select
                className={styles.select}
                value={patientCategory}
                onChange={(e) => setPatientCategory(e.target.value)}
              >
                <option>Adult</option>
                <option>Child</option>
                <option>Elderly</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Product Category</label>
              <select
                className={styles.select}
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                disabled={mode === "text"}
              >
                <option>All</option>
                <option>Pain / Fever</option>
                <option>Respiratory</option>
                <option>Digestive</option>
                <option>Supplements</option>
              </select>
            </div>
          </div>

          {/* Symptom chips or free text */}
          {mode === "symptoms" ? (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Select Symptoms</label>
              <div className={styles.symptomGrid}>
                {SYMPTOM_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={selectedSymptoms.includes(s) ? styles.symptomChipActive : styles.symptomChip}
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Describe Symptoms or Prescription</label>
              <textarea
                className={styles.textarea}
                rows={6}
                placeholder="e.g. Patient presents with mild headache, low-grade fever, and fatigue since yesterday evening. No known allergies."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
              />
            </div>
          )}

          <div className={styles.submitRow}>
            <Button
              variant="primary"
              isLoading={isLoading}
              disabled={!canGenerate || isLoading}
              onClick={handleGenerate}
            >
              <SparklesIcon /> Generate Suggestions
            </Button>
          </div>
        </div>

        {/* Output panel */}
        <div className={styles.panel}>
          <div>
            <p className={styles.panelKicker}>AI Output</p>
            <h3 className={styles.panelTitle}>Suggested OTC options</h3>
          </div>

          {/* Symptom mode output */}
          {mode === "symptoms" && (
            <>
              {!generated || selectedSymptoms.length === 0 ? (
                <div className={styles.outputEmpty}>
                  Select symptoms and click "Generate Suggestions" to display matching OTC products.
                </div>
              ) : suggestions.length === 0 ? (
                <div className={styles.outputEmpty}>
                  No match found for current filters. Try fewer symptoms or another category.
                </div>
              ) : (
                <div className={styles.suggestionList}>
                  {suggestions.map((item) => (
                    <div className={styles.suggestionCard} key={item.name}>
                      <div className={styles.suggestionTop}>
                        <div>
                          <p className={styles.suggestionName}>{item.name}</p>
                          <p className={styles.suggestionCategory}>{item.category}</p>
                        </div>
                        <span className={styles.stockBadge}>{item.stock} in stock</span>
                      </div>
                      <div className={styles.tagRow}>
                        {item.tags.map((tag) => (
                          <span key={tag} className={selectedSymptoms.includes(tag) ? styles.tagMatch : styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className={styles.noteText}><strong>Advisory:</strong> {item.note}</p>
                      <div className={styles.reviewBadge}>
                        <CheckIcon />
                        Must be reviewed by staff before recommendation.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Text mode output */}
          {mode === "text" && (
            <>
              {!streamedText && !isStreaming && !isLoading ? (
                <div className={styles.outputEmpty}>
                  Enter a description and click "Generate Suggestions" to receive AI-powered OTC advisory.
                </div>
              ) : (
                <div className={styles.streamBox}>
                  {streamedText}
                  {isStreaming && <span className={styles.cursor} />}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compliance notes */}
      <div className={styles.rulesGrid}>
        <div className={styles.ruleCard}>
          <h4>Non-prescription only</h4>
          <p>The module excludes prescription and regulated medicines from all suggestions.</p>
        </div>
        <div className={styles.ruleCard}>
          <h4>Stock-aware</h4>
          <p>Only currently in-stock products are surfaced to the interface.</p>
        </div>
        <div className={styles.ruleCard}>
          <h4>Human final authority</h4>
          <p>The pharmacist remains legally and operationally responsible for the final decision.</p>
        </div>
      </div>
    </>
  );
}
