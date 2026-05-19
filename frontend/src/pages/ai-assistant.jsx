import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  Check,
  ClipboardList,
  FileImage,
  FolderOpen,
  History,
  Printer,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import api from "@/lib/axios";
import { ASSISTANT, CASHIER, PHARMACIST } from "@/constants/roles";
import { formatCurrency } from "@/utils/formatCurrency";
import { getServerAuthUser } from "@/utils/serverAuth";
import styles from "@/styles/AIAssistantPage.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const today = new Date();
const dayMs = 86400000;

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function defaultHistoryRange() {
  return {
    from: new Date(today.getTime() - 29 * dayMs).toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

function csvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename, rows) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function roleLabel(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function dataUrlPayload(dataUrl) {
  const [header, data] = String(dataUrl).split(",");
  const mediaType = header?.match(/data:(.*);base64/)?.[1] || "image/jpeg";
  return { base64Image: data || dataUrl, mediaType };
}

function apiErrorMessage(err, fallback) {
  const message = err.response?.data?.message || fallback;
  const details = err.response?.data?.errors;
  if (Array.isArray(details) && details.length > 0) {
    return `${message}: ${details.map((item) => item.message).join(", ")}`;
  }
  return message;
}

function normalizeSuggestion(item) {
  return {
    _id: String(item.productId || item._id),
    productId: String(item.productId || item._id),
    name: item.name,
    brand: item.brand || "",
    category: item.category,
    stock: item.stockQty ?? item.stock ?? 0,
    price: item.salePrice ?? item.price ?? 0,
    salePrice: item.salePrice ?? item.price ?? 0,
    rationale: item.rationale,
    checked: item.checked ?? true,
  };
}

function normalizeConsultation(entry) {
  return {
    _id: entry._id,
    createdAt: entry.createdAt,
    staffId: entry.staffId?._id || entry.staffId,
    staffName: entry.staffId?.fullName || entry.staffName || "Staff",
    role: entry.staffId?.role || entry.role || "assistant",
    medicines: entry.extractedMedicines || entry.medicines || [],
    notes: entry.patientNotes || entry.notes || "",
    recommendations: (entry.suggestions || entry.recommendations || []).map(
      normalizeSuggestion,
    ),
    imageUrl: entry.savedImage ? entry.prescriptionImage : "",
  };
}

export default function AIAssistantPage({ user }) {
  const historyRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [saveImage, setSaveImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [manualMedicine, setManualMedicine] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyFrom, setHistoryFrom] = useState(defaultHistoryRange().from);
  const [historyTo, setHistoryTo] = useState(defaultHistoryRange().to);
  const [historyMedicine, setHistoryMedicine] = useState("all");
  const [historySort, setHistorySort] = useState("newest");
  const [historyLimit, setHistoryLimit] = useState(20);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const actor = {
    id: user?._id ?? user?.userId ?? user?.sub,
    name: user?.fullName ?? user?.name ?? user?.email ?? "Staff",
    role: user?.role ?? PHARMACIST,
  };

  const selectedRecommendations = recommendations.filter(
    (item) => item.checked,
  );
  const checkedMedicines = medicines.filter((item) => item.checked);

  const visibleHistory = useMemo(() => {
    const rows = historyItems.filter((entry) => {
      if (actor.role !== PHARMACIST && entry.staffId !== actor.id) return false;
      const day = dateKey(entry.createdAt);
      if (historyFrom && day < historyFrom) return false;
      if (historyTo && day > historyTo) return false;
      if (
        historyMedicine !== "all" &&
        !entry.medicines.some((medicine) => medicine.name === historyMedicine)
      )
        return false;
      return true;
    });
    rows.sort((a, b) => {
      if (historySort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return rows;
  }, [
    actor.id,
    actor.role,
    historyFrom,
    historyItems,
    historyMedicine,
    historySort,
    historyTo,
  ]);

  const medicineFilterOptions = useMemo(() => {
    return Array.from(
      new Set(
        historyItems.flatMap((entry) =>
          entry.medicines.map((medicine) => medicine.name),
        ),
      ),
    ).sort();
  }, [historyItems]);

  async function loadHistory() {
    setHistoryError("");
    try {
      const response = await api.get("/api/ai/consultations", {
        params: {
          from: historyFrom,
          to: historyTo,
          medicine: historyMedicine === "all" ? undefined : historyMedicine,
          limit: 100,
        },
      });
      setHistoryItems((response.data.data || []).map(normalizeConsultation));
    } catch (err) {
      setHistoryError(
        err.response?.data?.message || "Failed to load consultation history",
      );
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyFrom, historyMedicine, historyTo]);

  function handleFile(candidate) {
    if (!candidate) return;
    setUploadError("");
    if (!["image/jpeg", "image/png"].includes(candidate.type)) {
      setUploadError("Only JPEG and PNG files are accepted");
      setFile(null);
      setPreview("");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setUploadError("File too large - maximum size is 10MB");
      setFile(null);
      setPreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFile(candidate);
      setPreview(String(reader.result));
      setStep(1);
      setMedicines([]);
      setRecommendations([]);
    };
    reader.onerror = () =>
      setUploadError("Failed to upload image - please try again");
    reader.readAsDataURL(candidate);
  }

  function removeImage() {
    setFile(null);
    setPreview("");
    setUploadError("");
    setMedicines([]);
    setRecommendations([]);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function analysePrescription() {
    if (!file) {
      setUploadError("Please upload or capture a prescription image first");
      return;
    }
    setIsAnalysing(true);
    setAnalysisError("");
    try {
      const payload = dataUrlPayload(preview);
      const response = await api.post("/api/ai/scan", {
        ...payload,
        patientNotes,
        patientName: patientName || undefined,
        patientPhone: patientPhone || undefined,
        patientEmail: patientEmail || undefined,
      });
      setMedicines(
        (response.data.data.extractedMedicines || []).map(
          (medicine, index) => ({
            id: `ai-${index}-${medicine.name}`,
            name: medicine.name,
            checked: true,
            manual: false,
          }),
        ),
      );
      setStep(2);
    } catch (err) {
      setAnalysisError(apiErrorMessage(err, "Unable to analyse prescription"));
      setStep(2);
    } finally {
      setIsAnalysing(false);
    }
  }

  function addManualMedicine() {
    const name = manualMedicine.trim();
    if (!name) return;
    setMedicines((current) => [
      ...current,
      { id: `manual-${Date.now()}`, name, checked: true, manual: true },
    ]);
    setManualMedicine("");
  }

  function updateMedicine(id, patch) {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id ? { ...medicine, ...patch } : medicine,
      ),
    );
  }

  function removeMedicine(id) {
    setMedicines((current) => current.filter((medicine) => medicine.id !== id));
  }

  async function generateRecommendations() {
    if (checkedMedicines.length === 0) return;
    setIsGenerating(true);
    setRecommendationError("");
    try {
      const response = await api.post("/api/ai/recommendations", {
        medicines: checkedMedicines.map(({ name, manual }) => ({
          name,
          manual,
        })),
        patientNotes,
      });
      setRecommendations(
        (response.data.data.suggestions || []).map(normalizeSuggestion),
      );
      setStep(3);
    } catch (err) {
      setRecommendationError(
        apiErrorMessage(err, "Could not generate recommendations"),
      );
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  }

  function returnToScanWithImage() {
    setAnalysisError("");
    setStep(1);
  }

  function updateRecommendation(id, checked) {
    setRecommendations((current) =>
      current.map((item) => (item._id === id ? { ...item, checked } : item)),
    );
  }

  async function saveConsultation() {
    try {
      const response = await api.post("/api/ai/consultations", {
        patientName: patientName || undefined,
        patientPhone: patientPhone || undefined,
        patientEmail: patientEmail || undefined,
        patientNotes: patientNotes.trim(),
        extractedMedicines: checkedMedicines.map(({ name, manual }) => ({
          name,
          manual,
        })),
        suggestions: selectedRecommendations.map((item) => ({
          productId: item.productId,
          rationale: item.rationale,
        })),
        prescriptionImage: saveImage ? preview : undefined,
        saveImage,
      });
      setSelectedHistory(null);
      setHistoryItems((current) => [
        normalizeConsultation(response.data.data),
        ...current,
      ]);
      setStep(4);
      toast.success("Consultation saved to history");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save consultation"));
    }
  }

  function resetConsultation() {
    setStep(1);
    setFile(null);
    setPreview("");
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setPatientNotes("");
    setSaveImage(false);
    setUploadError("");
    setAnalysisError("");
    setRecommendationError("");
    setMedicines([]);
    setManualMedicine("");
    setRecommendations([]);
  }

  function printRecommendations() {
    document.body.classList.add("printing-ai-recommendations");
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("printing-ai-recommendations");
    }, 500);
  }

  async function exportHistory() {
    toast("Preparing consultation history export...");
    try {
      const response = await api.get("/api/ai/consultations", {
        params: {
          from: historyFrom,
          to: historyTo,
          medicine: historyMedicine === "all" ? undefined : historyMedicine,
          format: "csv",
        },
        responseType: "blob",
      });
      downloadBlob(
        `PharmaOS_AIConsultations_${historyFrom}_to_${historyTo}.csv`,
        response.data,
      );
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Export failed - please try again",
      );
    }
  }

  async function openHistoryDetail(entry) {
    try {
      const response = await api.get(`/api/ai/consultations/${entry._id}`);
      setSelectedHistory(normalizeConsultation(response.data.data));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load consultation details",
      );
      setSelectedHistory(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Decision Support</h1>
          <p className={styles.subtitle}>
            Prescription-based complementary product recommendations
          </p>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() =>
            historyRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <History size={15} />
          Consultation History
        </button>
      </div>

      <div className={styles.layout}>
        <section className={styles.consultationPanel}>
          <StepIndicator step={step} />
          {step === 1 && !isAnalysing && (
            <StepScan
              file={file}
              preview={preview}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              uploadError={uploadError}
              patientName={patientName}
              patientPhone={patientPhone}
              patientEmail={patientEmail}
              setPatientName={setPatientName}
              setPatientPhone={setPatientPhone}
              setPatientEmail={setPatientEmail}
              patientNotes={patientNotes}
              setPatientNotes={setPatientNotes}
              handleFile={handleFile}
              removeImage={removeImage}
              analysePrescription={analysePrescription}
              isAnalysing={isAnalysing}
            />
          )}
          {isAnalysing && <AnalysisLoading preview={preview} />}
          {step === 2 && !isAnalysing && (
            <StepAnalyse
              medicines={medicines}
              updateMedicine={updateMedicine}
              removeMedicine={removeMedicine}
              manualMedicine={manualMedicine}
              setManualMedicine={setManualMedicine}
              addManualMedicine={addManualMedicine}
              checkedCount={checkedMedicines.length}
              generateRecommendations={generateRecommendations}
              isGenerating={isGenerating}
              analysisError={analysisError}
              retryAnalysis={returnToScanWithImage}
              resetConsultation={resetConsultation}
            />
          )}
          {step === 3 && (
            <StepRecommend
              recommendations={recommendations}
              selectedRecommendations={selectedRecommendations}
              updateRecommendation={updateRecommendation}
              setStep={setStep}
              saveConsultation={saveConsultation}
              recommendationError={recommendationError}
              generateRecommendations={generateRecommendations}
              resetConsultation={resetConsultation}
            />
          )}
          {step === 4 && (
            <StepValidate
              medicines={checkedMedicines}
              recommendations={selectedRecommendations}
              patientNotes={patientNotes}
              actor={actor}
              saveImage={saveImage}
              setSaveImage={setSaveImage}
              printRecommendations={printRecommendations}
              resetConsultation={resetConsultation}
            />
          )}
        </section>

        <section className={styles.historyPanel} ref={historyRef}>
          <HistoryPanel
            history={visibleHistory}
            limit={historyLimit}
            setLimit={setHistoryLimit}
            from={historyFrom}
            to={historyTo}
            setFrom={setHistoryFrom}
            setTo={setHistoryTo}
            medicine={historyMedicine}
            setMedicine={setHistoryMedicine}
            sort={historySort}
            setSort={setHistorySort}
            medicineOptions={medicineFilterOptions}
            error={historyError}
            onRetry={loadHistory}
            onView={openHistoryDetail}
            onExport={exportHistory}
          />
        </section>
      </div>

      <HistoryDetailModal
        consultation={selectedHistory}
        onClose={() => setSelectedHistory(null)}
      />
    </div>
  );
}

AIAssistantPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = assistantOrPharmacistProps();

function StepIndicator({ step }) {
  const labels = ["Scan", "Analyse", "Recommend", "Validate"];
  return (
    <div className={styles.steps}>
      {labels.map((label, index) => {
        const number = index + 1;
        const state =
          number < step ? "done" : number === step ? "current" : "upcoming";
        return (
          <div className={styles.stepItem} key={label}>
            <span className={`${styles.stepCircle} ${styles[`step_${state}`]}`}>
              {state === "done" ? <Check size={13} /> : number}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StepScan(props) {
  const sizeText = props.file
    ? `${(props.file.size / 1024 / 1024).toFixed(2)} MB`
    : "";
  return (
    <div className={styles.stepBody}>
      {!props.preview ? (
        <div className={styles.uploadArea}>
          <FileImage size={42} />
          <h2>Scan or Upload Prescription</h2>
          <p>Take a photo or upload a JPEG or PNG image of the prescription</p>
          <div className={styles.uploadActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => props.cameraInputRef.current?.click()}
            >
              <Camera size={15} />
              Take Photo
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => props.fileInputRef.current?.click()}
            >
              <FolderOpen size={15} />
              Upload File
            </button>
          </div>
          <span>JPEG or PNG - max 10MB</span>
          <input
            ref={props.cameraInputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            hidden
            onChange={(e) => props.handleFile(e.target.files?.[0])}
          />
          <input
            ref={props.fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={(e) => props.handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className={styles.previewArea}>
          <div className={styles.imageFrame}>
            <img src={props.preview} alt="Prescription preview" />
          </div>
          <div className={styles.fileMeta}>
            <span>
              {props.file.name} - {sizeText}
            </span>
            <button type="button" onClick={props.removeImage}>
              Remove Image
            </button>
          </div>
        </div>
      )}
      {props.uploadError && (
        <p className={styles.errorText}>{props.uploadError}</p>
      )}
      <label className={styles.field}>
        <span>Patient Name (Optional)</span>
        <input
          type="text"
          value={props.patientName}
          onChange={(e) => props.setPatientName(e.target.value)}
          placeholder="Customer or patient name"
        />
      </label>
      <label className={styles.field}>
        <span>Patient Phone (Optional)</span>
        <input
          type="text"
          value={props.patientPhone}
          onChange={(e) => props.setPatientPhone(e.target.value)}
          placeholder="+212 6XX XXX XXX"
        />
      </label>
      <label className={styles.field}>
        <span>Patient Email (Optional)</span>
        <input
          type="email"
          value={props.patientEmail}
          onChange={(e) => props.setPatientEmail(e.target.value)}
          placeholder="patient@email.com"
        />
      </label>
      <label className={styles.field}>
        <span>Patient Notes (Optional)</span>
        <textarea
          rows={3}
          maxLength={500}
          value={props.patientNotes}
          onChange={(e) => props.setPatientNotes(e.target.value)}
          placeholder="Known allergies, patient age, specific concerns..."
        />
        <small>{props.patientNotes.length}/500</small>
      </label>
      <button
        type="button"
        className={styles.primaryWideBtn}
        disabled={!props.file || props.isAnalysing}
        onClick={props.analysePrescription}
      >
        {props.isAnalysing
          ? "Analysing prescription..."
          : "Analyse Prescription"}
      </button>
    </div>
  );
}

function AnalysisLoading({ preview }) {
  return (
    <div className={styles.loadingAnalysis}>
      <div className={styles.imageFrame}>
        <img src={preview} alt="Prescription being analysed" />
      </div>
      <h2>Analysing prescription...</h2>
      <p>Extracting prescribed medicines - this may take a few seconds</p>
    </div>
  );
}

function StepAnalyse(props) {
  return (
    <div className={styles.stepBody}>
      {props.analysisError ? (
        <div className={styles.errorBanner}>
          Analysis failed - {props.analysisError}
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={props.retryAnalysis}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div>
            <h2 className={styles.sectionTitle}>Extracted Medicines</h2>
            <p className={styles.sectionSubtext}>
              Review the medicines identified from the prescription. Correct any
              errors before generating recommendations.
            </p>
          </div>
          {props.medicines.length === 0 ? (
            <div className={styles.warningBanner}>
              No medicines could be identified from this image. The prescription
              may be unclear or in an unsupported format.
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={props.resetConsultation}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() =>
                    document.getElementById("manual-medicine")?.focus()
                  }
                >
                  Add Manually
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.medicineList}>
              {props.medicines.map((medicine) => (
                <div className={styles.medicineRow} key={medicine.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={medicine.checked}
                      onChange={(e) =>
                        props.updateMedicine(medicine.id, {
                          checked: e.target.checked,
                        })
                      }
                    />
                    <span>{medicine.name}</span>
                    {medicine.manual && <em>Manual</em>}
                  </label>
                  <button
                    type="button"
                    onClick={() => props.removeMedicine(medicine.id)}
                    aria-label="Remove medicine"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.manualAdd}>
            <input
              id="manual-medicine"
              value={props.manualMedicine}
              onChange={(e) => props.setManualMedicine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  props.addManualMedicine();
                }
              }}
              placeholder="Type a medicine name and press Enter"
            />
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={props.addManualMedicine}
            >
              Add
            </button>
          </div>
          <p className={styles.instruction}>
            Uncheck medicines that were incorrectly identified. You can also add
            medicines that were missed.
          </p>
          <button
            type="button"
            className={styles.primaryWideBtn}
            disabled={props.checkedCount === 0 || props.isGenerating}
            onClick={props.generateRecommendations}
          >
            {props.isGenerating
              ? "Generating recommendations..."
              : "Generate Recommendations"}
          </button>
        </>
      )}
    </div>
  );
}

function StepRecommend(props) {
  if (props.recommendations.length === 0 && !props.recommendationError) {
    return (
      <div className={styles.stepBody}>
        <DisclaimerBanner />
        <div className={styles.emptyRecommendations}>
          <h2>No complementary products found in current stock</h2>
          <p>
            This may be because no relevant parapharmacy products are currently
            in stock or above the minimum threshold
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={props.resetConsultation}
          >
            Start New Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepBody}>
      <DisclaimerBanner />
      {props.recommendationError && (
        <div className={styles.errorBanner}>
          Could not generate recommendations - {props.recommendationError}
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={props.generateRecommendations}
          >
            Try Again
          </button>
        </div>
      )}
      <div>
        <h2 className={styles.sectionTitle}>Complementary Recommendations</h2>
        <p className={styles.sectionSubtext}>
          {props.recommendations.length} in-stock parapharmacy products
          suggested
        </p>
      </div>
      <div className={styles.recommendationList}>
        {props.recommendations.map((item) => (
          <div className={styles.recommendationCard} key={item._id}>
            <button
              type="button"
              className={styles.removeRecommendation}
              onClick={() => props.updateRecommendation(item._id, false)}
              aria-label="Remove recommendation"
            >
              <X size={14} />
            </button>
            <label className={styles.recommendationCheck}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) =>
                  props.updateRecommendation(item._id, e.target.checked)
                }
              />
              <span>
                <strong>{item.name}</strong>
                <small>{item.brand}</small>
              </span>
            </label>
            <div className={styles.recommendationMeta}>
              <span className={styles.categoryBadge}>{item.category}</span>
              <span className={styles.stockText}>
                {item.stock} units in stock
              </span>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <div className={styles.rationale}>
              <span>Why</span>
              <p>{item.rationale}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.validatedPreview}>
        <h3>Products to Present to Customer</h3>
        <p>{props.selectedRecommendations.length} products selected</p>
        {props.selectedRecommendations.length === 0 ? (
          <span>No products selected - check at least one recommendation</span>
        ) : (
          props.selectedRecommendations.map((item) => (
            <div key={item._id} className={styles.previewRow}>
              <span>
                {item.name} - {item.category}
              </span>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
          ))
        )}
      </div>
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => props.setStep(2)}
        >
          Back to Medicines
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={props.selectedRecommendations.length === 0}
          onClick={props.saveConsultation}
        >
          Validate and Save
        </button>
      </div>
    </div>
  );
}

function StepValidate({
  medicines,
  recommendations,
  patientNotes,
  actor,
  saveImage,
  setSaveImage,
  printRecommendations,
  resetConsultation,
}) {
  return (
    <div className={styles.stepBody}>
      <h2 className={styles.sectionTitle}>Consultation Complete</h2>
      <div className={styles.summaryBox}>
        <SummaryLine label="Prescription analysed" value="Yes" />
        <SummaryLine
          label="Medicines identified"
          value={`${medicines.length} medicines`}
        />
        <SummaryLine
          label="Recommendations"
          value={`${recommendations.length} products selected`}
        />
        <SummaryLine label="Patient notes" value={patientNotes || "None"} />
        <SummaryLine label="Saved to history" value="Yes" />
      </div>
      <div className={styles.finalTable}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{formatCurrency(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.finalDisclaimer}>
        Present these suggestions to the customer as complementary options. You
        retain full clinical and legal responsibility for any recommendation.
      </p>
      <label className={styles.recommendationCheck}>
        <input
          type="checkbox"
          checked={saveImage}
          onChange={(event) => setSaveImage(event.target.checked)}
        />
        <span>
          <strong>Save prescription image with this consultation</strong>
          <small>
            Leave unchecked by default. Images are not retained unless
            explicitly saved.
          </small>
        </span>
      </label>
      <div className={styles.printArea}>
        <h1>PharmaMS</h1>
        <h2>Complementary Product Recommendations</h2>
        <p>
          {formatDateTime(new Date())} - {actor.name}
        </p>
        <h3>Prescribed medicines</h3>
        <ul>
          {medicines.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        <h3>Recommended products</h3>
        <table>
          <tbody>
            {recommendations.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{formatCurrency(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Complementary only. Does not replace pharmacist clinical judgment.
        </p>
      </div>
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={printRecommendations}
        >
          <Printer size={15} />
          Print Recommendations
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={resetConsultation}
        >
          Start New Consultation
        </button>
      </div>
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <div className={styles.disclaimer}>
      <TriangleAlert size={17} />
      <span>
        These suggestions are complementary to the prescribed treatment only.
        They do not replace pharmacist clinical judgment. Never recommend
        products that could interact with the prescribed medicines.
      </span>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className={styles.summaryLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HistoryPanel(props) {
  const visible = props.history.slice(0, props.limit);
  return (
    <div className={styles.historyInner}>
      <div className={styles.historyHeader}>
        <h2>Consultation History</h2>
        <label className={styles.compactField}>
          <span>Sort</span>
          <select
            value={props.sort}
            onChange={(e) => props.setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </div>
      <div className={styles.historyFilters}>
        <label className={styles.compactField}>
          <span>From</span>
          <input
            type="date"
            value={props.from}
            onChange={(e) => props.setFrom(e.target.value)}
          />
        </label>
        <label className={styles.compactField}>
          <span>To</span>
          <input
            type="date"
            value={props.to}
            onChange={(e) => props.setTo(e.target.value)}
          />
        </label>
        <label className={styles.compactField}>
          <span>Medicine</span>
          <select
            value={props.medicine}
            onChange={(e) => props.setMedicine(e.target.value)}
          >
            <option value="all">All</option>
            {props.medicineOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {props.error ? (
        <div className={styles.historyEmpty}>
          <ClipboardList size={32} />
          <p>{props.error}</p>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={props.onRetry}
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.historyEmpty}>
          <ClipboardList size={32} />
          <p>No consultations yet</p>
          <span>Completed consultations will appear here</span>
        </div>
      ) : (
        <div className={styles.historyList}>
          {visible.map((entry) => {
            const medText = entry.medicines
              .map((medicine) => medicine.name)
              .join(", ");
            return (
              <article className={styles.historyCard} key={entry._id}>
                <div>
                  <strong>{formatDateTime(entry.createdAt)}</strong>
                  <span>{entry.staffName}</span>
                </div>
                <p title={medText}>
                  {entry.medicines
                    .slice(0, 2)
                    .map((medicine) => medicine.name)
                    .join(", ")}
                  {entry.medicines.length > 2 ? "..." : ""}
                </p>
                <div className={styles.historyFooter}>
                  <span>
                    <i
                      className={
                        entry.recommendations.length > 0
                          ? styles.greenDot
                          : styles.grayDot
                      }
                    />
                    {entry.recommendations.length} products
                  </span>
                  <button type="button" onClick={() => props.onView(entry)}>
                    View
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {props.history.length > props.limit && (
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => props.setLimit(props.limit + 20)}
        >
          Load more
        </button>
      )}
      <button
        type="button"
        className={styles.primaryWideBtn}
        onClick={props.onExport}
      >
        Export Consultation History
      </button>
    </div>
  );
}

function HistoryDetailModal({ consultation, onClose }) {
  if (!consultation) return null;
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Consultation - ${formatDateTime(consultation.createdAt)}`}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => exportSingleConsultation(consultation)}
          >
            Export
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onClose}
          >
            Close
          </button>
        </>
      }
    >
      <div className={styles.historyModal}>
        <p className={styles.modalSubtitle}>
          {consultation.staffName} -{" "}
          <span className={styles.roleBadge}>
            {roleLabel(consultation.role)}
          </span>
        </p>
        <section>
          <h3>Prescription Image</h3>
          {consultation.imageUrl ? (
            <>
              <img
                src={consultation.imageUrl}
                alt="Prescription thumbnail"
                className={styles.historyThumb}
              />
              <a href={consultation.imageUrl} target="_blank" rel="noreferrer">
                View Full Image
              </a>
            </>
          ) : (
            <p>Prescription image not retained</p>
          )}
          <small>
            Prescription images are session-only unless explicitly saved
          </small>
        </section>
        <section>
          <h3>Prescribed Medicines</h3>
          {consultation.medicines.map((medicine) => (
            <p key={medicine.name}>
              {medicine.name}{" "}
              {medicine.manual && (
                <span className={styles.categoryBadge}>Manual</span>
              )}
            </p>
          ))}
        </section>
        <section>
          <h3>Patient Notes</h3>
          <p>{consultation.notes || "None"}</p>
        </section>
        <section>
          <h3>Recommendations Given</h3>
          <div className={styles.finalTable}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {consultation.recommendations.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3>Outcome</h3>
          <p>Date saved: {formatDateTime(consultation.createdAt)}</p>
          <p>Saved by: {consultation.staffName}</p>
        </section>
      </div>
    </Modal>
  );
}

function exportSingleConsultation(consultation) {
  toast("Preparing consultation history export...");
  downloadCsv(`PharmaMS_AIConsultation_${consultation._id}.csv`, [
    "Date,Staff,Prescribed Medicines,Recommendations Count,Recommended Products,Clinical Rationale",
    [
      formatDateTime(consultation.createdAt),
      consultation.staffName,
      consultation.medicines.map((medicine) => medicine.name).join(", "),
      consultation.recommendations.length,
      consultation.recommendations.map((item) => item.name).join(", "),
      consultation.recommendations.map((item) => item.rationale).join(" | "),
    ]
      .map(csvField)
      .join(","),
  ]);
  toast.success("Export downloaded");
}

function assistantOrPharmacistProps() {
  return async function getServerSideProps(context) {
    const user = await getServerAuthUser(context);
    if (!user) return { redirect: { destination: "/login", permanent: false } };
    if (user.mustChangePassword) {
      return { redirect: { destination: "/profile", permanent: false } };
    }
    if (![PHARMACIST, ASSISTANT].includes(user.role)) {
      return { redirect: { destination: "/dashboard", permanent: false } };
    }
    if (user.role === CASHIER) {
      return { redirect: { destination: "/dashboard", permanent: false } };
    }
    return { props: { user } };
  };
}
