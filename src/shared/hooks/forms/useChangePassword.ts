"use client";

import { useState, type FormEvent } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import {
  changeMyPassword,
  clearCachedAuth,
} from "@/shared/services/account.service";
import type { FieldErrors } from "@/shared/types/api";

interface ChangePasswordFormValues {
  confirmNewPassword: string;
  currentPassword: string;
  newPassword: string;
}

type ChangePasswordFormErrors = FieldErrors;

const EMPTY_CHANGE_PASSWORD_FORM: ChangePasswordFormValues = {
  confirmNewPassword: "",
  currentPassword: "",
  newPassword: "",
};

type ChangePasswordField = keyof ChangePasswordFormValues;
type TouchedFields = Partial<Record<ChangePasswordField, boolean>>;

function validateChangePasswordForm(
  values: ChangePasswordFormValues,
): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
  }

  if (!values.newPassword) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "Mật khẩu mới cần tối thiểu 6 ký tự";
  }

  if (!values.confirmNewPassword) {
    errors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
  } else if (values.newPassword !== values.confirmNewPassword) {
    errors.confirmNewPassword = "Mật khẩu xác nhận không khớp";
  }

  if (
    values.currentPassword &&
    values.newPassword &&
    values.currentPassword === values.newPassword
  ) {
    errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
  }

  return errors;
}

function readFirstFieldError(
  error: unknown,
  fieldName: string,
): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  const fieldErrors = (error as Error & { fields?: Record<string, string[]> })
    .fields;

  return fieldErrors?.[fieldName]?.[0];
}

interface UseChangePasswordOptions {
  onClose: () => void;
}

export function useChangePassword({ onClose }: UseChangePasswordOptions) {
  const [form, setForm] = useState<ChangePasswordFormValues>(
    EMPTY_CHANGE_PASSWORD_FORM,
  );
  const [errors, setErrors] = useState<ChangePasswordFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  function getVisibleError(field: ChangePasswordField) {
    if (!touchedFields[field] && !hasSubmitted) {
      return undefined;
    }

    return errors[field];
  }

  function updateField<K extends ChangePasswordField>(
    field: K,
    value: ChangePasswordFormValues[K],
  ) {
    setForm((current) => {
      const nextForm = {
        ...current,
        [field]: value,
      };

      if (
        touchedFields[field] ||
        touchedFields.newPassword ||
        touchedFields.confirmNewPassword ||
        hasSubmitted
      ) {
        setErrors(validateChangePasswordForm(nextForm));
      }

      return nextForm;
    });
  }

  function handleFieldBlur(field: ChangePasswordField) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
    setErrors(validateChangePasswordForm(form));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const nextErrors = validateChangePasswordForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      clearCachedAuth();
      onClose();

      await showAppAlert({
        confirmButtonText: "Đăng nhập lại",
        text: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại để tiếp tục.",
        title: "Đổi mật khẩu thành công",
      });

      window.location.href = ROUTES.JOB_SEEKER_LOGIN;
    } catch (error) {
      const fieldErrors: ChangePasswordFormErrors = {
        currentPassword: readFirstFieldError(error, "currentPassword"),
        newPassword: readFirstFieldError(error, "newPassword"),
      };

      setErrors((current) => ({
        ...current,
        ...fieldErrors,
      }));

      const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

      if (!hasFieldErrors) {
        showErrorAlert(
          error instanceof Error ? error.message : "Không thể đổi mật khẩu.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setErrors({});
    setTouchedFields({});
    setHasSubmitted(false);
    setForm(EMPTY_CHANGE_PASSWORD_FORM);
    setShowConfirmNewPassword(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  }

  return {
    errors,
    form,
    getVisibleError,
    handleFieldBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
    setShowConfirmNewPassword,
    setShowCurrentPassword,
    setShowNewPassword,
    showConfirmNewPassword,
    showCurrentPassword,
    showNewPassword,
    updateField,
  };
}
