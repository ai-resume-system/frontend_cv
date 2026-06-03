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
  Briefcase,
  Clock,
  Heart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BaseField } from "@/shared/components/ui/BaseField";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCompanyJobs } from "@/shared/hooks/data/useCompanyJobs";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { resolveMediaUrl } from "@/shared/lib/utils/resolveMediaUrl";
import { cn } from "@/shared/lib/utils/cn";
import { FAVORITE_JOB_ADDED_EVENT } from "@/shared/constants/constants/favorite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import type { CompanyDto } from "@/shared/types/company";
import type { Job } from "@/shared/types/job";
import { JobCardSkeleton } from "@/shared/components/ui/CardSkelton";

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

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Địa điểm đang cập nhật";
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
  const router = useRouter();
  const { isFavorite, isFavoritePending, toggleFavorite } = useFavoriteJobs();
  const { isLoggedIn } = useAuth();

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

  async function handleApply(slug: string) {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(slug));
  }

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
                jobs.map((job) => (
                  <article
                    className="group relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl border border-gray-300 bg-white p-6 shadow-md transition duration-300 hover:border-primary/40 hover:shadow-lg md:flex-row md:items-center"
                    key={job.id}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-xl font-bold text-primary shadow-sm">
                        <img
                          src={job?.company?.logoUrl ?? logoUrl ?? "/logo.png"}
                          alt={
                            job.company?.name ?? company.name ?? "Doanh nghiệp"
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={buildJobHref(job)}
                            className="truncate text-lg font-bold text-slate-900 transition hover:text-primary"
                          >
                            {job.title}
                          </Link>
                          <CheckCircle2 className="h-4 w-4 shrink-0 fill-green-100 text-green-600" />
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-500 transition hover:text-primary">
                          {job.company?.name ?? company.name ?? "Doanh nghiệp"}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {getAddress(job)}
                          </span>
                          <span className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 font-semibold text-primary">
                            <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                            {formatSalary(job)}
                          </span>
                          <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {job.jobType === "full_time"
                              ? "Toàn thời gian"
                              : job.jobType === "part_time"
                                ? "Bán thời gian"
                                : "Thực tập"}
                          </span>
                        </div>

                        {job.skills?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                className="rounded-md border border-blue-100 bg-blue-50/50 px-2 py-0.5 text-[11px] font-medium text-primary"
                                key={skill.id}
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
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
                            const wasAdded = await toggleFavorite(job.id, job);

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
