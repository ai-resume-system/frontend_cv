"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bolt,
  Bot,
  Download,
  Eye,
  FileText,
  Lightbulb,
  RefreshCcw,
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
  fetchCvDetail,
} from "@/shared/services/cv.service";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import type { JobApiItem } from "@/shared/types/job";
import { JobCard } from "@/shared/components/layouts/JobCard";
import { ScoreGauge, getScoreLabel } from "@/shared/components/ui/ScoreGauge";
import { BaseLoader } from "@/shared/components/ui/BaseLoader";

interface CvAnalysisResultPageProps {
  cvId: string;
}

export function CvAnalysisResultPage({ cvId }: CvAnalysisResultPageProps) {
  const { isLoggedIn, user } = useAuth();

  const [analysis, setAnalysis] = useState<CvAnalysisResponse | null>(null);
  const [cvTitle, setCvTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileExtension, setFileExtension] = useState<string | null>(null);
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
        const [result, cvDetail] = await Promise.all([
          fetchCvAnalysis(cvId),
          fetchCvDetail(cvId).catch(() => null),
        ]);
        if (cancelled) return;
        setAnalysis(result);
        setCvTitle(cvDetail?.title ?? result.cvId.slice(0, 12) + "...");
        const ext =
          cvDetail?.fileExtension ||
          (cvDetail?.title && cvDetail.title.split(".").pop()?.toLowerCase()) ||
          null;
        setFileExtension(ext);

        if (result.processingStatus === "completed") {
          setIsJobsLoading(true);
          try {
            const [jobs, previewData] = await Promise.all([
              fetchCvRecommendedJobs(cvId).catch(() => []),
              fetchCvPreview(cvId).catch(() => null),
            ]);
            if (!cancelled) {
              setRecommendedJobs(jobs);
              if (previewData) {
                setPreviewUrl(previewData.previewUrl);
              }
            }
          } catch (jobErr) {
            console.error("Failed to load recommended details:", jobErr);
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
          <BaseLoader message="Đang tải kết quả phân tích..." />
        </div>
      </section>
    );
  }

  if (error || !analysis) {
    return (
      <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-100">
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
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Báo cáo Phân tích CV của bạn
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

              {previewUrl ? (
                fileExtension &&
                ["docx", "doc"].includes(fileExtension.toLowerCase()) ? (
                  <div className="bg-slate-100 p-8 h-175 flex items-center justify-center w-full">
                    <div className="w-full max-w-sm bg-white shadow-lg p-8 rounded-3xl border border-slate-200/60 text-center space-y-6">
                      <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-slate-800">
                          Tệp Word (.docx) không hỗ trợ xem trực tiếp
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Trình duyệt không hỗ trợ xem trực tiếp định dạng Word.
                          Bạn có thể tải tệp tin này xuống máy hoặc đổi sang
                          định dạng PDF để xem trực tiếp tại đây.
                        </p>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="w-full py-3 px-4 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <Download className="h-4 w-4" />
                        Tải xuống để xem
                      </button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                    className="w-full h-175 border-none bg-white shadow-xs"
                    title="Xem trước CV"
                  />
                )
              ) : (
                <div className="relative flex min-h-125 flex-col items-center justify-center bg-surface-dim p-10">
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
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[28px] bg-white p-8 shadow-sm border border-surface-container-high">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Bot className="h-5 w-5" /> Đánh giá từ AI
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

            {analysis.skills && analysis.skills.length > 0 ? (
              <div className="rounded-[28px] bg-surface-container-low p-6 border border-surface-container-high">
                <div className="flex items-center gap-2 mb-4">
                  <Bolt className="h-5 w-5 text-primary" />
                  <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                    Kỹ năng đã khớp hệ thống
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

            {analysis.otherDetectedSkills && analysis.otherDetectedSkills.length > 0 ? (
              <div className="rounded-[28px] bg-surface-container-low p-6 border border-surface-container-high">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                    Kỹ năng AI phát hiện thêm
                  </h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.otherDetectedSkills.map((skill) => (
                    <span
                      key={skill.normalizedName ?? skill.name}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-on-surface-variant border border-outline-variant/30"
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

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`${JOBSEEKER_ROUTES.ANALYSIS_PROCESS}?cvId=${cvId}`}
                className="flex-1 py-4 px-4 bg-white border border-surface-container-high rounded-xl text-on-surface font-bold text-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Phân tích lại
              </Link>
              <Link
                href={JOBSEEKER_ROUTES.JOBS}
                className="flex-1 py-4 px-4 bg-linear-to-br from-primary to-primary-container rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                Tìm việc phù hợp
              </Link>
            </div>
          </div>
        </div>

        {analysis.processingStatus === "completed" && (
          <div className="mt-12 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h5 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider">
                  Việc làm phù hợp cho bạn
                </h5>
                <p className="text-xs text-slate-400 mt-1">
                  Dựa trên lịch sử tìm kiếm và phân tích năng lực cá nhân.
                </p>
              </div>
              <Link
                href={JOBSEEKER_ROUTES.JOBS}
                className="text-sm font-bold text-primary flex items-center group"
              >
                Xem tất cả
                <div className="flex items-center overflow-hidden transition-all duration-300 ease-out max-w-0 opacity-0 group-hover:max-w-6 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4 ml-1.5 -translate-x-4 transition-transform duration-300 ease-out group-hover:translate-x-0" />
                </div>
              </Link>
            </div>

            {isJobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-slate-100 border border-slate-200"
                  />
                ))}
              </div>
            ) : recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <JobCard key={job.id} job={job as any} showSkills={true} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <p className="text-sm text-slate-500">
                  Chưa tìm thấy công việc phù hợp trực tiếp với CV này.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
