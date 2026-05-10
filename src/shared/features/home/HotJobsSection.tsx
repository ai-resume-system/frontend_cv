"use client";

import Link from "next/link";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { messages } from "@/shared/i18n/config";
import type { Job } from "@/shared/types/job";

import { JobCardLink } from "./JobCard";
import { ArrowRightIcon } from "lucide-react";

function getCompanyName(job: Job): string {
  if (typeof job.company === "string") {
    return job.company;
  }

  return (
    job.companyName ??
    job.company?.companyName ??
    job.company?.name ??
    messages.home.hotJobs.fallbackCompany
  );
}

function getLocation(job: Job): string {
  if (typeof job.location === "string") {
    return job.location;
  }

  return (
    job.location?.province ??
    job.location?.city ??
    job.province ??
    job.city ??
    messages.home.hotJobs.fallbackLocation
  );
}

function formatSalary(job: Job): string | undefined {
  if (job.salary) {
    return job.salary;
  }

  if (job.salaryMin && job.salaryMax) {
    const currency = job.currency ?? "VND";
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} ${currency}`;
  }

  if (job.salaryMin) {
    const currency = job.currency ?? "VND";
    return `${messages.home.hotJobs.salaryFrom} ${job.salaryMin.toLocaleString("vi-VN")} ${currency}`;
  }

  return undefined;
}

function getWorkType(job: Job): string {
  return (
    job.workType ??
    job.jobType ??
    job.employmentType ??
    messages.home.hotJobs.fallbackWorkType
  );
}

function getMatch(job: Job): string | undefined {
  const score = job.aiMatchScore ?? job.matchScore;

  if (score === undefined) {
    return undefined;
  }

  return `${score <= 1 ? Math.round(score * 100) : Math.round(score)}%`;
}

function buildJobHref(jobId: string): string {
  return `${ROUTES.JOBS}?jobId=${jobId}`;
}

// Base trắng
function HotJobSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-3 h-6 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mb-8 h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function HotJobsSection() {
  const t = messages.home.hotJobs;
  const fallbackJobs = messages.home.jobs;
  const { jobs, loading, error } = useJobs({ page: 1, limit: 3 });

  return (
    <section className="bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold">{t.title}</h2>
            <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
          </div>
          <Link
            className="flex shrink-0 items-center gap-2 font-bold text-primary transition-all hover:gap-3 hover:text-primary-hover"
            href={ROUTES.JOBS}
          >
            {t.viewAll}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <HotJobSkeleton />
            <HotJobSkeleton />
            <HotJobSkeleton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {jobs.length > 0
              ? jobs.map((job) => (
                  <JobCardLink
                    company={getCompanyName(job)}
                    href={buildJobHref(job.id)}
                    key={job.id}
                    location={getLocation(job)}
                    match={getMatch(job)}
                    salary={formatSalary(job)}
                    title={job.title}
                    type={getWorkType(job)}
                  />
                ))
              : fallbackJobs.map((job) => (
                  <JobCardLink
                    company={job.company}
                    key={job.title}
                    location={job.location}
                    match={job.match}
                    title={job.title}
                    type={job.type}
                  />
                ))}
          </div>
        )}

        {!loading && error ? (
          <p className="mt-4 text-sm text-muted-foreground">{t.error}</p>
        ) : null}

        {!loading && !error && jobs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t.empty}</p>
        ) : null}
      </div>
    </section>
  );
}
