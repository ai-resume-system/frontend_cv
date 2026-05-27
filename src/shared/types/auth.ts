import type { EOtpType } from "@/shared/constants/enums/otp.enum";
import type {
  EUserRole,
  EUserStatus,
} from "@/shared/constants/enums/user.enum";

// ─────────────────────── Register ───────────────────────

export interface IBaseRegisterPayload {
  email: string;
  password: string;
}

export interface IRegisterJobSeekerPayload extends IBaseRegisterPayload {
  fullName?: string;
  phone?: string;
}

export interface IRegisterRecruiterPayload extends IBaseRegisterPayload {
  phone?: string;
  company_name?: string;
  location?: string;
}

// ─────────────────────── OTP ───────────────────────

export interface ISendOtpPayload {
  email: string;
  type: EOtpType;
  role?: EUserRole;
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
  type: EOtpType;
  role?: EUserRole;
}

export interface VerifyOtpForgotPasswordResponseData {
  signKey: string;
}

// ─────────────────────── Login ───────────────────────

export interface ILoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IResponseLogin {
  accessToken: string;
  expiresIn: number;
  expiresAt: string;
}

export type RefreshTokenResponseData = IResponseLogin;

// ─────────────────────── Forgot password ───────────────────────

export interface ForgotPasswordPayload {
  email: string;
  signKey: string;
  newPassword: string;
  role: EUserRole;
}

// ─────────────────────── Auth user (GET /account/me) ───────────────────────

export interface AuthUserProfile {
  fullName?: string;
  avatarUrl: string | null;
  bio?: string;
}

export interface AuthCompanyProfile {
  id?: string;
  careerCategoriesId?: string | null;
  companyName?: string | null;
  taxCode?: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  status: EUserStatus;
  role: EUserRole;
  profile: AuthUserProfile | null;
  company: AuthCompanyProfile | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─────────────────────── Account management ───────────────────────

export interface UpdateMyProfilePayload {
  fullName: string;
  phone: string;
  bio?: string;
}

export interface UpdateMyProfileResponse {
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string;
  phone?: string;
}

export interface UpdateMyCompanyPayload {
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
}

export interface UpdateMyCompanyResponse {
  id?: string;
  careerCategoriesId?: string | null;
  companyName?: string | null;
  taxCode?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  location?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─────────────────────── Error types ───────────────────────

export interface ApiErrorResponse {
  status?: string;
  message?: string;
  code?: number | string;
}

export interface ApiFieldErrorResponse extends ApiErrorResponse {
  error?: {
    fields?: Record<string, string[]>;
  };
}

export interface FieldErrors {
  [key: string]: string | undefined;
}
