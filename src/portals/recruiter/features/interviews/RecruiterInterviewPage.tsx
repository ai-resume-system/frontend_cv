"use client";

import { useState } from "react";
import {
  CalendarCheck,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterApplications } from "@/portals/recruiter/features/applicants/useRecruiterApplications";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";

function formatDateTime(value: string | null): string {
  if (!value) return "---";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// Lấy tên các thứ trong tiếng Việt
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
  const { applications, loading, error } = useRecruiterApplications({
    status: EJobApplicationStatus.INTERVIEW,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const limit = 10;

  // Khởi tạo 7 ngày trong tuần (Thứ 2 -> Chủ nhật)
  const getDaysOfWeek = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfWeek();

  // Lọc các buổi phỏng vấn trùng ngày đã chọn
  const filteredInterviews = applications.filter((app) => {
    if (!app.scheduleTime) return false;
    const appDate = new Date(app.scheduleTime);
    return (
      appDate.getDate() === selectedDate.getDate() &&
      appDate.getMonth() === selectedDate.getMonth() &&
      appDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Phân trang
  const startIndex = (page - 1) * limit;
  const pagedInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + limit,
  );

  // Định nghĩa cột của BaseTable
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
      render: (app) => (
        <span className="font-bold text-secondary-fixed bg-secondary-soft/50 px-2 py-0.5 rounded-md text-xs">
          ⏰ {formatDateTime(app.scheduleTime)}
        </span>
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
            className="text-xs text-on-surface-variant flex items-center gap-1 max-w-[200px] truncate"
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
      header: "AI Match",
      render: (app) => (
        <span className="font-bold text-tertiary">
          {app.matchingScore != null ? `${app.matchingScore}%` : "Chưa có AI"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: () => (
        <span className="inline-block rounded-full bg-tertiary-soft px-2.5 py-0.5 text-xs font-semibold text-tertiary">
          Đã lên lịch
        </span>
      ),
    },
  ];

  return (
    <RecruiterWorkspaceShell
      heading="Lịch phỏng vấn"
      subheading="Theo dõi và điều phối các cuộc phỏng vấn ứng viên theo lịch trình ngày."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        {/* Weekly Slider - Chọn ngày phỏng vấn trượt tuần */}
        <section className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
              📅 Tuần làm việc hiện tại
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(selectedDate);
                  prev.setDate(selectedDate.getDate() - 1);
                  setSelectedDate(prev);
                }}
                className="p-1 rounded-lg border border-outline-variant/20 hover:bg-slate-50 transition"
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
                className="p-1 rounded-lg border border-outline-variant/20 hover:bg-slate-50 transition"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isSelected =
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear();

              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setPage(1);
                  }}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl transition duration-150 relative ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-md shadow-primary/15"
                      : "bg-surface hover:bg-slate-50 text-on-surface"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${isSelected ? "text-white/80" : "text-slate-400"}`}
                  >
                    {DAYS_NAME[day.getDay()]}
                  </span>
                  <span className="text-base font-extrabold mt-1">
                    {day.getDate()}
                  </span>

                  {/* Chấm tròn nhỏ cho ngày hôm nay */}
                  {isToday && (
                    <span
                      className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-primary animate-pulse"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tiêu đề ngày được chọn */}
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
          emptyMessage="Không có lịch phỏng vấn nào cho ngày được chọn."
          pagination={{
            page,
            limit,
            total: filteredInterviews.length,
            totalPages: Math.ceil(filteredInterviews.length / limit),
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>
    </RecruiterWorkspaceShell>
  );
}
