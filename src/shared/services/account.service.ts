import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import type {
  AuthUser,
  ChangePasswordPayload,
  UpdateMyProfilePayload,
  UpdateMyProfileResponse,
} from "@/shared/types/auth";
import type { IResponseApiItem } from "@/shared/types/api";
import { LOCAL_STORAGE_KEYS } from "../constants/constants/local-storage";

export const AUTH_USER_UPDATED_EVENT = "auth-user-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function dispatchAuthUserUpdated(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(AUTH_USER_UPDATED_EVENT));
}

export function clearCachedAuth(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  dispatchAuthUserUpdated();
}

export function setCachedUser(user: AuthUser): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  dispatchAuthUserUpdated();
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiService.get<IResponseApiItem<AuthUser>>(
    API_ROUTES.ACCOUNT.ME,
    {
      auth: true,
      cache: "no-store",
    },
  );

  return response.data;
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
): Promise<UpdateMyProfileResponse> {
  const response = await apiService.patch<
    IResponseApiItem<UpdateMyProfileResponse>,
    UpdateMyProfilePayload
  >(API_ROUTES.ACCOUNT.ME_PROFILE, payload, {
    auth: true,
  });

  return response.data;
}

export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiService.patch<IResponseApiItem<null>, ChangePasswordPayload>(
    API_ROUTES.ACCOUNT.ME_CHANGE_PASSWORD,
    payload,
    {
      auth: true,
    },
  );
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
