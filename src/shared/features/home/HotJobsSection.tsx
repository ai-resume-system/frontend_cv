"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ListFilterIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { HotJobSkeleton } from "@/shared/components/ui/CardSkelton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { BasePagination } from "@/shared/components/ui/BasePagination";
import {
  buildCategoryFilterOptions,
  HOT_JOB_FILTER_LABELS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_SALARY_OPTIONS,
  mapFilterOptionsEmptyValue,
  type FilterOption,
  type HotJobFilterKey,
} from "@/shared/constants/constants/filter.constants";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { useJobFilters } from "@/shared/hooks/ui/useJobFilters";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";

import { JobCardLink } from "./JobCardSection";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";
import { StateLayout } from "@/shared/components/ui/StateLayout";

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp đang cập nhật";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Địa điểm đang cập nhật";
}

function getFilterOptions(
  filterKey: HotJobFilterKey,
  categories: ReturnType<typeof useCareerCategories>["categories"],
): FilterOption[] {
  if (filterKey === "salary") {
    return mapFilterOptionsEmptyValue(JOB_SALARY_OPTIONS, "all");
  }

  if (filterKey === "experience") {
    return mapFilterOptionsEmptyValue(JOB_EXPERIENCE_OPTIONS, "all");
  }

  if (filterKey === "category") {
    return buildCategoryFilterOptions(categories, {
      includeAll: true,
      allLabel: "Tất cả",
      emptyValue: "all",
    });
  }

  return [];
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
  const {
    applyFilters,
    buildQueryOptions,
    filters,
    page,
    setFilter,
    setFilters,
  } = useJobFilters({
    mode: "local",
    initialState: {
      category: "all",
      experience: "all",
      salary: "all",
    },
    baseQuery: {
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "DESC",
    },
    emptyValues: {
      category: "all",
      experience: "all",
      salary: "all",
    },
  });

  const [activeFilterKey, setActiveFilterKey] =
    useState<HotJobFilterKey>("salary");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const chipScrollRef = useRef<HTMLDivElement | null>(null);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
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
      setFilter("address", addressInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [addressInput, setFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterOptions = useMemo(
    () => getFilterOptions(activeFilterKey, categories),
    [activeFilterKey, categories],
  );

  const queryOptions = useMemo(() => buildQueryOptions(), [buildQueryOptions]);
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

  function handleFilterKeyChange(filterKey: HotJobFilterKey) {
    setActiveFilterKey(filterKey);
    setFilters((currentState) => ({
      ...currentState,
      address: "",
      category: "all",
      experience: "all",
      salary: "all",
    }));
    setAddressInput("");
    setIsFilterMenuOpen(false);
  }

  const selectedFilterValue =
    activeFilterKey === "salary"
      ? filters.salary
      : activeFilterKey === "experience"
        ? filters.experience
        : activeFilterKey === "category"
          ? filters.category
          : filters.address;

  return (
    <section className="bg-surface-container-high px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Việc làm HOT nhất
            </h2>
            <p className="text-sm font-normal text-slate-500">
              Đề xuất từ hệ thống FUSE
            </p>
          </div>

          <Link
            className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-all hover:gap-2 hover:text-primary-hover"
            href={ROUTES.JOBS}
          >
            Xem tất cả
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative shrink-0" ref={filterMenuRef}>
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
                  {HOT_JOB_FILTER_LABELS[activeFilterKey]}
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
                  Object.entries(HOT_JOB_FILTER_LABELS) as Array<
                    [HotJobFilterKey, string]
                  >
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
              <div className="w-full animate-fadeIn xl:max-w-md">
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
                          setFilter("address", "");
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
                  className="flex min-w-0 flex-1 cursor-grab gap-2 overflow-x-auto py-1 touch-pan-x select-none scrollbar-none active:cursor-grabbing"
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
                          if (activeFilterKey === "salary") {
                            setFilter("salary", option.value);
                            return;
                          }

                          if (activeFilterKey === "experience") {
                            setFilter("experience", option.value);
                            return;
                          }

                          setFilter("category", option.value);
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
                      salary={formatSalary(job.salaryMin, job.salaryMax)}
                      title={job.title}
                    />
                  </div>
                ))
              ) : (
                <StateLayout
                  type="empty"
                  title="Không có việc làm phù hợp"
                  description={
                    activeFilterKey === "address" && filters.address
                      ? `Không tìm thấy kết quả nào tại địa điểm "${filters.address}".`
                      : activeFilterKey === "category" && categoriesError
                        ? "Chưa tải được danh sách ngành nghề để lọc."
                        : "Thử thay đổi tiêu chí bộ lọc khác để tìm kiếm."
                  }
                  noBorder
                  imageWidth={100}
                  imageHeight={100}
                  className="col-span-full"
                />
              )}
            </div>

            <BasePagination
              className="mt-8"
              currentPage={page}
              onPageChange={applyFilters}
              totalPages={totalPages}
              variant="compact"
            />
          </>
        )}
      </div>
    </section>
  );
}
