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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AuthFormState, string>>
  >({});
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

  function updateField<K extends keyof AuthFormState>(
    key: K,
    value: AuthFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateForm() {
    const errors: Partial<Record<keyof AuthFormState, string>> = {};

    if (!form.email.trim()) {
      errors.email = t.validation.required;
    } else if (!isEmail(form.email)) {
      errors.email = t.validation.email;
    }

    if (!form.password.trim()) {
      errors.password = t.validation.required;
    } else if (form.password.length < 6) {
      errors.password = t.validation.passwordLength;
    }

    if (isRegister) {
      if (!isRecruiter && !form.fullName.trim()) {
        errors.fullName = t.validation.required;
      }

      if (isRecruiter && !form.company_name.trim()) {
        errors.company_name = t.validation.required;
      }

      if (!form.confirmPassword.trim()) {
        errors.confirmPassword = t.validation.required;
      } else if (form.confirmPassword !== form.password) {
        errors.confirmPassword = t.validation.passwordMatch;
      }
    }

    return errors;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateForm();
    if (errors.email || errors.password) {
      setFieldErrors(errors);
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

      router.push(isRecruiter ? ROUTES.RECRUITER_DASHBOARD : ROUTES.HOME);
    } catch (error) {
      showErrorAlert(
        error instanceof Error ? error.message : "KhÃ´ng thá»ƒ Ä‘Äƒng nháº­p.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        confirmButtonText: "Đi tới đăng nhập",
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
          : "XÃ¡c thá»±c OTP tháº¥t báº¡i.";

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
          : "KhÃ´ng thá»ƒ gá»­i láº¡i OTP.",
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
    goToRegisterForm,
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
