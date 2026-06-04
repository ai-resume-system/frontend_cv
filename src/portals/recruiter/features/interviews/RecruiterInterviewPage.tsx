"use client";

import { CalendarCheck, ExternalLink, MapPin } from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";

function formatDateTime(value: string | null): string {
  if (!value) return "---";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecruiterInterviewPage() {
  const { applications, loading, error } = useRecruiterApplications({
    status: EJobApplicationStatus.INTERVIEW,
  });

  return (
    <RecruiterWorkspaceShell
      heading="Lịch phỏng vấn"
      subheading="Danh sách ứng viên đã được lên lịch phỏng vấn."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-on-surface-variant">Đang tải...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <CalendarCheck className="h-12 w-12 text-outline" />
            <p className="text-sm text-on-surface-variant">
              Chưa có ứng viên nào được lên lịch phỏng vấn.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((app) => (
              <article
                key={app.id}
                className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-on-surface">
                    {app.fullName ?? "Chưa có tên"}
                  </h3>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {app.job?.title ?? "---"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <p>{app.contactEmail ?? app.user?.email ?? "---"}</p>
                  <p>{app.contactPhone ?? "---"}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span>{formatDateTime(app.scheduleTime)}</span>
                  </div>

                  {app.scheduleLocation ? (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{app.scheduleLocation}</span>
                    </div>
                  ) : null}

                  {app.scheduleLink ? (
                    <a
                      href={app.scheduleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Link phỏng vấn</span>
                    </a>
                  ) : null}
                </div>

                {app.notes ? (
                  <div className="mt-4 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                      Ghi chú
                    </p>
                    <p className="mt-1">{app.notes}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </RecruiterWorkspaceShell>
  );
}
