"use client";

import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/shared/components/ui/Badge";
import { FAVORITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favorite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
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
}

function FavoriteButton({ jobData, jobId }: FavoriteButtonProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavorite, isFavoritePending, toggleFavorite } = useFavoriteJobs();
  const saved = isFavorite(jobId);
  const isSubmitting = isFavoritePending(jobId);

  return (
    <button
      aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
      aria-pressed={saved}
      className={cn("absolute top-5 right-5 z-10 cursor-pointer")}
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
          const wasAdded = await toggleFavorite(jobId, jobData);

          if (wasAdded && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(FAVORITE_JOB_ADDED_EVENT, {
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
}: JobCardProps) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-2">
        <img
          alt={company}
          className="h-[70px] w-[70px] rounded-2xl border border-gray-300 object-contain transition-colors"
          src={logoUrl ?? "/logo.png"}
        />
      </div>
      <div>
        <h3 className="mb-1 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="line-clamp-1 font-medium text-muted-foreground">
          {company}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {salary ? (
          <Badge className="bg-secondary-soft text-sm text-primary">
            {salary}
          </Badge>
        ) : null}
        <Badge className="gap-1 bg-gray-300/70 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          {address}
        </Badge>
      </div>
    </>
  );
}

export function JobCard(props: JobCardProps) {
  const logoUrl = resolveMediaUrl(props.jobData?.company?.logoUrl);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <JobCardContent {...props} logoUrl={logoUrl} />
    </div>
  );
}

export function JobCardLink(props: JobCardProps) {
  const href =
    props.href ??
    (props.jobId ? ROUTES.JOB_SEEKER_JOB_DETAIL(props.jobId) : ROUTES.JOBS);
  const logoUrl = resolveMediaUrl(props.jobData?.company?.logoUrl);

  return (
    <article className="group relative min-h-full rounded-3xl border border-gray-200 border-t-[6px] border-t-transparent bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-t-primary hover:shadow-xl">
      <Link className="block focus-visible:outline-none" href={href}>
        <JobCardContent {...props} logoUrl={logoUrl} />
      </Link>

      {props.jobId ? (
        <FavoriteButton jobData={props.jobData} jobId={props.jobId} />
      ) : null}
    </article>
  );
}
