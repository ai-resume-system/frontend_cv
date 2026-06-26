"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
  Video,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import {
  fetchRecruiterInterviews,
  updateInterviewStatus,
} from "@/shared/services/recruiter-job-application.service";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import { EInterviewStatus } from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";

function formatTime(value: string | null): string {
  if (!value) return "---";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateLabel(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Hôm nay";

  const weekdays = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  return `${weekdays[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
}

const DAYS_NAME = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export function RecruiterInterviewPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>(""); // "" (Tất cả), "scheduled", "completed"
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [applications, setApplications] = useState<
    RecruiterApplicationApiItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"scheduleTime" | "matchingScore">(
    "scheduleTime",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const [limit, setLimit] = useState(10);

  async function loadInterviews() {
    setLoading(true);
    setError(null);
    try {
      // Thiết lập mốc thời gian từ 00:00:00 đến 23:59:59 của ngày được chọn
      const fromDate = new Date(selectedDate);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(selectedDate);
      toDate.setHours(23, 59, 59, 999);

      const result = await fetchRecruiterInterviews({
        page: 1,
        limit: 100, // Lấy toàn bộ danh sách trong ngày để phân trang client-side chính xác cùng bộ lọc nâng cao
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        q: searchTerm || undefined,
        sortBy,
        sortOrder,
      });

      setApplications(result.applications);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách phỏng vấn.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInterviews();
  }, [selectedDate, searchTerm, sortBy, sortOrder]);

  const handleUpdateInterviewStatus = async (
    id: string,
    newStatus: "scheduled" | "completed",
  ) => {
    try {
      await updateInterviewStatus(id, newStatus);
      showSuccessToast("Cập nhật tiến độ phỏng vấn thành công.");
      void loadInterviews();
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Không thể cập nhật tiến độ.",
      );
    }
  };

  const getDaysOfWeek = (baseDate: Date) => {
    const currentDay = baseDate.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfWeek(selectedDate);

  // Lọc client-side theo bộ lọc trạng thái phỏng vấn
  const filteredInterviews = applications.filter((app) => {
    if (!filterStatus) return true;

    const isCompleted =
      app.interviewStatus === EInterviewStatus.COMPLETED ||
      app.status === EJobApplicationStatus.ACCEPTED ||
      app.status === EJobApplicationStatus.REJECTED;

    if (filterStatus === "completed") {
      return isCompleted;
    } else if (filterStatus === "scheduled") {
      return !isCompleted && app.status === EJobApplicationStatus.INTERVIEW;
    }
    return true;
  });

  // Tính toán stats X/Y (Đã hoàn thành / Tổng lịch hẹn trong ngày)
  const totalY = applications.length;
  const completedX = applications.filter((app) => {
    return (
      app.interviewStatus === EInterviewStatus.COMPLETED ||
      app.status === EJobApplicationStatus.ACCEPTED ||
      app.status === EJobApplicationStatus.REJECTED
    );
  }).length;

  // Phân trang
  const startIndex = (page - 1) * limit;
  const pagedInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + limit,
  );

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    if (key === "time") {
      setSortBy("scheduleTime");
      setSortOrder(order);
    } else if (key === "matchingScore") {
      setSortBy("matchingScore");
      setSortOrder(order);
    }
    setPage(1);
  };

  const columns: BaseTableColumn<RecruiterApplicationApiItem>[] = [
    {
      key: "applicant",
      header: "Ứng viên",
      render: (app) => {
        const initial = (app.fullName ?? app.contactEmail ?? "?")
          .charAt(0)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-on-surface truncate">
                {app.fullName ?? "Ứng viên"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {app.contactEmail ?? app.user?.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "job",
      header: "Vị trí ứng tuyển",
      render: (app) => (
        <span className="font-semibold text-on-surface">
          {app.job?.title ?? "---"}
        </span>
      ),
    },
    {
      key: "time",
      header: "Giờ phỏng vấn",
      sortable: true,
      render: (app) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
            ⏰ {formatTime(app.scheduleTime)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            {formatDateLabel(app.scheduleTime)}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Hình thức / Địa điểm",
      render: (app) => {
        if (app.scheduleLink) {
          return (
            <a
              href={app.scheduleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover bg-primary-soft/40 px-2.5 py-1 rounded-xl transition border border-primary/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Phòng trực tuyến</span>
            </a>
          );
        }
        return (
          <span
            className="text-xs text-on-surface-variant flex items-center gap-1 max-w-50 truncate"
            title={app.scheduleLocation ?? ""}
          >
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{app.scheduleLocation ?? "Văn phòng công ty"}</span>
          </span>
        );
      },
    },
    {
      key: "matchingScore",
      header: "Độ phù hợp",
      sortable: true,
      render: (app) => (
        <span className="font-bold text-tertiary">
          {app.matchingScore != null ? `${app.matchingScore}%` : "Chưa có AI"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Tiến độ phỏng vấn",
      render: (app) => {
        const isFinalStatus =
          app.status === EJobApplicationStatus.ACCEPTED ||
          app.status === EJobApplicationStatus.REJECTED;

        // Nếu ứng viên đã được nhận việc
        if (app.status === EJobApplicationStatus.ACCEPTED) {
          return (
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Nhận việc
            </span>
          );
        }

        // Nếu ứng viên đã bị từ chối
        if (app.status === EJobApplicationStatus.REJECTED) {
          return (
            <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700 shadow-2xs">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
              Đã từ chối
            </span>
          );
        }

        const isCompleted = app.interviewStatus === EInterviewStatus.COMPLETED;

        // Nếu phỏng vấn đang ở trạng thái interview, hiển thị dropdown đổi nhanh tiến độ
        return (
          <div className="relative inline-block w-40">
            <select
              value={app.interviewStatus ?? EInterviewStatus.SCHEDULED}
              disabled={isFinalStatus}
              onChange={(e) =>
                handleUpdateInterviewStatus(
                  app.id,
                  e.target.value as EInterviewStatus,
                )
              }
              className={`w-full px-3 py-1.5 text-xs font-bold rounded-2xl border transition outline-none cursor-pointer ${
                isCompleted
                  ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70"
              }`}
            >
              <option value={EInterviewStatus.SCHEDULED}>Chưa phỏng vấn</option>
              <option value={EInterviewStatus.COMPLETED}>Đã phỏng vấn</option>
            </select>
          </div>
        );
      },
    },
  ];

  const localDateString = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const handleDateChange = (dateString: string) => {
    if (!dateString) return;
    const [year, month, day] = dateString.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    setPage(1);
  };

  const getSubheading = () => {
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Hôm nay bạn có ${applications.length} cuộc phỏng vấn cần thực hiện.`;
    }
    return `Bạn có ${applications.length} cuộc phỏng vấn cần thực hiện vào ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}.`;
  };

  const statsCard = (
    <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Clock className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Đã hoàn thành
        </p>
        <p className="text-base font-extrabold text-slate-800 mt-0.5">
          {completedX} / {totalY}
        </p>
      </div>
    </div>
  );

  return (
    <RecruiterWorkspaceShell
      heading="Lịch phỏng vấn & Quản lý ứng viên"
      subheading={getSubheading()}
      action={statsCard}
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        {/* Weekly Slider */}
        <section className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                📅 Chọn ngày:
              </span>
              <input
                type="date"
                value={localDateString}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(selectedDate);
                  prev.setDate(selectedDate.getDate() - 1);
                  setSelectedDate(prev);
                }}
                className="p-1 rounded-lg border border-outline-variant/20 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(selectedDate);
                  next.setDate(selectedDate.getDate() + 1);
                  setSelectedDate(next);
                }}
                className="p-1 rounded-lg border border-outline-variant/20 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 items-center justify-items-center">
            {weekDays.map((day, index) => {
              const isSelected =
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear();

              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              if (isSelected) {
                return (
                  <div
                    key={index}
                    className="relative transform scale-110 z-10 transition duration-300 mx-1 self-center"
                  >
                    {/* Spiral Rings */}
                    <div className="absolute -top-1.5 left-1/4 -translate-x-1/2 flex gap-1 z-20">
                      <div className="w-1.5 h-3.5 rounded-full bg-slate-700 border border-slate-300" />
                    </div>
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                      <div className="w-1.5 h-3.5 rounded-full bg-slate-700 border border-slate-300" />
                    </div>
                    <div className="absolute -top-1.5 left-3/4 -translate-x-1/2 flex gap-1 z-20">
                      <div className="w-1.5 h-3.5 rounded-full bg-slate-700 border border-slate-300" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setPage(1);
                      }}
                      className="flex flex-col w-18 h-20.5 items-center bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative cursor-pointer"
                    >
                      <div className="w-full bg-rose-500 py-1 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider">
                        {DAYS_NAME[day.getDay()]}
                      </div>

                      <div className="flex-1 w-full flex items-center justify-center bg-amber-50/10">
                        <span className="text-2xl font-black text-slate-800 leading-none">
                          {day.getDate()}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-amber-100 rounded-tr-sm border-t border-r border-slate-200 shadow-inner" />

                      {isToday && (
                        <span className="absolute bottom-1 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setPage(1);
                  }}
                  className="flex flex-col items-center py-2 px-1 rounded-xl transition duration-150 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 w-16 h-18 justify-center self-center cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-400">
                    {DAYS_NAME[day.getDay()]}
                  </span>
                  <span className="text-base font-extrabold mt-0.5 text-slate-700">
                    {day.getDate()}
                  </span>
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-0.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bộ lọc tìm kiếm và kết quả */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Tìm tên, email ứng viên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition text-on-surface-variant font-medium cursor-pointer"
            >
              <option value="">Tất cả tiến độ phỏng vấn</option>
              <option value="scheduled">Chưa phỏng vấn</option>
              <option value="completed">Đã phỏng vấn</option>
            </select>
          </div>
        </div>

        {/* Tiêu đề danh sách */}
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-on-surface">
            Danh sách phỏng vấn ngày {selectedDate.getDate()} tháng{" "}
            {selectedDate.getMonth() + 1} năm {selectedDate.getFullYear()}
          </h2>
          <span className="ml-2 bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md text-xs">
            {filteredInterviews.length} cuộc hẹn
          </span>
        </div>

        {/* BaseTable hiển thị danh sách lịch */}
        <BaseTable
          columns={columns}
          data={pagedInterviews}
          loading={loading}
          emptyMessage="Không có lịch phỏng vấn nào cho ngày và bộ lọc được chọn."
          sortBy={sortBy === "scheduleTime" ? "time" : "matchingScore"}
          sortOrder={sortOrder}
          onSort={handleSort}
          itemName="cuộc hẹn"
          pagination={{
            page,
            limit,
            total: filteredInterviews.length,
            totalPages: Math.ceil(filteredInterviews.length / limit),
            onPageChange: (newPage) => setPage(newPage),
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          }}
        />
      </div>
    </RecruiterWorkspaceShell>
  );
}
