"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Clock3,
  FileSearch,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
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
import { useRecruiterDashboard } from "@/portals/recruiter/features/dashboard/useRecruiterDashboard";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { EJobApplicationStatusLabels } from "@/shared/constants/enums/job-application.enum";
import { EJobStatusLabels } from "@/shared/constants/enums/job.enum";
import { formatDate } from "@/shared/lib/helpers/formatDate.helper";

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

  return (
    <RecruiterWorkspaceShell
      heading="Tổng quan"
      subheading="Tổng quan về hiệu suất tuyển dụng và hoạt động của doanh nghiệp."
    >
      {/* Thẻ thống kê */}
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-primary-soft p-3 text-primary">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                TIN TUYỂN DỤNG
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-on-surface-variant">
              Tổng tin tuyển dụng
            </p>
            <p className="mt-1 text-3xl font-extrabold text-on-surface">
              {loading ? "..." : metrics.totalJobs}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-secondary-soft p-3 text-secondary">
                <FileSearch className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70">
                ĐANG MỞ
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-on-surface-variant">
              Tin đang mở tuyển
            </p>
            <p className="mt-1 text-3xl font-extrabold text-on-surface">
              {loading ? "..." : metrics.openJobs}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                <UsersRound className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary/70">
                HỒ SƠ
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-on-surface-variant">
              Tổng hồ sơ đã nhận
            </p>
            <p className="mt-1 text-3xl font-extrabold text-on-surface">
              {loading ? "..." : metrics.totalApplications}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-md transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="rounded-2xl bg-tertiary-fixed/30 p-3 text-tertiary">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary/70">
                PHỎNG VẤN
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-on-surface-variant">
              Lịch phỏng vấn sắp tới
            </p>
            <p className="mt-1 text-3xl font-extrabold text-on-surface">
              {loading ? "..." : metrics.interviewApplications}
            </p>
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

            <div className="mt-6 w-full h-72 flex-1 min-h-[280px]">
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

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
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
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition"
                >
                  <span>Xem thêm</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {jobOverviews && jobOverviews.slice(0, 3).length ? (
                  jobOverviews.slice(0, 3).map((job) => (
                    <article
                      key={job.id}
                      className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5 transition hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-on-surface truncate">
                            {job.title}
                          </h3>
                          <p className="mt-1 text-xs text-on-surface-variant truncate">
                            {job.address ?? "Chưa cập nhật địa điểm"} • Đăng
                            ngày {formatDate(job.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary">
                            {EJobStatusLabels[job.status]}
                          </span>
                          <span className="rounded-full bg-secondary-soft px-3 py-1 text-[11px] font-semibold text-secondary">
                            {job.applicationCount} hồ sơ
                          </span>
                        </div>
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
                <h2 className="text-xl font-bold text-on-surface">
                  Ứng viên mới ứng tuyển
                </h2>

                <Link
                  href={RECRUITER_ROUTES.APPLICANTS}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition"
                >
                  <span>Xem tất cả ứng viên</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {applications && applications.slice(0, 3).length ? (
                  applications.slice(0, 3).map((application) => {
                    const initial = application.applicantName
                      .charAt(0)
                      .toUpperCase();
                    return (
                      <article
                        key={application.id}
                        className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-5 transition hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-on-surface truncate">
                                {application.applicantName}
                              </h3>
                              <p className="mt-0.5 text-xs text-on-surface-variant truncate">
                                {application.jobTitle}
                              </p>
                              <p className="mt-2 text-[10px] text-on-surface-variant">
                                {formatDate(application.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                              {EJobApplicationStatusLabels[application.status]}
                            </span>
                            <span className="text-xs font-semibold text-tertiary">
                              {typeof application.matchingScore === "number"
                                ? `AI ${application.matchingScore}%`
                                : "Chưa có AI"}
                            </span>

                            <Link
                              href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(
                                application.jobId,
                              )}
                              className="mt-1 text-[11px] font-bold text-primary hover:text-primary-hover hover:underline flex items-center gap-0.5"
                            >
                              <span>Xem chi tiết</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
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
    </RecruiterWorkspaceShell>
  );
}
