import { API_ROUTES } from "@/shared/constants/constants/api";
import { apiService } from "@/shared/services/api-service";
import {
  AUTH_STORE_CHANGED_EVENT,
  clearAuthStore,
  getAccessToken,
  getCurrentUser,
  setCurrentUser,
} from "@/shared/services/auth-store";
import type {
  AuthUser,
  ChangePasswordPayload,
  UpdateMyProfilePayload,
  UpdateMyProfileResponse,
} from "@/shared/types/auth";
import type { IResponseApiItem } from "@/shared/types/api";
export const AUTH_USER_UPDATED_EVENT = AUTH_STORE_CHANGED_EVENT;

export function clearCachedAuth(): void {
  clearAuthStore();
}

export function setCachedUser(user: AuthUser): void {
  setCurrentUser(user);
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

export async function deleteMyAvatar(): Promise<void> {
  await apiService.delete<void>(API_ROUTES.ACCOUNT.ME_DELETE_AVATAR, {
    auth: true,
  });
}

export async function deleteMyCompanyLogo(): Promise<void> {
  await apiService.delete<void>(API_ROUTES.ACCOUNT.ME_DELETE_LOGO, {
    auth: true,
  });
}

export async function deleteMyCompanyBanner(): Promise<void> {
  await apiService.delete<void>(API_ROUTES.ACCOUNT.ME_DELETE_BANNER, {
    auth: true,
  });
}

export async function logoutUser(): Promise<void> {
  try {
    await apiService.post<void, Record<string, never>>(
      API_ROUTES.AUTH.LOGOUT,
      {},
      { auth: true },
    );
  } catch {
    // Ignore logout API errors because local auth state must still be cleared.
  }

  clearCachedAuth();
}

export function getCachedUser(): AuthUser | null {
  return getCurrentUser();
}

export function getCachedToken(): string | null {
  return getAccessToken();
}
