"use client";

import { ChevronLeft, ChevronRight, Flag, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BaseField } from "@/shared/components/ui/BaseField";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import type { Job } from "@/shared/types/job";

function getCompanyName(job: Job): string {
  return job.companyName ?? job.company?.companyName ?? "Doanh nghiệp";
}

function getLocation(job: Job): string {
  return job.location ?? job.company?.location ?? "Đang cập nhật";
}

function formatSalary(job: Job): string {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.salaryMin.toLocaleString("vi-VN")} - ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMin === "number") {
    return `Từ ${job.salaryMin.toLocaleString("vi-VN")} VND`;
  }

  if (typeof job.salaryMax === "number") {
    return `Đến ${job.salaryMax.toLocaleString("vi-VN")} VND`;
  }

  return "Thỏa thuận";
}

function formatRelativeDate(value: Date): string {
  const now = Date.now();
  const diffInDays = Math.max(
    0,
    Math.floor((now - value.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (diffInDays === 0) {
    return "Hôm nay";
  }

  if (diffInDays === 1) {
    return "1 ngày trước";
  }

  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} tuần trước`;
}

function buildJobHref(jobId: string): string {
  return ROUTES.JOB_SEEKER_JOB_DETAIL(jobId);
}

type SortValue = "newest" | "salary";

interface JobListFilterState {
  careerCategoryId: string;
  experienceYears: string;
  jobType: string;
  location: string;
  q: string;
  sort: SortValue;
}

const INITIAL_FILTER_STATE: JobListFilterState = {
  careerCategoryId: "",
  experienceYears: "",
  jobType: "",
  location: "",
  q: "",
  sort: "newest",
};

function readFiltersFromSearchParams(
  searchParams: URLSearchParams,
): JobListFilterState {
  const sortParam = searchParams.get("sort");

  return {
    careerCategoryId: searchParams.get("careerCategoryId") ?? "",
    experienceYears: searchParams.get("experienceYears") ?? "",
    jobType: searchParams.get("jobType") ?? "",
    location: searchParams.get("location") ?? "",
    q: searchParams.get("q") ?? "",
    sort: sortParam === "salary" ? "salary" : "newest",
  };
}

export function JobListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, loading: categoriesLoading } = useCareerCategories({
    page: 1,
    limit: 100,
  });
  const [filters, setFilters] = useState<JobListFilterState>(() =>
    readFiltersFromSearchParams(searchParams),
  );

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    setFilters(readFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const queryOptions = useMemo(
    () => ({
      careerCategoryId: filters.careerCategoryId || undefined,
      experienceYears: filters.experienceYears
        ? Number(filters.experienceYears)
        : undefined,
      jobType: filters.jobType || undefined,
      limit: 9,
      location: filters.location || undefined,
      page,
      q: filters.q || undefined,
      sortBy: filters.sort === "salary" ? "salaryMax" : "createdAt",
      sortOrder: "DESC" as const,
      status: "open",
    }),
    [filters, page],
  );

  const { jobs, loading, error, pagination } = useJobs(queryOptions);
  const totalItems = pagination?.totalItems ?? jobs.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  function updateFilter<Key extends keyof JobListFilterState>(
    key: Key,
    value: JobListFilterState[Key],
  ) {
    setFilters((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  function pushFilters(nextPage = 1) {
    const nextSearchParams = new URLSearchParams();

    if (filters.q.trim()) {
      nextSearchParams.set("q", filters.q.trim());
    }

    if (filters.location.trim()) {
      nextSearchParams.set("location", filters.location.trim());
    }

    if (filters.careerCategoryId) {
      nextSearchParams.set("careerCategoryId", filters.careerCategoryId);
    }

    if (filters.jobType) {
      nextSearchParams.set("jobType", filters.jobType);
    }

    if (filters.experienceYears) {
      nextSearchParams.set("experienceYears", filters.experienceYears);
    }

    if (filters.sort !== "newest") {
      nextSearchParams.set("sort", filters.sort);
    }

    if (nextPage > 1) {
      nextSearchParams.set("page", `${nextPage}`);
    }

    const nextQuery = nextSearchParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function resetFilters() {
    setFilters(INITIAL_FILTER_STATE);
    router.push(pathname);
  }

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
                  Bộ lọc tìm kiếm
                </h2>
                <Search className="h-4 w-4 text-primary" />
              </div>

              <div className="mt-6 space-y-5">
                <BaseField
                  id="job-search-q"
                  label="Từ khóa"
                  placeholder="Tên việc làm, kỹ năng, công ty"
                  value={filters.q}
                  onChange={(event) => updateFilter("q", event.target.value)}
                />

                <BaseField
                  id="job-search-location"
                  label="Địa điểm"
                  placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
                  value={filters.location}
                  onChange={(event) =>
                    updateFilter("location", event.target.value)
                  }
                />

                <BaseField
                  id="job-search-category"
                  as="select"
                  label="Lĩnh vực"
                  value={filters.careerCategoryId}
                  onChange={(event) =>
                    updateFilter("careerCategoryId", event.target.value)
                  }
                  options={[
                    { label: categoriesLoading ? "Đang tải..." : "Tất cả lĩnh vực", value: "" },
                    ...categories.map((category) => ({
                      label: category.name,
                      value: category.id,
                    })),
                  ]}
                />

                <BaseField
                  id="job-search-type"
                  as="select"
                  label="Loại hình"
                  value={filters.jobType}
                  onChange={(event) => updateFilter("jobType", event.target.value)}
                  options={[
                    { label: "Tất cả loại hình", value: "" },
                    { label: "Toàn thời gian", value: "full_time" },
                    { label: "Bán thời gian", value: "part_time" },
                    { label: "Thực tập", value: "internship" },
                  ]}
                />

                <BaseField
                  id="job-search-experience"
                  as="select"
                  label="Kinh nghiệm"
                  value={filters.experienceYears}
                  onChange={(event) =>
                    updateFilter("experienceYears", event.target.value)
                  }
                  hint="API hiện dùng một tham số `experienceYears`, nên bộ lọc này đang map theo mốc năm kinh nghiệm."
                  options={[
                    { label: "Tất cả mốc kinh nghiệm", value: "" },
                    { label: "Mới đi làm", value: "0" },
                    { label: "1 năm", value: "1" },
                    { label: "3 năm", value: "3" },
                    { label: "5 năm", value: "5" },
                  ]}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => pushFilters(1)}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-2xl border border-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                >
                  Xóa
                </button>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  Fuse Jobs
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Tìm thấy {totalItems.toLocaleString("vi-VN")} công việc
                </h1>
              </div>

              <div className="w-full sm:w-56">
                <BaseField
                  id="job-search-sort"
                  as="select"
                  label="Sắp xếp"
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilter("sort", event.target.value as SortValue)
                  }
                  options={[
                    { label: "Mới nhất", value: "newest" },
                    { label: "Lương cao nhất", value: "salary" },
                  ]}
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-[28px] border border-error/20 bg-error-container px-6 py-5 text-sm text-on-error-container">
                Không tải được danh sách công việc: {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    className="h-64 animate-pulse rounded-[28px] bg-white shadow-sm"
                    key={index}
                  />
                ))}
              </div>
            ) : jobs.length ? (
              <div className="space-y-5">
                {jobs.map((job) => (
                  <article
                    className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    key={job.id}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-surface-container-high bg-surface-container-low text-xl font-bold text-primary">
                        {getCompanyName(job).slice(0, 1)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                className="text-2xl font-bold tracking-tight text-on-surface transition hover:text-primary"
                                href={buildJobHref(job.id)}
                              >
                                {job.title}
                              </Link>
                              {job.isFavourited ? (
                                <span className="rounded-full bg-tertiary-fixed/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                                  Đã lưu
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm font-semibold text-primary">
                              {getCompanyName(job)}
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-on-surface-variant">
                            {formatRelativeDate(job.createdAt)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-on-surface-variant">
                          <span className="rounded-full bg-surface-container-low px-3 py-1.5">
                            {getLocation(job)}
                          </span>
                          <span className="rounded-full bg-surface-container-low px-3 py-1.5">
                            {formatSalary(job)}
                          </span>
                          <span className="rounded-full bg-surface-container-low px-3 py-1.5">
                            {job.jobType === "full_time"
                              ? "Toàn thời gian"
                              : job.jobType === "part_time"
                                ? "Bán thời gian"
                                : "Thực tập"}
                          </span>
                        </div>

                        {job.skills?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                                key={skill.id}
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex w-full items-center gap-3 md:w-auto md:flex-col">
                        <Link
                          href={buildJobHref(job.id)}
                          className="flex-1 rounded-2xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-hover md:w-32"
                        >
                          Xem chi tiết
                        </Link>
                        <button
                          type="button"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-container-high text-on-surface-variant transition hover:bg-surface-container-low"
                          title="Chức năng báo cáo chưa có API riêng"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-surface-container-high bg-white/70 px-6 py-14 text-center">
                <h2 className="text-lg font-semibold text-on-surface">
                  Không có công việc phù hợp
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Thử thay đổi từ khóa hoặc bộ lọc để mở rộng kết quả tìm kiếm.
                </p>
              </div>
            )}

            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => pushFilters(page - 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-container-high bg-white text-on-surface-variant transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => pushFilters(pageNumber)}
                      className={
                        pageNumber === page
                          ? "inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white"
                          : "inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-surface-container-high bg-white px-4 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                      }
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => pushFilters(page + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-container-high bg-white text-on-surface-variant transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
