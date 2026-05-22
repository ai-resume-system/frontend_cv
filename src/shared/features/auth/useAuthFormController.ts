"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { AUTH_MESSAGES } from "@/shared/constants/constants/messages";
import {
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
} from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EOtpType } from "@/shared/constants/enums/otp.enum";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import {
  fetchCurrentUser,
  setCachedUser,
} from "@/shared/services/account.service";
import {
  login,
  registerJobSeeker,
  registerRecruiter,
  sendOtp,
  verifyOtp,
} from "@/shared/services/auth.service";

export type AuthMode = "login" | "register";
export type RegisterStep = "form" | "otp";

export interface AuthFormState {
  location: string;
  company_name: string;
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  rememberMe: boolean;
}

interface UseAuthFormControllerOptions {
  mode: AuthMode;
  role: EUserRole.JOB_SEEKER | EUserRole.RECRUITER;
}

type AuthFieldName = keyof AuthFormState;
type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;
type AuthTouchedFields = Partial<Record<AuthFieldName, boolean>>;

const initialFormState: AuthFormState = {
  location: "",
  company_name: "",
  confirmPassword: "",
  email: "",
  fullName: "",
  password: "",
  phone: "",
  rememberMe: false,
};

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 59;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function useAuthFormController({
  mode,
  role,
}: UseAuthFormControllerOptions) {
  const router = useRouter();
  const t = AUTH_MESSAGES;
  const isRegister = mode === "register";
  const isRecruiter = role === EUserRole.RECRUITER;

  const [form, setForm] = useState<AuthFormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [otpValue, setOtpValue] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<AuthTouchedFields>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);

  const stepValue = registerStep === "otp" ? 2 : 1;
  const loginTarget = isRecruiter
    ? ROUTES.RECRUITER_LOGIN
    : ROUTES.JOB_SEEKER_LOGIN;
  const registerTarget = isRecruiter
    ? ROUTES.RECRUITER_REGISTER
    : ROUTES.JOB_SEEKER_REGISTER;
  const alternateHref = isRegister ? loginTarget : registerTarget;

  useEffect(() => {
    if (otpCountdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOtpCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpCountdown]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const shouldPromptRole =
      role === EUserRole.JOB_SEEKER &&
      window.sessionStorage.getItem(SESSION_STORAGE_KEYS.AUTH_ROLE_PROMPT) ===
        "1" &&
      !window.sessionStorage.getItem(SESSION_STORAGE_KEYS.AUTH_SELECTED_ROLE);

    setShowRolePicker(shouldPromptRole);
  }, [role]);

  function validateField(
    field: AuthFieldName,
    nextForm: AuthFormState,
  ): string | undefined {
    const value = nextForm[field];

    switch (field) {
      case "email":
        if (!nextForm.email.trim()) {
          return t.validation.required;
        }

        if (!isEmail(nextForm.email)) {
          return t.validation.email;
        }

        return undefined;

      case "password":
        if (!nextForm.password.trim()) {
          return t.validation.required;
        }

        if (nextForm.password.length < 6) {
          return t.validation.passwordLength;
        }

        return undefined;

      case "fullName":
        if (isRegister && !isRecruiter && !nextForm.fullName.trim()) {
          return t.validation.required;
        }

        return undefined;

      case "company_name":
        if (isRegister && isRecruiter && !nextForm.company_name.trim()) {
          return t.validation.required;
        }

        return undefined;

      case "confirmPassword":
        if (!isRegister) {
          return undefined;
        }

        if (!nextForm.confirmPassword.trim()) {
          return t.validation.required;
        }

        if (nextForm.confirmPassword !== nextForm.password) {
          return t.validation.passwordMatch;
        }

        return undefined;

      case "location":
      case "phone":
      case "rememberMe":
        return undefined;

      default:
        return value ? undefined : undefined;
    }
  }

  function validateForm(nextForm: AuthFormState): AuthFieldErrors {
    const errors: AuthFieldErrors = {};

    const fields: AuthFieldName[] = isRegister
      ? [
          "email",
          "password",
          "confirmPassword",
          ...(isRecruiter
            ? (["company_name"] as const)
            : (["fullName"] as const)),
        ]
      : ["email", "password"];

    for (const field of fields) {
      const error = validateField(field, nextForm);

      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }

  function getFieldError(field: AuthFieldName) {
    if (!touchedFields[field] && !hasSubmitted) {
      return undefined;
    }

    return fieldErrors[field];
  }

  function handleFieldBlur(field: AuthFieldName) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, form),
    }));
  }

  function updateField<K extends AuthFieldName>(
    key: K,
    value: AuthFormState[K],
  ) {
    setForm((current) => {
      const nextForm = { ...current, [key]: value };

      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };

        if (touchedFields[key] || hasSubmitted) {
          nextErrors[key] = validateField(key, nextForm);
        } else {
          nextErrors[key] = undefined;
        }

        if (
          key === "password" &&
          (touchedFields.confirmPassword || hasSubmitted)
        ) {
          nextErrors.confirmPassword = validateField(
            "confirmPassword",
            nextForm,
          );
        }

        return nextErrors;
      });

      return nextForm;
    });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (errors.email || errors.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      });

      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACCESS_TOKEN,
        response.accessToken,
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN,
        response.refreshToken,
      );
      window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.USER,
        JSON.stringify(response.user),
      );
      try {
        const currentUser = await fetchCurrentUser();
        setCachedUser(currentUser);
      } catch {}

      const redirectPath =
        !isRecruiter && typeof window !== "undefined"
          ? window.sessionStorage.getItem(
              SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
            )
          : null;

      if (redirectPath && !isRecruiter) {
        window.sessionStorage.removeItem(
          SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
        );
        router.push(redirectPath);
        return;
      }

      router.push(isRecruiter ? ROUTES.RECRUITER_DASHBOARD : ROUTES.HOME);
    } catch (error) {
      showErrorAlert(
        error instanceof Error ? error.message : "Không thể đăng nhập.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isRecruiter
        ? {
            location: form.location || undefined,
            company_name: form.company_name || undefined,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
          }
        : {
            email: form.email,
            fullName: form.fullName || undefined,
            password: form.password,
            phone: form.phone || undefined,
          };

      if (isRecruiter) {
        await registerRecruiter(payload);
      } else {
        await registerJobSeeker(payload);
      }

      setRegisterStep("otp");
      setOtpCountdown(OTP_RESEND_SECONDS);
      setOtpValue("");
      setOtpError("");
      setTouchedFields({});
      setHasSubmitted(false);
      setFieldErrors({});
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      setOtpError(t.validation.otpLength);
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp({
        email: form.email,
        otp: otpValue,
        type: EOtpType.REGISTER,
      });

      await showAppAlert({
        confirmButtonText: "Đăng nhập",
        text: "Tài khoản của bạn đã được xác thực. Tiếp tục đăng nhập để bắt đầu sử dụng FUSE.",
        title: "Tạo tài khoản thành công",
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEYS.AUTH_SELECTED_ROLE,
          isRecruiter ? "recruiter" : "jobseeker",
        );
        window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_ROLE_PROMPT);
      }

      router.push(loginTarget);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "XA?A?c thA?A?A?c OTP thA?A?A?t bA?A?A?i.";

      setOtpError(message);
      await showErrorAlert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (otpCountdown > 0) {
      return;
    }

    try {
      await sendOtp({
        email: form.email,
        type: EOtpType.REGISTER,
      });
      setOtpCountdown(OTP_RESEND_SECONDS);
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "KhA?A'ng thA?A??' gA?A?A-i lA?A?A?i OTP.",
      );
    }
  }

  function handleOtpChange(index: number, value: string) {
    const normalized = value.replace(/\D/g, "").slice(-1);
    const currentDigits = Array.from(
      { length: OTP_LENGTH },
      (_, currentIndex) => otpValue[currentIndex] ?? "",
    );
    currentDigits[index] = normalized;
    const nextValue = currentDigits.join("");
    setOtpValue(nextValue);
    setOtpError("");

    if (normalized && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !otpValue[index] && index > 0) {
      const previousInput = document.getElementById(`otp-${index - 1}`);
      previousInput?.focus();
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    setOtpValue(pasted);
    setOtpError("");
  }

  function goToRegisterForm() {
    setRegisterStep("form");
    setOtpError("");
  }

  function selectJobSeeker() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.AUTH_SELECTED_ROLE,
        "jobseeker",
      );
      window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_ROLE_PROMPT);
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.AUTH_FLOW_MODE, mode);
    }

    setShowRolePicker(false);
  }

  function selectRecruiter() {
    const recruiterPath =
      mode === "login" ? ROUTES.RECRUITER_LOGIN : ROUTES.RECRUITER_REGISTER;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.AUTH_SELECTED_ROLE,
        "recruiter",
      );
      window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_ROLE_PROMPT);
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.AUTH_FLOW_MODE, mode);
    }

    router.push(recruiterPath);
  }

  return {
    alternateHref,
    fieldErrors,
    form,
    getFieldError,
    goToRegisterForm,
    handleFieldBlur,
    handleLogin,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleRegister,
    handleResendOtp,
    handleVerifyOtp,
    isRecruiter,
    isRegister,
    isSubmitting,
    loginTarget,
    mode,
    otpCountdown,
    otpError,
    otpValue,
    registerStep,
    selectJobSeeker,
    selectRecruiter,
    setShowConfirmPassword,
    setShowPassword,
    showConfirmPassword,
    showPassword,
    showRolePicker,
    stepValue,
    updateField,
  };
}
