import type { EOtpType } from "@/shared/constants/enums/otp.enum";
import type { EUserRole } from "@/shared/constants/enums/user.enum";

export interface IBaseRegisterPayload {
  email: string;
  password: string;
}

export interface IRegisterJobSeekerPayload extends IBaseRegisterPayload {
  fullName: string;
}

export interface IRegisterRecruiterPayload extends IBaseRegisterPayload {
  phone?: string;
  name: string;
  address: string;
}

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
  signKey: string | null;
}

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

export interface ForgotPasswordPayload {
  email: string;
  signKey: string;
  newPassword: string;
  role: EUserRole;
}
