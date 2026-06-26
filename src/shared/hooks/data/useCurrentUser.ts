import { useState, useEffect, useCallback } from "react";
import {
  AUTH_USER_UPDATED_EVENT,
  fetchCurrentUser,
  getCachedUser,
  getCachedToken,
  logoutUser,
  setCachedUser,
} from "@/shared/services/account.service";
import type { AuthUser } from "@/shared/types/account";
import { JOBSEEKER_ROUTES, RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

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
    function syncUserFromCache() {
      setUser(getCachedUser());
    }

    syncUserFromCache();
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncUserFromCache);

    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncUserFromCache);
    };
  }, []);

  const logout = useCallback(async () => {
    const isRecruiterPath = typeof window !== "undefined" && window.location.pathname.startsWith("/recruiter");
    await logoutUser();
    setUser(null);
    if (isRecruiterPath) {
      window.location.href = RECRUITER_ROUTES.LOGIN;
    } else {
      window.location.href = JOBSEEKER_ROUTES.HOME;
    }
  }, []);

  return { user, loading, logout, refreshUser, setUser };
}
