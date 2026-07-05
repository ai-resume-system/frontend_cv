"use client";

import { useState } from "react";
import {
  UsersRound,
  Eye,
  CircleX,
  Calendar,
  Award,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseSearch } from "@/shared/components/ui/BaseSearch";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import { StatusUpdateModal } from "./components/StatusUpdateModal";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";

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
      return "bg-tertiary-fixed/20 text-tertiary";
    case EJobApplicationStatus.WITHDRAWN:
      return "bg-outline/10 text-on-surface-variant";
  }
}

export function RecruiterApplicantsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(
    undefined,
  );
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EJobApplicationStatus | "">("");
  const [sortBy, setSortBy] = useState<"createdAt" | "matchingScore">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { jobs } = useRecruiterJobList();
  const {
    applications,
    totalItems,
    totalPages,
    loading,
    error,
    handleUpdateStatus,
  } = useRecruiterApplications({
    jobId: selectedJobId,
    status: status || undefined,
    q: q || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  // Reset page khi thay đổi bộ lọc công việc
  const handleJobFilterChange = (jobId: string | undefined) => {
    setSelectedJobId(jobId);
    setPage(1);
  };

  // State quản lý Modal cập nhật trạng thái
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplicationApiItem | null>(null);
  const [targetStatus, setTargetStatus] =
    useState<EJobApplicationStatus | null>(null);

  // State quản lý Modal chi tiết
  const [selectedAppForDetail, setSelectedAppForDetail] =
    useState<RecruiterApplicationApiItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
      key: "job",
      header: "Công việc",
      render: (app) => (
        <span className="text-sm text-on-surface-variant font-medium">
          {app.job?.title ?? "---"}
        </span>
      ),
    },
    {
      key: "matchingScore",
      header: "Độ phù hợp",
      sortable: true,
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
      sortable: true,
      render: (app) => (
        <span className="text-xs text-on-surface-variant font-medium">
          {new Intl.DateTimeFormat("vi-VN").format(new Date(app.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (app) => (
        <div className="flex items-center justify-end gap-2">
          {/* Nút Xem Chi Tiết */}
          <button
            type="button"
            onClick={() => {
              setSelectedAppForDetail(app);
              setIsDetailOpen(true);
            }}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary cursor-pointer"
            title="Xem chi tiết đơn ứng tuyển"
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
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary cursor-pointer"
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
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error cursor-pointer"
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
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-tertiary-fixed/20 hover:text-on-tertiary-fixed-variant cursor-pointer"
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
        </div>
      ),
    },
  ];

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    if (key === "matchingScore" || key === "createdAt") {
      setSortBy(key);
      setSortOrder(order);
      setPage(1);
    }
  };

  return (
    <RecruiterWorkspaceShell
      heading="Danh sách ứng viên ứng tuyển"
      subheading="Quản lý và theo dõi các ứng viên đã ứng tuyển vào các tin tuyển dụng"
      action={
        selectedJobId ? (
          <Link href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(selectedJobId)}>
            <BaseButton variant="secondary" size="sm">
              Xem chi tiết chiến dịch
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

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-outline-variant/15">
          <div className="w-full md:w-72">
            <BaseSearch
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setQ("");
                setPage(1);
              }}
              placeholder="Tìm kiếm ứng viên..."
            />
          </div>

          {/* Lọc Trạng thái */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(1);
            }}
            className="w-full sm:w-auto rounded-2xl border border-outline-variant/35 bg-surface px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none transition-all duration-200 outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={EJobApplicationStatus.APPLIED}>Mới ứng tuyển</option>
            <option value={EJobApplicationStatus.INTERVIEW}>
              Lịch phỏng vấn
            </option>
            <option value={EJobApplicationStatus.ACCEPTED}>Nhận việc</option>
            <option value={EJobApplicationStatus.REJECTED}>Đã từ chối</option>
          </select>
        </div>

        <BaseTable
          columns={columns}
          data={applications}
          loading={loading}
          emptyMessage="Chưa có ứng viên nào khớp với bộ lọc tìm kiếm."
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={{
            page,
            limit,
            total: totalItems,
            totalPages: totalPages,
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

        <ApplicationDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedAppForDetail(null);
          }}
          application={selectedAppForDetail}
        />
      </div>
    </RecruiterWorkspaceShell>
  );
}
