"use client";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { AuthLayout } from "@/shared/components/layouts/AuthLayout";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AccountChoicePage } from "@/shared/features/auth/AccountChoicePage";
import { type AuthMode, useAuth } from "@/shared/hooks/forms/useAuthForm";

import { JobSeekerShowcase } from "./function";

interface JobSeekerAuthFormProps {
  mode: AuthMode;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function JobSeekerAuthForm({ mode }: JobSeekerAuthFormProps) {
  const isLogin = mode === "login";
  const controller = useAuth({
    mode,
    role: EUserRole.JOB_SEEKER,
  });

  const {
    alternateHref,
    form,
    getFieldError,
    handleFieldBlur,
    goToRegisterForm,
    handleLogin,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleRegister,
    handleResendOtp,
    handleVerifyOtp,
    isRegister,
    isSubmitting,
    otpExpiryCountdown,
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
    updateField,
  } = controller;

  const isRegisterStepOtp = isRegister && registerStep === "otp";

  return (
    <>
      <AuthLayout
        showcase={<JobSeekerShowcase />}
        showProgress={isRegister}
        stepLabel={
          isRegister ? (isRegisterStepOtp ? "Bước 2/2" : "Bước 1/2") : undefined
        }
        stepProgress={
          isRegister ? (isRegisterStepOtp ? "100%" : "50%") : undefined
        }
        showcasePosition="left"
      >
        {isRegister ? (
          <>
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="mb-4 sm:mb-5 lg:mb-6">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                    {registerStep === "otp"
                      ? "Xác thực tài khoản"
                      : "Chào mừng bạn đến với Fuse"}
                  </h1>

                  {registerStep === "otp" && (
                    <button
                      className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer"
                      type="button"
                      onClick={goToRegisterForm}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </button>
                  )}
                </div>

                <p className="mt-1 max-w-xl text-sm text-on-surface-variant sm:mt-2 sm:text-base lg:text-lg">
                  {registerStep === "otp"
                    ? "Nhập mã OTP 6 chữ số đã được gửi đến email của bạn để hoàn tất đăng ký."
                    : "Bắt đầu hành trình của bạn với hệ sinh thái FUSE."}
                </p>
              </div>

              {registerStep === "form" ? (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  <form
                    className="space-y-4"
                    noValidate
                    onSubmit={handleRegister}
                  >
                    <BaseField
                      error={getFieldError("fullName")}
                      id="fullName"
                      label="Họ và tên"
                      leadingIcon={<UserRound className="h-5 w-5" />}
                      placeholder="Nhập họ và tên của bạn"
                      value={form.fullName}
                      onBlur={() => handleFieldBlur("fullName")}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      required
                    />

                    <BaseField
                      error={getFieldError("email")}
                      id="email"
                      label="Địa chỉ Email"
                      leadingIcon={<Mail className="h-5 w-5" />}
                      placeholder="name@email.com"
                      type="email"
                      value={form.email}
                      onBlur={() => handleFieldBlur("email")}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      required
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <BaseField
                        error={getFieldError("password")}
                        id="password"
                        label="Mật khẩu"
                        leadingIcon={<Lock className="h-5 w-5" />}
                        placeholder="••••••••"
                        trailingIcon={
                          <button
                            className="cursor-pointer rounded-full p-1 text-outline"
                            type="button"
                            onClick={() =>
                              setShowPassword((current) => !current)
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onBlur={() => handleFieldBlur("password")}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        required
                      />

                      <BaseField
                        error={getFieldError("confirmPassword")}
                        id="confirmPassword"
                        label="Xác nhận mật khẩu"
                        leadingIcon={<Lock className="h-5 w-5" />}
                        placeholder="••••••••"
                        trailingIcon={
                          <button
                            className="cursor-pointer rounded-full p-1 text-outline"
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
                        value={form.confirmPassword}
                        onBlur={() => handleFieldBlur("confirmPassword")}
                        onChange={(event) =>
                          updateField("confirmPassword", event.target.value)
                        }
                        required
                      />
                    </div>

                    <BaseButton
                      endIcon={<ArrowRight className="h-5 w-5" />}
                      fullWidth
                      loading={isSubmitting}
                      type="submit"
                    >
                      Tạo tài khoản
                    </BaseButton>
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <form className="space-y-4" onSubmit={handleVerifyOtp}>
                    <div className="grid grid-cols-6 gap-3 w-full">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          className="w-full aspect-square rounded-xl sm:rounded-2xl bg-surface-container-low text-center text-lg font-bold border border-primary-hover/90 text-on-surface outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-primary/20 sm:text-xl p-0 min-w-0"
                          id={`otp-${index}`}
                          key={index}
                          inputMode="numeric"
                          maxLength={1}
                          value={otpValue[index] ?? ""}
                          onChange={(event) =>
                            handleOtpChange(index, event.target.value)
                          }
                          onKeyDown={(event) => handleOtpKeyDown(index, event)}
                          onPaste={handleOtpPaste}
                        />
                      ))}
                    </div>

                    {otpError ? (
                      <p className="text-sm text-error">{otpError}</p>
                    ) : null}

                    <BaseButton fullWidth loading={isSubmitting} type="submit">
                      Xác nhận
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
              )}
            </div>
            <p className="mt-3 text-center text-sm text-on-surface-variant">
              Bạn đã có tài khoản?{" "}
              <Link className="font-semibold text-primary" href={alternateHref}>
                Đăng nhập
              </Link>
            </p>
          </>
        ) : (
          <div className="space-y-3 sm:space-y-4 lg:space-y-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl lg:text-3xl">
                Chào mừng bạn quay trở lại
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Tiếp tục hành trình chinh phục sự nghiệp cùng FUSE
              </p>
            </div>

            <form
              className="space-y-3 sm:space-y-4"
              noValidate
              onSubmit={handleLogin}
            >
              <BaseField
                error={getFieldError("email")}
                id="loginEmail"
                label="Địa chỉ Email"
                leadingIcon={<Mail className="h-5 w-5" />}
                placeholder="name@email.com"
                type="email"
                value={form.email}
                onBlur={() => handleFieldBlur("email")}
                onChange={(event) => updateField("email", event.target.value)}
              />

              <BaseField
                error={getFieldError("password")}
                id="loginPassword"
                label="Mật khẩu"
                leadingIcon={<Lock className="h-5 w-5" />}
                placeholder="••••••••"
                trailingIcon={
                  <button
                    className="cursor-pointer rounded-full p-1 text-outline"
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
                value={form.password}
                onBlur={() => handleFieldBlur("password")}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
              />
              <div className="flex items-center justify-between">
                <BaseField
                  checked={form.rememberMe}
                  id="rememberMe"
                  label="Duy trì đăng nhập"
                  type="checkbox"
                  onChange={(event) =>
                    updateField("rememberMe", event.target.checked)
                  }
                />

                <BaseButton
                  variant="ghost"
                  className="text-sm font-semibold text-primary"
                  type="button"
                  href={ROUTES.JOB_SEEKER_FORGOT_PASSWORD}
                >
                  Quên mật khẩu?
                </BaseButton>
              </div>

              <BaseButton fullWidth loading={isSubmitting} type="submit">
                Đăng nhập
              </BaseButton>
            </form>

            <p className="text-center text-sm text-on-surface-variant">
              Bạn chưa có tài khoản?{" "}
              <Link className="font-semibold text-primary" href={alternateHref}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        )}
      </AuthLayout>

      {showRolePicker ? (
        <AccountChoicePage
          mode={mode}
          onSelectJobSeeker={selectJobSeeker}
          onSelectRecruiter={selectRecruiter}
          variant="modal"
        />
      ) : null}
    </>
  );
}
