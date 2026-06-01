"use client";

import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BaseField } from "@/shared/components/ui/BaseField";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCompanyJobs } from "@/shared/hooks/data/useCompanyJobs";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import type { CompanyDto } from "@/shared/types/company";
import type { Job } from "@/shared/types/job";

interface CompanyDetailPageProps {
  company: CompanyDto;
}

interface CompanyJobFilters {
  address: string;
  q: string;
}

const INITIAL_FILTERS: CompanyJobFilters = {
  address: "",
  q: "",
};

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
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

function getEmployeeLabel(company: CompanyDto): string {
  if (
    typeof company.employeeMin === "number" &&
    typeof company.employeeMax === "number"
  ) {
    return `${company.employeeMin}-${company.employeeMax} nhân viên`;
  }

  if (typeof company.employeeMin === "number") {
    return `Từ ${company.employeeMin} nhân viên`;
  }

  if (typeof company.employeeMax === "number") {
    return `Đến ${company.employeeMax} nhân viên`;
  }

  return "Đang cập nhật";
}

function buildJobHref(job: Job): string {
  return ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug ?? job.id);
}

function buildMapLink(company: CompanyDto): string | undefined {
  if (
    typeof company.latitude === "number" &&
    typeof company.longitude === "number"
  ) {
    return `https://www.google.com/maps?q=${company.latitude},${company.longitude}`;
  }

  if (company.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;
  }

  return undefined;
}

export function CompanyDetailPage({ company }: CompanyDetailPageProps) {
  const [filters, setFilters] = useState<CompanyJobFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<CompanyJobFilters>(INITIAL_FILTERS);
  const [expanded, setExpanded] = useState(false);

  const companySlug = company.slug ?? "";
  const { jobs, loading, error, pagination } = useCompanyJobs({
    companySlug,
    page: 1,
    limit: 6,
    q: appliedFilters.q.trim() || undefined,
    address: appliedFilters.address.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
    status: "open",
  });

  const mapLink = buildMapLink(company);
  const totalJobs =
    pagination?.totalItems ?? company.openJobCount ?? jobs.length;
  const bannerUrl = resolveMediaUrl(company.bannerUrl);
  const logoUrl = resolveMediaUrl(company.logoUrl);

  return (
    <section className="bg-background pb-14">
      <div className="border-b border-surface-container-high bg-surface-container-low">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-surface-container-high bg-white shadow-sm">
            <div className="h-48 bg-linear-to-r from-primary/15 via-white to-secondary/10">
              {bannerUrl ? (
                <img
                  alt={company.name ?? "Công ty"}
                  className="h-full w-full object-cover"
                  src={bannerUrl}
                />
              ) : null}
            </div>

            <div className="px-6 pb-6 sm:px-8">
              <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-surface-container-high bg-white shadow-sm">
                  {logoUrl ? (
                    <img
                      alt={company.name ?? "Logo công ty"}
                      className="h-20 w-20 rounded-2xl object-contain"
                      src={logoUrl}
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl">
                    {company.name ?? "Công ty đang cập nhật"}
                  </h1>

                  {company.websiteUrl ? (
                    <a
                      className="mt-3 inline-flex items-center gap-2 text-sm text-on-surface-variant transition hover:text-primary"
                      href={company.websiteUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{company.websiteUrl}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 border-b border-surface-container-high">
                <a
                  className="border-b-2 border-primary pb-3 text-sm font-semibold text-primary"
                  href="#company-overview"
                >
                  Trang chủ
                </a>
                <a
                  className="pb-3 text-sm font-semibold text-on-surface-variant transition hover:text-primary"
                  href="#company-jobs"
                >
                  Tin tuyển dụng ({totalJobs})
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_340px] lg:px-8">
        <div className="space-y-6">
          <section
            className="rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm"
            id="company-overview"
          >
            <h2 className="text-2xl font-bold text-primary">
              Giới thiệu công ty
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-7 text-on-surface-variant">
              <p className={expanded ? undefined : "line-clamp-6"}>
                {company.description ??
                  "Thông tin giới thiệu của doanh nghiệp đang được cập nhật."}
              </p>
              {company.description ? (
                <button
                  className="text-sm font-semibold text-primary transition hover:text-primary-hover"
                  onClick={() => setExpanded((currentState) => !currentState)}
                  type="button"
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </button>
              ) : null}
            </div>
          </section>

          <section
            className="rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm"
            id="company-jobs"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  Tin tuyển dụng
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Tìm kiếm công việc phù hợp trong doanh nghiệp này.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
              <BaseField
                id="company-job-search-q"
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Tên công việc, vị trí ứng tuyển..."
                value={filters.q}
                onChange={(event) =>
                  setFilters((currentState) => ({
                    ...currentState,
                    q: event.target.value,
                  }))
                }
              />
              <BaseField
                id="company-job-search-address"
                leadingIcon={<MapPin className="h-4 w-4" />}
                placeholder="Tất cả tỉnh/thành phố"
                value={filters.address}
                onChange={(event) =>
                  setFilters((currentState) => ({
                    ...currentState,
                    address: event.target.value,
                  }))
                }
              />
              <button
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
                onClick={() => setAppliedFilters(filters)}
                type="button"
              >
                Tìm kiếm
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                Array.from({ length: 3 }, (_, index) => (
                  <div
                    className="h-44 animate-pulse rounded-[24px] bg-surface-container"
                    key={index}
                  />
                ))
              ) : error ? (
                <div className="rounded-[24px] border border-dashed border-surface-container-high px-5 py-10 text-center text-sm text-on-surface-variant">
                  Không thể tải danh sách việc làm của công ty lúc này.
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    className="group rounded-[24px] border border-surface-container-high bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    key={job.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <a
                          className="text-lg font-bold text-on-surface transition hover:text-primary"
                          href={buildJobHref(job)}
                        >
                          {job.title}
                        </a>
                        <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                          {getCompanyLabel(job)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                          <span className="rounded-full bg-surface-container-low px-3 py-1">
                            {getAddress(job)}
                          </span>
                          {formatSalary(job) ? (
                            <span className="rounded-full bg-surface-container-low px-3 py-1">
                              {formatSalary(job)}
                            </span>
                          ) : null}
                          {job.jobType ? (
                            <span className="rounded-full bg-surface-container-low px-3 py-1">
                              {job.jobType === "full_time"
                                ? "Toàn thời gian"
                                : job.jobType === "part_time"
                                  ? "Bán thời gian"
                                  : "Thực tập"}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <a
                          className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                          href={ROUTES.JOB_SEEKER_JOB_APPLY(job.slug ?? job.id)}
                        >
                          Ứng tuyển ngay
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-surface-container-high px-5 py-10 text-center text-sm text-on-surface-variant">
                  Công ty hiện chưa có tin tuyển dụng phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">Thông tin chung</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Mã số thuế</p>
                  <p className="font-semibold text-on-surface">
                    {company.taxCode ?? "Đang cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Quy mô</p>
                  <p className="font-semibold text-on-surface">
                    {getEmployeeLabel(company)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Lĩnh vực</p>
                  <p className="font-semibold text-on-surface">
                    {company.careerCategory?.name ?? "Đang cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">
                    Tin tuyển dụng
                  </p>
                  <p className="font-semibold text-on-surface">
                    {totalJobs} vị trí đang mở
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">
              Địa điểm công ty
            </h2>
            <div className="mt-5 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-on-surface">
                  {company.address ?? "Địa chỉ đang cập nhật"}
                </p>
                {mapLink ? (
                  <Link
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    href={mapLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Mở trong Maps
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
