import type { FieldErrors } from "@/shared/types/auth";

export interface ProfileFormValues {
  avatarUrl: string;
  bio: string;
  email: string;
  fullName: string;
  phone: string;
}

export interface ChangePasswordFormValues {
  confirmNewPassword: string;
  currentPassword: string;
  newPassword: string;
}

export type ProfileFormErrors = FieldErrors;
export type ChangePasswordFormErrors = FieldErrors;
