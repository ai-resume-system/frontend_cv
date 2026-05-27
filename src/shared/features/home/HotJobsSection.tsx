"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ListFilterIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react";

import { BaseField } from "@/shared/components/ui/BaseField";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useJobs } from "@/shared/hooks/data/useJobs";
import { cn } from "@/shared/lib/utils/cn";
import type { CareerCategory } from "@/shared/types/category";
import type { Job } from "@/shared/types/job";

import { JobCardLink } from "./JobCard";

type FilterKey = "salary" | "location" | "experience" | "category";

interface FilterOption {
  label: string;
  value: string;
}

const FILTER_LABELS: Record<FilterKey, string> = {
  salary: "Mức lương",
  location: "Địa điểm",
  experience: "Kinh nghiệm",
  category: "Ngành nghề",
};

function getCompanyName(job: Job): string {
  return (
    job.companyName ?? job.company?.companyName ?? "Doanh nghiệp đang cập nhật"
  );
}

function getLocation(job: Job): string {
  return job.location ?? job.company?.location ?? "Địa điểm đang cập nhật";
}

function toSalaryMillion(value?: number): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }

  return value / 1_000_000;
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

function buildJobHref(jobId: string): string {
  return `${ROUTES.JOBS}?jobId=${jobId}`;
}

function getSalaryFilterValue(job: Job): string | null {
  const salaryMin = toSalaryMillion(job.salaryMin);
  const salaryMax = toSalaryMillion(job.salaryMax);
  const salaryValue = salaryMax ?? salaryMin;

  if (typeof salaryValue !== "number") {
    return null;
  }

  if (salaryValue < 10) {
    return "under-10";
  }

  if (salaryValue < 15) {
    return "10-15";
  }

  if (salaryValue < 20) {
    return "15-20";
  }

  if (salaryValue < 25) {
    return "20-25";
  }

  if (salaryValue < 30) {
    return "25-30";
  }

  return "over-30";
}

function getExperienceFilterValue(job: Job): string | null {
  if (typeof job.experienceYears !== "number") {
    return null;
  }

  if (job.experienceYears <= 0) {
    return "fresher";
  }

  if (job.experienceYears <= 2) {
    return "1-2";
  }

  if (job.experienceYears <= 4) {
    return "3-4";
  }

  return "5-plus";
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
      { label: "Chưa yêu cầu", value: "fresher" },
      { label: "1-2 năm", value: "1-2" },
      { label: "3-4 năm", value: "3-4" },
      { label: "Từ 5 năm", value: "5-plus" },
    ];
  }

  if (filterKey === "category") {
    return [
      { label: "Tất cả", value: "all" },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];
  }

  return [];
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
  const { jobs, loading } = useJobs({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
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
  const [locationInput, setLocationInput] = useState("");
  const chipScrollRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = useMemo(
    () => buildFilterOptions(activeFilterKey, categories),
    [activeFilterKey, categories],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (activeFilterKey === "location") {
        if (locationInput.trim() === "") {
          return true;
        }

        const jobLocation = (
          job.location ??
          job.company?.location ??
          ""
        ).toLowerCase();

        return jobLocation.includes(locationInput.trim().toLowerCase());
      }

      if (selectedFilterValue === "all") {
        return true;
      }

      if (activeFilterKey === "salary") {
        return getSalaryFilterValue(job) === selectedFilterValue;
      }

      if (activeFilterKey === "experience") {
        return getExperienceFilterValue(job) === selectedFilterValue;
      }

      return job.careerCategory?.id === selectedFilterValue;
    });
  }, [activeFilterKey, jobs, locationInput, selectedFilterValue]);

  function scrollFilters(direction: "left" | "right") {
    chipScrollRef.current?.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  }

  function handleFilterKeyChange(filterKey: FilterKey) {
    setActiveFilterKey(filterKey);
    setSelectedFilterValue("all");
    setLocationInput("");
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
              className="flex h-11 w-full min-w-[200px] items-center justify-between rounded-xl border border-primary/40 bg-white px-4 py-2 text-left shadow-sm transition-colors hover:border-primary md:w-[240px] cursor-pointer"
              onClick={() => setIsFilterMenuOpen((prev) => !prev)}
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
            {activeFilterKey === "location" ? (
              <div className="w-full max-w-md animate-fadeIn">
                <BaseField
                  inputClassName="!h-11 rounded-xl border-primary/30 bg-white text-sm placeholder:text-slate-400 focus:border-primary"
                  leadingIcon={
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  }
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Nhập địa điểm tìm kiếm (e.g. Hà Nội, Hồ Chí Minh)..."
                  trailingIcon={
                    locationInput ? (
                      <button
                        className="rounded-full p-1 transition-colors hover:bg-muted"
                        onClick={() => setLocationInput("")}
                        type="button"
                      >
                        <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : undefined
                  }
                  value={locationInput}
                />
              </div>
            ) : (
              <>
                <button
                  aria-label="Cuộn bộ lọc sang trái"
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary-soft lg:flex"
                  onClick={() => scrollFilters("left")}
                  type="button"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                </button>

                <div
                  className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                        onClick={() => setSelectedFilterValue(option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  aria-label="Cuộn bộ lọc sang phải"
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary-soft lg:flex"
                  onClick={() => scrollFilters("right")}
                  type="button"
                >
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <HotJobSkeleton />
            <HotJobSkeleton />
            <HotJobSkeleton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
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
              <div className="flex flex-col items-center justify-center py-16 text-center md:col-span-3">
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
                  {activeFilterKey === "location" && locationInput
                    ? `Không tìm thấy kết quả nào tại địa điểm "${locationInput}".`
                    : activeFilterKey === "category" && categoriesError
                      ? "Chưa tải được danh sách ngành nghề để lọc."
                      : "Thử thay đổi tiêu chí bộ lọc khác để tìm kiếm."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
