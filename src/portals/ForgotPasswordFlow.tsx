"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleQuestionMark,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import { AuthLayout } from "@/shared/components/layouts/AuthLayout";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EOtpType } from "@/shared/constants/enums/otp.enum";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import {
  forgotPassword,
  sendOtp,
  verifyOtp,
} from "@/shared/services/auth.service";

type IForgotPasswordStep = "email" | "otp" | "password" | "success";
type PasswordFieldName = "password" | "confirmPassword";

interface ForgotPasswordFlowProps {
  role: EUserRole;
}

function getLoginRoute(role: EUserRole): string {
  return role === EUserRole.RECRUITER
    ? ROUTES.RECRUITER_LOGIN
    : ROUTES.JOB_SEEKER_LOGIN;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const OTP_EXPIRES_IN_SECONDS = 300;
const FORGOT_PASSWORD_RESEND_SECONDS = 60;

function getStepLabel(step: IForgotPasswordStep): string {
  switch (step) {
    case "email":
      return "Bước 1/4";
    case "otp":
      return "Bước 2/4";
    case "password":
      return "Bước 3/4";
    case "success":
      return "Hoàn tất";
  }
}

function getStepProgress(step: IForgotPasswordStep): string {
  switch (step) {
    case "email":
      return "25%";
    case "otp":
      return "50%";
    case "password":
      return "75%";
    case "success":
      return "100%";
  }
}

function validateEmail(value: string): string {
  if (!value.trim()) {
    return "Vui lòng nhập địa chỉ email.";
  }

  if (!isEmail(value)) {
    return "Email không hợp lệ.";
  }

  return "";
}

function validatePasswordFields(
  nextPassword: string,
  nextConfirmPassword: string,
): Partial<Record<PasswordFieldName, string>> {
  const nextErrors: Partial<Record<PasswordFieldName, string>> = {};

  if (!nextPassword.trim()) {
    nextErrors.password = "Vui lòng nhập mật khẩu mới.";
  } else if (nextPassword.length < 8) {
    nextErrors.password = "Mật khẩu phải chứa ít nhất 8 ký tự.";
  }

  if (!nextConfirmPassword.trim()) {
    nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
  } else if (nextPassword !== nextConfirmPassword) {
    nextErrors.confirmPassword = "Xác nhận mật khẩu không trùng khớp.";
  }

  return nextErrors;
}

export function ForgotPasswordFlow({ role }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<IForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signKey, setSignKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<PasswordFieldName, string>>
  >({});
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState<
    Partial<Record<PasswordFieldName, boolean>>
  >({});
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [stepError, setStepError] = useState("");

  const isJobSeeker = role === EUserRole.JOB_SEEKER;
  const loginRoute = getLoginRoute(role);

  useEffect(() => {
    if (step !== "otp" || otpCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, otpCountdown]);

  useEffect(() => {
    if (step !== "otp" || otpExpiryCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpExpiryCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, otpExpiryCountdown]);

  async function requestOtp() {
    const response = await sendOtp({
      email,
      type: EOtpType.FORGOT_PASSWORD,
      role,
    });

    return response.message;
  }

  function handleEmailBlur() {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setStepError("");

    if (emailTouched || emailSubmitted) {
      setEmailError(validateEmail(value));
    }
  }

  function handlePasswordBlur(field: PasswordFieldName) {
    setPasswordTouched((current) => ({ ...current, [field]: true }));
    setPasswordErrors(validatePasswordFields(password, confirmPassword));
  }

  function handlePasswordChange(field: PasswordFieldName, value: string) {
    const nextPassword = field === "password" ? value : password;
    const nextConfirmPassword =
      field === "confirmPassword" ? value : confirmPassword;

    if (field === "password") {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }

    setStepError("");

    if (
      passwordTouched[field] ||
      passwordTouched.password ||
      passwordTouched.confirmPassword ||
      passwordSubmitted
    ) {
      setPasswordErrors(
        validatePasswordFields(nextPassword, nextConfirmPassword),
      );
    }
  }

  async function handleSendEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailSubmitted(true);

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    setIsSubmitting(true);
    setStepError("");

    try {
      await requestOtp();
      setOtpValue(Array(6).fill(""));
      setSignKey("");
      setStep("otp");
      setOtpCountdown(FORGOT_PASSWORD_RESEND_SECONDS);
      setOtpExpiryCountdown(OTP_EXPIRES_IN_SECONDS);
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : "Không thể gửi mã xác thực.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const otpString = otpValue.join("");

    if (otpString.length < 6) {
      setStepError("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }

    setIsSubmitting(true);
    setStepError("");

    try {
      const response = await verifyOtp({
        email,
        otp: otpString,
        type: EOtpType.FORGOT_PASSWORD,
        role,
      });

      const nextSignKey = response.data?.signKey;

      if (!nextSignKey) {
        throw new Error("Không nhận được khóa xác thực từ hệ thống.");
      }

      setSignKey(nextSignKey);
      setStep("password");
      setStepError("");
      setOtpCountdown(0);
      setOtpExpiryCountdown(0);
      setPasswordErrors({});
      setPasswordTouched({});
      setPasswordSubmitted(false);
    } catch (err) {
      setStepError(
        err instanceof Error
          ? err.message
          : "Mã xác thực không chính xác hoặc đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSubmitted(true);

    const nextErrors = validatePasswordFields(password, confirmPassword);
    setPasswordErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!signKey) {
      setStepError("Thiếu khóa xác thực. Vui lòng xác minh OTP lại.");
      return;
    }

    setIsSubmitting(true);
    setStepError("");

    try {
      await forgotPassword({
        email,
        signKey,
        newPassword: password,
        role,
      });
      setStep("success");
    } catch (err) {
      setStepError(
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (otpCountdown > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStepError("");

    try {
      await requestOtp();
      setOtpCountdown(FORGOT_PASSWORD_RESEND_SECONDS);
      setOtpExpiryCountdown(OTP_EXPIRES_IN_SECONDS);
      setOtpValue(Array(6).fill(""));
      setSignKey("");
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : "Không thể gửi lại mã OTP.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(-1);
    const nextOtp = [...otpValue];
    nextOtp[index] = cleanValue;

    setOtpValue(nextOtp);
    setStepError("");

    if (cleanValue && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      const nextOtp = [...otpValue];
      nextOtp[index - 1] = "";
      setOtpValue(nextOtp);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);

    const nextOtp = Array(6).fill("");

    for (let index = 0; index < pastedData.length; index += 1) {
      nextOtp[index] = pastedData[index];
    }

    setOtpValue(nextOtp);
    setStepError("");

    const targetIndex = pastedData.length < 6 ? pastedData.length : 5;
    document.getElementById(`otp-${targetIndex}`)?.focus();
  }

  function renderFormContent() {
    switch (step) {
      case "email":
        return (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                Quên mật khẩu?
              </h1>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant sm:text-base">
                Nhập email đăng ký của bạn bên dưới. Chúng tôi sẽ gửi mã xác
                thực để bạn đặt lại thông tin truy cập.
              </p>
            </div>

            <form className="space-y-3 sm:space-y-4" noValidate onSubmit={handleSendEmail}>
              <BaseField
                error={emailTouched || emailSubmitted ? emailError : undefined}
                id="email"
                label="Email công việc"
                leadingIcon={<Mail className="h-5 w-5" />}
                placeholder="user@gmail.com"
                type="email"
                value={email}
                onBlur={handleEmailBlur}
                onChange={(e) => handleEmailChange(e.target.value)}
              />

              {stepError ? (
                <p className="text-sm text-error">{stepError}</p>
              ) : null}

              <BaseButton fullWidth loading={isSubmitting} type="submit">
                Gửi mã xác thực
              </BaseButton>
            </form>
          </div>
        );

      case "otp":
        return (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                  Xác minh danh tính
                </h1>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant sm:text-base">
                  Mã xác thực 6 chữ số đã được gửi đến email của bạn.
                </p>
              </div>

              <button
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface"
                type="button"
                onClick={() => setStep("email")}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
            </div>

            <form className="space-y-3 sm:space-y-4" noValidate onSubmit={handleVerifyOtp}>
              <div className="grid w-full grid-cols-6 gap-3">
                {otpValue.map((char, index) => (
                  <input
                    key={`otp-${index}`}
                    className="aspect-square min-w-0 w-full rounded-xl border border-primary-hover/90 bg-surface-container-low p-0 text-center text-lg font-bold text-on-surface outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-primary/20 sm:rounded-2xl sm:text-xl"
                    id={`otp-${index}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              {stepError ? (
                <p className="text-sm text-error">{stepError}</p>
              ) : null}

              <BaseButton fullWidth loading={isSubmitting} type="submit">
                Xác minh truy cập
              </BaseButton>

              <div className="text-center text-sm text-on-surface-variant">
                <span>Bạn chưa nhận được mã?</span>
                <button
                  className="ml-1 cursor-pointer font-semibold text-primary disabled:text-outline"
                  disabled={otpExpiryCountdown > 0}
                  type="button"
                  onClick={handleResendOtp}
                >
                  {otpExpiryCountdown > 0
                    ? `OTP hết hạn sau ${formatCountdown(otpExpiryCountdown)}`
                    : "Gửi lại mã"}
                </button>
              </div>
            </form>
          </div>
        );

      case "password":
        return (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                Thiết lập mật khẩu mới
              </h1>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant sm:text-base">
                Vui lòng nhập mật khẩu mới của bạn bên dưới. Mật khẩu nên có ít
                nhất 8 ký tự.
              </p>
            </div>

            <form
              className="space-y-3 sm:space-y-4"
              noValidate
              onSubmit={handleResetPassword}
            >
              <BaseField
                error={
                  passwordTouched.password || passwordSubmitted
                    ? passwordErrors.password
                    : undefined
                }
                id="password"
                label="Mật khẩu mới"
                leadingIcon={<Lock className="h-5 w-5" />}
                placeholder="Nhập mật khẩu mới"
                trailingIcon={
                  <button
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                type={showPassword ? "text" : "password"}
                value={password}
                onBlur={() => handlePasswordBlur("password")}
                onChange={(e) =>
                  handlePasswordChange("password", e.target.value)
                }
              />

              <BaseField
                error={
                  passwordTouched.confirmPassword || passwordSubmitted
                    ? passwordErrors.confirmPassword
                    : undefined
                }
                id="confirmPassword"
                label="Xác nhận mật khẩu mới"
                leadingIcon={<Lock className="h-5 w-5" />}
                placeholder="Nhập lại mật khẩu mới"
                trailingIcon={
                  <button
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onBlur={() => handlePasswordBlur("confirmPassword")}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
              />

              {stepError ? (
                <p className="text-sm text-error">{stepError}</p>
              ) : null}

              <BaseButton fullWidth loading={isSubmitting} type="submit">
                Cập nhật mật khẩu
              </BaseButton>
            </form>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center animate-in scale-in duration-300">
            <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 animate-bounce text-emerald-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                Thành công!
              </h1>
              <p className="mt-1 max-w-sm text-sm text-on-surface-variant sm:text-base">
                Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập
                lại với mật khẩu mới.
              </p>
            </div>
            <Link className="w-full" href={loginRoute}>
              <BaseButton fullWidth>Quay lại đăng nhập</BaseButton>
            </Link>
          </div>
        );
    }
  }

  return (
    <AuthLayout
      role={role}
      showProgress={true}
      stepLabel={getStepLabel(step)}
      stepProgress={getStepProgress(step)}
    >
      {renderFormContent()}
    </AuthLayout>
  );
}
