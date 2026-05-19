import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { clearToken } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("pharmaos_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = decodeJwt(token);
      setUser(payload);
      setRole(payload.role ?? null);
    } catch {
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return { user, role, isLoading, logout };
}
