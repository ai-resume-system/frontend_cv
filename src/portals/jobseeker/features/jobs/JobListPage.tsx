"use client";

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Funnel,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { JobCard } from "@/shared/components/layouts/JobCard";
import { TopSearchBar } from "@/portals/jobseeker/components/layouts/TopSearchBar";
import { BasePagination } from "@/shared/components/ui/BasePagination";
import { JobCardSkeleton } from "@/shared/components/ui/CardSkelton";
import {
  buildCategoryFilterOptions,
  JOB_EDUCATION_LEVEL_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_SALARY_OPTIONS,
  JOB_SORT_OPTIONS,
  JOB_TYPE_OPTIONS,
  JOB_WORK_ARRANGEMENT_OPTIONS,
  type JobFilterSortValue,
} from "@/shared/constants/constants/filter.constants";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { useJobFilters } from "@/shared/hooks/ui/useJobFilters";
import Image from "next/image";

function formatDate(value?: Date): string {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export function JobListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "DESC",
      status: "open",
    },
    paramAliases: {
      category: ["careerCategorySlug"],
    },
  });

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const { categories } = useCareerCategories({
    page: 1,
    limit: 100,
  });
  const [showAllCategories, setShowAllCategories] = useState(false);

  const queryOptions = buildQueryOptions();
  const { jobs, loading, error, pagination } = useJobs(queryOptions);
  const totalItems = pagination?.totalItems ?? jobs.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const categoriesToRender = showAllCategories
    ? (categories ?? [])
    : (categories ?? []).slice(0, 5);
  const categoryOptions = buildCategoryFilterOptions(categoriesToRender);

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
              <div className="sticky top-24 flex flex-col rounded-3xl border border-gray-300 bg-white shadow-lg overflow-hidden max-h-[calc(100vh-200px)]">
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

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      TRÌNH ĐỘ HỌC VẤN
                    </h3>
                    <div className="space-y-2">
                      {JOB_EDUCATION_LEVEL_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="educationLevel"
                            checked={filters.educationLevel === opt.value}
                            onChange={() =>
                              setFilter("educationLevel", opt.value)
                            }
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:outline-none"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                      HÌNH THỨC LÀM VIỆC
                    </h3>
                    <div className="space-y-2">
                      {JOB_WORK_ARRANGEMENT_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600 hover:text-primary"
                        >
                          <input
                            type="radio"
                            name="workArrangement"
                            checked={filters.workArrangement === opt.value}
                            onChange={() =>
                              setFilter("workArrangement", opt.value)
                            }
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
                      [Cập nhật {formatDate(new Date())}]
                    </span>
                  </h1>
                </div>

                <div
                  ref={sortDropdownRef}
                  className="relative flex shrink-0 items-center gap-2 self-start sm:self-auto"
                >
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" /> Sắp xếp
                    theo:
                  </span>

                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex min-w-40 cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {JOB_SORT_OPTIONS.find((o) => o.value === filters.sort)
                      ?.label || "Chọn..."}
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isSortOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                      {JOB_SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilter(
                              "sort",
                              option.value as JobFilterSortValue,
                            );
                            const nextSearchParams = new URLSearchParams(
                              searchParams.toString(),
                            );
                            nextSearchParams.set("sort", option.value);
                            nextSearchParams.set("page", "1");
                            router.push(
                              `${pathname}?${nextSearchParams.toString()}`,
                            );
                            setIsSortOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                            filters.sort === option.value
                              ? "bg-primary/5 text-primary font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                          {filters.sort === option.value && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
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
                    <JobCard key={job.id} job={job} />
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

              {totalPages > 1 && (
                <div className="mt-8">
                  <BasePagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(pageNumber) => applyFilters(pageNumber)}
                    variant="text"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
