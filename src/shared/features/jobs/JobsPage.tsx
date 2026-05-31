"use client";

import { FileX2 } from "lucide-react";

import { JobCardLink } from "@/shared/features/home/JobCard";
import { useJobs } from "@/shared/hooks/data/useJobs";
import type { Job } from "@/shared/types/job";

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp đang cập nhật";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Địa điểm đang cập nhật";
}

function formatSalary(job: Job): string | undefined {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMin === "number") {
    return `Từ ${job.salaryMin.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMax === "number") {
    return `Đến ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  return undefined;
}

function JobsPageSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-md">
      <div className="mb-5 h-16 w-16 animate-pulse rounded-2xl bg-muted" />
      <div className="mb-3 h-6 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mb-5 h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-7 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function JobsPage() {
  const { jobs, loading, error } = useJobs({ page: 1, limit: 12 });

  return (
    <section className="bg-background px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl font-bold">
            Danh sách việc làm
          </h1>
          <p className="mt-3 text-muted-foreground">
            Khám phá các cơ hội tuyển dụng mới nhất từ hệ thống FUSE.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <JobsPageSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa tải được danh sách việc làm.
            </p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCardLink
                company={getCompanyLabel(job)}
                jobData={job}
                jobId={job.id}
                key={job.id}
                address={getAddress(job)}
                salary={formatSalary(job)}
                title={job.title}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileX2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">
              Chưa có việc làm
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Hiện tại chưa có tin tuyển dụng phù hợp để hiển thị.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
