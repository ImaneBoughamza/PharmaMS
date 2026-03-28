import { useRouter } from "next/router";
import { toast } from "sonner";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReservationForm from "@/components/reservations/ReservationForm";
import styles from "@/styles/ReservationStaffNewPage.module.css";

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard(["pharmacist", "assistant"]);

export default function ReservationStaffNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data) {
    setIsLoading(true);
    try {
      // TODO: replace with real API call: await api.post("/api/reservations", data)
      toast.success("Reservation created successfully.");
      router.push("/reservations");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create reservation.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => router.push("/reservations")}>
          ← Back
        </button>
        <h1 className={styles.title}>New Reservation</h1>
      </div>
      <div className={styles.card}>
        <ReservationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

ReservationStaffNewPage.getLayout = AppLayout.getLayout;
