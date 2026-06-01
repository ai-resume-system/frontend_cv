import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils/cn";

type BasePaginationVariant = "compact" | "text";

interface BasePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: BasePaginationVariant;
  className?: string;
}

export function BasePagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "text",
  className,
}: BasePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isCompact = variant === "compact";
  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-3", className)}
    >
      <button
        className={cn(
          "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50",
          isCompact
            ? "h-11 w-11 rounded-full border border-primary bg-white text-primary hover:bg-primary-soft"
            : "h-11 min-w-[112px] rounded-2xl border border-surface-container-high bg-white px-5 text-sm font-semibold text-on-surface hover:bg-surface-container-low",
        )}
        disabled={previousDisabled}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
        {isCompact ? null : <span className="ml-2">Trước</span>}
      </button>

      <span
        className={cn(
          "inline-flex items-center justify-center",
          isCompact
            ? "text-base font-semibold text-on-surface-variant"
            : "h-11 rounded-2xl bg-surface-container px-5 text-sm font-semibold text-on-surface",
        )}
      >
        {isCompact ? (
          <>
            <span className="text-primary">{currentPage}</span>
            <span className="mx-1 text-on-surface-variant">/</span>
            <span className="text-on-surface-variant">{totalPages} trang</span>
          </>
        ) : (
          `Trang ${currentPage} / ${totalPages}`
        )}
      </span>

      <button
        className={cn(
          "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50",
          isCompact
            ? "h-11 w-11 rounded-full border border-primary bg-white text-primary hover:bg-primary-soft"
            : "h-11 min-w-[112px] rounded-2xl border border-surface-container-high bg-white px-5 text-sm font-semibold text-on-surface hover:bg-surface-container-low",
        )}
        disabled={nextDisabled}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        {isCompact ? null : <span className="mr-2">Sau</span>}
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
