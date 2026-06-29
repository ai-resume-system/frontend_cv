"use client";

import {
  CircleX,
  Download,
  Eye,
  Calendar,
  Award,
  UserCheck,
} from "lucide-react";

import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";

interface RecruiterApplicantRowProps {
  application: RecruiterApplicationApiItem;
  onUpdateStatusClick: (
    application: RecruiterApplicationApiItem,
    targetStatus: EJobApplicationStatus,
  ) => void;
  onViewCv: (id: string) => void;
  showJobColumn?: boolean;
}

function getStatusLabel(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "Mới ứng tuyển";
    case EJobApplicationStatus.INTERVIEW:
      return "Lịch phỏng vấn";
    case EJobApplicationStatus.REJECTED:
      return "Đã từ chối";
    case EJobApplicationStatus.ACCEPTED:
      return "Đã nhận việc";
    case EJobApplicationStatus.WITHDRAWN:
      return "Đã rút";
  }
}

function getStatusClass(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "bg-warning/10 text-warning";
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

export function RecruiterApplicantRow({
  application,
  onUpdateStatusClick,
  onViewCv,
  showJobColumn = false,
}: RecruiterApplicantRowProps) {
  return (
    <tr className="border-b border-outline-variant/10 transition hover:bg-surface-container-low/40">
      <td className="px-6 py-4">
        <p className="font-semibold text-on-surface">
          {application.fullName ?? "Chưa có tên"}
        </p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {application.contactEmail ?? application.user?.email ?? ""}
        </p>
      </td>
      {showJobColumn ? (
        <td className="px-6 py-4 text-sm text-on-surface-variant">
          {application.job?.title ?? "---"}
        </td>
      ) : null}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {application.matchingScore != null &&
          application.matchingScore > 0 ? (
            <svg className="h-10 w-10 shrink-0" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={
                  application.matchingScore >= 70
                    ? "#22c55e"
                    : application.matchingScore >= 40
                      ? "#eab308"
                      : "#ef4444"
                }
                strokeWidth="3"
                strokeDasharray={`${application.matchingScore > 100 ? 100 : application.matchingScore} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
              <text
                x="18"
                y="18"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] font-bold"
                fill="currentColor"
              >
                {Math.round(application.matchingScore)}%
              </text>
            </svg>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              Chưa có điểm
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}
        >
          {getStatusLabel(application.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-on-surface-variant">
        {new Intl.DateTimeFormat("vi-VN").format(
          new Date(application.createdAt),
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Nút Xem CV */}
          <button
            type="button"
            onClick={() => onViewCv(application.id)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Xem CV"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* APPLIED: Lên lịch phỏng vấn / Từ chối */}
          {application.status === EJobApplicationStatus.APPLIED && (
            <>
              <button
                type="button"
                onClick={() =>
                  onUpdateStatusClick(
                    application,
                    EJobApplicationStatus.INTERVIEW,
                  )
                }
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                title="Lên lịch phỏng vấn"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateStatusClick(
                    application,
                    EJobApplicationStatus.REJECTED,
                  )
                }
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                title="Từ chối hồ sơ"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </>
          )}

          {/* INTERVIEW: Nhận việc / Từ chối */}
          {application.status === EJobApplicationStatus.INTERVIEW && (
            <>
              <button
                type="button"
                onClick={() =>
                  onUpdateStatusClick(
                    application,
                    EJobApplicationStatus.ACCEPTED,
                  )
                }
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-tertiary-fixed/20 hover:text-on-tertiary-fixed-variant"
                title="Đồng ý tuyển - Nhận việc"
              >
                <UserCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateStatusClick(
                    application,
                    EJobApplicationStatus.REJECTED,
                  )
                }
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                title="Từ chối hồ sơ"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Nút Tải CV */}
          {application.cv?.fileUrl ? (
            <a
              href={application.cv.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-secondary-soft hover:text-secondary"
              title="Tải CV"
            >
              <Download className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
