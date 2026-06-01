"use client";

import {
  CircleCheck,
  CircleX,
  Download,
  Eye,
} from "lucide-react";

import {
  EApplicationStatus,
} from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";

interface RecruiterApplicantRowProps {
  application: RecruiterApplicationApiItem;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewCv: (id: string) => void;
  showJobColumn?: boolean;
}

function getStatusLabel(status: EApplicationStatus): string {
  switch (status) {
    case EApplicationStatus.APPLIED:
      return "Mới ứng tuyển";
    case EApplicationStatus.REVIEWING:
      return "Đang xem";
    case EApplicationStatus.INTERVIEW:
      return "Phỏng vấn";
    case EApplicationStatus.REJECTED:
      return "Từ chối";
    case EApplicationStatus.OFFERED:
      return "Đã gửi offer";
    case EApplicationStatus.ACCEPTED:
      return "Đã nhận việc";
    case EApplicationStatus.WITHDRAWN:
      return "Đã rút";
  }
}

function getStatusClass(status: EApplicationStatus): string {
  switch (status) {
    case EApplicationStatus.APPLIED:
    case EApplicationStatus.REVIEWING:
      return "bg-warning/10 text-warning";
    case EApplicationStatus.INTERVIEW:
      return "bg-primary-soft text-primary";
    case EApplicationStatus.REJECTED:
      return "bg-error/10 text-error";
    case EApplicationStatus.OFFERED:
    case EApplicationStatus.ACCEPTED:
      return "bg-tertiary-fixed/20 text-tertiary";
    case EApplicationStatus.WITHDRAWN:
      return "bg-outline/10 text-on-surface-variant";
  }
}

export function RecruiterApplicantRow({
  application,
  onAccept,
  onReject,
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
                application.matchingScore != null && application.matchingScore >= 70
                  ? "#22c55e"
                  : application.matchingScore != null && application.matchingScore >= 40
                    ? "#eab308"
                    : "#ef4444"
              }
              strokeWidth="3"
              strokeDasharray={`${(application.matchingScore ?? 0) > 100 ? 100 : application.matchingScore ?? 0} 100`}
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
              {application.matchingScore != null
                ? `${Math.round(application.matchingScore)}%`
                : "N/A"}
            </text>
          </svg>
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
        {new Intl.DateTimeFormat("vi-VN").format(new Date(application.createdAt))}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewCv(application.id)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Xem CV"
          >
            <Eye className="h-4 w-4" />
          </button>
          {application.status === EApplicationStatus.APPLIED ||
          application.status === EApplicationStatus.REVIEWING ? (
            <>
              <button
                type="button"
                onClick={() => onAccept(application.id)}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-tertiary-fixed/20 hover:text-tertiary"
                title="Chấp nhận"
              >
                <CircleCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onReject(application.id)}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                title="Từ chối"
              >
                <CircleX className="h-4 w-4" />
              </button>
            </>
          ) : null}
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
