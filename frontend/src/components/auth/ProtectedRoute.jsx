import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!role) {
      router.replace("/login");
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [role, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!role) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) return null;

  return children;
}
