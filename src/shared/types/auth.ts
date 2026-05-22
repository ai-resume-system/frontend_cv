import type { EOtpType } from "@/shared/constants/enums/otp.enum";
import type {
  EUserRole,
  EUserStatus,
} from "@/shared/constants/enums/user.enum";

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

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
  type: EOtpType;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IResponseLogin {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: EUserRole;
  };
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export type RefreshTokenResponseData = IResponseLogin;

export interface ForgotPasswordPayload {
  email: string;
  signKey: string;
  newPassword: string;
}

export interface ISendOtpPayload {
  email: string;
  type: EOtpType;
}

export interface VerifyOtpForgotPasswordResponseData {
  signKey: string;
}

export interface ApiErrorResponse {
  status?: string;
  message?: string;
  code?: number | string;
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

export interface AuthUserProfile {
  fullName: string;
  avatarUrl: string;
  bio: string;
}

export interface AuthCompanyProfile {
  careerCategoriesId: string;
  companyName: string;
  taxCode: string;
  logoUrl: string;
  bannerUrl: string;
  location: string;
  description: string;
  websiteUrl: string;
}

export interface UpdateMyProfilePayload {
  avatarUrl?: string;
  bio?: string;
  fullName: string;
  phone: string;
}

export interface UpdateMyProfileResponse {
  id: string;
  avatarUrl: string;
  bio: string;
  fullName: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiFieldErrorResponse extends ApiErrorResponse {
  error?: {
    fields?: Record<string, string[]>;
  };
}

export interface FieldErrors {
  [key: string]: string | undefined;
}

export interface AuthUserCacheSnapshot {
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
