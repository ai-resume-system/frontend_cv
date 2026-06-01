"use client";

import {
  Download,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { JOBSEEKER_ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";

const PROCESSING_STATUS_CONFIG = {
  pending: {
    label: "Chưa phân tích",
    className: "bg-surface-container-highest text-on-surface-variant",
  },
  processing: {
    label: "Đang xử lý...",
    className: "bg-secondary-fixed text-primary",
  },
  completed: {
    label: "Đã xử lý",
    className: "bg-[#6ffbbe]/30 text-[#005236]",
  },
  failed: {
    label: "Lỗi phân tích",
    className: "bg-error-container text-error",
  },
} as const;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;

interface CvItemRowProps {
  cv: CvItem;
  isDownloading: boolean;
  isPreviewing: boolean;
  onNavigateToAnalysis: (id: string, status: string) => void;
  onDelete: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
  onPreview: (id: string) => Promise<void>;
}

function CvItemRow({
  cv,
  isDownloading,
  isPreviewing,
  onNavigateToAnalysis,
  onDelete,
  onDownload,
  onPreview,
}: CvItemRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;

  const uploadDate = new Date(cv.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  async function handleDelete() {
    setIsDeleting(true);
    await onDelete(cv.id);
    setIsDeleting(false);
  }

  function handleAnalysisAction() {
    onNavigateToAnalysis(cv.id, processingStatus);
  }

  return (
    <div className="rounded-xl border border-transparent bg-surface-container-lowest p-5 shadow-sm transition-all duration-300 hover:translate-x-0.5 hover:border-muted-foreground/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              processingStatus === "completed"
                ? "bg-secondary-fixed"
                : "bg-surface-container-highest",
            )}
          >
            <FileText
              className={cn(
                "h-6 w-6",
                processingStatus === "completed" ? "text-primary" : "text-on-surface-variant",
              )}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold leading-tight text-on-surface">
                {cv.title ?? "CV không tên"}
              </h4>
              {cv.isDefault ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                  Mặc định
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-xs text-on-surface-variant">
                Tải lên: {uploadDate}
              </span>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                  statusConfig.className,
                )}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            disabled={isPreviewing}
            onClick={() => void onPreview(cv.id)}
            title="Xem CV"
            type="button"
          >
            {isPreviewing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          <button
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            disabled={isDownloading}
            onClick={() => void onDownload(cv.id)}
            title="Tải xuống"
            type="button"
          >
            {isDownloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </button>
          <button
            className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            disabled={processingStatus === "processing"}
            onClick={() => void handleAnalysisAction()}
            title="Phân tích CV bằng AI"
            type="button"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 text-error transition-colors hover:bg-error-container disabled:opacity-50"
            disabled={isDeleting}
            onClick={handleDelete}
            title="Xóa"
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CvPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    cvList,
    isLoading,
    isUploading,
    isPreviewingCvId,
    isDownloadingCvId,
    loadError,
    uploadError,
    actionError,
    handleUpload,
    handleDelete,
    handlePreview,
    handleDownload,
  } = useCvList();

  function handleNavigateToAnalysis(id: string, status: string) {
    if (status === "completed") {
      router.push(JOBSEEKER_ROUTES.ANALYSIS_RESULT(id));
    } else {
      router.push(`${JOBSEEKER_ROUTES.ANALYSIS_PROCESS}?cvId=${id}`);
    }
  }

  const completedCount = cvList.filter(
    (cv) => cv.processingStatus === "completed",
  ).length;

  function validateAndUpload(file: File) {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Chỉ chấp nhận file PDF hoặc DOCX.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    void handleUpload(file);
  }

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        validateAndUpload(file);
      }
      event.target.value = "";
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        validateAndUpload(file);
      }
    },
    [handleUpload],
  );

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <section className="mb-12">
        <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Hồ sơ cá nhân
        </span>
        <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
          Kho hồ sơ của bạn
        </h1>
        <p className="max-w-2xl leading-relaxed text-on-surface-variant">
          Quản lý và tối ưu hóa các phiên bản CV của bạn với sự hỗ trợ từ trí
          tuệ nhân tạo. Đảm bảo bạn luôn sẵn sàng cho cơ hội tiếp theo.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="rounded-xl bg-surface-container-low p-8 transition-all duration-300 hover:shadow-lg md:col-span-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Tải lên CV mới
            </h2>
            <span className="rounded-full bg-surface-container-highest px-3 py-1 text-xs text-on-surface-variant">
              PDF, DOCX (Tối đa {MAX_FILE_SIZE_MB}MB)
            </span>
          </div>

          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 bg-surface-container-lowest/50 hover:border-primary",
              isUploading && "pointer-events-none opacity-70",
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-fixed">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <UploadCloud className="h-8 w-8 text-primary" />
              )}
            </div>
            <p className="mb-1 text-lg font-semibold text-on-surface">
              {isUploading ? "Đang tải lên..." : "Kéo và thả tệp tại đây"}
            </p>
            <p className="mb-6 text-sm text-on-surface-variant">
              Hoặc nhấp để chọn tệp từ máy tính
            </p>
            <button
              className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-60"
              disabled={isUploading}
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              type="button"
            >
              Chọn tệp ngay
            </button>
          </div>

          <input
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          {(fileError ?? uploadError ?? actionError) ? (
            <p className="mt-3 text-sm text-error">
              {fileError ?? uploadError ?? actionError}
            </p>
          ) : null}
        </div>

        <div className="space-y-6 md:col-span-4">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6">
            <div className="absolute top-4 right-4 opacity-10">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <h3 className="mb-4 font-display text-lg font-bold text-on-surface">
              AI Insight
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 animate-pulse rounded-full bg-surface-container" />
                <div className="h-2 animate-pulse rounded-full bg-surface-container" />
              </div>
            ) : completedCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-on-surface">
                    CV đã phân tích
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {completedCount}
                  </span>
                </div>
                <p className="text-xs italic text-on-surface-variant">
                  {completedCount} CV đã được xử lý bởi AI. Nhấp vào biểu tượng
                  lấp lánh để xem phân tích chi tiết.
                </p>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Chưa có CV nào được phân tích.
              </p>
            )}
          </div>

          {completedCount > 0 ? (
            <div className="rounded-xl border-l-4 border-[#4edea3] bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-bold text-[#005236]">✓</span>
                <span className="font-bold text-on-surface">Career-Ready</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {completedCount} hồ sơ đã được tối ưu hóa cho ATS.
              </p>
            </div>
          ) : null}
        </div>

        <div className="md:col-span-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Danh sách hồ sơ đã tải
            </h2>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Gần đây nhất
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  className="h-20 animate-pulse rounded-xl bg-surface-container"
                  key={item}
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-xl border-2 border-dashed border-error/30 bg-error-container/40 p-10 text-center">
              <p className="font-semibold text-error">
                Không thể tải danh sách CV.
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {loadError}
              </p>
            </div>
          ) : cvList.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-14 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-on-surface-variant/30" />
              <p className="font-semibold text-on-surface-variant">
                Bạn chưa có CV nào.
              </p>
              <p className="mt-1 text-sm text-on-surface-variant/70">
                Hãy tải lên CV đầu tiên để bắt đầu!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cvList.map((cv) => (
                <CvItemRow
                  cv={cv}
                  isDownloading={isDownloadingCvId === cv.id}
                  isPreviewing={isPreviewingCvId === cv.id}
                  key={cv.id}
                  onNavigateToAnalysis={handleNavigateToAnalysis}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
