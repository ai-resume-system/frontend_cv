"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { cn } from "@/shared/lib/utils/cn";

interface StateLayoutProps {
  type: "empty" | "error";
  title: string;
  description?: string;
  customImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  noBorder?: boolean;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
}

export function StateLayout({
  type,
  title,
  description,
  customImage,
  imageWidth = 120,
  imageHeight = 120,
  noBorder = false,
  action,
  className,
  children,
}: StateLayoutProps) {
  const defaultImage = type === "empty" ? "/no_data.png" : "/error_data.png";
  const imageSrc = customImage || defaultImage;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center px-6 w-full",
        !noBorder && "border-2 border-dashed rounded-3xl shadow-sm",
        !noBorder && type === "empty" && "border-slate-300 bg-white",
        !noBorder && type === "error" && "border-gray-300 bg-rose-50/10",
        className,
      )}
    >
      <div className="flex items-center justify-center">
        <Image
          alt={title}
          height={imageHeight}
          priority
          src={imageSrc}
          width={imageWidth}
          className="opacity-75"
        />
      </div>
      <h3
        className={cn(
          "mt-4 text-base font-bold text-slate-800 sm:text-lg",
          type === "error" && "text-rose-600",
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6 flex justify-center">
          {action.href ? (
            <BaseButton
              variant="primary"
              href={action.href}
              className="rounded-2xl px-6 py-2.5 font-bold shadow-sm text-xs h-10"
            >
              {action.label}
            </BaseButton>
          ) : (
            <BaseButton
              variant="primary"
              onClick={action.onClick}
              className="rounded-2xl px-6 py-2.5 font-bold shadow-sm text-xs h-10"
            >
              {action.label}
            </BaseButton>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
