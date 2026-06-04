"use client";

import {
  CloudUpload,
  FileText,
  LoaderCircle,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
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

export function CvSelectAnalysisPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Custom hook state
  const { cvList, isLoading, isUploading, handleUpload, uploadError } =
    useCvList();

  // Local UI State
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
    null,
  );
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES.JOB_SEEKER_LOGIN);
    }
  }, [isLoggedIn, router]);

  // Sort CVs: isDefault = true goes to top, then by updated date
  const sortedCvs = [...cvList].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Automatically select the default CV on load
  useEffect(() => {
    if (sortedCvs.length > 0 && !selectedCvId) {
      const defaultCv = sortedCvs.find((cv) => cv.isDefault);
      if (defaultCv) {
        setSelectedCvId(defaultCv.id);
      } else {
        setSelectedCvId(sortedCvs[0].id);
      }
    }
  }, [sortedCvs, selectedCvId]);

  if (!isLoggedIn) return null;

  function validateFile(file: File): boolean {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Chỉ chấp nhận file PDF hoặc DOCX.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  }

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && validateFile(file)) {
        setSelectedUploadFile(file);
      }
      event.target.value = "";
    },
    [],
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedUploadFile(file);
    }
  }, []);

  const handleConfirmUpload = async () => {
    if (!selectedUploadFile) return;
    try {
      await handleUpload(selectedUploadFile);
      setSelectedUploadFile(null);
      await showAppAlert({
        title: "Tải lên thành công",
        text: "Hồ sơ mới đã được thêm vào thư viện của bạn.",
        icon: "success",
      });
      // Clear select state to auto-select the newly uploaded CV (which floats to top)
      setSelectedCvId(null);
    } catch (error) {
      await showErrorAlert(
        error instanceof Error ? error.message : "Tải lên hồ sơ thất bại.",
      );
    }
  };

  function handleStartAnalysis(cv: CvItem) {
    router.push(`${ROUTES.JOB_SEEKER_ANALYSIS_PROCESS}?cvId=${cv.id}`);
  }

  const activeSelectedCv = sortedCvs.find((cv) => cv.id === selectedCvId);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-8 md:flex-row md:items-stretch justify-center">
        {/* LEFT CONTAINER */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Chọn CV để phân tích
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-normal">
              Hệ thống AI sẽ quét CV của bạn và đưa ra đánh giá chi tiết về kỹ
              năng, kinh nghiệm và gợi ý cải thiện.
            </p>
          </div>

          <div className="space-y-3">
            {!selectedUploadFile ? (
              <div
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all text-center bg-white",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 bg-slate-50/30 hover:border-primary hover:bg-slate-50/70",
                  isUploading && "pointer-events-none opacity-70",
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <CloudUpload className="h-5.5 w-5.5 text-primary" />
                </div>
                <p className="mb-0.5 text-sm font-semibold text-slate-800">
                  Kéo và thả CV của bạn vào đây
                </p>
                <p className="mb-4 text-[11px] text-slate-400">
                  PDF, DOCX (Tối đa {MAX_FILE_SIZE_MB}MB)
                </p>
                <button
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-60"
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
            ) : (
              /* Selected File State (Ảnh 2) */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary bg-primary/5 p-5 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5.5 w-5.5 text-primary" />
                </div>
                <p className="font-bold text-primary text-sm line-clamp-1 mb-0.5">
                  {selectedUploadFile.name}
                </p>
                <p className="text-[11px] text-slate-400 mb-3.5">
                  {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedUploadFile(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline transition"
                    disabled={isUploading}
                    type="button"
                  >
                    Chọn tệp khác
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={isUploading}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                    type="button"
                  >
                    {isUploading && (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    )}
                    <span>Tải CV lên</span>
                  </button>
                </div>
              </div>
            )}

            {(fileError ?? uploadError) && (
              <p className="text-xs text-error font-medium text-center">
                {fileError ?? uploadError}
              </p>
            )}
          </div>

          {/* Library list section */}
          <div className="flex-1 flex flex-col justify-end pt-2">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                Chọn từ thư viện của bạn
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                {cvList.length} hồ sơ
              </span>
            </div>

            {isLoading ? (
              /* Skeletor library loading */
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                    key={item}
                  />
                ))}
              </div>
            ) : sortedCvs.length > 0 ? (
              /* Scrollable list containing max 3 CVs at once */
              <div className="max-h-[265px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                {sortedCvs.map((cv) => {
                  const isSelected = cv.id === selectedCvId;
                  return (
                    <div
                      onClick={() => setSelectedCvId(cv.id)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 select-none",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs",
                      )}
                      key={cv.id}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "bg-slate-100 text-slate-400",
                          )}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className={cn(
                                "font-bold text-sm truncate",
                                isSelected ? "text-primary" : "text-slate-800",
                              )}
                              title={cv.title || ""}
                            >
                              {cv.title ?? "CV không tên"}
                            </h3>
                            {isSelected && (
                              /* Checkmark icon inside title row (ảnh 4 style) */
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Cập nhật: {formatUploadDate(cv.updatedAt)}
                            {cv.isDefault && " • Mặc định"}
                          </p>
                        </div>
                      </div>

                      {/* Action Button: Analyze if selected, Select if not */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <button
                            className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-4.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAnalysis(cv);
                            }}
                            type="button"
                          >
                            Phân tích
                          </button>
                        ) : (
                          <button
                            className="inline-flex h-8 items-center justify-center rounded-full bg-slate-100 px-4.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCvId(cv.id);
                            }}
                            type="button"
                          >
                            Chọn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Library empty */
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/30">
                <FileText className="mx-auto mb-2.5 h-8 w-8 text-slate-400/55" />
                <p className="text-xs font-semibold text-slate-500">
                  Bạn chưa có hồ sơ nào trong thư viện
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Kéo thả hoặc click chọn tệp ở trên để tải hồ sơ lên.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTAINER */}
        <div className="hidden md:flex md:w-[360px] lg:w-[400px] shrink-0">
          <div className="w-full rounded-[28px] overflow-hidden shadow-lg relative bg-linear-to-br from-primary/95 to-primary flex flex-col justify-between p-8 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-end">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">
                  FUSE AI INSIGHT
                </span>
              </div>

              <h2 className="text-2xl font-bold leading-tight mb-3">
                Phân tích chuyên sâu
              </h2>

              <p className="text-xs lg:text-sm leading-relaxed text-white/80">
                AI sẽ quét CV của bạn, nhận diện chuẩn xác các kỹ năng, số năm
                kinh nghiệm và đưa ra các gợi ý tối ưu để hồ sơ của bạn lọt qua
                các bộ lọc ATS khó tính nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
