"use client";

import { CheckCircle2, Heart, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { ROUTES } from "@/shared/constants/constants/routes";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { FAVOURITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favourite-job";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import { Badge } from "@/shared/components/ui/Badge";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import type { Job } from "@/shared/types/job";

interface JobCardProps {
  job: Job;
  showSkills?: boolean;
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
}

function formatExperience(years?: number | null): string {
  if (typeof years !== "number" || years === 0) {
    return "Không yêu cầu";
  }
  return `${years} năm`;
}

function toSalaryMillion(value?: number): number | undefined {
  if (typeof value !== "number") return undefined;
  return value / 1000000;
}

function formatMillionValue(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString("vi-VN")
    : value.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
}

function formatSalary(job: Job): string {
  const salaryMin = toSalaryMillion(job.salaryMin);
  const salaryMax = toSalaryMillion(job.salaryMax);

  if ((!salaryMin && !salaryMax) || (salaryMin === 0 && salaryMax === 0)) {
    return "Thỏa thuận";
  }

  if (typeof salaryMin === "number" && typeof salaryMax === "number") {
    return `${formatMillionValue(salaryMin)} - ${formatMillionValue(salaryMax)} triệu`;
  }

  if (typeof salaryMin === "number") {
    return `Từ ${formatMillionValue(salaryMin)} triệu`;
  }

  if (typeof salaryMax === "number") {
    return `Đến ${formatMillionValue(salaryMax)} triệu`;
  }

  return "Thỏa thuận";
}

function formatRelativeTime(value?: Date | string | null): string {
  if (!value) return "Đang cập nhật";
  const date = typeof value === "string" ? new Date(value) : value;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 1) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${Math.floor(diffMonths / 12)} năm trước`;
}

function buildJobHref(slug: string): string {
  return ROUTES.JOB_SEEKER_JOB_DETAIL(slug);
}

export function JobCard({ job, showSkills = false }: JobCardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavourite, isFavouritePending, toggleFavourite } = useFavouriteJobs();

  async function handleApply(slug: string) {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(slug));
  }

  return (
    <Link
      href={buildJobHref(job.slug ?? job.id)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-300 p-6 shadow-md transition duration-300 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start gap-4 w-full">
        {/* Logo */}
        <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
          <img
            src={job?.company?.logoUrl ?? "/logo.png"}
            alt={job.company?.name ?? "Doanh nghiệp"}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-lg font-bold text-slate-800 group-hover:text-primary transition">
                {job.title}
              </span>
              <CheckCircle2 className="h-4 w-4 shrink-0 fill-green-100 text-[#00b14f]" />
            </div>
            <span className="shrink-0 text-base font-bold text-primary/70">
              {formatSalary(job)}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase text-slate-400 transition">
              {job.company?.name ?? "Doanh nghiệp"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                {getAddress(job)}
              </Badge>
              <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-slate-400" />
                {formatExperience(job.experienceYears)}
              </Badge>
            </div>
          </div>

          {/* Hiển thị kỹ năng nổi bật nếu có cấu hình */}
          {showSkills && job.skills?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 3).map((skill) => (
                <span
                  className="rounded-md border border-blue-100 bg-blue-50/50 px-2 py-0.5 text-[11px] font-medium text-primary"
                  key={skill.id}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 shrink-0 self-end sm:self-auto w-full sm:w-auto">
        <div className="relative flex items-center justify-end">
          {job.updatedAt && (
            <span className="pointer-events-none text-sm text-slate-400 transition-opacity duration-300 whitespace-nowrap md:absolute md:right-0 md:opacity-100 md:group-hover:opacity-0">
              Cập nhật {formatRelativeTime(job.updatedAt)}
            </span>
          )}

          <BaseButton
            className="hidden md:inline-flex h-10 rounded-full px-5 text-sm font-semibold transform transition-all duration-300 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleApply(job.slug ?? job.id);
            }}
          >
            Ứng tuyển
          </BaseButton>
        </div>

        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-primary-container bg-white shadow-sm transition-all duration-200 hover:bg-primary-soft active:scale-95",
            isFavouritePending(job.id) && "animate-pulse opacity-60",
          )}
          disabled={isFavouritePending(job.id)}
          onClick={async (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (!isLoggedIn) {
              if (typeof window !== "undefined") {
                const redirectPath = `${window.location.pathname}${window.location.search}`;
                window.sessionStorage.setItem(
                  SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
                  redirectPath,
                );
              }

              router.push(ROUTES.JOB_SEEKER_LOGIN);
              return;
            }

            try {
              const wasAdded = await toggleFavourite(job.id, job);

              if (wasAdded && typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent(FAVOURITE_JOB_ADDED_EVENT, {
                    detail: {
                      jobId: job.id,
                      title: job.title,
                    },
                  }),
                );
              }
            } catch (error) {
              showErrorAlert(
                error instanceof Error
                  ? error.message
                  : "Không thể cập nhật danh sách yêu thích.",
              );
            }
          }}
          type="button"
        >
          <Heart
            className={cn(
              "h-5 w-5 text-slate-500 transition-transform group-hover:scale-105",
              isFavourite(job.id) && "fill-primary text-primary",
            )}
          />
        </button>
      </div>
    </Link>
  );
}
