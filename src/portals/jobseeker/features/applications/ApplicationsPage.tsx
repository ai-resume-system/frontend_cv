"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Sparkles,
  Calendar,
  MapPin,
  Video,
  X,
  Search,
} from "lucide-react";
import Image from "next/image";

import { BasePagination } from "@/shared/components/ui/BasePagination";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { ROUTES } from "@/shared/constants/constants/routes";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { withdrawJobApplication } from "@/shared/services/application.service";
import { useMyApplications } from "../../../../shared/hooks/data/useMyApplications";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { ApplicationCardSkeleton } from "@/shared/components/ui/CardSkelton";
import type { JobSeekerApplicationApiItem } from "@/shared/types/application";
import { StateLayout } from "@/shared/components/ui/StateLayout";

const FILTER_TABS = [
  { label: "Tất cả", value: "" },
  { label: "Vừa ứng tuyển", value: EJobApplicationStatus.APPLIED },
  { label: "Phỏng vấn", value: EJobApplicationStatus.INTERVIEW },
  { label: "Từ chối", value: EJobApplicationStatus.REJECTED },
  { label: "Đã rút", value: EJobApplicationStatus.WITHDRAWN },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
];

function formatInterviewTime(timeStr?: string | null): string {
  if (!timeStr) return "Đang cập nhật";
  try {
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Đang cập nhật";
  }
}

export function ApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [activeInterviewApp, setActiveInterviewApp] =
    useState<JobSeekerApplicationApiItem | null>(null);

  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { applications, pagination, loading, error, refetch } =
    useMyApplications({
      page,
      limit: 6,
      status: status || undefined,
      sortBy: "createdAt",
      sortOrder: sort === "oldest" ? "ASC" : "DESC",
    });

  const totalItems = pagination?.totalItems ?? applications.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm chuyển tab
  const handleTabChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }
    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Hàm thay đổi sắp xếp
  const handleSortChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("sort", value);
    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
    setIsSortOpen(false);
  };

  // Hàm chuyển trang
  const handlePageChange = (pageNumber: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", `${pageNumber}`);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Hàm xử lý rút đơn ứng tuyển
  const handleWithdrawConfirm = async () => {
    if (!withdrawAppId) return;
    setIsWithdrawing(true);
    try {
      await withdrawJobApplication(withdrawAppId);
      showSuccessToast("Rút đơn ứng tuyển thành công.");
      setWithdrawAppId(null);
      refetch();
    } catch (err: any) {
      showErrorToast(err?.message || "Rút đơn ứng tuyển thất bại.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-2 mb-10 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl font-display">
          Danh sách việc làm đã ứng tuyển
        </h1>

        {/* Filter & Sort Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`relative cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 group hover:bg-gray-200 hover:text-slate-900 ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-900"
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div
            ref={sortDropdownRef}
            className="relative flex items-center gap-2 self-end shrink-0 md:self-auto"
          >
            <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sắp xếp:
            </span>

            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex min-w-37.5 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              type="button"
            >
              {SORT_OPTIONS.find((o) => o.value === sort)?.label || "Chọn..."}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition group hover:cursor-pointer ${
                      sort === option.value
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                    type="button"
                  >
                    {option.label}
                    {sort === option.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <ApplicationCardSkeleton length={6} />
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onWithdraw={setWithdrawAppId}
                onViewInterviewDetails={setActiveInterviewApp}
              />
            ))}
          </div>
        ) : (
          <StateLayout
            type="empty"
            title="Chưa có hồ sơ ứng tuyển"
            description="Bạn chưa ứng tuyển công việc nào ở bộ lọc này. Hãy tiếp tục tìm kiếm và ứng tuyển các cơ hội việc làm phù hợp."
            action={{
              label: "Khám phá việc làm ngay",
              href: ROUTES.JOBS,
            }}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center pb-8">
          <BasePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="text"
          />
        </div>
      )}

      {/* Modal 1: Chi tiết lịch hẹn phỏng vấn */}
      {activeInterviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveInterviewApp(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Lịch hẹn phỏng vấn
                </h3>
                <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5">
                  {activeInterviewApp.job?.company?.name ?? "Doanh nghiệp"}
                </p>
              </div>
            </div>

            {/* Body Info */}
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vị trí tuyển dụng
                </p>
                <p className="mt-1 font-semibold text-slate-800 text-sm">
                  {activeInterviewApp.job?.title}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Thời gian
                </p>
                <p className="mt-1.5 font-bold text-primary flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  {formatInterviewTime(activeInterviewApp.scheduleTime)}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Địa điểm / Hình thức
                </p>
                <p className="mt-1.5 font-semibold text-slate-800 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {activeInterviewApp.scheduleLocation ||
                      "Địa điểm trực tiếp"}
                  </span>
                </p>
              </div>

              {activeInterviewApp.scheduleLink && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Link họp trực tuyến
                  </p>
                  <a
                    href={activeInterviewApp.scheduleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 transition"
                  >
                    <Video className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Tham gia cuộc họp ngay</span>
                  </a>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="mt-8 flex justify-end">
              <BaseButton
                variant="secondary"
                size="sm"
                onClick={() => setActiveInterviewApp(null)}
                className="rounded-xl px-5 font-bold"
              >
                Đóng
              </BaseButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Xác nhận rút đơn */}
      {withdrawAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-800">
              Xác nhận rút đơn ứng tuyển?
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn rút hồ sơ cho công việc này không? Nhà tuyển
              dụng sẽ không thể xem hồ sơ này nữa và hành động này không thể
              hoàn tác.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <BaseButton
                variant="ghost"
                size="sm"
                onClick={() => setWithdrawAppId(null)}
                disabled={isWithdrawing}
                className="rounded-xl font-bold"
              >
                Hủy bỏ
              </BaseButton>
              <BaseButton
                variant="danger-filled"
                size="sm"
                onClick={handleWithdrawConfirm}
                loading={isWithdrawing}
                className="rounded-xl font-bold px-5"
              >
                Đồng ý rút đơn
              </BaseButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
