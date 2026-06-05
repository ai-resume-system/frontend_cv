"use client";

import {
  Copy,
  Download,
  Edit2,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Share2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { PROCESSING_STATUS_CONFIG } from "@/shared/constants/enums/cv.enum";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";

// ==================== 1. UTILITY: FORMAT DATE ====================
export function formatDateTime(value?: Date | string | null): string {
  if (!value) return "Đang cập nhật";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==================== COMPONENT: CV CARD (GRID) ====================
interface CvCardProps {
  cv: CvItem;
  isPreviewing: boolean;
  isDownloading: boolean;
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, isDefault: boolean) => void;
  onRenameOpen: (id: string, currentTitle: string) => void;
  onCopyLink: (id: string) => void;
  onNavigateToAnalysis: (id: string, status: string) => void;
}

export function CvCard({
  cv,
  isPreviewing,
  isDownloading,
  isMenuOpen,
  onMenuToggle,
  onCloseMenu,
  onPreview,
  onDownload,
  onDelete,
  onSetDefault,
  onRenameOpen,
  onCopyLink,
  onNavigateToAnalysis,
}: CvCardProps) {
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;

  // Xử lý logic định dạng file để đổi màu Badge tương ứng
  const fileExt = (cv.fileExtension?.replace(".", "") || "PDF").toUpperCase();
  const isDoc = fileExt === "DOC" || fileExt === "DOCX";

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = () => onCloseMenu();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-300 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div
        className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100/70 flex items-center justify-center border border-slate-100 cursor-pointer"
        onClick={() => onPreview(cv.id)}
      >
        <div className="flex flex-col items-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
          <div className="relative flex h-16 w-20 items-center justify-center rounded-xl">
            <FileText className={cn("h-30 w-30 text-slate-400")} />
            <div
              className={cn(
                "absolute -right-1.5 -bottom-2 flex items-center justify-center rounded-md px-1.5 py-0.5 text-[12px] font-bold text-white shadow-sm uppercase transition-colors",
                isDoc ? "bg-blue-400" : "bg-orange-400",
              )}
            >
              {fileExt}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(cv.id, !cv.isDefault);
          }}
          className={cn(
            "absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer",
            cv.isDefault
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-600",
          )}
          title={cv.isDefault ? "Hồ sơ mặc định" : "Đặt làm mặc định"}
          type="button"
        >
          <Star className={cn("h-6 w-6", cv.isDefault && "fill-amber-400")} />
        </button>

        <div
          className={cn(
            "absolute inset-0 bg-slate-900/15 flex items-end justify-center gap-2.5 pb-3 rounded-2xl transition-all duration-300",
            isMenuOpen
              ? "opacity-100 visible z-10"
              : "opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10",
          )}
        >
          {/* <button
            onClick={() => onPreview(cv.id)}
            disabled={isPreviewing}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:opacity-60 active:scale-95 cursor-pointer"
            type="button"
          >
            {isPreviewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button> */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(cv.id);
            }}
            disabled={isDownloading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:opacity-60 active:scale-95 cursor-pointer"
            title="Tải về"
            type="button"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>

          {/* Nút Thao tác khác (...) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(e);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              title="Thao tác khác"
              type="button"
            >
              <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {/* Dropdown Menu (Hiển thị phía trên nút bấm một chút) */}
            {isMenuOpen && (
              <div className="absolute right-0 bottom-11 z-20 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyLink(cv.id);
                    onCloseMenu();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  type="button"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  Sao chép liên kết
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameOpen(cv.id, cv.title || "");
                    onCloseMenu();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  type="button"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                  Đổi tên
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cv.id);
                    onCloseMenu();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-error hover:bg-error-container/20 cursor-pointer"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5 text-error" />
                  Xóa hồ sơ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col flex-1 gap-4">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-bold leading-tight text-slate-800 line-clamp-1 flex-1"
            title={cv.title || ""}
          >
            {cv.title ?? "Hồ sơ không tên"}
          </h4>

          <button
            onClick={() => onNavigateToAnalysis(cv.id, processingStatus)}
            disabled={processingStatus === "processing"}
            className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition disabled:opacity-50 cursor-pointer"
            title="Xem kết quả phân tích hồ sơ"
            type="button"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm text-slate-500">
            Cập nhật: {formatDateTime(cv.updatedAt)}
          </span>
          <Badge
            className={cn(
              "bg-transparent border px-2 py-0.5 text-xs font-bold uppercase",
              statusConfig.className,
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </article>
  );
}
