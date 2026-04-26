import AppLayout from "@/components/layout/AppLayout";
import PrescriptionScanner from "@/components/ai/PrescriptionScanner";
import ConsultationHistory from "@/components/ai/ConsultationHistory";
import styles from "@/styles/AIAssistantPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard(["pharmacist", "assistant"]);

export default function AIAssistantPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prescription Scanner</h1>
        <p className={styles.subtitle}>
          Upload a prescription image to extract medicines and receive parapharmacy complement suggestions.
        </p>
      </div>

      <div className={styles.disclaimer}>
        <span>⚠</span>
        <span>
          AI suggestions are for decision support only. They surface in-stock parapharmacy complements —
          not OTC medicines. The final dispensing decision always remains with the pharmacist.
        </span>
      </div>

      <div className={styles.layout}>
        <PrescriptionScanner />
        <ConsultationHistory />
      </div>
    </div>
  );
}

AIAssistantPage.getLayout = AppLayout.getLayout;
