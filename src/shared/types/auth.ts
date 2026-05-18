import type { EOtpType } from "@/shared/constants/enums/otp.enum";
import type { EUserRole } from "@/shared/constants/enums/user.enum";

export interface IBaseRegisterPayload {
  email: string;
  password: string;
}

export interface IRegisterJobSeekerPayload extends IBaseRegisterPayload {
  fullName?: string;
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

export interface ISendOtpPayload {
  email: string;
  type: EOtpType;
}

// Tam thời

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  profile: {
    fullName: string;
    avatarUrl: string;
    bio: string;
  };
  company: {
    careerCategoriesId: string;
    companyName: string;
    taxCode: string;
    logoUrl: string;
    bannerUrl: string;
    location: string;
    description: string;
    websiteUrl: string;
  };
}
