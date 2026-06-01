"use client";

import {
  Bolt,
  CloudUpload,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;

function formatUploadDate(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} tháng trước`;
}

function formatFileSize(_bytes?: number): string {
  return "—";
}

export function CvSelectAnalysisPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const {
    cvList,
    isLoading,
    isUploading,
    handleUpload,
    uploadError,
  } = useCvList();
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES.JOB_SEEKER_LOGIN);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const sortedCvs = [...cvList].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

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
      if (file) validateAndUpload(file);
      event.target.value = "";
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [handleUpload],
  );

  function handleStartAnalysis(cv: CvItem) {
    router.push(
      `${ROUTES.JOB_SEEKER_ANALYSIS_PROCESS}?cvId=${cv.id}`,
    );
  }

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row">
        <div className="flex-1 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              PHÂN TÍCH HỒ SƠ
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Chọn CV để phân tích
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
              Hệ thống AI sẽ phân tích CV của bạn và đưa ra đánh giá chi tiết về
              kỹ năng, kinh nghiệm và gợi ý cải thiện.
            </p>
          </div>

          <div
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-12 transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-outline-variant bg-white/50 hover:border-primary",
              isUploading && "pointer-events-none opacity-70",
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-fixed">
              {isUploading ? (
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <CloudUpload className="h-8 w-8 text-primary" />
              )}
            </div>
            <p className="mb-1 text-lg font-semibold text-on-surface">
              {isUploading
                ? "Đang tải lên..."
                : "Kéo và thả CV của bạn vào đây"}
            </p>
            <p className="mb-6 text-sm text-on-surface-variant">
              PDF, DOCX (Tối đa {MAX_FILE_SIZE_MB}MB)
            </p>
            <button
              className="rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-60"
              disabled={isUploading}
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              type="button"
            >
              Chọn tệp
            </button>
            <input
              accept=".pdf,.doc,.docx"
              className="hidden"
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
            />
          </div>

          {(fileError ?? uploadError) ? (
            <p className="text-sm text-error">{fileError ?? uploadError}</p>
          ) : null}

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">
                Chọn từ thư viện của bạn
              </h2>
              <span className="text-xs font-semibold text-on-surface-variant">
                {cvList.length} CV
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    className="h-20 animate-pulse rounded-2xl bg-surface-container"
                    key={item}
                  />
                ))}
              </div>
            ) : sortedCvs.length > 0 ? (
              <div className="space-y-3">
                {sortedCvs.map((cv) => (
                  <div
                    className="flex items-center justify-between rounded-2xl border border-surface-container-high bg-white p-4 transition hover:shadow-sm"
                    key={cv.id}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-on-surface">
                            {cv.title ?? "CV không tên"}
                          </h3>
                          {cv.isDefault ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                              Mặc định
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          Tải lên: {formatUploadDate(cv.createdAt)}
                          {" • "}
                          {formatFileSize(undefined)}
                        </p>
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-xl bg-tertiary-fixed/30 px-4 py-2 text-xs font-bold text-primary transition hover:bg-tertiary-fixed/50 active:scale-95"
                      onClick={() => handleStartAnalysis(cv)}
                      type="button"
                    >
                      <Bolt className="h-4 w-4" />
                      Phân tích
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant p-10 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-on-surface-variant/30" />
                <p className="text-sm font-semibold text-on-surface-variant">
                  Bạn chưa có CV nào
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Tải lên CV đầu tiên để bắt đầu phân tích.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden flex-1 md:block">
          <div className="sticky top-28 overflow-hidden rounded-[28px] shadow-xl">
            <div className="aspect-[4/5] bg-gradient-to-br from-primary/90 to-primary">
              <div className="flex h-full flex-col justify-end p-8 text-white">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-tertiary-fixed" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                    FUSE AI
                  </span>
                </div>
                <h2 className="mb-3 text-3xl font-bold leading-tight">
                  Phân tích chuyên sâu
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                  AI sẽ quét CV, nhận diện kỹ năng, kinh nghiệm và đưa ra gợi ý
                  cải thiện để hồ sơ của bạn nổi bật hơn.
                </p>
                <div className="flex gap-6">
                  <div>
                    <span className="text-2xl font-bold">98%</span>
                    <p className="text-[10px] font-bold uppercase tracking-tight text-white/60">
                      ĐỘ CHÍNH XÁC
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div>
                    <span className="text-2xl font-bold">12s</span>
                    <p className="text-[10px] font-bold uppercase tracking-tight text-white/60">
                      THỜI GIAN PHÂN TÍCH
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
