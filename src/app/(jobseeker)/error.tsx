"use client";

import React, { startTransition, useEffect } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { JOBSEEKER_ROUTES } from "@/shared/constants/constants/routes";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobseekerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Jobseeker Error Boundary caught an error:", error);
  }, [error]);

  const handleReset = () => {
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-6 shadow-sm">
          <AlertCircle className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-3 sm:text-3xl">
          Không thể kết nối máy chủ
        </h1>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          Đã có lỗi xảy ra trong quá trình tải dữ liệu. Vui lòng kiểm tra kết
          nối mạng của bạn hoặc thử lại sau ít phút.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <BaseButton
            variant="primary"
            onClick={handleReset}
            startIcon={<RefreshCw className="h-4 w-4" />}
          >
            Thử lại
          </BaseButton>
          <BaseButton
            variant="secondary"
            href={JOBSEEKER_ROUTES.HOME}
            startIcon={<Home className="h-4 w-4" />}
          >
            Quay về Trang chủ
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
