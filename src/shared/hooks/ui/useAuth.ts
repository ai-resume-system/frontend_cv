import { useSyncExternalStore } from "react";
import {
  AUTH_USER_UPDATED_EVENT,
  getCachedToken,
  getCachedUser,
} from "@/shared/services/account.service";
import type { EUserRole } from "@/shared/constants/enums/user.enum";
import type { AuthUser } from "@/shared/types/auth";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  userRole: EUserRole | null;
}

const DEFAULT_AUTH_STATE: AuthState = {
  isLoggedIn: false,
  user: null,
  userRole: null,
};

let cachedAuthSnapshot: AuthState = DEFAULT_AUTH_STATE;
let cachedAuthSnapshotKey = "guest";

function readAuthFromStorage(): AuthState {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_STATE;
  }

  const token = getCachedToken();
  const user = getCachedUser();

  if (!token || !user?.role) {
    cachedAuthSnapshot = DEFAULT_AUTH_STATE;
    cachedAuthSnapshotKey = "guest";
    return cachedAuthSnapshot;
  }

  const snapshotKey = JSON.stringify({
    email: user.email,
    role: user.role,
    token,
    userId: user.id,
  });

  if (snapshotKey === cachedAuthSnapshotKey) {
    return cachedAuthSnapshot;
  }

  cachedAuthSnapshotKey = snapshotKey;
  cachedAuthSnapshot = {
    isLoggedIn: true,
    user,
    userRole: user.role as EUserRole,
  };

  return cachedAuthSnapshot;
}

function subscribeToAuthStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);
  };
}

export function useAuth() {
  const authState = useSyncExternalStore(
    subscribeToAuthStore,
    readAuthFromStorage,
    // lỗi liên quan render token
    () => DEFAULT_AUTH_STATE,
  );

  return {
    isLoggedIn: authState.isLoggedIn,
    userRole: authState.userRole,
    user: authState.user,
  };
}
