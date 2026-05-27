"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BellRing } from "lucide-react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { BaseButton } from "@/shared/components/ui/BaseButton";

type AccountMode = "login" | "register";
type AccountRole = "job_seeker" | "recruiter";

interface AccountChoicePageProps {
  mode?: AccountMode;
  onSelectJobSeeker?: () => void;
  onSelectRecruiter?: () => void;
  variant?: "modal" | "page";
}

interface RoleOption {
  buttonLabel: string;
  image: string;
  imageAlt: string;
  role: AccountRole;
}

function getTargetHref(mode: AccountMode, role: AccountRole): string {
  if (role === "recruiter") {
    return mode === "login"
      ? ROUTES.RECRUITER_LOGIN
      : ROUTES.RECRUITER_REGISTER;
  }

  return mode === "login"
    ? ROUTES.JOB_SEEKER_LOGIN
    : ROUTES.JOB_SEEKER_REGISTER;
}

function getModeFromSearchParams(
  mode: AccountMode | undefined,
  value: string | null,
): AccountMode {
  if (mode) {
    return mode;
  }

  return value === "login" ? "login" : "register";
}

export function AccountChoicePage({
  mode,
  onSelectJobSeeker,
  onSelectRecruiter,
  variant = "page",
}: AccountChoicePageProps) {
  const searchParams = useSearchParams();
  const resolvedMode = getModeFromSearchParams(mode, searchParams.get("mode"));
  const roleOptions: RoleOption[] = [
    {
      buttonLabel: "Tôi là nhà tuyển dụng",
      image: "/Recruiter.png",
      imageAlt: "Nhà tuyển dụng",
      role: "recruiter",
    },
    {
      buttonLabel: "Tôi là người tìm việc",
      image: "/Job_Seeker.png",
      imageAlt: "Người tìm việc",
      role: "job_seeker",
    },
  ];

  const content = (
    <div className="relative z-10 w-full max-w-[860px] overflow-hidden rounded-[24px] border border-border bg-surface shadow-2xl">
      <header className="pt-6 pb-3 text-center sm:pt-8 sm:pb-4">
        <h1 className="font-display text-xl font-extrabold leading-tight text-foreground">
          Chào mừng bạn đến với FUSE
        </h1>
        <p className="mt-3 inline-flex items-center justify-center gap-2 text-sm leading-6 text-muted-foreground ">
          Bạn hãy dành ra vài giây để xác nhận thông tin dưới đây nhé!
          <BellRing
            aria-hidden="true"
            className="h-5 w-5 rotate-12 text-warning"
          />
        </p>
      </header>

      <div className="px-5 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-7">
        <p className="text-center leading-6 text-foreground">
          Để tối ưu tốt nhất cho trải nghiệm của bạn với FUSE,
          <br /> vui lòng lựa chọn nhóm phù hợp nhất với bạn?
        </p>

        <div className="mx-auto mt-8 grid max-w-[680px] gap-8 sm:grid-cols-2 sm:gap-12">
          {roleOptions.map((option) => {
            const href = getTargetHref(resolvedMode, option.role);
            const isJobSeeker = option.role === "job_seeker";

            return (
              <div
                className="group flex flex-col items-center text-center"
                key={option.role}
              >
                {(isJobSeeker && variant === "modal" && onSelectJobSeeker) ||
                (!isJobSeeker && variant === "modal" && onSelectRecruiter) ? (
                  <button
                    className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 cursor-pointer"
                    onClick={
                      isJobSeeker ? onSelectJobSeeker : onSelectRecruiter
                    }
                    type="button"
                  >
                    <RoleImage option={option} />
                  </button>
                ) : (
                  <Link
                    className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                    href={href}
                  >
                    <RoleImage option={option} />
                  </Link>
                )}

                {(isJobSeeker && variant === "modal" && onSelectJobSeeker) ||
                (!isJobSeeker && variant === "modal" && onSelectRecruiter) ? (
                  <BaseButton
                    variant="primary"
                    className="mt-8 rounded-full px-6 py-3 text-base font-extrabold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={
                      isJobSeeker ? onSelectJobSeeker : onSelectRecruiter
                    }
                    type="button"
                  >
                    {option.buttonLabel}
                  </BaseButton>
                ) : (
                  <Link
                    className="mt-8 rounded-full bg-primary px-6 py-3 text-base font-extrabold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    href={href}
                  >
                    {option.buttonLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-100 isolate flex items-center justify-center bg-foreground/60 px-10 py-6 backdrop-blur-[2px] sm:px-6">
        {content}
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-foreground/45 backdrop-blur-[1px]" />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6">
        {content}
      </section>
    </main>
  );
}

function RoleImage({ option }: { option: RoleOption }) {
  return (
    <span className="relative grid h-48 w-48 sm:h-56 sm:w-56 place-items-end overflow-hidden rounded-full border border-gray-200 shadow-2xl transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,102,255,0.3)] group-focus-within:shadow-[0_20px_50px_rgba(0,102,255,0.3)]">
      <Image
        alt={option.imageAlt}
        className="translate-y-1 object-contain transition-transform duration-300 group-hover:scale-105 group-focus-within:scale-110"
        fill
        priority
        sizes="(max-width: 640px) 12rem, 14rem"
        src={option.image}
      />
    </span>
  );
}
