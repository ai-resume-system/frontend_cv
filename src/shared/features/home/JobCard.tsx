"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";

interface JobCardProps {
  company: string;
  href?: string;
  jobId?: string;
  jobData?: Job;
  location: string;
  match?: string;
  salary?: string;
  title: string;
  type?: string;
}

interface FavoriteButtonProps {
  jobData?: Job;
  jobId: string;
}

function FavoriteButton({ jobData, jobId }: FavoriteButtonProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavorite, toggleFavorite } = useFavoriteJobs();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saved = isFavorite(jobId);

  return (
    <button
      aria-label={saved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
      aria-pressed={saved}
      className={cn("absolute top-5 right-5 z-10")}
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
          setIsSubmitting(true);
          await toggleFavorite(jobId, jobData);
        } catch (error) {
          showErrorAlert(
            error instanceof Error
              ? error.message
              : "Không thể cập nhật danh sách yêu thích.",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
      type="button"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-primary-soft">
        <Heart
          aria-hidden="true"
          className={cn(
            "h-5 w-5 text-primary/40 transition-colors",
            saved && "fill-primary-selected text-primary-selected",
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
  location,
  salary,
}: JobCardProps) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-2">
        <Image
          alt=""
          className="rounded-2xl border border-gray-300 transition-colors"
          height={70}
          src="/logo.png"
          width={70}
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
          <Badge className="text-sm bg-secondary-soft text-primary">
            {salary}
          </Badge>
        ) : null}
        <Badge className="text-sm bg-gray-300/70 text-muted-foreground gap-1">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          {location}
        </Badge>
      </div>
    </>
  );
}

export function JobCard(props: JobCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <JobCardContent {...props} />
    </div>
  );
}

export function JobCardLink(props: JobCardProps) {
  const href = props.href ?? ROUTES.JOBS;

  return (
    <article className="group relative min-h-full rounded-3xl border border-gray-200 border-t-[6px] border-t-transparent bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-t-primary hover:shadow-xl">
      <Link className="block focus-visible:outline-none" href={href}>
        <JobCardContent {...props} />
      </Link>

      {props.jobId ? (
        <FavoriteButton jobData={props.jobData} jobId={props.jobId} />
      ) : null}
    </article>
  );
}
