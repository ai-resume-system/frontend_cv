import { useState, useEffect } from "react";
import {
  getCachedToken,
  getCachedUser,
} from "@/shared/services/account.service";
import type { EUserRole } from "@/shared/constants/enums/user.enum";

function readAuthFromStorage() {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, userRole: null, user: null };
  }
  const token = getCachedToken();
  const user = getCachedUser();
  return {
    isLoggedIn: Boolean(token && user),
    userRole: user?.role as EUserRole | null,
    user,
  };
}

export function useAuth() {
  const [authState, setAuthState] = useState(() => readAuthFromStorage());

  useEffect(() => {
    const handleStorage = () => {
      setAuthState(readAuthFromStorage());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    isLoggedIn: authState.isLoggedIn,
    userRole: authState.userRole,
    user: authState.user,
  };
}
