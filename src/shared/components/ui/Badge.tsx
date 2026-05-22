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
        "inline-flex items-center rounded-full px-3 py-1 font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}
