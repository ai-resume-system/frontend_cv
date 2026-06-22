"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";

interface BaseLoaderProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function BaseLoader({
  message,
  className,
  fullPage = false,
}: BaseLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-4",
        fullPage ? "min-h-screen w-full bg-surface" : "min-h-100 py-12 w-full",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Vòng ping mờ bên dưới tạo chiều sâu */}
        <div className="absolute h-10 w-10 rounded-full border-4 border-primary/20 animate-ping" />
        <LoaderCircle className="h-10 w-10 animate-spin text-primary relative z-10" />
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide animate-duration-1000">
          {message}
        </p>
      )}
    </div>
  );
}
