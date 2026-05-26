import type { FieldErrors } from "@/shared/types/auth";

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
