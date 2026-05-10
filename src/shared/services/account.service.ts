import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type { AuthUser } from "@/shared/types/auth";
import { LOCAL_STORAGE_KEYS } from "../constants/constants/local-storage";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function clearCachedAuth(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiService.get<AuthUser>(API_ROUTES.ACCOUNT.ME, {
    auth: true,
    cache: "no-store",
  });
}

export async function logoutUser(): Promise<void> {
  const token = getCachedToken();

  if (token) {
    try {
      await apiService.post<void, Record<string, never>>(
        API_ROUTES.AUTH.LOGOUT,
        {},
        { auth: true },
      );
    } catch {
      // Ignore logout API errors because local auth state must still be cleared.
    }
  }

  clearCachedAuth();
}

export function getCachedUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const userStr = window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function getCachedToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
}
