// Dạng Status có viền và màu
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
