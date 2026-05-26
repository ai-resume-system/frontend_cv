import { useSyncExternalStore } from "react";

import type { EUserRole } from "@/shared/constants/enums/user.enum";
import {
  AUTH_USER_UPDATED_EVENT,
  getCachedUser,
} from "@/shared/services/account.service";
import { getAccessToken } from "@/shared/services/auth-store";
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

function readAuthFromStore(): AuthState {
  if (typeof window === "undefined") {
    return DEFAULT_AUTH_STATE;
  }

  const token = getAccessToken();
  const user = getCachedUser();

  if (!token) {
    cachedAuthSnapshot = DEFAULT_AUTH_STATE;
    cachedAuthSnapshotKey = "guest";
    return cachedAuthSnapshot;
  }

  const snapshotKey = user
    ? `${token}:${user.id}:${user.role}:${user.updatedAt}`
    : `${token}:guest-user`;

  if (snapshotKey === cachedAuthSnapshotKey) {
    return cachedAuthSnapshot;
  }

  cachedAuthSnapshotKey = snapshotKey;
  cachedAuthSnapshot = {
    isLoggedIn: true,
    user,
    userRole: user?.role ?? null,
  };

  return cachedAuthSnapshot;
}

function subscribeToAuthStore(onStoreChange: () => void) {
  window.addEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange);
  };
}

export function useAuth() {
  const authState = useSyncExternalStore(
    subscribeToAuthStore,
    readAuthFromStore,
    () => DEFAULT_AUTH_STATE,
  );

  return {
    isLoggedIn: authState.isLoggedIn,
    userRole: authState.userRole,
    user: authState.user,
  };
}
