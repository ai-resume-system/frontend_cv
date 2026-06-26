"use client";

import { Calendar, MoreHorizontal, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import {
  EJobApplicationStatus,
  EJobApplicationStatusLabels,
} from "@/shared/constants/enums/job-application.enum";
import { ROUTES } from "@/shared/constants/constants/routes";
import type { JobSeekerApplicationApiItem } from "@/shared/types/application";
import { cn } from "@/shared/lib/utils/cn";
import { formatBriefAddress } from "@/shared/lib/utils/formatAddress";

interface ApplicationCardProps {
  application: JobSeekerApplicationApiItem;
  onWithdraw: (id: string) => void;
  onViewInterviewDetails: (app: JobSeekerApplicationApiItem) => void;
}

// Hàm format ngày ứng tuyển: "12 Th04, 2024"
function formatAppliedDate(dateStr?: string | null): string {
  if (!dateStr) return "Đang cập nhật";
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} Th${month}, ${year}`;
  } catch {
    return "Đang cập nhật";
  }
}

// Hàm format lịch hẹn thu gọn hiển thị trên card: "08:30 - Thứ Ba, 30/06"
function formatInterviewCompact(timeStr?: string | null): string {
  if (!timeStr) return "Đang cập nhật";
  try {
    const date = new Date(timeStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const weekday = weekdays[date.getDay()];
    return `${hours}:${minutes} - ${weekday}, ${day}/${month}`;
  } catch {
    return "Đang cập nhật";
  }
}

// Hàm lấy classes màu sắc cho status badge
function getStatusBadgeClass(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "bg-amber-100 text-amber-900 border border-amber-300 text-xs py-0.5 px-3 font-bold rounded-full";
    case EJobApplicationStatus.INTERVIEW:
      return "bg-blue-100 text-blue-900 border border-blue-300 text-xs py-0.5 px-3 font-bold rounded-full";
    case EJobApplicationStatus.REJECTED:
      return "bg-red-100 text-red-950 border border-red-300 text-xs py-0.5 px-3 font-bold rounded-full";
    case EJobApplicationStatus.ACCEPTED:
      return "bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs py-0.5 px-3 font-bold rounded-full";
    case EJobApplicationStatus.WITHDRAWN:
      return "bg-slate-100 text-slate-700 border border-slate-300 text-xs py-0.5 px-3 font-bold rounded-full";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300 text-xs py-0.5 px-3 font-bold rounded-full";
  }
}

export function ApplicationCard({
  application,
  onWithdraw,
  onViewInterviewDetails,
}: ApplicationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { job, status, matchingScore, createdAt } = application;
  const company = job?.company;
  const jobTitle = job?.title ?? "Vị trí tuyển dụng";
  const companyName = company?.name ?? "Doanh nghiệp tuyển dụng";
  const address = formatBriefAddress(job?.address);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chỉ cho phép rút đơn khi đơn vẫn ở trạng thái vừa ứng tuyển.
  const canWithdraw = status === EJobApplicationStatus.APPLIED;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-300 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <div>
        {/* Header: Logo & Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <img
              src={company?.logoUrl ?? "/logo.png"}
              alt={companyName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
          <Badge
            className={cn(
              getStatusBadgeClass(status),
              "uppercase tracking-wider shadow-xs",
            )}
          >
            {EJobApplicationStatusLabels[status]}
          </Badge>
        </div>

        {/* Content: Title & Company info */}
        <div className="mt-5">
          <Link
            href={job?.slug ? ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug) : "#"}
            className="line-clamp-1 text-lg font-extrabold text-slate-900 hover:text-primary transition-colors duration-200"
          >
            {jobTitle}
          </Link>
          <p className="mt-1.5 line-clamp-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            {companyName}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate max-w-37.5">{address}</span>
            </Badge>

            {matchingScore !== null &&
            matchingScore !== undefined &&
            matchingScore > 0 ? (
              <Badge className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl px-2.5 py-1 shadow-2xs">
                <span>Phù hợp {matchingScore}%</span>
              </Badge>
            ) : (
              <Badge className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-350 rounded-xl px-2.5 py-1 shadow-2xs">
                <span>Chưa có điểm phù hợp</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Date Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Đã ứng tuyển: {formatAppliedDate(createdAt)}</span>
          </div>

          {status === EJobApplicationStatus.INTERVIEW &&
            application.scheduleTime && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Lịch phỏng vấn sắp tới
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs font-extrabold text-blue-950">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    {formatInterviewCompact(application.scheduleTime)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {application.scheduleLink ? (
                    <span>Phỏng vấn trực tuyến (Online)</span>
                  ) : (
                    <span>Phỏng vấn trực tiếp (Offline)</span>
                  )}
                </p>
                {application.interviewNotes && (
                  <div className="mt-2 pt-2 border-t border-blue-250/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Lời nhắn từ nhà tuyển dụng:
                    </p>
                    <div
                      className="text-[11px] text-slate-700 prose prose-sm max-w-none wrap-break-words max-h-20 overflow-y-auto custom-scroll pr-1"
                      dangerouslySetInnerHTML={{
                        __html: application.interviewNotes,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

          {status === EJobApplicationStatus.ACCEPTED &&
            application.onboardingNotes && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  Dặn dò chuẩn bị đi làm:
                </p>
                <div
                  className="text-[11px] text-emerald-950 prose prose-sm max-w-none wrap-break-words max-h-20 overflow-y-auto custom-scroll pr-1"
                  dangerouslySetInnerHTML={{
                    __html: application.onboardingNotes,
                  }}
                />
              </div>
            )}

          {status === EJobApplicationStatus.REJECTED &&
            application.rejectionReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-3 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">
                  Phản hồi từ nhà tuyển dụng:
                </p>
                <div
                  className="text-[11px] text-red-950 prose prose-sm max-w-none wrap-break-words max-h-20 overflow-y-auto custom-scroll pr-1"
                  dangerouslySetInnerHTML={{
                    __html: application.rejectionReason,
                  }}
                />
              </div>
            )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {status === EJobApplicationStatus.INTERVIEW ? (
          <BaseButton
            variant="primary"
            size="sm"
            onClick={() => onViewInterviewDetails(application)}
            className="flex-1 rounded-2xl text-xs font-bold"
          >
            Xem lịch phỏng vấn
          </BaseButton>
        ) : (
          <BaseButton
            variant="primary"
            size="sm"
            href={job?.slug ? ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug) : "#"}
            className="flex-1"
          >
            Chi tiết công việc
          </BaseButton>
        )}

        {/* Nút Rút đơn & Dropdown Menu */}
        <div ref={menuRef} className="relative">
          <BaseButton
            variant="secondary"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "w-10 p-0 flex items-center justify-center rounded-2xl border border-slate-350 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20",
              isMenuOpen && "bg-slate-100 text-slate-900 border-slate-450",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
          </BaseButton>

          {isMenuOpen && (
            <div className="absolute bottom-full right-0 z-50 mb-2 w-44 origin-bottom-right rounded-2xl border border-slate-300 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                disabled={!canWithdraw}
                onClick={() => {
                  onWithdraw(application.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer",
                  canWithdraw
                    ? "text-red-700 hover:bg-red-50"
                    : "text-slate-400 cursor-not-allowed",
                )}
                type="button"
                title={
                  !canWithdraw
                    ? "Chỉ có thể rút đơn khi chưa có lịch hẹn phỏng vấn"
                    : undefined
                }
              >
                Rút đơn ứng tuyển
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
