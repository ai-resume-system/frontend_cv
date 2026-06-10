"use client";

import { X, LoaderCircle, Bolt, Lightbulb } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import { BaseButton } from "@/shared/components/ui/BaseButton";

interface PreviewAnalysisModalProps {
  isOpen: boolean;
  analysis: CvAnalysisResponse;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-slate-200"
          cx="64"
          cy="64"
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
        />
        <circle
          className="transition-all duration-1000 text-emerald-400"
          cx="64"
          cy="64"
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-800">{score}</span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">
          Điểm số
        </span>
      </div>
    </div>
  );
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Xuất sắc", color: "text-emerald-600" };
  if (score >= 70) return { label: "Tốt", color: "text-primary" };
  if (score >= 50) return { label: "Trung bình", color: "text-yellow-600" };
  return { label: "Cần cải thiện", color: "text-red-500" };
}

export function PreviewAnalysisModal({
  isOpen,
  analysis,
  isSaving,
  onClose,
  onSave,
}: PreviewAnalysisModalProps) {
  if (!isOpen) return null;

  const score = analysis.score ?? 0;
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-[32px] bg-slate-50 p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Dữ liệu tạm thời
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition cursor-pointer"
            type="button"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Đánh giá tổng quan
              </span>
              <h4
                className={cn("text-xl font-black mt-1 mb-4", scoreLabel.color)}
              >
                {scoreLabel.label}
              </h4>

              <ScoreGauge score={score} />
            </div>

            {/* Cột phải: Chi tiết */}
            <div className="md:col-span-7 space-y-6">
              {/* Kỹ năng */}
              {analysis.skills && analysis.skills.length > 0 && (
                <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Bolt className="h-5 w-5 text-primary" />
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Kỹ năng được nhận diện
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skills.map((skill) => (
                      <span
                        key={skill.normalizedName ?? skill.name}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg",
                          (skill.confidence ?? 0) >= 0.8
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-50 text-slate-600 border border-slate-200",
                        )}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gợi ý */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                    Gợi ý cải thiện từ AI
                  </h5>
                  {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-4 bg-white border border-slate-200 border-l-4 border-l-primary shadow-xs flex gap-3"
                    >
                      <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-xs leading-relaxed text-slate-600">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50/50 border border-yellow-200/60 rounded-2xl p-4 text-xs leading-relaxed text-yellow-700">
          ⚠️ <strong>Lưu ý:</strong> Đây là kết quả phân tích thử nghiệm. Báo
          cáo này và tệp CV của bạn <strong>chưa được lưu</strong> vào hệ thống.
          Vui lòng bấm <strong>"Lưu vào tài khoản"</strong> ở dưới để lưu trữ
          chính thức.
        </div>

        {/* Footer (Nút bấm) */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 shrink-0">
          <BaseButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Hủy bỏ (Không lưu)
          </BaseButton>

          <BaseButton variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
            <span>Lưu vào tài khoản</span>
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
