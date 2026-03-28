import AppLayout from "@/components/layout/AppLayout";
import OTCAssistantPanel from "@/components/ai/OTCAssistantPanel";
import styles from "@/styles/AIAssistantPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard(["pharmacist", "assistant"]);

export default function AIAssistantPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Differentiator Feature · Decision Support</span>
        <h1 className={styles.heroTitle}>
          Generate advisory OTC suggestions based on symptoms and available stock.
        </h1>
        <p className={styles.heroDesc}>
          This feature supports the pharmacist or assistant by surfacing in-stock,
          non-prescription products only. The final dispensing decision always remains human.
        </p>
      </section>

      <OTCAssistantPanel />
    </div>
  );
}

AIAssistantPage.getLayout = AppLayout.getLayout;
