import { useState, useEffect, useCallback } from "react";
import {
  fetchCurrentUser,
  logoutUser,
  getCachedUser,
  getCachedToken,
} from "@/shared/services/account.service";
import type { AuthUser } from "@/shared/types/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getCachedToken();
    if (!token) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const userData = await fetchCurrentUser();
        if (!cancelled) {
          setUser(userData);
          window.localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch {
        if (!cancelled) {
          const cached = getCachedUser();
          if (cached) {
            setUser(cached);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, logout };
}
