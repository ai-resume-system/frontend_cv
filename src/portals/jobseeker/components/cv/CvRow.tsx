"use client";

import {
  Copy,
  Download,
  Edit2,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PROCESSING_STATUS_CONFIG } from "@/shared/constants/enums/cv.enum";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";
import { formatDateTime } from "./CvCard";
import { Badge } from "@/shared/components/ui/Badge";
import { BaseButton } from "@/shared/components/ui/BaseButton";

// ==================== COMPONENT: CV ROW (LIST) ====================
interface CvRowProps {
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

export function CvRow({
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
}: CvRowProps) {
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;

  // Xử lý logic định dạng file để đổi màu Badge tương ứng
  const fileExt = (cv.fileExtension?.replace(".", "") || "PDF").toUpperCase();
  const isDoc = fileExt === "DOC" || fileExt === "DOCX";

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = () => onCloseMenu();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-300 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:translate-x-0.5 hover:border-primary/50 hover:shadow-[0_8px_16px_rgba(15,23,42,0.05)]",
        isMenuOpen ? "z-40" : "z-10",
      )}
    >
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
            <h4
              className="flex flex-wrap items-center font-bold text-slate-800 truncate"
              title={cv.title || ""}
            >
              {cv.title ?? "Hồ sơ không tên"}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400 font-medium">
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

        <div className="flex w-full flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0 sm:w-auto sm:justify-end sm:gap-4 shrink-0">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
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

          {/* Wrapper cho Nút và các Icon để không bị rớt dòng trên di động */}
          <div className="flex items-center gap-3">
            {/* Nút phân tích */}
            <div className="flex items-center shrink-0">
              {processingStatus === "completed" ? (
                <div className="flex gap-1.5">
                  <BaseButton
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      onNavigateToAnalysis(cv.id, processingStatus)
                    }
                    className="px-2.5 h-8 text-[11px] font-bold rounded-lg transition cursor-pointer"
                    type="button"
                  >
                    Xem kết quả
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigateToAnalysis(cv.id, "pending")}
                    className="px-2.5 h-8 text-[11px] font-bold border-primary text-primary hover:bg-primary/15 rounded-lg transition cursor-pointer"
                    title="Phân tích lại"
                    type="button"
                  >
                    Phân tích lại
                  </BaseButton>
                </div>
              ) : (
                <BaseButton
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateToAnalysis(cv.id, processingStatus)}
                  disabled={processingStatus === "processing"}
                  className="px-2.5 h-8 text-[11px] font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition cursor-pointer"
                  type="button"
                >
                  {processingStatus === "processing"
                    ? "Đang phân tích..."
                    : "Phân tích"}
                </BaseButton>
              )}
            </div>

            {/* Đường phân cách */}
            <div className="h-5 w-px bg-gray-300 shrink-0" />

            {/* Các Icon thao tác */}
            <div className="flex items-center justify-end gap-1 shrink-0">
              <button
                onClick={() => onPreview(cv.id)}
                disabled={isPreviewing}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Xem hồ sơ"
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
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Tải xuống"
                type="button"
              >
                {isDownloading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Download className="h-4.5 w-4.5" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuToggle(e);
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Thao tác khác"
                  type="button"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-gray-300 bg-white py-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
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
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsDeleting(true);
                        await onDelete(cv.id);
                        setIsDeleting(false);
                        onCloseMenu();
                      }}
                      disabled={isDeleting}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-error hover:bg-error-container/20 cursor-pointer"
                      type="button"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-error" />
                      )}
                      Xóa hồ sơ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
