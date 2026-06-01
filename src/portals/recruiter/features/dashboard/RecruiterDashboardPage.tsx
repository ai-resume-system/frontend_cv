"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileSearch,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { useRecruiterDashboard } from "@/portals/recruiter/features/dashboard/useRecruiterDashboard";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function getApplicationStatusLabel(status: string): string {
  switch (status) {
    case "APPLIED":
      return "Mới ứng tuyển";
    case "REVIEWING":
      return "Đang xem";
    case "INTERVIEW":
      return "Phỏng vấn";
    case "REJECTED":
      return "Từ chối";
    case "OFFERED":
      return "Đã gửi offer";
    case "ACCEPTED":
      return "Đã nhận việc";
    case "WITHDRAWN":
      return "Đã rút hồ sơ";
    default:
      return status;
  }
}

function getJobStatusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Đang mở";
    case "pending":
      return "Chờ duyệt";
    case "closed":
      return "Đã đóng";
    case "rejected":
      return "Bị từ chối";
    case "expired":
      return "Hết hạn";
    default:
      return status;
  }
}

export function RecruiterDashboardPage() {
  const {
    applications,
    error,
    jobOverviews,
    loading,
    metrics,
    recruiter,
    trend,
  } = useRecruiterDashboard();

  const topApplicant = [...applications]
    .filter((application) => typeof application.matchingScore === "number")
    .sort(
      (left, right) => (right.matchingScore ?? 0) - (left.matchingScore ?? 0),
    )[0];

  const trendMax = Math.max(...trend.map((item) => item.value), 1);

  return (
    <RecruiterWorkspaceShell
      heading="Dashboard tuyển dụng"
      subheading={`Theo dõi tiến độ tuyển dụng của ${
        recruiter?.company?.name ?? "doanh nghiệp"
      } từ dữ liệu tin đăng và hồ sơ hiện có.`}
      action={
        <Link
          href={RECRUITER_ROUTES.JOB_POSTING}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/15 transition hover:bg-primary-hover"
        >
          <BriefcaseBusiness className="h-4 w-4" />
          <span>Đăng tin mới</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            Không tải được dashboard recruiter: {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Jobs
              </span>
            </div>
            <p className="mt-5 text-sm text-on-surface-variant">
              Tổng tin tuyển dụng
            </p>
            <p className="mt-2 text-3xl font-bold text-on-surface">
              {loading ? "..." : formatNumber(metrics.totalJobs)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                <FileSearch className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/70">
                Open
              </span>
            </div>
            <p className="mt-5 text-sm text-on-surface-variant">Tin đang mở</p>
            <p className="mt-2 text-3xl font-bold text-on-surface">
              {loading ? "..." : formatNumber(metrics.openJobs)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                <UsersRound className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary/70">
                Candidates
              </span>
            </div>
            <p className="mt-5 text-sm text-on-surface-variant">
              Hồ sơ đã nhận
            </p>
            <p className="mt-2 text-3xl font-bold text-on-surface">
              {loading ? "..." : formatNumber(metrics.totalApplications)}
            </p>
          </div>

          <div className="rounded-3xl bg-[linear-gradient(135deg,_#00288e_0%,_#1e40af_100%)] p-6 text-on-primary shadow-lg shadow-primary/15">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-white/15 p-3">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                AI Match
              </span>
            </div>
            <p className="mt-5 text-sm text-white/80">
              Điểm matching trung bình
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : metrics.averageMatchingScore === null
                  ? "N/A"
                  : `${Math.round(metrics.averageMatchingScore)}%`}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  6 tuần gần nhất
                </p>
                <h2 className="mt-2 text-xl font-bold text-on-surface">
                  Xu hướng ứng tuyển
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                  Biểu đồ này đang dựng từ dữ liệu hồ sơ lấy qua endpoint
                  `applications/jobs/:jobId` của các tin đã tải. Backend hiện
                  chưa có API analytics tổng hợp theo tháng cho recruiter.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-6 items-end gap-3">
              {trend.map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex h-56 items-end">
                    <div
                      className="w-full rounded-t-3xl bg-[linear-gradient(180deg,_rgba(0,88,190,0.35)_0%,_rgba(0,40,142,0.92)_100%)] transition hover:opacity-90"
                      style={{
                        height: `${Math.max((item.value / trendMax) * 100, 10)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-on-surface">
                      {item.value}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    Top match hiện tại
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Dựa trên `matchingScore` từ API hồ sơ ứng tuyển.
                  </p>
                </div>
              </div>

              {topApplicant ? (
                <div className="mt-6 rounded-3xl bg-primary-soft/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-on-surface">
                        {topApplicant.applicantName}
                      </p>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {topApplicant.jobTitle}
                      </p>
                      <p className="mt-3 text-sm text-on-surface-variant">
                        {topApplicant.applicantEmail ?? "Chưa có email"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-primary shadow-sm">
                      {topApplicant.matchingScore}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
                  Chưa có hồ sơ nào trả về `matchingScore`, nên khối này đang
                  chờ dữ liệu thật từ backend.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                  <Clock3 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    Lịch phỏng vấn
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Chưa có API lịch phỏng vấn riêng.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
                Khi backend cung cấp endpoint lịch phỏng vấn hoặc pipeline, khối
                này sẽ chuyển từ ghi chú sang dữ liệu thật.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Tin tuyển dụng gần đây
                </h2>
              </div>
              <Link
                href={RECRUITER_ROUTES.JOB_POSTING}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
              >
                <span>Tạo tin mới</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {jobOverviews.length ? (
                jobOverviews.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {job.address ?? "Chưa cập nhật địa điểm"} • Tạo ngày{" "}
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                          {getJobStatusLabel(job.status)}
                        </span>
                        <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
                          {job.applicationCount} hồ sơ
                        </span>
                        <span className="rounded-full bg-tertiary-fixed/25 px-3 py-1 text-xs font-semibold text-tertiary">
                          {job.matchingAverage === null
                            ? "Chưa có AI match"
                            : `AI ${Math.round(job.matchingAverage)}%`}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                  Recruiter này chưa có tin tuyển dụng nào hoặc backend chưa trả
                  dữ liệu cho `jobs/my`.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Ứng viên mới ứng tuyển
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Snapshot từ `applications/jobs/:jobId`.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {applications.slice(0, 6).length ? (
                applications.slice(0, 6).map((application) => (
                  <article
                    key={application.id}
                    className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-on-surface">
                          {application.applicantName}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {application.jobTitle}
                        </p>
                        <p className="mt-3 text-xs text-on-surface-variant">
                          {application.cvTitle ?? "Chưa có tiêu đề CV"} •{" "}
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <div className="space-y-2 text-right">
                        <span className="block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                          {getApplicationStatusLabel(application.status)}
                        </span>
                        <span className="block text-xs font-semibold text-tertiary">
                          {typeof application.matchingScore === "number"
                            ? `AI ${application.matchingScore}%`
                            : "Chưa có AI"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                  Chưa có hồ sơ mới để hiển thị.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </RecruiterWorkspaceShell>
  );
}
