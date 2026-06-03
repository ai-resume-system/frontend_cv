"use client";

import {
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Funnel,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { TopSearchBar } from "@/shared/components/ui/TopSearchBar";
import {
  buildCategoryFilterOptions,
  JOB_EXPERIENCE_OPTIONS,
  JOB_SALARY_OPTIONS,
  JOB_SORT_OPTIONS,
  JOB_TYPE_OPTIONS,
  type JobFilterSortValue,
} from "@/shared/constants/constants/filter.constants";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { useJobFilters } from "@/shared/hooks/ui/useJobFilters";
import type { Job } from "@/shared/types/job";
import Image from "next/image";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { cn } from "@/shared/lib/utils/cn";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { FAVORITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favorite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import { JobCardSkeleton } from "@/shared/components/ui/CardSkelton";
import { Badge } from "@/shared/components/ui/Badge";

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

function formatDate(value?: Date): string {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function buildJobHref(jobId: string): string {
  return ROUTES.JOB_SEEKER_JOB_DETAIL(jobId);
}

export function JobListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const {
    applyFilters,
    buildQueryOptions,
    filters,
    page,
    resetFilters,
    setFilter,
  } = useJobFilters({
    mode: "url",
    pathname,
    router,
    searchParams,
    baseQuery: {
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
      status: "open",
    },
    paramAliases: {
      category: ["careerCategorySlug"],
    },
  });

  const { categories } = useCareerCategories({
    page: 1,
    limit: 100,
  });
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { isFavorite, isFavoritePending, toggleFavorite } = useFavoriteJobs();

  const queryOptions = buildQueryOptions();
  const { jobs, loading, error, pagination } = useJobs(queryOptions);
  const totalItems = pagination?.totalItems ?? jobs.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const categoriesToRender = showAllCategories
    ? (categories ?? [])
    : (categories ?? []).slice(0, 5);
  const categoryOptions = buildCategoryFilterOptions(categoriesToRender);

  async function handleApply(slug: string) {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(slug));
  }

  return (
    <>
      <section className="bg-linear-to-r from-primary/95 via-primary/50 to-primary/95 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-0">
          <TopSearchBar
            initialKeyword={filters.q}
            initialAddress={filters.address}
            initialCategory={filters.category}
          />
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col rounded-3xl border border-gray-300 bg-white shadow-lg overflow-hidden max-h-[calc(100vh-120px)]">
                <div className="flex items-center gap-2 border-b border-slate-100 p-6 pb-4 shrink-0">
                  <Funnel className="h-5 w-5 shrink-0 text-primary" />
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
                    Lọc nâng cao
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 scrollbar-thin">
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      THEO NGÀNH NGHỀ
                    </h3>
                    <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                      <label className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === ""}
                          onChange={() => setFilter("category", "")}
                          className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                        />
                        <span>Tất cả ngành nghề</span>
                      </label>
                      {categoryOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={filters.category === option.value}
                            onChange={() => setFilter("category", option.value)}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                          />
                          <span className="truncate">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {categories && categories.length > 5 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllCategories((prev) => !prev)}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-blue-700"
                      >
                        {showAllCategories ? (
                          <>
                            Thu gọn <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Xem thêm <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      KINH NGHIỆM
                    </h3>
                    <div className="space-y-2">
                      {JOB_EXPERIENCE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="experience"
                            checked={filters.experience === opt.value}
                            onChange={() => setFilter("experience", opt.value)}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      MỨC LƯƠNG
                    </h3>
                    <div className="space-y-2">
                      {JOB_SALARY_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="salary"
                            checked={filters.salary === opt.value}
                            onChange={() => setFilter("salary", opt.value)}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      LOẠI HÌNH LÀM VIỆC
                    </h3>
                    <div className="space-y-2">
                      {JOB_TYPE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="jobType"
                            checked={filters.jobType === opt.value}
                            onChange={() => setFilter("jobType", opt.value)}
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50 shrink-0 flex justify-center items-center">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full cursor-pointer py-2 rounded-xl text-center text-sm font-semibold bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
                  >
                    Xóa lọc
                  </button>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="flex flex-wrap items-center gap-1.5 text-lg font-bold text-slate-800">
                    Tuyển dụng{" "}
                    <span className="font-extrabold text-primary">
                      {totalItems.toLocaleString("vi-VN")}
                    </span>{" "}
                    việc làm
                    <span className="text-sm font-normal text-slate-600">
                      [Update {formatDate(new Date())}]
                    </span>
                  </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" /> Sắp xếp
                    theo:
                  </span>
                  <select
                    value={filters.sort}
                    onChange={(event) => {
                      const value = event.target.value as JobFilterSortValue;
                      setFilter("sort", value);

                      const nextSearchParams = new URLSearchParams(
                        searchParams.toString(),
                      );
                      nextSearchParams.set("sort", value);
                      nextSearchParams.set("page", "1");
                      router.push(`${pathname}?${nextSearchParams.toString()}`);
                    }}
                    className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition outline-none hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {JOB_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                  Không tải được danh sách công việc: {error}
                </div>
              ) : null}

              {loading ? (
                <JobCardSkeleton length={5} type="row" />
              ) : jobs.length ? (
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <article
                      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-300 p-6 shadow-md transition duration-300 hover:border-primary/40 hover:shadow-lg"
                      key={job.id}
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
                              <Link
                                href={buildJobHref(job.slug ?? job.id)}
                                className="truncate text-lg font-bold text-slate-800 group-hover:text-primary transition"
                              >
                                {job.title}
                              </Link>
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
                              <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                                {getAddress(job)}
                              </Badge>
                              <Badge className="rounded bg-gray-300/60 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                                {formatExperience(job.experienceYears)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-3 shrink-0 self-end sm:self-auto">
                        <BaseButton
                          className="h-10 rounded-full px-5 text-sm font-semibold opacity-100 transform transition-all duration-300 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
                          onClick={() => handleApply(job.slug ?? job.id)}
                        >
                          Ứng tuyển
                        </BaseButton>

                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border border-primary-container bg-white shadow-sm transition-all duration-200 hover:bg-primary-soft active:scale-95",
                            isFavoritePending(job.id) &&
                              "animate-pulse opacity-60",
                          )}
                          disabled={isFavoritePending(job.id)}
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
                              const wasAdded = await toggleFavorite(
                                job.id,
                                job,
                              );

                              if (wasAdded && typeof window !== "undefined") {
                                window.dispatchEvent(
                                  new CustomEvent(FAVORITE_JOB_ADDED_EVENT, {
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
                              isFavorite(job.id) && "fill-primary text-primary",
                            )}
                          />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <div className="flex items-center justify-center">
                    <Image
                      alt="Không có dữ liệu"
                      height={100}
                      priority
                      src="/no_data.png"
                      width={100}
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-800">
                    Không có công việc phù hợp
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Thử thay đổi từ khóa hoặc bộ lọc để mở rộng kết quả tìm
                    kiếm.
                  </p>
                </div>
              )}

              {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => applyFilters(page - 1)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                    .map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => applyFilters(pageNumber)}
                        className={
                          pageNumber === page
                            ? "inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm"
                            : "inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        }
                      >
                        {pageNumber}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => applyFilters(page + 1)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
