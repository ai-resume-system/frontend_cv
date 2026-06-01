"use client";

import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/shared/constants/constants/routes";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { showErrorAlert } from "@/shared/lib/ui/alert";
import {
  fetchCvAnalysis,
  fetchCvPreview,
  queueCvAnalysis,
} from "@/shared/services/cv.service";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";

type ProcessingStage = "queueing" | "analyzing" | "finalizing" | "completed" | "failed";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

const STAGE_CONFIG: Record<ProcessingStage, { label: string; percent: number }> = {
  queueing: { label: "Đưa CV vào hàng đợi xử lý...", percent: 15 },
  analyzing: { label: "AI đang quét nội dung CV...", percent: 45 },
  finalizing: { label: "Hoàn thiện báo cáo phân tích...", percent: 80 },
  completed: { label: "Phân tích hoàn tất!", percent: 100 },
  failed: { label: "Phân tích thất bại", percent: 0 },
};

export function CvAnalysisProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const cvId = searchParams.get("cvId");

  const [cvTitle, setCvTitle] = useState<string>("");
  const [stage, setStage] = useState<ProcessingStage>("queueing");
  const [analysisResult, setAnalysisResult] = useState<CvAnalysisResponse | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }
    if (!cvId) {
      router.replace(ROUTES.JOB_SEEKER_ANALYSIS);
      return;
    }
  }, [isLoggedIn, cvId, router]);

  useEffect(() => {
    if (!cvId || !isLoggedIn) return;
    const id = cvId;

    let cancelled = false;

    async function startAnalysis() {
      try {
        await queueCvAnalysis(id);
        if (cancelled) return;
        setStage("analyzing");
        attemptsRef.current = 0;

        pollingRef.current = setInterval(async () => {
          if (cancelled) return;
          attemptsRef.current += 1;

          if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (!cancelled) {
              setStage("failed");
              await showErrorAlert("Quá thời gian chờ phân tích. Vui lòng thử lại.");
            }
            return;
          }

          try {
            const result = await fetchCvAnalysis(id);
            if (cancelled) return;

            if (attemptsRef.current > 5) {
              setStage("finalizing");
            }

            if (result.processingStatus === "completed") {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setAnalysisResult(result);
              setStage("completed");

              setTimeout(() => {
                if (!cancelled) {
                  router.push(ROUTES.JOB_SEEKER_ANALYSIS_RESULT(id));
                }
              }, 1500);
            } else if (result.processingStatus === "failed") {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setStage("failed");
              await showErrorAlert("Phân tích CV thất bại. Vui lòng thử lại.");
            } else if (result.processingStatus === "processing") {
              setStage("analyzing");
            }
          } catch {
            if (cancelled) return;
          }
        }, POLL_INTERVAL_MS);
      } catch (error) {
        if (cancelled) return;
        setStage("failed");
        await showErrorAlert(
          error instanceof Error
            ? error.message
            : "Không thể bắt đầu phân tích CV.",
        );
      }
    }

    void startAnalysis();

    return () => {
      cancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [cvId, isLoggedIn, router]);

  useEffect(() => {
    if (!cvId || !isLoggedIn) return;
    const id = cvId;
    async function loadCvInfo() {
      try {
        const result = await fetchCvAnalysis(id);
        setCvTitle(result.cvId.slice(0, 8) + "...");
      } catch {
        setCvTitle("CV đã chọn");
      }
    }
    void loadCvInfo();
  }, [cvId, isLoggedIn]);

  if (!isLoggedIn || !cvId) return null;

  const stageConfig = STAGE_CONFIG[stage];
  const isFailed = stage === "failed";

  async function handlePreview() {
    if (!cvId) return;
    try {
      const { previewUrl } = await fetchCvPreview(cvId);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch {
      await showErrorAlert("Không thể xem trước CV.");
    }
  }

  return (
    <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href={ROUTES.JOB_SEEKER_ANALYSIS}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">
            Quay lại chọn CV
          </span>
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          AI đang phân tích hồ sơ của bạn
        </h1>
        <p className="mb-10 text-sm text-on-surface-variant">
          Hệ thống đang xử lý và đánh giá CV dựa trên các tiêu chí thông minh.
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="overflow-hidden rounded-[28px] border border-surface-container-high bg-surface-container-low">
              <div className="flex items-center justify-between border-b border-surface-container-high bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    description
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {cvTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high"
                    onClick={handlePreview}
                    title="Xem CV"
                    type="button"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high"
                    title="Tải xuống"
                    type="button"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-[500px] flex-col items-center justify-center bg-surface-dim p-10">
                <div className="mx-auto w-full max-w-md space-y-6 opacity-50">
                  <div className="h-10 w-3/4 rounded-xl bg-surface-container" />
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-surface-container" />
                    <div className="h-4 w-full rounded bg-surface-container" />
                    <div className="h-4 w-5/6 rounded bg-surface-container" />
                  </div>
                  <div className="h-8 w-1/2 rounded-xl bg-surface-container" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-xl bg-surface-container" />
                    <div className="h-24 rounded-xl bg-surface-container" />
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/90 px-6 py-3 shadow-xl backdrop-blur-sm">
                    {stage === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-tertiary-fixed-dim" />
                    ) : isFailed ? (
                      <span className="material-symbols-outlined text-error">
                        error
                      </span>
                    ) : (
                      <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                    )}
                    <span
                      className={`text-sm font-semibold ${isFailed ? "text-error" : "text-primary"}`}
                    >
                      {isFailed
                        ? "Phân tích thất bại"
                        : stage === "completed"
                          ? "Hoàn tất! Đang chuyển hướng..."
                          : "AI đang quét nội dung..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">
                  Tiến trình phân tích
                </h2>
              </div>

              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface-variant">
                    {stageConfig.label}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {stage === "completed" ? "100%" : `${stageConfig.percent}%`}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isFailed ? "bg-error" : "bg-primary"}`}
                    style={{
                      width: `${stageConfig.percent}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {(["queueing", "analyzing", "finalizing", "completed"] as const).map(
                  (step) => {
                    const stepIndex = ["queueing", "analyzing", "finalizing", "completed"].indexOf(step);
                    const currentIndex = ["queueing", "analyzing", "finalizing", "completed"].indexOf(stage === "failed" ? "queueing" : stage);
                    const isDone = stepIndex < currentIndex;
                    const isCurrent = stepIndex === currentIndex && !isFailed;

                    return (
                      <div
                        className={`flex items-center gap-3 ${isDone || isCurrent ? "opacity-100" : "opacity-40"}`}
                        key={step}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            isDone
                              ? "bg-tertiary-fixed-dim/30 text-tertiary-container"
                              : isCurrent
                                ? "bg-primary text-white"
                                : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-[10px] font-bold">{stepIndex + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isDone
                              ? "text-tertiary-container"
                              : isCurrent
                                ? "font-semibold text-on-surface"
                                : "text-on-surface-variant"
                          }`}
                        >
                          {STAGE_CONFIG[step].label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  FUSE AI
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                AI đang phân tích cấu trúc CV, nhận diện kỹ năng, kinh nghiệm
                làm việc và trình độ học vấn. Kết quả sẽ hiển thị ngay sau khi
                hoàn tất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
