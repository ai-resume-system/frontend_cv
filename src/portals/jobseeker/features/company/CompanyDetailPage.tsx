"use client";

import {
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";

import { JobCard } from "@/shared/components/layouts/JobCard";
import { BaseField } from "@/shared/components/ui/BaseField";
import { JobCardSkeleton } from "@/shared/components/ui/CardSkelton";
import { useCompanyJobs } from "@/shared/hooks/data/useCompanyJobs";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import type { CompanyDto } from "@/shared/types/company";

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

function buildGoogleMapsUrl(company: CompanyDto): string | undefined {
  const coords: { lat?: number | null; lng?: number | null } = {};
  if (company.latitude) coords.lat = company.latitude;
  if (company.longitude) coords.lng = company.longitude;

  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  }
  const addr = company.address;
  if (addr && addr !== "Đang cập nhật") {
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
  }
  return undefined;
}

export function CompanyDetailPage({ company }: CompanyDetailPageProps) {
  const [filters, setFilters] = useState<CompanyJobFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<CompanyJobFilters>(INITIAL_FILTERS);
  const [expanded, setExpanded] = useState(false);

  const companySlug = company.slug ?? "";
  const {
    jobs = [],
    loading,
    error,
    pagination,
  } = useCompanyJobs({
    companySlug,
    page: 1,
    limit: 6,
    q: appliedFilters.q.trim() || undefined,
    address: appliedFilters.address.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
    status: "open",
  });

  const mapLink = buildGoogleMapsUrl(company);
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
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-surface-container-high bg-white shadow-sm">
                  <img
                    alt={company.name ?? "Logo công ty"}
                    className="h-20 w-20 rounded-2xl object-contain"
                    src={logoUrl ?? "/logo.png"}
                  />
                </div>

                <div className="flex-1 min-w-0">
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
              <h2 className="text-2xl font-bold text-primary">
                Tin tuyển dụng
              </h2>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
              <BaseField
                id="company-job-search-q"
                leadingIcon={<Search className="h-5 w-5" />}
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
                placeholder="Địa chỉ"
                value={filters.address}
                onChange={(event) =>
                  setFilters((currentState) => ({
                    ...currentState,
                    address: event.target.value,
                  }))
                }
              />
              <button
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover cursor-pointer"
                onClick={() => setAppliedFilters(filters)}
                type="button"
              >
                Tìm kiếm
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <JobCardSkeleton length={3} type="row" />
              ) : error ? (
                <div className="rounded-[24px] border border-dashed border-surface-container-high px-5 py-10 text-center text-sm text-on-surface-variant">
                  Không thể tải danh sách việc làm của công ty lúc này.
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => <JobCard key={job.id} job={job} showSkills />)
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
            </div>
          </section>

          <section className="rounded-[28px] border border-surface-container-high bg-white p-6 shadow-sm text-left">
            <h2 className="text-xl font-bold text-slate-800">
              Địa điểm công ty
            </h2>
            <div className="mt-4 flex items-start gap-2.5 text-slate-600">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <span className="text-sm font-semibold leading-6">
                {company.address ?? "Địa chỉ đang cập nhật"}
              </span>
            </div>
            {mapLink ? (
              <div className="relative mt-4 aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <a
                  href={buildMapLink(company)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-primary shadow-md transition hover:bg-slate-50 cursor-pointer"
                >
                  Mở trong Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <iframe
                  allowFullScreen
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapLink}
                  title="Vị trí công ty"
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 flex-col items-center justify-center gap-3 p-6 text-center mt-4">
                <MapPin className="h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-500">
                  Địa điểm chưa được cập nhật
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
