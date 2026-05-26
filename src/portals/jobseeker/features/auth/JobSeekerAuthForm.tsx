"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleQuestionMark,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { AccountChoicePage } from "@/shared/features/auth/AccountChoicePage";
import {
  type AuthMode,
  useAuthFormController,
} from "@/shared/features/auth/useAuthFormController";
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
  const controller = useAuthFormController({
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

  return (
    <>
      <div className="flex h-screen flex-col bg-white lg:flex-row overflow-y-auto custom-scroll">
        <div className="sticky top-0 hidden h-screen lg:flex lg:w-1/2">
          <JobSeekerShowcase />
        </div>

        <div className="flex w-full flex-1 lg:w-1/2">
          <div className="flex min-h-screen w-full flex-col px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 py-4 sm:py-5 lg:py-6 xl:py-8">
            <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:min-h-[72px]">
              <Link
                className="flex min-w-0 items-center gap-2 sm:gap-3"
                href={ROUTES.HOME}
              >
                <Image
                  alt="FUSE"
                  className="h-8 w-8 shrink-0 sm:h-[42px] sm:w-[42px]"
                  height={32}
                  src="/logo.png"
                  width={32}
                />
                <span className="truncate text-base font-extrabold uppercase tracking-tight text-primary sm:text-xl">
                  {INFOMATION_WEB.COMPANY_NAME}
                </span>
              </Link>

              <div className="flex gap-3">
                {isRegister ? (
                  <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:flex-nowrap sm:gap-4">
                    <p className="hidden lg:flex text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                      {registerStep === "otp" ? "Bước 2/2" : "Bước 1/2"}
                    </p>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-32">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{
                          width: registerStep === "otp" ? "100%" : "50%",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <Link
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                  href={`tel:${INFOMATION_WEB.PHONE}`}
                >
                  <span>Hỗ trợ</span>
                  <CircleQuestionMark className="h-4 w-4 translate-y-[1px]" />
                </Link>
              </div>
            </header>

            <main className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-lg xl:max-w-xl">
                {isRegister ? (
                  <>
                    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                      <div className="mb-6 sm:mb-8 lg:mb-10">
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

                        <p className="mt-2 max-w-xl text-sm text-on-surface-variant sm:mt-3 sm:text-base lg:text-lg">
                          {registerStep === "otp"
                            ? "Nhập mã OTP 6 chữ số đã được gửi đến email của bạn để hoàn tất đăng ký."
                            : "Bắt đầu hành trình của bạn với hệ sinh thái FUSE."}
                        </p>
                      </div>

                      {registerStep === "form" ? (
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                          <form
                            className="space-y-5"
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

                            <div className="grid gap-5 md:grid-cols-2">
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
                                      setShowConfirmPassword(
                                        (current) => !current,
                                      )
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
                                onBlur={() =>
                                  handleFieldBlur("confirmPassword")
                                }
                                onChange={(event) =>
                                  updateField(
                                    "confirmPassword",
                                    event.target.value,
                                  )
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
                          <form
                            className="space-y-5"
                            onSubmit={handleVerifyOtp}
                          >
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
                                  onKeyDown={(event) =>
                                    handleOtpKeyDown(index, event)
                                  }
                                  onPaste={handleOtpPaste}
                                />
                              ))}
                            </div>

                            {otpError ? (
                              <p className="text-sm text-error">{otpError}</p>
                            ) : null}

                            <BaseButton
                              fullWidth
                              loading={isSubmitting}
                              type="submit"
                            >
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
                    <p className=" mt-4 text-center text-sm text-on-surface-variant">
                      Bạn đã có tài khoản?{" "}
                      <Link
                        className="font-semibold text-primary"
                        href={alternateHref}
                      >
                        Đăng nhập
                      </Link>
                    </p>
                  </>
                ) : (
                  <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <h1 className="mt-3 text-2xl font-bold tracking-tight text-on-surface sm:mt-4 sm:text-3xl lg:text-4xl">
                        Chào mừng bạn quay trở lại
                      </h1>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant sm:mt-4 sm:text-base sm:leading-8 lg:text-lg">
                        Tiếp tục hành trình chinh phục sự nghiệp cùng FUSE
                      </p>
                    </div>

                    <form
                      className="space-y-6"
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
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
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

                      <BaseButton
                        fullWidth
                        loading={isSubmitting}
                        type="submit"
                      >
                        Đăng nhập
                      </BaseButton>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant">
                      Bạn chưa có tài khoản?{" "}
                      <Link
                        className="font-semibold text-primary"
                        href={alternateHref}
                      >
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </main>

            <footer className="text-center text-sm text-slate-400">
              <span className="uppercase">
                © {INFOMATION_WEB.COPYRIGHT_YEAR} {INFOMATION_WEB.COMPANY_NAME}
                .{" "}
              </span>
              Kiến tạo sự nghiệp bền vững.
            </footer>
          </div>
        </div>
      </div>

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
