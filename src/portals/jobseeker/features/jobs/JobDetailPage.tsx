"use client";

import {
  ArrowRight,
  Building2,
  ExternalLink,
  Flag,
  Heart,
  MapPin,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";

interface JobDetailPageProps {
  job: Job;
  relatedJobs: Job[];
}

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
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

function formatJobType(job: Job): string {
  if (job.jobType === "full_time") return "Toàn thời gian";
  if (job.jobType === "part_time") return "Bán thời gian";
  return "Thực tập";
}

function formatDate(value?: Date): string {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function splitDescription(value?: string): string[] {
  if (!value) {
    return ["Nhà tuyển dụng chưa cập nhật mô tả chi tiết cho vị trí này."];
  }
  return value
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildGoogleMapsUrl(job: Job): string | undefined {
  const coords: { lat?: number | null; lng?: number | null } = {};
  if (job.company?.latitude) coords.lat = job.company.latitude;
  if (job.company?.longitude) coords.lng = job.company.longitude;

  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  }
  const addr = getAddress(job);
  if (addr && addr !== "Đang cập nhật") {
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
  }
  return undefined;
}

export function JobDetailPage({ job, relatedJobs }: JobDetailPageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isFavorite, isFavoritePending, toggleFavorite } = useFavoriteJobs();

  const saved = isFavorite(job.id);
  const descriptionBlocks = splitDescription(job.description);
  const mapsUrl = buildGoogleMapsUrl(job);
  const companySlug = job.company?.slug;
  const companyName = getCompanyLabel(job);

  async function handleApply() {
    if (!isLoggedIn) {
      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    router.push(ROUTES.JOB_SEEKER_JOB_APPLY(job.slug ?? job.id));
  }

  return (
    <>
      <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-tertiary-fixed/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Enterprise Listing
                  </span>
                  <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                    {formatJobType(job)}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {job.title}
                </h1>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {getAddress(job)}
                  </span>
                  <span className="rounded-full bg-surface-container-low px-4 py-2">
                    {typeof job.experienceYears === "number"
                      ? `${job.experienceYears} năm kinh nghiệm`
                      : "Kinh nghiệm đang cập nhật"}
                  </span>
                  <span className="rounded-full bg-surface-container-low px-4 py-2">
                    Hạn nộp: {formatDate(job.expiredAt)}
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-surface-container-high pt-8">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    <span>Ứng tuyển ngay</span>
                    <Send className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isFavoritePending(job.id)}
                    onClick={() => {
                      void toggleFavorite(job.id, job);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high bg-surface-container-low px-5 py-4 text-sm font-semibold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        saved && "fill-primary text-primary",
                      )}
                    />
                    <span>{saved ? "Đã lưu" : "Lưu tin"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void showAppAlert({
                        icon: "info",
                        title: "Chưa có API báo cáo",
                        text: "Backend hiện chưa cung cấp endpoint báo cáo tin tuyển dụng.",
                      });
                    }}
                    className="ml-auto inline-flex items-center gap-2 rounded-2xl px-4 py-4 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Báo cáo</span>
                  </button>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm">
                <h2 className="border-l-4 border-tertiary-fixed pl-4 text-2xl font-bold uppercase tracking-tight text-primary">
                  Mô tả công việc
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-on-surface-variant">
                  {descriptionBlocks.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm">
                <h2 className="border-l-4 border-tertiary-fixed pl-4 text-2xl font-bold uppercase tracking-tight text-primary">
                  Thông tin vị trí
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-surface-container-low p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                      Công ty
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {companyName}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                      Mức lương
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {formatSalary(job)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                      Lĩnh vực
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {job.careerCategory?.name ?? "Đang cập nhật"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                      Cập nhật
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {formatDate(job.updatedAt)}
                    </p>
                  </div>
                </div>

                {job.skills?.length ? (
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                      Kỹ năng nổi bật
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary"
                          key={skill.id}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
                    {companyName.slice(0, 1)}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      {companyName}
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                      {job.careerCategory?.name ??
                        "Doanh nghiệp đang cập nhật lĩnh vực"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-on-surface-variant">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{getAddress(job)}</span>
                  </p>
                </div>

                {companySlug ? (
                  <Link
                    href={ROUTES.JOB_SEEKER_COMPANY_DETAIL(companySlug)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    <Building2 className="h-4 w-4" />
                    Xem trang công ty
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void showAppAlert({
                        icon: "info",
                        title: "Chưa có thông tin",
                        text: "Công ty chưa có trang thông tin trên hệ thống.",
                      });
                    }}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    <Building2 className="h-4 w-4" />
                    Xem trang công ty
                  </button>
                )}
              </section>

              <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-sm">
                {mapsUrl ? (
                  <div className="aspect-4/3 w-full">
                    <iframe
                      allowFullScreen
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapsUrl}
                      title="Vị trí công ty"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-4/3 flex-col items-center justify-center gap-3 p-6 text-center">
                    <MapPin className="h-10 w-10 text-on-surface-variant/40" />
                    <p className="text-sm text-on-surface-variant">
                      Địa điểm chưa được cập nhật
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-primary">
                    Việc làm liên quan
                  </h2>
                  <Link
                    href={ROUTES.JOBS}
                    className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition hover:text-primary"
                  >
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {relatedJobs.length ? (
                    relatedJobs.map((relatedJob) => (
                      <Link
                        className="block rounded-2xl border border-surface-container-high bg-surface-container-low p-4 transition hover:border-primary/20 hover:bg-white"
                        href={ROUTES.JOB_SEEKER_JOB_DETAIL(
                          relatedJob.slug ?? relatedJob.id,
                        )}
                        key={relatedJob.id}
                      >
                        <h3 className="text-base font-semibold text-on-surface">
                          {relatedJob.title}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {getCompanyLabel(relatedJob)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                          <span className="rounded-full bg-white px-3 py-1">
                            {getAddress(relatedJob)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            {formatSalary(relatedJob)}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low p-4 text-sm text-on-surface-variant">
                      Chưa có công việc liên quan.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-surface-container-high bg-white/90 px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-on-surface">
              {job.title}
            </p>
            <p className="text-xs text-on-surface-variant">{companyName}</p>
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-hover sm:w-auto"
          >
            <Send className="h-4 w-4" />
            Ứng tuyển ngay
          </button>
        </div>
      </div>
    </>
  );
}
