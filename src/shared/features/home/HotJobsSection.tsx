"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ListFilterIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react";

import { BaseField } from "@/shared/components/ui/BaseField";
import { BasePagination } from "@/shared/components/ui/BasePagination";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { cn } from "@/shared/lib/utils/cn";
import type { FetchJobsParams } from "@/shared/services/job.service";
import type { CareerCategory } from "@/shared/types/career-category";
import type { Job } from "@/shared/types/job";

import { JobCardLink } from "./JobCardSection";
import { HotJobSkeleton } from "@/shared/components/ui/CardSkelton";

type FilterKey = "salary" | "address" | "experience" | "category";

interface FilterOption {
  label: string;
  value: string;
}

const FILTER_LABELS: Record<FilterKey, string> = {
  salary: "Mức lương",
  address: "Địa điểm",
  experience: "Kinh nghiệm",
  category: "Ngành nghề",
};

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp đang cập nhật";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Địa điểm đang cập nhật";
}

function toSalaryMillion(value?: number): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }

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

function formatSalary(job: Job): string | undefined {
  const salaryMin = toSalaryMillion(job.salaryMin);
  const salaryMax = toSalaryMillion(job.salaryMax);

  if (typeof salaryMin === "number" && typeof salaryMax === "number") {
    return `${formatMillionValue(salaryMin)} - ${formatMillionValue(salaryMax)} triệu`;
  }

  if (typeof salaryMin === "number") {
    return `Từ ${formatMillionValue(salaryMin)} triệu`;
  }

  if (typeof salaryMax === "number") {
    return `Đến ${formatMillionValue(salaryMax)} triệu`;
  }

  return undefined;
}

function buildFilterOptions(
  filterKey: FilterKey,
  categories: CareerCategory[],
): FilterOption[] {
  if (filterKey === "salary") {
    return [
      { label: "Tất cả", value: "all" },
      { label: "Dưới 10 triệu", value: "under-10" },
      { label: "Từ 10-15 triệu", value: "10-15" },
      { label: "Từ 15-20 triệu", value: "15-20" },
      { label: "Từ 20-25 triệu", value: "20-25" },
      { label: "Từ 25-30 triệu", value: "25-30" },
      { label: "Trên 30 triệu", value: "over-30" },
    ];
  }

  if (filterKey === "experience") {
    return [
      { label: "Tất cả", value: "all" },
      { label: "Chưa có kinh nghiệm", value: "fresher" },
      { label: "1-2 năm", value: "1-2" },
      { label: "3-4 năm", value: "3-4" },
      { label: "Trên 5 năm", value: "5-plus" },
    ];
  }

  if (filterKey === "category") {
    return [
      { label: "Tất cả", value: "all" },
      ...categories.map((category) => ({
        label: category.name,
        value: category.slug,
      })),
    ];
  }

  return [];
}

function getSalaryQuery(
  value: string,
): Pick<FetchJobsParams, "salaryMin" | "salaryMax"> {
  switch (value) {
    case "under-10":
      return { salaryMax: 10000000 };
    case "10-15":
      return { salaryMin: 10000000, salaryMax: 15000000 };
    case "15-20":
      return { salaryMin: 15000000, salaryMax: 20000000 };
    case "20-25":
      return { salaryMin: 20000000, salaryMax: 25000000 };
    case "25-30":
      return { salaryMin: 25000000, salaryMax: 30000000 };
    case "over-30":
      return { salaryMin: 30000000 };
    default:
      return {};
  }
}

function getExperienceQuery(
  value: string,
): Pick<FetchJobsParams, "experienceYearsMin" | "experienceYearsMax"> {
  switch (value) {
    case "fresher":
      return { experienceYearsMin: 0, experienceYearsMax: 0 };
    case "1-2":
      return { experienceYearsMin: 1, experienceYearsMax: 2 };
    case "3-4":
      return { experienceYearsMin: 3, experienceYearsMax: 4 };
    case "5-plus":
      return { experienceYearsMin: 5 };
    default:
      return {};
  }
}

