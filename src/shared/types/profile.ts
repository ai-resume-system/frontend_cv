import type { FieldErrors } from "@/shared/types/auth";

// ─────────────────────── Job seeker profile form ───────────────────────

export interface ProfileFormValues {
  phone: string;
  fullName: string;
  email: string;
  bio: string;
}

export interface ChangePasswordFormValues {
  confirmNewPassword: string;
  currentPassword: string;
  newPassword: string;
}

export type ProfileFormErrors = FieldErrors;
export type ChangePasswordFormErrors = FieldErrors;

// ─────────────────────── Recruiter company form ───────────────────────

export interface CompanyFormValues {
  companyName: string;
  taxCode: string;
  location: string;
  description: string;
  websiteUrl: string;
  careerCategoriesId: string;
}

export type CompanyFormErrors = FieldErrors;
