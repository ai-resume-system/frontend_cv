"use client";

import { ArrowLeft, UsersRound } from "lucide-react";
import Link from "next/link";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { RecruiterApplicantRow } from "@/portals/recruiter/features/applicants/RecruiterApplicantRow";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

interface RecruiterApplicantsByJobPageProps {
  jobId: string;
}

export function RecruiterApplicantsByJobPage({ jobId }: RecruiterApplicantsByJobPageProps) {
  const { jobs } = useRecruiterJobList();
  const job = jobs.find((j) => j.id === jobId);
  const { applications, loading, error, reload, handleAccept, handleReject, handleViewCv } =
    useRecruiterApplications({ jobId });

  return (
    <RecruiterWorkspaceShell
      heading={job?.title ?? "Ứng viên"}
      subheading={
        job
          ? `Quản lý ứng viên cho tin tuyển dụng "${job.title}"`
          : "Chi tiết ứng viên theo công việc"
      }
      action={
        <Link href={RECRUITER_ROUTES.APPLICANTS}>
          <BaseButton variant="secondary" startIcon={<ArrowLeft className="h-4 w-4" />} size="sm">
            Tất cả ứng viên
          </BaseButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

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
