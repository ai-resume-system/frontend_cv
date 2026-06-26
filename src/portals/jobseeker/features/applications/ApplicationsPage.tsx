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
  Copy,
  ExternalLink,
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
  { label: "Nhận việc", value: EJobApplicationStatus.ACCEPTED },
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

interface ParsedInterviewDate {
  time: string;
  weekday: string;
  day: string;
  monthStr: string;
  year: string;
  fullDate: string;
}

function parseInterviewTime(
  timeStr?: string | null,
): ParsedInterviewDate | null {
  if (!timeStr) return null;
  try {
    const date = new Date(timeStr);
    const time = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const weekday = weekdays[date.getDay()];

    const day = String(date.getDate()).padStart(2, "0");
    const monthStr = `Tháng ${date.getMonth() + 1}`;
    const year = String(date.getFullYear());

    const fullDate = new Intl.DateTimeFormat("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    return { time, weekday, day, monthStr, year, fullDate };
  } catch {
    return null;
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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, []);

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
      {activeInterviewApp &&
        (() => {
          const parsedTime = parseInterviewTime(
            activeInterviewApp.scheduleTime,
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-2xl xl:max-w-3xl overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                  onClick={() => setActiveInterviewApp(null)}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header: Company Logo & Job Title */}
                <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <img
                      src={
                        activeInterviewApp.job?.company?.logoUrl ?? "/logo.png"
                      }
                      alt={activeInterviewApp.job?.company?.name ?? "Company"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-lg font-extrabold text-slate-900 leading-snug truncate"
                      title={activeInterviewApp.job?.title}
                    >
                      {activeInterviewApp.job?.title}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                      {activeInterviewApp.job?.company?.name ?? "Doanh nghiệp"}
                    </p>
                  </div>
                </div>

                {/* Body Info */}
                <div className="mt-6 max-h-[50vh] md:max-h-[58vh] overflow-y-auto pr-2 custom-scroll space-y-5">
                  {/* 1. Time / Calendar Leaf Visual */}
                  {parsedTime ? (
                    <div className="flex items-center gap-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      {/* Calendar leaf mock */}
                      <div className="flex h-20 w-16 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs text-center select-none">
                        <div className="bg-primary/95 px-1 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                          {parsedTime.monthStr}
                        </div>
                        <div className="flex flex-1 flex-col justify-center bg-white px-1">
                          <span className="text-2xl font-black text-slate-800 leading-none">
                            {parsedTime.day}
                          </span>
                          <span className="mt-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                            {parsedTime.weekday}
                          </span>
                        </div>
                      </div>
                      {/* Clock & Detailed text */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Thời gian phỏng vấn
                        </p>
                        <p className="mt-0.5 text-lg font-extrabold text-primary leading-tight">
                          {parsedTime.time}
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mt-1">
                          {parsedTime.fullDate}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-800">
                      <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>Thời gian phỏng vấn đang được sắp xếp.</span>
                    </div>
                  )}

                  {/* 2. Platform / Address details */}
                  {activeInterviewApp.scheduleLink ? (
                    /* Online meeting */
                    <div className="space-y-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                          <Video className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                          Phỏng vấn trực tuyến (Online)
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Phỏng vấn sẽ được thực hiện trực tuyến. Bạn vui lòng sử
                        dụng liên kết dưới đây để truy cập phòng phỏng vấn trực
                        tiếp.
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div
                          className="flex-1 truncate rounded-xl border border-emerald-150 bg-white px-3 py-2 text-xs font-mono font-medium text-emerald-800 select-all"
                          title={activeInterviewApp.scheduleLink}
                        >
                          {activeInterviewApp.scheduleLink}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              handleCopyLink(activeInterviewApp.scheduleLink!)
                            }
                            className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition shadow-2xs cursor-pointer ${
                              isCopied
                                ? "border-emerald-350 bg-emerald-100 text-emerald-900"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                            type="button"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>

                          <a
                            href={activeInterviewApp.scheduleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md cursor-pointer"
                          >
                            <span>Vào họp</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Offline direct meeting */
                    <div className="space-y-3.5 rounded-2xl border border-blue-200 bg-blue-50/20 p-4.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                          Phỏng vấn trực tiếp (Offline)
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Địa điểm chi tiết
                        </p>
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {activeInterviewApp.scheduleLocation ||
                            "Chưa cập nhật địa điểm cụ thể"}
                        </p>
                      </div>

                      {activeInterviewApp.scheduleLocation && (
                        <div className="flex justify-end pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              activeInterviewApp.scheduleLocation,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-300 bg-white px-4 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50 transition cursor-pointer"
                          >
                            <MapPin className="h-3.5 w-3.5 text-blue-600" />
                            <span>Xem trên Google Maps</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Ghi chú chi tiết từ nhà tuyển dụng */}
                  {activeInterviewApp.interviewNotes && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4.5 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Lời nhắn từ nhà tuyển dụng:
                      </p>
                      <div
                        className="text-xs text-slate-700 prose prose-sm max-w-none wrap-wrap-break-words"
                        dangerouslySetInnerHTML={{
                          __html: activeInterviewApp.interviewNotes,
                        }}
                      />
                    </div>
                  )}

                  {/* 3. Prep Checklist */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Lưu ý chuẩn bị cho buổi phỏng vấn</span>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2.5 list-none pl-0">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                          1
                        </span>
                        <span>
                          <strong>Tìm hiểu JD & Công ty:</strong> Đọc lại kỹ mô
                          tả công việc (JD) tuyển dụng và thông tin về sản
                          phẩm/dịch vụ của công ty trước buổi hẹn.
                        </span>
                      </li>
                      {activeInterviewApp.scheduleLink ? (
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                            2
                          </span>
                          <span>
                            <strong>Thiết bị & Mạng:</strong> Kiểm tra tai nghe,
                            micro, camera và đường truyền mạng ổn định trước
                            buổi hẹn ít nhất 10 phút.
                          </span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                            2
                          </span>
                          <span>
                            <strong>Đến sớm:</strong> Sắp xếp thời gian di
                            chuyển để có mặt tại địa điểm phỏng vấn trước từ 10
                            - 15 phút so với lịch hẹn.
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                          3
                        </span>
                        <span>
                          <strong>Trang phục & Hồ sơ:</strong> Lựa chọn trang
                          phục lịch sự và mang theo CV bản cứng được in sẵn đề
                          phòng trường hợp cần sử dụng.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="mt-8 flex justify-end">
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveInterviewApp(null)}
                    className="rounded-xl px-6 font-bold"
                  >
                    Đóng
                  </BaseButton>
                </div>
              </div>
            </div>
          );
        })()}

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
