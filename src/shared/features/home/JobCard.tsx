"use client";

import { Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EJobType, JOB_TYPE_LABELS } from "@/shared/constants/enums/job.enum";
import { cn } from "@/shared/lib/utils/cn";
import Image from "next/image";

interface JobCardProps {
  company: string;
  href?: string;
  location: string;
  match?: string;
  salary?: string;
  title: string;
  type: string;
}

function FavoriteButton() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      aria-pressed={isFavorite}
      className={cn("absolute top-5 right-5 z-10")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsFavorite((current) => !current);
      }}
      type="button"
    >
      <span className="flex h-9 w-9 items-center justify-center hover:bg-primary-soft  rounded-full transition-all duration-200 ">
        <Heart
          aria-hidden="true"
          className={cn(
            "h-5 w-5 text-primary/40 transition-colors",
            isFavorite && "fill-primary-selected text-primary-selected",
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
  type,
  salary,
}: JobCardProps) {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-2">
        <Image
          src="/logo.png"
          alt=""
          width={70}
          height={70}
          className="transition-colors border border-gray-300 rounded-2xl"
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
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-medium text-foreground">
            {salary}
          </span>
        ) : null}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          {location}
        </div>
        <Badge>{JOB_TYPE_LABELS[type as EJobType]}</Badge>
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

      <FavoriteButton />
    </article>
  );
}
