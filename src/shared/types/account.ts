import type {
  EUserRole,
  EUserStatus,
} from "@/shared/constants/enums/user.enum";
import type { CareerCategory } from "@/shared/types/career-category";

export interface AuthUserProfile {
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface AuthCompanyProfile {
  id?: string;
  slug?: string | null;
  careerCategoryId?: string | null;
  careerCategory?: CareerCategory | null;
  name?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  taxCode?: string | null;
  websiteUrl?: string | null;
  employeeMin?: number | null;
  employeeMax?: number | null;
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
}

export interface UpdateMyProfilePayload {
  fullName: string;
  phone: string;
  bio?: string;
}

export interface UpdateMyProfileResponse {
  phone?: string;
  fullName?: string | null;
  bio?: string | null;
}

export interface UpdateMyCompanyPayload {
  careerCategoryId?: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  taxCode?: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  employeeMin?: number;
  employeeMax?: number;
}

export interface UpdateMyCompanyResponse {
  id?: string;
  phone?: string;
  careerCategoryId?: string | null;
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  taxCode?: string | null;
  websiteUrl?: string | null;
  employeeMin?: number | null;
  employeeMax?: number | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
