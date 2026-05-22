"use client";

import Link from "next/link";
import { ArrowRightIcon, FileX2 } from "lucide-react";

import { HOME_MESSAGES } from "@/shared/constants/constants/messages";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useJobs } from "@/shared/hooks/data/useJobs";
import type { Job } from "@/shared/types/job";

import { JobCardLink } from "./JobCard";

function getCompanyName(job: Job): string {
  return (
    job.companyName ?? job.company?.companyName ?? "Doanh nghiệp đang cập nhật"
  );
}

function getLocation(job: Job): string {
  return job.location ?? "---";
}

function formatSalary(job: Job): string | undefined {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} triệu`;
  }

  if (typeof job.salaryMin === "number") {
    return `> ${job.salaryMin.toLocaleString("vi-VN")} triệu`;
  }

  if (typeof job.salaryMax === "number") {
    return `< ${job.salaryMax.toLocaleString("vi-VN")} triệu`;
  }

  return undefined;
}

function buildJobHref(jobId: string): string {
  return `${ROUTES.JOBS}?jobId=${jobId}`;
}

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
  const t = HOME_MESSAGES;
  const { jobs, loading, error } = useJobs({ page: 1, limit: 50 });

  return (
    <section className="bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold">
              Việc làm HOT nhất
            </h2>
            <p className="mt-2 text-muted-foreground">
              Cập nhật các cơ hội nổi bật đang mở tuyển từ hệ thống FUSE.
            </p>
          </div>
          <Link
            className="flex shrink-0 items-center gap-2 font-bold text-primary transition-all hover:gap-3 hover:text-primary-hover"
            href={ROUTES.JOBS}
          >
            {t.categories.viewMore}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <HotJobSkeleton />
            <HotJobSkeleton />
            <HotJobSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa tải được danh sách việc làm nổi bật.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCardLink
                  company={getCompanyName(job)}
                  href={buildJobHref(job.id)}
                  jobData={job}
                  jobId={job.id}
                  key={job.id}
                  location={getLocation(job)}
                  salary={formatSalary(job)}
                  title={job.title}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center md:col-span-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileX2 className="h-8 w-8 text-muted-foreground" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  Không có dữ liệu
                </h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Hiện tại chưa có việc làm nào được đăng tải.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
