"use client";

import { useState } from "react";
import { UsersRound } from "lucide-react";
import Link from "next/link";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { RecruiterApplicantRow } from "@/portals/recruiter/features/applicants/RecruiterApplicantRow";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

export function RecruiterApplicantsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);

  const { jobs } = useRecruiterJobList();
  const { applications, loading, error, reload, handleAccept, handleReject, handleViewCv } =
    useRecruiterApplications({ jobId: selectedJobId });

  return (
    <RecruiterWorkspaceShell
      heading="Ứng viên"
      subheading="Xem tất cả ứng viên đã ứng tuyển vào các tin tuyển dụng."
      action={
        selectedJobId ? (
          <Link href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(selectedJobId)}>
            <BaseButton variant="secondary" size="sm">
              Xem chi tiết
            </BaseButton>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedJobId(undefined)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedJobId === undefined
                ? "bg-primary text-on-primary shadow-lg shadow-primary/15"
                : "bg-white text-on-surface-variant hover:bg-primary-soft/60"
            }`}
          >
            Tất cả công việc
          </button>
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setSelectedJobId(job.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedJobId === job.id
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/15"
                  : "bg-white text-on-surface-variant hover:bg-primary-soft/60"
              }`}
            >
              {job.title}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/85 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-on-surface-variant">Đang tải...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <UsersRound className="h-12 w-12 text-outline" />
              <p className="text-sm text-on-surface-variant">
                Chưa có ứng viên nào cho tin tuyển dụng này.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    <th className="px-6 py-4">Ứng viên</th>
                    <th className="px-6 py-4">Công việc</th>
                    <th className="px-6 py-4">AI Match</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày ứng tuyển</th>
                    <th className="px-6 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <RecruiterApplicantRow
                      key={app.id}
                      application={app}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onViewCv={handleViewCv}
                      showJobColumn
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RecruiterWorkspaceShell>
  );
}
