"use client";

import { Flame, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/shared/components/ui/Badge";
import { FAVOURITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favourite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import { formatBriefAddress } from "@/shared/lib/utils/formatAddress";
import type { Job } from "@/shared/types/job";

interface JobCardProps {
  address: string;
  company: string;
  href?: string;
  jobId?: string;
  jobData?: Job;
  match?: string;
  salary?: string;
  title: string;
  type?: string;
  logoUrl?: string | null;
}

interface FavoriteButtonProps {
  jobData?: Job;
  jobId: string;
  className?: string;
}

function isHotJob(createdAt?: Date | string | null): boolean {
  if (!createdAt) return false;
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / 86400000;
  return diffDays <= 14; // Trong vòng 14 ngày (2 tuần)
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

function FavoriteButton({ jobData, jobId, className }: FavoriteButtonProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavourite, isFavouritePending, toggleFavourite } =
    useFavouriteJobs();
  const saved = isFavourite(jobId);
  const isSubmitting = isFavouritePending(jobId);

  return (
    <button
      aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
      aria-pressed={saved}
      className={cn("cursor-pointer focus:outline-none", className)}
      disabled={isSubmitting}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();

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
          const wasAdded = await toggleFavourite(jobId, jobData);

          if (wasAdded && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(FAVOURITE_JOB_ADDED_EVENT, {
                detail: { jobId, title: jobData?.title },
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
      <span className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-primary-soft">
        <Heart
          aria-hidden="true"
          className={cn(
            "h-5 w-5 text-primary/40 transition-all duration-200",
            saved && "fill-primary text-primary",
            isSubmitting && "opacity-60",
          )}
        />
      </span>
    </button>
  );
}

function JobCardContent({
  title,
  company,
  address,
  salary,
  logoUrl,
  createdAt,
}: JobCardProps & { createdAt?: Date | string | null }) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-2">
        <img
          alt={company}
          className="h-18 w-18 aspect-square rounded-xl border-2 border-gray-300 object-cover transition-colors"
          src={logoUrl ?? "/logo.png"}
        />
      </div>
      <div>
        <h3 className="mb-1 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary truncate">
          {title}
        </h3>
        <p className="line-clamp-1 font-medium text-muted-foreground">
          {company}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {salary ? (
          <Badge className="bg-secondary-soft text-sm text-primary">
            {salary}
          </Badge>
        ) : null}
        <Badge className="gap-1 bg-gray-300/70 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          {formatBriefAddress(address)}
        </Badge>
        {createdAt && (
          <span className="text-[11px] font-semibold text-slate-400 self-center ml-1">
            {formatRelativeTime(createdAt)}
          </span>
        )}
      </div>
    </>
  );
}

export function JobCard(props: JobCardProps) {
  const logoUrl = resolveMediaUrl(props.jobData?.company?.logoUrl);
  const createdAt = props.jobData?.createdAt;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <JobCardContent {...props} logoUrl={logoUrl} createdAt={createdAt} />
    </div>
  );
}

export function JobCardLink(props: JobCardProps) {
  const slugOrId = props.jobData?.slug ?? props.jobId;
  const href =
    props.href ??
    (slugOrId ? ROUTES.JOB_SEEKER_JOB_DETAIL(slugOrId) : ROUTES.JOBS);
  const logoUrl = resolveMediaUrl(props.jobData?.company?.logoUrl);

  const createdAt = props.jobData?.createdAt;
  const isHot = isHotJob(createdAt);

  return (
    <article className="group relative min-h-full rounded-3xl border border-gray-200 border-t-[6px] border-t-transparent bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-t-primary hover:shadow-xl">
      <Link className="block focus-visible:outline-none" href={href}>
        <JobCardContent {...props} logoUrl={logoUrl} createdAt={createdAt} />
      </Link>

      {isHot && (
        <span className="absolute top-5 right-5 shrink-0 rounded bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
          <Flame aria-hidden="true" className="h-4 w-4" /> HOT JOB
        </span>
      )}

      {props.jobId ? (
        <FavoriteButton
          jobData={props.jobData}
          jobId={props.jobId}
          className="absolute bottom-5 right-5 z-10"
        />
      ) : null}
    </article>
  );
}
