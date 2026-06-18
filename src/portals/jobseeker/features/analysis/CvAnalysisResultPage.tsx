"use client";

import {
  ArrowLeft,
  Bolt,
  Download,
  Eye,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { JOBSEEKER_ROUTES, ROUTES } from "@/shared/constants/constants/routes";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { cn } from "@/shared/lib/utils/cn";
import {
  fetchCvAnalysis,
  fetchCvDownload,
  fetchCvPreview,
  fetchCvRecommendedJobs,
} from "@/shared/services/cv.service";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import type { JobApiItem } from "@/shared/types/job";
import { JobCard } from "@/shared/components/layouts/JobCard";
import { ScoreGauge, getScoreLabel } from "@/shared/components/ui/ScoreGauge";

interface CvAnalysisResultPageProps {
  cvId: string;
}

export function CvAnalysisResultPage({ cvId }: CvAnalysisResultPageProps) {
  const { isLoggedIn } = useAuth();

  const [analysis, setAnalysis] = useState<CvAnalysisResponse | null>(null);
  const [cvTitle, setCvTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<JobApiItem[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const result = await fetchCvAnalysis(cvId);
        if (cancelled) return;
        setAnalysis(result);
        setCvTitle(result.cvId.slice(0, 12) + "...");

        if (result.processingStatus === "completed") {
          setIsJobsLoading(true);
          try {
            const jobs = await fetchCvRecommendedJobs(cvId);
            if (!cancelled) {
              setRecommendedJobs(jobs);
            }
          } catch (jobErr) {
            console.error("Failed to load recommended jobs:", jobErr);
          } finally {
            if (!cancelled) setIsJobsLoading(false);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải kết quả phân tích.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [cvId, isLoggedIn]);

  if (!isLoggedIn) return null;

  if (isLoading) {
    return (
      <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin text-primary mx-auto">
                <Sparkles className="h-8 w-8" />
              </div>
              <p className="text-sm text-on-surface-variant">
                Đang tải kết quả phân tích...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !analysis) {
    return (
      <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-error font-semibold">
                {error ?? "Không có dữ liệu phân tích."}
              </p>
              <Link
                href={ROUTES.JOB_SEEKER_ANALYSIS}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại chọn CV
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const score = analysis.score ?? 0;
  const scoreInfo = getScoreLabel(score, "theme");

  async function handlePreview() {
    try {
      const { previewUrl } = await fetchCvPreview(cvId);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch {
      // silently fail
    }
  }

  async function handleDownload() {
    try {
      const { downloadUrl } = await fetchCvDownload(cvId);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      // silently fail
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
          <span className="text-xs uppercase tracking-widest">Quay lại</span>
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            {analysis.analyzedAt ? (
              <>
                <span className="text-outline text-xs">•</span>
                <span className="text-on-surface-variant text-xs">
                  Cập nhật:{" "}
                  {new Date(analysis.analyzedAt).toLocaleDateString("vi-VN")}
                </span>
              </>
            ) : null}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kết quả phân tích CV
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-surface-container-high bg-surface-container-low">
              <div className="flex items-center justify-between border-b border-surface-container-high bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
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
                    onClick={handleDownload}
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

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/90 px-6 py-3 shadow-xl backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Đã phân tích bởi AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[28px] bg-white p-8 shadow-sm border border-surface-container-high">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Phân tích phù hợp AI
                  </span>
                  <h4
                    className={cn("text-2xl font-bold mt-1", scoreInfo.color)}
                  >
                    Đánh giá: {scoreInfo.label}
                  </h4>
                </div>
                {score >= 70 ? (
                  <div className="bg-tertiary-fixed/20 px-3 py-1 rounded-full flex items-center gap-1 border border-tertiary-fixed-dim/30">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                    <span className="text-[10px] font-bold text-on-tertiary-fixed-variant uppercase">
                      Đã tối ưu
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreGauge score={score} variant="theme" />
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">
                        Phù hợp yêu cầu
                      </span>
                      <span className="text-primary">
                        {Math.min(100, score + 7)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, score + 7)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">
                        Từ khóa kỹ thuật
                      </span>
                      <span className="text-primary">
                        {Math.max(30, score - 5)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.max(30, score - 5)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">
                        Trình bày & Định dạng
                      </span>
                      <span className="text-primary">
                        {Math.max(30, score - 2)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.max(30, score - 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {analysis.skills.length > 0 ? (
              <div className="rounded-[28px] bg-surface-container-low p-6 border border-surface-container-high">
                <div className="flex items-center gap-2 mb-4">
                  <Bolt className="h-5 w-5 text-primary" />
                  <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                    Kỹ năng được nhận diện
                  </h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill) => (
                    <span
                      key={skill.normalizedName ?? skill.name}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-lg",
                        (skill.confidence ?? 0) >= 0.8
                          ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                          : "bg-white text-on-surface-variant border border-outline-variant/30",
                      )}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {analysis.suggestions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Gợi ý từ AI để cải thiện
                  </h5>
                </div>
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-xl p-4 border-l-4 shadow-sm",
                      index === 0
                        ? "bg-white border-primary"
                        : "bg-white border-tertiary-fixed-dim",
                    )}
                  >
                    <div className="flex gap-3">
                      <Lightbulb
                        className={cn(
                          "h-5 w-5 shrink-0",
                          index === 0
                            ? "text-primary"
                            : "text-tertiary-container",
                        )}
                      />
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-on-surface-variant">
                          {suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {analysis.experience.length > 0 ? (
              <div className="rounded-[28px] bg-surface-container-low p-6 border border-surface-container-high">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                    Kinh nghiệm trọng tâm
                  </h5>
                </div>
                <div className="space-y-4">
                  {analysis.experience.slice(0, 3).map((exp, index) => (
                    <div className="flex gap-4" key={index}>
                      <div
                        className={cn(
                          "w-1 rounded-full",
                          index === 0
                            ? "bg-tertiary-fixed-dim"
                            : "bg-primary-fixed-dim",
                        )}
                      />
                      <div>
                        <p className="font-bold text-on-surface text-sm">
                          {exp.title ?? "Chưa có thông tin"}
                        </p>
                        {exp.company ? (
                          <p className="text-xs text-on-surface-variant">
                            {exp.company}
                          </p>
                        ) : null}
                        {exp.startDate || exp.endDate ? (
                          <p className="text-xs text-on-surface-variant mt-1">
                            {exp.startDate ?? "—"}{" "}
                            {exp.endDate ? `— ${exp.endDate}` : ""}
                          </p>
                        ) : null}
                        {exp.description ? (
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-white p-2 rounded-xl">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-primary mb-1">
                    MẸO TỪ FUSE AI
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {analysis.summary ??
                      "Hãy đảm bảo CV của bạn có đầy đủ thông tin liên lạc, kỹ năng và kinh nghiệm làm việc để nhận được phân tích chính xác nhất."}
                  </p>
                </div>
              </div>
            </div>

            {analysis.processingStatus === "completed" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Việc làm phù hợp nhất cho bạn
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dựa trên lịch sử tìm kiếm và phân tích năng lực cá nhân.
                    </p>
                  </div>
                  <Link
                    href={JOBSEEKER_ROUTES.JOBS}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Xem tất cả
                  </Link>
                </div>

                {isJobsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-2xl bg-slate-100 border border-slate-200"
                      />
                    ))}
                  </div>
                ) : recommendedJobs.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedJobs.slice(0, 3).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job as any}
                        showSkills={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                      Chưa tìm thấy công việc phù hợp trực tiếp với CV này.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={ROUTES.JOB_SEEKER_CV}
                className="flex-1 py-4 px-4 bg-white border border-surface-container-high rounded-xl text-on-surface font-bold text-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Chỉnh sửa CV ngay
              </Link>
              <Link
                href={JOBSEEKER_ROUTES.JOBS}
                className="flex-1 py-4 px-4 bg-linear-to-br from-primary to-primary-container rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Tìm việc phù hợp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