export function HotJobsSection() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCareerCategories({
    page: 1,
    limit: 100,
  });

  const [activeFilterKey, setActiveFilterKey] = useState<FilterKey>("salary");
  const [selectedFilterValue, setSelectedFilterValue] = useState("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [debouncedAddressInput, setDebouncedAddressInput] = useState("");
  const [page, setPage] = useState(1);
  const chipScrollRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    pointerId: number | null;
    startScrollLeft: number;
    startX: number;
  }>({
    isDragging: false,
    pointerId: null,
    startScrollLeft: 0,
    startX: 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAddressInput(addressInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [addressInput]);

  const filterOptions = useMemo(
    () => buildFilterOptions(activeFilterKey, categories),
    [activeFilterKey, categories],
  );

  const queryOptions = useMemo<FetchJobsParams>(() => {
    const baseQuery: FetchJobsParams = {
      page,
      limit: 3,
      sortBy: "createdAt",
      sortOrder: "DESC",
    };

    if (activeFilterKey === "address") {
      return debouncedAddressInput
        ? {
            ...baseQuery,
            address: debouncedAddressInput,
          }
        : baseQuery;
    }

    if (selectedFilterValue === "all") {
      return baseQuery;
    }

    if (activeFilterKey === "salary") {
      return {
        ...baseQuery,
        ...getSalaryQuery(selectedFilterValue),
      };
    }

    if (activeFilterKey === "experience") {
      return {
        ...baseQuery,
        ...getExperienceQuery(selectedFilterValue),
      };
    }

    return {
      ...baseQuery,
      careerCategorySlug: selectedFilterValue,
    };
  }, [activeFilterKey, debouncedAddressInput, page, selectedFilterValue]);

  const { jobs, loading, pagination } = useJobs(queryOptions);
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  function scrollFilters(direction: "left" | "right") {
    chipScrollRef.current?.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  }

  function handleChipPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const container = chipScrollRef.current;

    if (!container) {
      return;
    }

    const targetElement =
      event.target instanceof HTMLElement ? event.target : null;

    if (targetElement?.closest("button")) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startScrollLeft: container.scrollLeft,
      startX: event.clientX,
    };

    container.setPointerCapture(event.pointerId);
  }

  function handleChipPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const container = chipScrollRef.current;
    const dragState = dragStateRef.current;

    if (!container || !dragState.isDragging) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    container.scrollLeft = dragState.startScrollLeft - deltaX;
  }

  function handleChipPointerEnd() {
    dragStateRef.current = {
      isDragging: false,
      pointerId: null,
      startScrollLeft: 0,
      startX: 0,
    };
  }

  function handleFilterKeyChange(filterKey: FilterKey) {
    setActiveFilterKey(filterKey);
    setSelectedFilterValue("all");
    setAddressInput("");
    setDebouncedAddressInput("");
    setPage(1);
    setIsFilterMenuOpen(false);
  }

  return (
    <section className="bg-surface-container-high px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Việc làm HOT nhất
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Đề xuất từ hệ thống FUSE
            </p>
          </div>
          <Link
            className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-all hover:gap-2 hover:text-primary-hover"
            href={ROUTES.JOBS}
          >
            Xem thêm
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative shrink-0">
            <button
              aria-expanded={isFilterMenuOpen}
              aria-haspopup="menu"
              className="flex h-11 w-full min-w-[200px] items-center justify-between rounded-xl border border-primary/40 bg-white px-4 py-2 text-left shadow-sm transition-colors hover:border-primary md:w-[240px]"
              onClick={() =>
                setIsFilterMenuOpen((currentState) => !currentState)
              }
              type="button"
            >
              <span className="flex items-center gap-2">
                <ListFilterIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Lọc theo:</span>
                <span className="text-sm font-semibold text-foreground">
                  {FILTER_LABELS[activeFilterKey]}
                </span>
              </span>
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isFilterMenuOpen && "rotate-180",
                )}
              />
            </button>

            {isFilterMenuOpen ? (
              <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5">
                {(
                  Object.entries(FILTER_LABELS) as Array<[FilterKey, string]>
                ).map(([key, label]) => {
                  const isActive = key === activeFilterKey;

                  return (
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-soft text-primary"
                          : "text-foreground hover:bg-muted/50",
                      )}
                      key={key}
                      onClick={() => handleFilterKeyChange(key)}
                      type="button"
                    >
                      <span>{label}</span>
                      {isActive ? (
                        <span className="font-semibold">✓</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {activeFilterKey === "address" ? (
              <div className="w-full xl:max-w-md animate-fadeIn">
                <BaseField
                  inputClassName="!h-11 rounded-xl border-primary/30 bg-white text-sm placeholder:text-slate-400 focus:border-primary"
                  leadingIcon={
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  }
                  onChange={(event) => setAddressInput(event.target.value)}
                  placeholder="Nhập địa điểm tìm kiếm (e.g. Hà Nội, Hồ Chí Minh)..."
                  trailingIcon={
                    addressInput ? (
                      <button
                        className="rounded-full p-1 transition-colors hover:bg-muted"
                        onClick={() => {
                          setAddressInput("");
                          setPage(1);
                        }}
                        type="button"
                      >
                        <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : undefined
                  }
                  value={addressInput}
                />
              </div>
            ) : (
              <>
                <button
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-primary-soft lg:flex"
                  onClick={() => scrollFilters("left")}
                  type="button"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                </button>

                <div
                  className="flex min-w-0 flex-1 cursor-grab gap-2 overflow-x-auto py-1 touch-pan-x select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                  onPointerCancel={handleChipPointerEnd}
                  onPointerDown={handleChipPointerDown}
                  onPointerMove={handleChipPointerMove}
                  onPointerUp={handleChipPointerEnd}
                  ref={chipScrollRef}
                >
                  {filterOptions.map((option) => {
                    const isActive = option.value === selectedFilterValue;
                    const isDisabled =
                      activeFilterKey === "category" &&
                      categoriesLoading &&
                      option.value !== "all";

                    return (
                      <button
                        className={cn(
                          "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-none transition-colors",
                          isActive
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200 bg-white text-foreground hover:border-primary/30 hover:bg-primary-soft hover:text-primary",
                          isDisabled && "cursor-not-allowed opacity-50",
                        )}
                        disabled={isDisabled}
                        key={option.value}
                        onClick={() => {
                          setSelectedFilterValue(option.value);
                          setPage(1);
                        }}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-primary-soft lg:flex"
                  onClick={() => scrollFilters("right")}
                  type="button"
                >
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <HotJobSkeleton />
            <HotJobSkeleton />
            <HotJobSkeleton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="h-full">
                    <JobCardLink
                      company={getCompanyLabel(job)}
                      href={ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id)}
                      jobData={job}
                      jobId={job.id}
                      address={getAddress(job)}
                      salary={formatSalary(job)}
                      title={job.title}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex items-center justify-center">
                    <Image
                      alt="Không có dữ liệu"
                      height={100}
                      priority
                      src="/no_data.png"
                      width={100}
                    />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-foreground">
                    Không có việc làm phù hợp
                  </h4>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {activeFilterKey === "address" && debouncedAddressInput
                      ? `Không tìm thấy kết quả nào tại địa điểm "${debouncedAddressInput}".`
                      : activeFilterKey === "category" && categoriesError
                        ? "Chưa tải được danh sách ngành nghề để lọc."
                        : "Thử thay đổi tiêu chí bộ lọc khác để tìm kiếm."}
                  </p>
                </div>
              )}
            </div>

            <BasePagination
              className="mt-8"
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
              variant="compact"
            />
          </>
        )}
      </div>
    </section>
  );
}
