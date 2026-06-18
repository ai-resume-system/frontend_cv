"use client";

import { useEffect } from "react";
import { X, LoaderCircle, Bolt, Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import type { CvAnalysisResponse } from "@/shared/types/cv-analysis";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { ScoreGauge, getScoreLabel } from "@/shared/components/ui/ScoreGauge";
import { Badge } from "@/shared/components/ui/Badge";

interface PreviewAnalysisModalProps {
  isOpen: boolean;
  analysis: CvAnalysisResponse;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export function PreviewAnalysisModal({
  isOpen,
  analysis,
  isSaving,
  onClose,
  onSave,
}: PreviewAnalysisModalProps) {
  // Khóa cuộn trang chính khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const score = analysis.score ?? 0;
  const scoreLabel = getScoreLabel(score, "default");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
      <div className="w-full max-w-4xl rounded-[32px] bg-slate-50 p-6 sm:p-8 shadow-2xl border border-slate-300 flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xs">
              Dữ liệu tạm thời
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
            type="button"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable with custom-scroll) */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-6 custom-scroll">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Cột trái: Đánh giá tổng quan */}
            <div className="md:col-span-5 rounded-[24px] bg-white p-6 border border-slate-300 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Đánh giá tổng quan
              </span>
              <h4
                className={cn("text-xl font-black mt-2 mb-4", scoreLabel.color)}
              >
                {scoreLabel.label}
              </h4>

              <ScoreGauge score={score} variant="default" />
            </div>

            {/* Cột phải: Chi tiết */}
            <div className="md:col-span-7 space-y-8">
              {/* Kỹ năng */}
              {analysis.skills && analysis.skills.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Bolt className="h-5 w-5 text-primary shrink-0" />
                    <h5 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                      Kỹ năng được nhận diện
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-2">
                    {analysis.skills.map((skill) => (
                      <Badge
                        key={skill.normalizedName ?? skill.name}
                        className={cn(
                          "px-3 py-1 text-xs font-bold rounded-xl transition-all hover:scale-105 shadow-2xs",
                          (skill.confidence ?? 0) >= 0.8
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Gợi ý */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3 pl-1">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                    <h5 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                      Gợi ý cải thiện từ AI
                    </h5>
                  </div>
                  {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-2xl p-4 bg-white border border-slate-300 border-l-[6px] border-l-primary shadow-sm transition-colors hover:bg-slate-50/50"
                    >
                      <p className="text-sm leading-relaxed font-medium text-slate-700">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cảnh báo hổ phách đậm nét */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs leading-relaxed text-amber-900 mb-4 shadow-3xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Lưu ý:</strong> Đây là kết quả phân tích thử nghiệm. Báo cáo
            này và tệp CV của bạn <strong>chưa được lưu</strong> vào hệ thống.
            Vui lòng bấm <strong>"Lưu vào tài khoản"</strong> ở dưới để lưu trữ
            chính thức.
          </div>
        </div>

        {/* Footer (Nút bấm) */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 shrink-0">
          <BaseButton
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            className="border-slate-400 hover:border-primary/50 text-slate-900 font-bold"
          >
            Hủy bỏ (Không lưu)
          </BaseButton>

          <BaseButton
            variant="primary"
            onClick={onSave}
            disabled={isSaving}
            className="font-bold"
          >
            {isSaving && (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" />
            )}
            <span>Lưu vào tài khoản</span>
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
