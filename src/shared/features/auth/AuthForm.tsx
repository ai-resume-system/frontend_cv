"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { messages } from "@/shared/i18n/config";
import {
  login,
  registerJobSeeker,
  registerRecruiter,
} from "@/shared/services/auth.service";

import { AccountChoicePage } from "./AccountChoicePage";

interface AuthFormProps {
  mode: "login" | "register";
  role: EUserRole.JOB_SEEKER | EUserRole.RECRUITER;
}

interface AuthFormState {
  fullName: string;
  companyName: string;
  industry: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialState: AuthFormState = {
  fullName: "",
  companyName: "",
  industry: "",
  address: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthForm({ mode, role }: AuthFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormState>(initialState);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = messages.auth;
  const isRegister = mode === "register";
  const isRecruiter = role === EUserRole.RECRUITER;
  const [shouldShowRoleChoice, setShouldShowRoleChoice] =
    useState(!isRecruiter);
  const title = isRegister
    ? isRecruiter
      ? t.register.recruiterTitle
      : t.register.jobSeekerTitle
    : isRecruiter
      ? t.login.recruiterTitle
      : t.login.jobSeekerTitle;
  const alternateHref = isRegister
    ? isRecruiter
      ? ROUTES.RECRUITER_LOGIN
      : ROUTES.JOB_SEEKER_LOGIN
    : isRecruiter
      ? ROUTES.RECRUITER_REGISTER
      : ROUTES.JOB_SEEKER_REGISTER;

  function updateField(name: keyof AuthFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate(): string {
    if (
      !form.email ||
      !form.password ||
      (isRegister && !form.confirmPassword)
    ) {
      return t.validation.required;
    }
    if (!isEmail(form.email)) {
      return t.validation.email;
    }
    if (form.password.length < 6) {
      return t.validation.passwordLength;
    }
    if (isRegister && form.password !== form.confirmPassword) {
      return t.validation.passwordMatch;
    }
    if (
      isRegister &&
      isRecruiter &&
      (!form.companyName || !form.industry || !form.address)
    ) {
      return t.validation.required;
    }
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        const payload = {
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        };
        const response = isRecruiter
          ? await registerRecruiter(payload)
          : await registerJobSeeker(payload);
        setSuccess(response.message || t.register.successFallback);
        return;
      }

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
      setSuccess(t.login.success);
      router.push(ROUTES.HOME);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t.validation.required,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isRegister ? t.register.subtitle : t.login.subtitle}
        </p>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <Input
              label={t.fields.fullName}
              name="fullName"
              onChange={(event) => updateField("fullName", event.target.value)}
              value={form.fullName}
            />
          ) : null}
          {isRegister && isRecruiter ? (
            <>
              <Input
                label={t.fields.companyName}
                name="companyName"
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                value={form.companyName}
              />
              <Input
                label={t.fields.industry}
                name="industry"
                onChange={(event) =>
                  updateField("industry", event.target.value)
                }
                value={form.industry}
              />
              <Input
                label={t.fields.address}
                name="address"
                onChange={(event) => updateField("address", event.target.value)}
                value={form.address}
              />
            </>
          ) : null}
          <Input
            label={
              isRecruiter && isRegister ? t.fields.companyEmail : t.fields.email
            }
            name="email"
            onChange={(event) => updateField("email", event.target.value)}
            type="email"
            value={form.email}
          />
          {isRegister ? (
            <Input
              label={t.fields.phone}
              name="phone"
              onChange={(event) => updateField("phone", event.target.value)}
              value={form.phone}
            />
          ) : null}
          <Input
            label={t.fields.password}
            name="password"
            onChange={(event) => updateField("password", event.target.value)}
            type="password"
            value={form.password}
          />
          {isRegister ? (
            <Input
              label={t.fields.confirmPassword}
              name="confirmPassword"
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
              type="password"
              value={form.confirmPassword}
            />
          ) : null}
          {error ? (
            <p className="rounded-lg bg-error-soft p-3 text-sm font-medium text-error">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg bg-ai-soft p-3 text-sm font-medium text-ai-strong">
              {success}
            </p>
          ) : null}
          <Button
            className="w-full"
            disabled={isSubmitting}
            type="submit"
            variant={isRecruiter ? "ai" : "primary"}
          >
            {isRegister ? t.register.submit : t.login.submit}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? t.register.switchToLogin : t.login.switchToRegister}{" "}
          <Link
            className="font-semibold text-primary hover:text-primary-hover"
            href={alternateHref}
          >
            {isRegister
              ? messages.common.nav.login
              : messages.common.nav.register}
          </Link>
        </p>
      </div>

      {shouldShowRoleChoice ? (
        <AccountChoicePage
          mode={mode}
          onSelectJobSeeker={() => setShouldShowRoleChoice(false)}
          variant="modal"
        />
      ) : null}
    </>
  );
}
