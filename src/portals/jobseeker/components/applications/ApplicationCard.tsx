"use client";

import { Calendar, MoreHorizontal, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import { ROUTES } from "@/shared/constants/constants/routes";
import type { JobSeekerApplicationApiItem } from "@/shared/types/application";
import { cn } from "@/shared/lib/utils/cn";

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

// Hàm lấy thông tin text của status
function getStatusLabel(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "ĐANG CHỜ";
    case EJobApplicationStatus.REVIEWING:
      return "ĐANG XEM XÉT";
    case EJobApplicationStatus.INTERVIEW:
      return "PHỎNG VẤN";
    case EJobApplicationStatus.REJECTED:
      return "TỪ CHỐI";
    case EJobApplicationStatus.OFFERED:
      return "ĐỀ NGHỊ";
    case EJobApplicationStatus.ACCEPTED:
      return "NHẬN VIỆC";
    case EJobApplicationStatus.WITHDRAWN:
      return "ĐÃ RÚT";
    default:
      return "ĐANG XỬ LÝ";
  }
}

// Hàm lấy classes màu sắc cho status badge
function getStatusBadgeClass(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "bg-amber-100 text-amber-700 border border-amber-200 text-xs py-0.5 px-2.5 font-bold";
    case EJobApplicationStatus.REVIEWING:
      return "bg-sky-100 text-sky-700 border border-sky-200 text-xs py-0.5 px-2.5 font-bold";
    case EJobApplicationStatus.INTERVIEW:
      return "bg-blue-100 text-blue-700 border border-blue-200 text-xs py-0.5 px-2.5 font-bold";
    case EJobApplicationStatus.REJECTED:
      return "bg-red-100 text-red-700 border border-red-200 text-xs py-0.5 px-2.5 font-bold";
    case EJobApplicationStatus.OFFERED:
    case EJobApplicationStatus.ACCEPTED:
      return "bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs py-0.5 px-2.5 font-bold";
    case EJobApplicationStatus.WITHDRAWN:
      return "bg-slate-100 text-slate-500 border border-slate-200 text-xs py-0.5 px-2.5 font-bold";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200 text-xs py-0.5 px-2.5 font-bold";
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
  const address = job?.address ?? "Đang cập nhật";

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

  // Chỉ cho phép rút đơn khi ở trạng thái APPLIED
  const canWithdraw = status === EJobApplicationStatus.APPLIED;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <div>
        {/* Header: Logo & Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
            <img
              src={company?.logoUrl ?? "/logo.png"}
              alt={companyName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
          <Badge className={getStatusBadgeClass(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>

        {/* Content: Title & Company info */}
        <div className="mt-5">
          <Link
            href={job?.slug ? ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug) : "#"}
            className="line-clamp-1 text-base font-bold text-slate-800 hover:text-primary transition-colors"
          >
            {jobTitle}
          </Link>
          <p className="mt-1 line-clamp-1 text-sm font-semibold uppercase text-slate-400">
            {companyName}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[150px]">{address}</span>
            </div>

            {matchingScore !== null && matchingScore !== undefined && (
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 fill-emerald-100" />
                <span>AI Match: {matchingScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Info */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Đã ứng tuyển: {formatAppliedDate(createdAt)}</span>
        </div>
      </div>

      {/* Footer: Action Buttons */}
      <div className="mt-6 flex items-center gap-3">
        {/* Nút hành động chính */}
        {status === EJobApplicationStatus.INTERVIEW ? (
          <BaseButton
            variant="primary"
            size="sm"
            onClick={() => onViewInterviewDetails(application)}
            className="flex-1 rounded-2xl text-xs font-bold"
          >
            Xem tiến trình
          </BaseButton>
        ) : status === EJobApplicationStatus.OFFERED ? (
          <BaseButton
            variant="ai"
            size="sm"
            href={job?.slug ? ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug) : "#"}
            className="flex-1 rounded-2xl text-xs font-bold"
          >
            Xem đề nghị
          </BaseButton>
        ) : (
          <BaseButton
            variant="secondary"
            size="sm"
            href={job?.slug ? ROUTES.JOB_SEEKER_JOB_DETAIL(job.slug) : "#"}
            className="flex-1 rounded-2xl text-xs font-bold"
          >
            Chi tiết công việc
          </BaseButton>
        )}

        {/* Nút Rút đơn & Dropdown Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20",
              isMenuOpen && "bg-slate-100 text-slate-800"
            )}
            type="button"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute bottom-full right-0 z-50 mb-2 w-40 origin-bottom-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                disabled={!canWithdraw}
                onClick={() => {
                  onWithdraw(application.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                  canWithdraw
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-300 cursor-not-allowed"
                )}
                type="button"
                title={!canWithdraw ? "Chỉ có thể rút đơn khi đang chờ duyệt" : undefined}
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
