"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  closeOnOverlayClick?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
  "3xl": "max-w-5xl",
  "4xl": "max-w-6xl",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  closeOnOverlayClick = true,
}: BaseModalProps) {
  // Lock scroll when modal is open
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-on-surface/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-91 w-full rounded-2xl border border-border bg-surface-container-lowest p-6 shadow-[0_24px_60px_rgba(25,28,29,0.14)] sm:p-8 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          {title && (
            <h2 className="font-headline text-xl font-semibold text-on-surface">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-foreground hover:opacity-50 cursor-pointer rounded-lg p-1 transition duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll text-sm text-on-surface-variant mb-6 text-left">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse gap-3 shrink-0 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
