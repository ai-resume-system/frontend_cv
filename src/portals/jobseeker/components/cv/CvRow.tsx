"use client";

import {
  Download,
  Edit2,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { PROCESSING_STATUS_CONFIG } from "@/shared/constants/enums/cv.enum";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";
import { formatDateTime } from "./CvCard";
import { Badge } from "@/shared/components/ui/Badge";

// ==================== COMPONENT: CV ROW (LIST) ====================
interface CvRowProps {
  cv: CvItem;
  isPreviewing: boolean;
  isDownloading: boolean;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, isDefault: boolean) => void;
  onRenameOpen: (id: string, currentTitle: string) => void;
  onNavigateToAnalysis: (id: string, status: string) => void;
}

export function CvRow({
  cv,
  isPreviewing,
  isDownloading,
  onPreview,
  onDownload,
  onDelete,
  onSetDefault,
  onRenameOpen,
  onNavigateToAnalysis,
}: CvRowProps) {
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;

  // Xử lý logic định dạng file để đổi màu Badge tương ứng
  const fileExt = (cv.fileExtension?.replace(".", "") || "PDF").toUpperCase();
  const isDoc = fileExt === "DOC" || fileExt === "DOCX";

  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:translate-x-0.5 hover:border-primary/50 hover:shadow-[0_8px_16px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <FileText className="h-15 w-15 text-slate-400" />
            <div
              className={cn(
                "absolute flex items-center justify-center rounded-md px-4 py-0.5 text-[10px] font-bold text-white uppercase transition-colors",
                isDoc ? "bg-blue-400" : "bg-orange-400",
              )}
            >
              {fileExt}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className="font-bold text-slate-800 truncate"
                title={cv.title || ""}
              >
                {cv.title ?? "Hồ sơ không tên"}
              </h4>
              {cv.isDefault && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  Mặc định
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>Cập nhật: {formatDateTime(cv.updatedAt)}</span>
              <Badge
                className={cn(
                  "bg-transparent border px-1 py-0.5 text-xs font-bold uppercase rounded-md!",
                  statusConfig.className,
                )}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end shrink-0">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Mặc định
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={cv.isDefault ?? false}
                onChange={() => onSetDefault(cv.id, !cv.isDefault)}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
            </label>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
            <button
              onClick={() => onNavigateToAnalysis(cv.id, processingStatus)}
              disabled={processingStatus === "processing"}
              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Phân tích CV bằng AI"
              type="button"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => onPreview(cv.id)}
              disabled={isPreviewing}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 disabled:opacity-50  cursor-pointer"
              title="Xem CV"
              type="button"
            >
              {isPreviewing ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>

            <button
              onClick={() => onDownload(cv.id)}
              disabled={isDownloading}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 disabled:opacity-50  cursor-pointer"
              title="Tải xuống"
              type="button"
            >
              {isDownloading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Download className="h-4.5 w-4.5" />
              )}
            </button>

            <button
              onClick={() => onRenameOpen(cv.id, cv.title || "")}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95  cursor-pointer"
              title="Đổi tên"
              type="button"
            >
              <Edit2 className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={async () => {
                setIsDeleting(true);
                await onDelete(cv.id);
                setIsDeleting(false);
              }}
              disabled={isDeleting}
              className="rounded-lg p-2 text-error transition-colors hover:bg-error-container/20 active:scale-95 disabled:opacity-50  cursor-pointer"
              title="Xóa"
              type="button"
            >
              {isDeleting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Trash2 className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
