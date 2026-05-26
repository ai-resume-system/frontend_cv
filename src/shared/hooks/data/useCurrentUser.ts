import { useState, useEffect, useCallback } from "react";
import {
  AUTH_USER_UPDATED_EVENT,
  fetchCurrentUser,
  getCachedUser,
  getCachedToken,
  logoutUser,
  setCachedUser,
} from "@/shared/services/account.service";
import type { AuthUser } from "@/shared/types/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getCachedToken();

    if (!token) {
      setUser(null);
      return null;
    }

    setLoading(true);

    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
      setCachedUser(userData);
      return userData;
    } catch {
      const cached = getCachedUser();
      setUser(cached);
      return cached;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getCachedToken();
    const cachedUser = getCachedUser();

    let cancelled = false;

    function syncUserFromCache() {
      setUser(getCachedUser());
    }

    syncUserFromCache();
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncUserFromCache);

    if (!token || cachedUser) {
      return () => {
        cancelled = true;
        window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncUserFromCache);
      };
    }

    async function load() {
      setLoading(true);
      try {
        const userData = await fetchCurrentUser();
        if (!cancelled) {
          setUser(userData);
          setCachedUser(userData);
        }
      } catch {
        if (!cancelled) {
          const cached = getCachedUser();
          setUser(cached);
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
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncUserFromCache);
    };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, logout, refreshUser, setUser };
}
