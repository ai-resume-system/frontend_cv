"use client";

import { cn } from "@/shared/lib/utils/cn";

export interface ScoreLabel {
  label: string;
  color: string;
}

export function getScoreLabel(
  score: number,
  variant: "default" | "theme" = "default",
): ScoreLabel {
  if (variant === "theme") {
    if (score >= 85) return { label: "Xuất sắc", color: "text-tertiary" };
    if (score >= 70) return { label: "Tốt", color: "text-primary" };
    if (score >= 50) return { label: "Trung bình", color: "text-yellow-600" };
    return { label: "Cần cải thiện", color: "text-error" };
  } else {
    if (score >= 85) return { label: "Xuất sắc", color: "text-emerald-600" };
    if (score >= 70) return { label: "Tốt", color: "text-primary" };
    if (score >= 50) return { label: "Trung bình", color: "text-yellow-600" };
    return { label: "Cần cải thiện", color: "text-red-500" };
  }
}

interface ScoreGaugeProps {
  score: number;
  variant?: "default" | "theme";
  className?: string;
}

export function ScoreGauge({
  score,
  variant = "default",
  className,
}: ScoreGaugeProps) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const isTheme = variant === "theme";

  return (
    <div className={cn("relative w-32 h-32 shrink-0", className)}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className={cn(
            isTheme ? "text-surface-container-highest" : "text-slate-200",
          )}
          cx="64"
          cy="64"
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
        />
        <circle
          className={cn(
            "transition-all duration-1000",
            isTheme ? "" : "text-emerald-400",
          )}
          cx="64"
          cy="64"
          fill="transparent"
          r={radius}
          stroke={isTheme ? "#4edea3" : "currentColor"}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-3xl font-extrabold",
            isTheme ? "text-on-surface" : "text-slate-800",
          )}
        >
          {score}
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase",
            isTheme ? "text-on-surface-variant" : "text-slate-400",
          )}
        >
          Điểm số
        </span>
      </div>
    </div>
  );
}
