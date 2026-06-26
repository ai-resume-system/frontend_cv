"use client";

import { useState } from "react";
import {
  ArrowLeft,
  UsersRound,
  Eye,
  CircleX,
  Download,
  Calendar,
  Award,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import { StatusUpdateModal } from "./components/StatusUpdateModal";

function getStatusLabel(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "Mới ứng tuyển";
    case EJobApplicationStatus.INTERVIEW:
      return "Lịch phỏng vấn";
    case EJobApplicationStatus.REJECTED:
      return "Đã từ chối";
    case EJobApplicationStatus.ACCEPTED:
      return "Nhận việc";
    case EJobApplicationStatus.WITHDRAWN:
      return "Đã rút";
  }
}

function getStatusClass(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "bg-warning/15 text-warning";
    case EJobApplicationStatus.INTERVIEW:
      return "bg-primary-soft text-primary";
    case EJobApplicationStatus.REJECTED:
      return "bg-error/10 text-error";
    case EJobApplicationStatus.ACCEPTED:
      return "bg-tertiary-soft text-tertiary";
    case EJobApplicationStatus.WITHDRAWN:
      return "bg-outline/10 text-on-surface-variant";
  }
}

interface RecruiterApplicantsByJobPageProps {
  jobId: string;
}

export function RecruiterApplicantsByJobPage({
  jobId,
}: RecruiterApplicantsByJobPageProps) {
  const { jobs } = useRecruiterJobList();
  const job = jobs.find((j) => j.id === jobId);
  const { applications, loading, error, handleUpdateStatus, handleViewCv } =
    useRecruiterApplications({ jobId });

  const searchParams = useSearchParams();
  const backUrl = searchParams.get("backUrl") || RECRUITER_ROUTES.JOBS;

  const [page, setPage] = useState(1);
  const limit = 10;

  // State quản lý Modal cập nhật trạng thái
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplicationApiItem | null>(null);
  const [targetStatus, setTargetStatus] =
    useState<EJobApplicationStatus | null>(null);

  // Phân trang
  const startIndex = (page - 1) * limit;
  const pagedApplications = applications.slice(startIndex, startIndex + limit);

  // Định nghĩa các cột cho BaseTable
  const columns: BaseTableColumn<RecruiterApplicationApiItem>[] = [
    {
      key: "applicant",
      header: "Ứng viên",
      render: (app) => (
        <div>
          <p className="font-bold text-on-surface">
            {app.fullName ?? "Chưa có tên"}
          </p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {app.contactEmail ?? app.user?.email ?? ""}
          </p>
        </div>
      ),
    },
    {
      key: "matchingScore",
      header: "Độ phù hợp",
      render: (app) => (
        <div className="flex items-center gap-3">
          {app.matchingScore != null && app.matchingScore > 0 ? (
            <svg className="h-9 w-9 shrink-0" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={
                  app.matchingScore >= 70
                    ? "#10b981"
                    : app.matchingScore >= 40
                      ? "#eab308"
                      : "#ef4444"
                }
                strokeWidth="3"
                strokeDasharray={`${app.matchingScore > 100 ? 100 : app.matchingScore} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
              <text
                x="18"
                y="18"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] font-extrabold"
                fill="currentColor"
              >
                {Math.round(app.matchingScore)}%
              </text>
            </svg>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              Chưa có điểm
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (app) => (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(
            app.status,
          )}`}
        >
          {getStatusLabel(app.status)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày ứng tuyển",
      render: (app) =>
        new Intl.DateTimeFormat("vi-VN").format(new Date(app.createdAt)),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (app) => (
        <div className="flex items-center justify-end gap-2">
          {/* Nút Xem CV */}
          <button
            type="button"
            onClick={() => handleViewCv(app.id)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Xem CV"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* APPLIED: Lên lịch phỏng vấn / Từ chối */}
          {app.status === EJobApplicationStatus.APPLIED && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(app);
                  setTargetStatus(EJobApplicationStatus.INTERVIEW);
                }}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                title="Lên lịch phỏng vấn"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(app);
                  setTargetStatus(EJobApplicationStatus.REJECTED);
                }}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                title="Từ chối hồ sơ"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </>
          )}

          {/* INTERVIEW: Nhận việc / Từ chối */}
          {app.status === EJobApplicationStatus.INTERVIEW && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(app);
                  setTargetStatus(EJobApplicationStatus.ACCEPTED);
                }}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-tertiary-soft hover:text-tertiary cursor-pointer"
                title="Đồng ý tuyển - Nhận việc"
              >
                <UserCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(app);
                  setTargetStatus(EJobApplicationStatus.REJECTED);
                }}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error cursor-pointer"
                title="Từ chối hồ sơ"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Nút Tải CV */}
          {app.cv?.fileUrl && (
            <a
              href={app.cv.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-secondary-soft hover:text-secondary"
              title="Tải tệp CV"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <RecruiterWorkspaceShell
      heading={job?.title ?? "Ứng viên"}
      subheading={
        job
          ? `Quản lý ứng viên ứng tuyển vào chiến dịch tuyển dụng "${job.title}"`
          : "Chi tiết ứng viên theo chiến dịch tuyển dụng"
      }
      action={
        <Link href={backUrl}>
          <BaseButton
            variant="secondary"
            startIcon={<ArrowLeft className="h-4 w-4" />}
            size="sm"
          >
            Quay lại
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

        <BaseTable
          columns={columns}
          data={pagedApplications}
          loading={loading}
          emptyMessage="Hiện tại chưa có ứng viên nào ứng tuyển cho vị trí này."
          pagination={{
            page,
            limit,
            total: applications.length,
            totalPages: Math.ceil(applications.length / limit),
            onPageChange: (newPage) => setPage(newPage),
          }}
        />

        <StatusUpdateModal
          isOpen={Boolean(selectedApplication && targetStatus)}
          onClose={() => {
            setSelectedApplication(null);
            setTargetStatus(null);
          }}
          candidateName={selectedApplication?.fullName ?? ""}
          targetStatus={targetStatus}
          onConfirm={async (payload) => {
            if (selectedApplication) {
              await handleUpdateStatus(selectedApplication.id, payload);
            }
          }}
        />
      </div>
    </RecruiterWorkspaceShell>
  );
}
