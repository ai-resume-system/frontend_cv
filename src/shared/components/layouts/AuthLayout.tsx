"use client";

import { JobSeekerShowcase } from "@/portals/jobseeker/features/auth/function";
import { RecruiterShowcase } from "@/portals/recruiter/features/auth/function";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  role: EUserRole;
  stepLabel?: string;
  stepProgress?: string;
  showProgress?: boolean;
  children: React.ReactNode;
  showcasePosition?: "left" | "right";
}

export function AuthLayout({
  role,
  stepLabel,
  stepProgress,
  showProgress = false,
  children,
  showcasePosition,
}: AuthLayoutProps) {
  const isJobSeeker = role === EUserRole.JOB_SEEKER;
  const position = showcasePosition ?? (isJobSeeker ? "left" : "right");

  const showcaseEl = (
    <div className="sticky top-0 hidden self-start lg:flex lg:h-screen lg:w-1/2">
      {isJobSeeker ? <JobSeekerShowcase /> : <RecruiterShowcase />}
    </div>
  );

  return (
    <div className="custom-scroll flex min-h-screen flex-col lg:flex-row overflow-hidden lg:h-screen bg-slate-50">
      {position === "left" && showcaseEl}

      <div className="flex w-full flex-1 lg:w-1/2 lg:min-h-0 lg:overflow-y-auto bg-white flex-col">
        <div className="flex w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-4 xl:px-12 xl:py-6 2xl:px-16 justify-between">
          <header className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:min-h-16">
            <Link
              className="flex min-w-0 items-center gap-2 sm:gap-2.5"
              href={ROUTES.HOME}
            >
              <Image
                alt="FUSE"
                className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
                height={36}
                src="/logo.png"
                width={36}
              />
              <span className="truncate text-base font-extrabold uppercase tracking-tight text-primary sm:text-lg">
                {INFOMATION_WEB.COMPANY_NAME}
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {showProgress && (stepLabel || stepProgress) && (
                <div className="flex items-center gap-3 sm:flex-nowrap sm:gap-4">
                  {stepLabel && (
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                      {stepLabel}
                    </p>
                  )}
                  {stepProgress && (
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-32">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: stepProgress }}
                      />
                    </div>
                  )}
                </div>
              )}

              <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                href={`tel:${INFOMATION_WEB.PHONE}`}
              >
                <span>Hỗ trợ</span>
                <CircleQuestionMark className="h-4 w-4 translate-y-px" />
              </Link>
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center py-3 md:py-4 lg:py-6">
            <div className="w-full max-w-lg xl:max-w-xl">{children}</div>
          </main>

          <footer className="text-center text-sm text-slate-400 mt-auto pt-2 pb-1">
            <span className="uppercase">
              © {INFOMATION_WEB.COPYRIGHT_YEAR} {INFOMATION_WEB.COMPANY_NAME}
              .{" "}
            </span>
            Kiến tạo sự nghiệp bền vững.
          </footer>
        </div>
      </div>

      {position === "right" && showcaseEl}
    </div>
  );
}
