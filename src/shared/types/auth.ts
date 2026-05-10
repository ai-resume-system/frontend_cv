import type { EUserRole } from "@/shared/constants/enums/user.enum";

export interface AuthUser {
  id: string;
  email: string;
  role: EUserRole;
  status: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
  bio?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface ApiMeta {
  message: string;
  status: boolean;
}

export interface ApiResponse<TData> {
  data: TData;
  meta: ApiMeta;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message?: string;
  code?: number | string;
}

export interface UserProfileResponse extends AuthUser {
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}
