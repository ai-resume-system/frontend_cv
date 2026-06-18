"use client";

import {
  CloudUpload,
  FileText,
  Sparkles,
  Check,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { showAppAlert, showErrorAlert } from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import type { CvItem } from "@/shared/types/cv";
import { Badge } from "@/shared/components/ui/Badge";
import { PROCESSING_STATUS_CONFIG } from "@/shared/constants/enums/cv.enum";
import { formatDateTime } from "@/portals/jobseeker/components/cv/CvCard";
import {
  uploadTempCv,
  previewTempCv,
  saveTempCv,
} from "@/shared/services/cv.service";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import { PreviewAnalysisModal } from "./PreviewAnalysisModal";
import { StateLayout } from "@/shared/components/ui/StateLayout";


const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;

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

  // States cho phân tích tạm (preview)
  const [tempFileKey, setTempFileKey] = useState<string | null>(null);
  const [isPreviewingTemp, setIsPreviewingTemp] = useState(false);
  const [tempAnalysisResult, setTempAnalysisResult] =
    useState<CvAnalysisResponse | null>(null);
  const [isSavingTemp, setIsSavingTemp] = useState(false);

  const handleTempAnalysis = async () => {
    if (!selectedUploadFile) return;
    try {
      setIsPreviewingTemp(true);
      setFileError(null);

      // 1. Tải tệp tạm lên S3 tạm thời
      const uploadResult = await uploadTempCv(selectedUploadFile);
      const key = uploadResult.tempFileKey;
      setTempFileKey(key);

      // 2. Chạy AI phân tích thử
      const previewResult = await previewTempCv(key);
      setTempAnalysisResult(previewResult.analysis);

      await showAppAlert({
        title: "Xem trước phân tích",
        text: "AI đã hoàn thành phân tích tạm thời CV của bạn.",
        icon: "success",
      });
    } catch (error: any) {
      await showErrorAlert(
        error?.message ?? "Phân tích tạm thời thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsPreviewingTemp(false);
    }
  };

  const handleSaveTempCv = async () => {
    if (!tempFileKey || !selectedUploadFile) return;
    try {
      setIsSavingTemp(true);
      await saveTempCv(tempFileKey, selectedUploadFile.name);

      await showAppAlert({
        title: "Đã lưu hồ sơ",
        text: "Hồ sơ tuyển dụng và kết quả phân tích đã được lưu chính thức.",
        icon: "success",
      });

      setSelectedUploadFile(null);
      setTempFileKey(null);
      setTempAnalysisResult(null);

      // Reload lại trang để tải lại thư viện CV mới
      window.location.reload();
    } catch (error: any) {
      await showErrorAlert(
        error?.message ?? "Lưu hồ sơ thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSavingTemp(false);
    }
  };

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

  if (!isLoggedIn) return null;

  function handleStartAnalysis(cv: CvItem) {
    router.push(`${ROUTES.JOB_SEEKER_ANALYSIS_PROCESS}?cvId=${cv.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-stretch justify-center">
        {/* LEFT CONTAINER */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Phân tích hồ sơ
          </h1>

          <div className="space-y-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 tracking-wider">
                Tải lên từ máy tính
              </h2>
            </div>
            {!selectedUploadFile ? (
              <div
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all text-center bg-white shadow-xs hover:shadow-md",
                  isDragging
                    ? "border-blue-700 bg-blue-50/30"
                    : "border-slate-400 bg-slate-100/30 hover:border-blue-700 hover:bg-slate-100/60",
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
                <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-105">
                  <CloudUpload className="h-6 w-6 text-primary" />
                </div>
                <p className="mb-1 text-sm font-bold text-slate-800">
                  Chọn hồ sơ từ máy tính của bạn, hoặc kéo và thả CV của bạn vào
                  đây
                </p>
                <p className="mb-4 text-xs font-medium text-slate-600">
                  Hỗ trợ định dạng PDF, DOCX (Dung lượng tối đa{" "}
                  {MAX_FILE_SIZE_MB}MB)
                </p>
                <button
                  className="rounded-md bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-60 cursor-pointer"
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
              (() => {
                const selectedFileExt = (
                  selectedUploadFile.name.split(".").pop() || "PDF"
                ).toUpperCase();
                const isSelectedDoc =
                  selectedFileExt === "DOC" || selectedFileExt === "DOCX";
                return (
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 select-none",
                      selectedUploadFile
                        ? "border-primary bg-primary/0.03 shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.08)]"
                        : "border-slate-200 bg-white shadow-xs",
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                        <FileText className="h-10 w-10 text-slate-400" />
                        <div
                          className={cn(
                            "absolute bottom-1.5 flex items-center justify-center rounded-md px-2 py-0.5 text-[8px] font-bold text-white uppercase",
                            isSelectedDoc ? "bg-blue-500" : "bg-orange-500",
                          )}
                        >
                          {selectedFileExt}
                        </div>
                      </div>

                      {/* Thông tin File */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-xs text-primary">
                            {selectedUploadFile.name}
                          </h3>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Tệp mới chọn
                          </span>
                          <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-green-600">
                            <CheckCircle className="h-4 w-4 stroke-3" />
                          </div>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                          <span>
                            Dung lượng:{" "}
                            {(selectedUploadFile.size / (1024 * 1024)).toFixed(
                              2,
                            )}{" "}
                            MB
                          </span>
                          <span className="text-amber-600 font-bold uppercase text-[10px]">
                            Chưa lưu vào hệ thống
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => {
                          setSelectedUploadFile(null);
                          setTempFileKey(null);
                          setTempAnalysisResult(null);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-rose-500 border border-rose-200 bg-rose-50/30 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        disabled={isPreviewingTemp}
                        type="button"
                      >
                        Đổi tệp
                      </button>
                      <button
                        onClick={handleTempAnalysis}
                        disabled={isPreviewingTemp}
                        className="inline-flex px-3 py-1.5 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 disabled:opacity-50 cursor-pointer"
                        type="button"
                      >
                        {isPreviewingTemp && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        <span>Phân tích</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

            {(fileError ?? uploadError) && (
              <p className="text-xs text-error font-semibold text-center mt-2">
                {fileError ?? uploadError}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-end pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 tracking-wider">
                Chọn từ thư viện của bạn
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-500">
                {cvList.length} hồ sơ
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    className="h-20 animate-pulse rounded-2xl bg-slate-100"
                    key={item}
                  />
                ))}
              </div>
            ) : sortedCvs.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                  {sortedCvs.map((cv) => {
                    const isSelected = cv.id === selectedCvId && !selectedUploadFile;
                    const fileExt = (
                      cv.fileExtension?.replace(".", "") || "PDF"
                    ).toUpperCase();
                    const isDoc = fileExt === "DOC" || fileExt === "DOCX";
                    const processingStatus = cv.processingStatus ?? "pending";
                    const statusConfig =
                      PROCESSING_STATUS_CONFIG[processingStatus] ??
                      PROCESSING_STATUS_CONFIG.pending;

                    return (
                      <div
                        onClick={() => {
                          setSelectedCvId(cv.id);
                          setSelectedUploadFile(null);
                          setTempFileKey(null);
                          setTempAnalysisResult(null);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-300 select-none",
                          isSelected
                            ? "border-primary bg-primary/0.03 shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.08)]"
                            : "border-slate-200 bg-white hover:translate-x-0.5 hover:border-primary/50 hover:shadow-xs",
                        )}
                        key={cv.id}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition-colors">
                            <FileText className="h-10 w-10 text-slate-400" />
                            <div
                              className={cn(
                                "absolute bottom-1.5 flex items-center justify-center rounded-md px-2 py-0.5 text-[8px] font-bold text-white uppercase transition-colors",
                                isDoc ? "bg-blue-500" : "bg-orange-500",
                              )}
                            >
                              {fileExt}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className={cn(
                                  "font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs",
                                  isSelected
                                    ? "text-primary"
                                    : "text-slate-800",
                                )}
                                title={cv.title || ""}
                              >
                                {cv.title ?? "CV không tên"}
                              </h3>
                              {cv.isDefault && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                                  Mặc định
                                </span>
                              )}
                              {isSelected && (
                                <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-green-600">
                                  <CheckCircle className="h-4 w-4 stroke-3" />
                                </div>
                              )}
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>
                                Cập nhật: {formatDateTime(cv.updatedAt)}
                              </span>
                              <Badge
                                className={cn(
                                  "bg-transparent border px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md!",
                                  statusConfig.className,
                                )}
                              >
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2 shrink-0 ml-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {processingStatus === "completed" ? (
                            <>
                              <button
                                onClick={() =>
                                  router.push(
                                    ROUTES.JOB_SEEKER_ANALYSIS_RESULT(cv.id),
                                  )
                                }
                                className="px-2.5 py-1.5 text-xs font-bold text-blue-900 border border-blue-300 bg-blue-50 hover:bg-blue-100/80 rounded-lg shadow-2xs transition cursor-pointer"
                                type="button"
                              >
                                Xem kết quả
                              </button>
                              <button
                                onClick={() => handleStartAnalysis(cv)}
                                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-300 bg-slate-100 hover:bg-slate-200/80 rounded-lg shadow-2xs transition cursor-pointer"
                                type="button"
                              >
                                Phân tích lại
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartAnalysis(cv)}
                              disabled={processingStatus === "processing"}
                              className="px-2.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition cursor-pointer"
                              type="button"
                            >
                              {processingStatus === "processing"
                                ? "Đang phân tích..."
                                : "Phân tích ngay"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <StateLayout
                type="empty"
                title="Bạn chưa có hồ sơ nào trong thư viện"
                description="Hãy kéo thả hoặc click chọn tệp ở trên để tải hồ sơ lên."
                className="py-10!"
              />
            )}
          </div>
        </div>

        {/* RIGHT CONTAINER */}
        <div className="hidden md:flex md:w-[360px] lg:w-[400px] shrink-0">
          <div className="w-full rounded-[28px] overflow-hidden shadow-xl relative flex flex-col justify-between p-8 text-white bg-slate-900 border border-slate-800 min-h-[460px]">
            <img
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src="/favourite_background.png"
              alt="background-img"
            />

            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)] z-10 pointer-events-none" />

            {/* Bottom Content Description */}
            <div className="relative z-20 flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">
                  FUSE AI INSIGHT
                </span>
              </div>

              <h2 className="text-xl font-bold leading-tight mb-2">
                Phân tích chuyên sâu
              </h2>

              <p className="text-xs leading-relaxed text-white/80">
                AI sẽ phân tích CV của bạn, nhận diện chuẩn xác các kỹ năng, số
                năm kinh nghiệm và đưa ra các gợi ý tối ưu giúp hồ sơ của bạn
                nổi bật hơn với nhà tuyển dụng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview kết quả tạm thời */}
      {tempAnalysisResult && (
        <PreviewAnalysisModal
          isOpen={tempAnalysisResult !== null}
          analysis={tempAnalysisResult}
          isSaving={isSavingTemp}
          onClose={() => {
            setSelectedUploadFile(null);
            setTempFileKey(null);
            setTempAnalysisResult(null);
          }}
          onSave={handleSaveTempCv}
        />
      )}
    </div>
  );
}
