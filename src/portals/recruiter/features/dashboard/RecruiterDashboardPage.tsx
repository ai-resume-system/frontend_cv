"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Clock3,
  Eye,
  FileSearch,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import { useRecruiterDashboard } from "@/portals/recruiter/features/dashboard/useRecruiterDashboard";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { EJobApplicationStatusLabels } from "@/shared/constants/enums/job-application.enum";
import {
  EJobStatusLabels,
  EJobStatus,
} from "@/shared/constants/enums/job.enum";
import { formatDate } from "@/shared/lib/helpers/formatDate.helper";
import type { RecruiterJobOverview } from "@/shared/types/dashboard";
import type { Job } from "@/shared/types/job";

// Helper: Chuyển RecruiterJobOverview sang dạng Job đủ để truyền vào Modal
function jobOverviewToJobShape(overview: RecruiterJobOverview): Job {
  return {
    id: overview.id,
    title: overview.title,
    address: overview.address,
    status: overview.status,
    expiredAt: overview.expiredAt ?? undefined,
    vacancyCount: overview.vacancyCount ?? undefined,
    createdAt: overview.createdAt,
    updatedAt: overview.createdAt, // fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobType: "full_time" as any,
  };
}

function getJobStatusClass(status: EJobStatus): string {
  switch (status) {
    case EJobStatus.OPEN:
      return "bg-green-100 text-green-700";
    case EJobStatus.CLOSED:
      return "bg-red-100 text-red-700";
    case EJobStatus.PENDING:
      return "bg-yellow-100 text-yellow-700";
    case EJobStatus.REJECTED:
      return "bg-red-50 text-red-500";
    case EJobStatus.EXPIRED:
      return "bg-orange-100 text-orange-700";
    case EJobStatus.DRAFT:
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function RecruiterDashboardPage() {
  const {
    applications,
    error,
    jobOverviews,
    loading,
    metrics,
    trend,
    todayInterviews,
  } = useRecruiterDashboard();

  const { user } = useCurrentUser();
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const date = new Date();
    setCurrentTime(
      date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <RecruiterWorkspaceShell
      heading="Tổng quan"
      subheading={
        <span>
          Chào mừng trở lại,{" "}
          <span className="font-bold text-primary">
            {user?.company?.name ?? user?.email ?? "Nhà tuyển dụng"}
          </span>
          . {currentTime ? `Hôm nay là ${currentTime}.` : ""}
        </span>
      }
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Thẻ thống kê */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="group/card flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            <div className="flex items-start justify-between">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary transition-transform duration-300 group-hover/card:scale-110">
                <BriefcaseBusiness className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                Tin tuyển dụng
              </span>
            </div>
            <div className="mt-6 flex flex-col grow">
              <p className="text-sm font-medium text-on-surface-variant">
                Tổng tin tuyển dụng
              </p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-black text-on-surface">
                  {loading ? "..." : metrics.totalJobs}
                </p>
                <Link
                  href={RECRUITER_ROUTES.JOBS}
                  className="group flex items-center text-xs font-bold text-primary transition-colors hover:opacity-80"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group/card flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/10">
            <div className="flex items-start justify-between">
              <span className="rounded-2xl bg-secondary-soft p-3 text-secondary transition-transform duration-300 group-hover/card:scale-110">
                <FileSearch className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary/70">
                Đang mở
              </span>
            </div>
            <div className="mt-6 flex flex-col grow">
              <p className="text-sm font-medium text-on-surface-variant">
                Tin đang mở tuyển
              </p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-black text-on-surface">
                  {loading ? "..." : metrics.openJobs}
                </p>
                <Link
                  href={RECRUITER_ROUTES.JOBS}
                  className="group flex items-center text-xs font-bold text-secondary transition-colors hover:opacity-80"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </div>
            </div>
          </div>

          {/* Thẻ 3: Tổng hồ sơ đã nhận */}
          <div className="group/card flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tertiary/10">
            <div className="flex items-start justify-between">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary transition-transform duration-300 group-hover/card:scale-110">
                <UsersRound className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-tertiary/70">
                Hồ sơ
              </span>
            </div>
            <div className="mt-6 flex flex-col grow">
              <p className="text-sm font-medium text-on-surface-variant">
                Tổng hồ sơ đã nhận
              </p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-black text-on-surface">
                  {loading ? "..." : metrics.totalApplications}
                </p>
                <Link
                  href={RECRUITER_ROUTES.APPLICANTS}
                  className="group flex items-center text-xs font-bold text-tertiary transition-colors hover:opacity-80"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </div>
            </div>
          </div>

          {/* Thẻ 4: Lịch phỏng vấn sắp tới */}
          <div className="group/card flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tertiary/10">
            <div className="flex items-start justify-between">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary transition-transform duration-300 group-hover/card:scale-110">
                <CalendarCheck className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-tertiary/70">
                Phỏng vấn
              </span>
            </div>
            <div className="mt-6 flex flex-col grow">
              <p className="text-sm font-medium text-on-surface-variant">
                Lịch phỏng vấn sắp tới
              </p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-black text-on-surface">
                  {loading ? "..." : metrics.interviewApplications}
                </p>
                <Link
                  href={RECRUITER_ROUTES.APPLICANTS}
                  className="group flex items-center text-xs font-bold text-tertiary transition-colors hover:opacity-80"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 items-stretch xl:grid-cols-[1.6fr_1fr]">
          {/* Biểu đồ xu hướng ứng tuyển */}
          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md flex flex-col h-full">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                THỐNG KÊ 6 TUẦN GẦN NHẤT
              </p>
              <h2 className="mt-1 text-xl font-bold text-on-surface">
                Xu hướng ứng tuyển
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                Biểu đồ thể hiện sự biến động số lượng hồ sơ nộp vào hệ thống
              </p>
            </div>

            <div className="mt-6 w-full h-72 flex-1 min-h-70">
              <ResponsiveContainer
                width="100%"
                height="100%"
                initialDimension={{ width: 100, height: 100 }}
              >
                <BarChart
                  data={trend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelClassName="font-bold text-slate-800"
                  />
                  <Bar
                    dataKey="value"
                    name="Số hồ sơ"
                    fill="#0058be"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  >
                    {trend.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === trend.length - 1 ? "#0058be" : "#3b82f6"
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lịch phỏng vấn hôm nay */}
          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  Lịch phỏng vấn hôm nay
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Các buổi phỏng vấn diễn ra trong ngày hôm nay
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-85 pr-1 scrollbar-thin">
              {loading ? (
                <div className="py-8 text-center text-sm text-on-surface-variant">
                  Đang tải lịch hẹn...
                </div>
              ) : todayInterviews && todayInterviews.length > 0 ? (
                todayInterviews.map((interview) => {
                  const timeStr = interview.scheduleTime
                    ? new Date(interview.scheduleTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "--:--";
                  const initial = (
                    interview.fullName ??
                    interview.user?.email ??
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <div
                      key={interview.id}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high transition hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {interview.fullName ??
                            interview.user?.email ??
                            "Ứng viên"}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {interview.job?.title ?? "Vị trí ứng tuyển"}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-secondary-fixed bg-secondary-soft/50 inline-block px-2.5 py-0.5 rounded-md">
                          ⏰ {timeStr}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant h-full">
                  <Clock3 className="h-8 w-8 text-outline-variant mb-2" />
                  <p className="text-sm">Hôm nay không có lịch phỏng vấn</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
          {/* Tin tuyển dụng gần đây */}
          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-on-surface">
                  Tin tuyển dụng gần đây
                </h2>
                <Link
                  href={RECRUITER_ROUTES.JOBS}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition"
                >
                  <span>Xem thêm</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {jobOverviews && jobOverviews.slice(0, 4).length ? (
                  jobOverviews.slice(0, 4).map((job) => (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Tên và thông tin */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-on-surface truncate leading-snug">
                            {job.title}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getJobStatusClass(job.status)}`}
                            >
                              {EJobStatusLabels[job.status]}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              {job.applicationCount} hồ sơ
                            </span>
                            {job.vacancyCount != null && (
                              <span className="text-[10px] text-on-surface-variant">
                                • {job.vacancyCount} chỉ tiêu
                              </span>
                            )}
                            {job.expiredAt && (
                              <span className="text-[10px] text-on-surface-variant">
                                • HSD: {formatDate(job.expiredAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nút xem chi tiết */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewJob(jobOverviewToJobShape(job))
                          }
                          className="shrink-0 rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                          title="Xem bài đăng"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                    Chưa có tin tuyển dụng nào được tạo.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ứng viên mới ứng tuyển */}
          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-on-surface shrink-0">
                  Ứng viên mới
                </h2>
                <Link
                  href={RECRUITER_ROUTES.APPLICANTS}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {applications && applications.slice(0, 4).length ? (
                  applications.slice(0, 4).map((application) => {
                    const initial = application.applicantName
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <article
                        key={application.id}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest transition hover:shadow-sm"
                      >
                        {/* Avatar */}
                        <div className="shrink-0">
                          {application.avatarUrl ? (
                            <img
                              src={application.avatarUrl}
                              alt={application.applicantName}
                              width={44}
                              height={44}
                              className="rounded-full object-cover ring-2 ring-surface-container-high"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-base font-bold text-primary">
                              {initial}
                            </div>
                          )}
                        </div>

                        {/* Thông tin */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-on-surface truncate">
                            {application.applicantName}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {application.jobTitle}
                          </p>
                          <p className="mt-0.5 text-[10px] text-on-surface-variant/70">
                            {formatDate(application.createdAt)}
                          </p>
                        </div>

                        {/* Badge + Link */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {typeof application.matchingScore === "number" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                              AI {application.matchingScore}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              {EJobApplicationStatusLabels[application.status]}
                            </span>
                          )}
                          <Link
                            href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(
                              application.jobId,
                            )}
                            className="text-[11px] font-bold text-primary hover:text-primary-hover hover:underline flex items-center gap-0.5"
                          >
                            <span>Chi tiết</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm text-on-surface-variant">
                    Chưa có hồ sơ ứng tuyển mới.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Preview Tin tuyển dụng - dùng chung với RecruiterJobListPage */}
      {previewJob && (
        <RecruiterJobPreviewModal
          job={previewJob}
          onClose={() => setPreviewJob(null)}
        />
      )}
    </RecruiterWorkspaceShell>
  );
}
