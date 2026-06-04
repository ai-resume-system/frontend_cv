"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import {
  deleteMyAvatar,
  setCachedUser,
  updateMyProfile,
} from "@/shared/services/account.service";
import type { AuthUser } from "@/shared/types/account";
import type { FieldErrors } from "@/shared/types/api";

interface ProfileFormValues {
  phone: string;
  fullName: string;
  email: string;
  bio: string;
}

type ProfileFormErrors = FieldErrors;

const EMPTY_PROFILE_FORM: ProfileFormValues = {
  bio: "",
  email: "",
  fullName: "",
  phone: "",
};

type ProfileField = keyof ProfileFormValues;
type TouchedFields = Partial<Record<ProfileField, boolean>>;

function buildProfileForm(user: AuthUser): ProfileFormValues {
  return {
    bio: user.profile?.bio ?? "",
    email: user.email,
    fullName: user.profile?.fullName ?? "",
    phone: user.phone,
  };
}

function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Vui lÃ²ng nháº­p há» vÃ  tÃªn.";
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

export function useProfileForm() {
  const { loading, refreshUser, setUser, user } = useCurrentUser();
  const [form, setForm] = useState<ProfileFormValues>(EMPTY_PROFILE_FORM);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm(buildProfileForm(user));
  }, [user]);

  function getVisibleError(field: ProfileField) {
    if (!touchedFields[field] && !hasSubmitted) {
      return undefined;
    }

    return errors[field];
  }

  function updateField<K extends ProfileField>(
    field: K,
    value: ProfileFormValues[K],
  ) {
    setForm((current) => {
      const nextForm = {
        ...current,
        [field]: value,
      };

      if (touchedFields[field] || hasSubmitted) {
        setErrors(validateProfileForm(nextForm));
      }

      return nextForm;
    });
  }

  function handleFieldBlur(field: ProfileField) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
    setErrors(validateProfileForm(form));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const nextErrors = validateProfileForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateMyProfile({
        bio: form.bio.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });

      const nextUser: AuthUser = {
        ...user,
        phone: response.phone || form.phone.trim(),
        profile: {
          avatarUrl: user.profile?.avatarUrl ?? null,
          bio: response.bio ?? form.bio.trim(),
          fullName: response.fullName ?? form.fullName.trim(),
        },
        updatedAt: new Date().toISOString(),
      };

      setUser(nextUser);
      setCachedUser(nextUser);
      setForm(buildProfileForm(nextUser));
      setTouchedFields({});
      setHasSubmitted(false);
      setErrors({});

      await showAppAlert({
        text: "ThÃ´ng tin cÃ¡ nhÃ¢n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t.",
        title: "LÆ°u thay Ä‘á»•i thÃ nh cÃ´ng",
      });
    } catch (error) {
      const fieldErrors: ProfileFormErrors = {
        fullName: readFirstFieldError(error, "fullName"),
        phone: readFirstFieldError(error, "phone"),
      };

      setErrors((current) => ({
        ...current,
        ...fieldErrors,
      }));

      const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

      if (!hasFieldErrors) {
        showErrorAlert(
          error instanceof Error
            ? error.message
            : "KhÃ´ng thá»ƒ cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    if (!user) return;
    setForm(buildProfileForm(user));
    setErrors({});
    setTouchedFields({});
    setHasSubmitted(false);
  }

  async function handleDeleteAvatar() {
    if (!user?.profile?.avatarUrl || isDeletingAvatar) {
      return;
    }

    setIsDeletingAvatar(true);

    try {
      await deleteMyAvatar();

      const nextUser: AuthUser = {
        ...user,
        profile: {
          avatarUrl: null,
          bio: user.profile?.bio ?? "",
          fullName: user.profile?.fullName ?? "",
        },
        updatedAt: new Date().toISOString(),
      };

      setUser(nextUser);
      setCachedUser(nextUser);
      await refreshUser();

      showSuccessToast("áº¢nh Ä‘áº¡i diá»‡n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c xÃ³a thÃ nh cÃ´ng.");
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "KhÃ´ng thá»ƒ xÃ³a áº£nh Ä‘áº¡i diá»‡n lÃºc nÃ y.",
      );
    } finally {
      setIsDeletingAvatar(false);
    }
  }

  return {
    errors,
    form,
    getVisibleError,
    handleDeleteAvatar,
    handleFieldBlur,
    handleSubmit,
    isDeletingAvatar,
    isLoading: loading,
    isSubmitting,
    refreshUser,
    resetForm,
    updateField,
    user,
  };
}
