import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileImage, X } from "lucide-react";
import Button from "@/components/ui/Button";
import RecommendationPanel from "./RecommendationPanel";
import styles from "@/components/ai/PrescriptionScanner.module.css";

// TODO: replace with real API call to POST /api/ai/scan when backend is ready
async function mockScan() {
  await new Promise((r) => setTimeout(r, 1800));
  return {
    extractedMedicines: [
      { name: "Amoxicillin 500mg", dosage: "1 capsule × 3/day × 7 days" },
      { name: "Ibuprofen 400mg",   dosage: "1 tablet × 2/day if pain" },
    ],
    suggestions: [
      { _id: "p2", name: "Vitamin C 1000mg",    brand: "Sanofi",    rationale: "Supports immune recovery during antibiotic treatment." },
      { _id: "p5", name: "Probiotic 10 Billion",brand: "Bioderma",  rationale: "Restore gut flora after antibiotic course." },
      { _id: "p3", name: "Zinc Lozenges 10mg",  brand: "Nutrident", rationale: "Anti-inflammatory complement to ibuprofen therapy." },
    ],
  };
}

export default function PrescriptionScanner({ onScanComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files (JPEG/PNG) are accepted.");
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleScan() {
    if (!file) return;
    setIsScanning(true);
    try {
      // TODO: send base64 to POST /api/ai/scan
      // const base64 = preview.split(",")[1];
      // const data = await api.post("/api/ai/scan", { image: base64, mimeType: file.type });
      const data = await mockScan();
      setResult(data);
      onScanComplete?.(data);
      toast.success("Prescription scanned successfully.");
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.sectionLabel}>Prescription Scanner</p>

      {/* Drop zone */}
      {!preview ? (
        <div
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={28} className={styles.dropIcon} />
          <p className={styles.dropText}>Drop prescription image here</p>
          <p className={styles.dropSub}>JPEG or PNG — max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className={styles.previewWrap}>
          <img src={preview} alt="Prescription" className={styles.preview} />
          <button className={styles.clearBtn} onClick={clearFile} aria-label="Remove">
            <X size={14} />
          </button>
        </div>
      )}

      {file && !result && (
        <div className={styles.fileInfo}>
          <FileImage size={14} />
          <span>{file.name}</span>
        </div>
      )}

      {file && !result && (
        <Button
          variant="primary"
          onClick={handleScan}
          isLoading={isScanning}
          disabled={isScanning}
        >
          {isScanning ? "Analysing…" : "Scan Prescription"}
        </Button>
      )}

      {/* Extracted medicines */}
      {result && (
        <>
          <div className={styles.divider} />
          <p className={styles.sectionLabel}>Extracted Medicines</p>
          <table className={styles.extractedTable}>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
              </tr>
            </thead>
            <tbody>
              {result.extractedMedicines.map((m, i) => (
                <tr key={i}>
                  <td className={styles.medicineName}>{m.name}</td>
                  <td className={styles.dosage}>{m.dosage}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.divider} />
          <RecommendationPanel suggestions={result.suggestions} />

          <button className={styles.resetBtn} onClick={clearFile}>
            Scan another prescription
          </button>
        </>
      )}
    </div>
  );
}
