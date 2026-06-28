"use client";

import {
  Box,
  Briefcase,
  ClipboardClock,
  Clock,
  Coins,
  ExternalLink,
  GraduationCap,
  Heart,
  Laptop,
  MapPin,
  Send,
  SquareX,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { cn } from "@/shared/lib/utils/cn";
import {
  EJobEducationLevelLabels,
  EJobStatus,
  EJobTypeLabels,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import { showErrorToast, showSuccessToast } from "@/shared/lib/ui/toast";
import { formatSalary } from "@/shared/lib/helpers/formatPrice.helper";
import { formatBriefAddress } from "@/shared/lib/utils/formatAddress";
import type { Job } from "@/shared/types/job";

interface RecruiterJobPreviewModalProps {
  job: Job;
  onClose: () => void;
  onCloseJob?: (id: string, reason: string) => Promise<void>;
}

function getCompanyLabel(job: Job): string {
  return job.company?.name ?? "Doanh nghiệp";
}

function getAddress(job: Job): string {
  return job.address ?? job.company?.address ?? "Đang cập nhật";
}

function formatDate(value?: Date | string): string {
  if (!value) return "Đang cập nhật";
  const dateObj = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

function buildMapLink(job: Job): string | undefined {
  if (
    typeof job.company?.latitude === "number" &&
    typeof job.company?.longitude === "number"
  ) {
    return `https://www.google.com/maps?q=${job.company.latitude},${job.company.longitude}`;
  }
  const addr = getAddress(job);
  if (addr && addr !== "Đang cập nhật") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }
  return undefined;
}

function buildGoogleMapsUrl(job: Job): string | undefined {
  const coords: { lat?: number | null; lng?: number | null } = {};
  if (job.company?.latitude) coords.lat = job.company.latitude;
  if (job.company?.longitude) coords.lng = job.company.longitude;

  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  }
  const addr = getAddress(job);
  if (addr && addr !== "Đang cập nhật") {
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=15&output=embed`;
  }
  return undefined;
}

export function RecruiterJobPreviewModal({
  job,
  onClose,
  onCloseJob,
}: RecruiterJobPreviewModalProps) {
  const [closing, setClosing] = useState(false);
  const mapsUrl = buildGoogleMapsUrl(job);
  const companyName = getCompanyLabel(job);

  const handleCloseJobAction = async () => {
    if (!onCloseJob) return;
    const reason = window.prompt("Nhập lý do đóng tin tuyển dụng:");
    if (reason === null) return;
    if (!reason.trim()) {
      showErrorToast("Lý do đóng tin là bắt buộc.");
      return;
    }

    setClosing(true);
    try {
      await onCloseJob(job.id, reason.trim());
      showSuccessToast("Đóng tuyển dụng thành công.");
      onClose();
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Không thể đóng tin tuyển dụng.",
      );
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-[28px] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/15 shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              Bản xem trước tin tuyển dụng
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Hiển thị chính xác cách ứng viên nhìn thấy bài đăng của bạn trên
              hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/55 custom-scroll">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column (2/3) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Main Card */}
              <section className="rounded-3xl border border-outline-variant/80 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl leading-snug">
                  {job.title || "Tiêu đề công việc chưa cập nhật"}
                </h1>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Coins,
                      label: "Mức lương",
                      value:
                        formatSalary(
                          job.salaryMin ?? undefined,
                          job.salaryMax ?? undefined,
                        ) ?? "Thỏa thuận",
                    },
                    {
                      icon: MapPin,
                      label: "Địa điểm",
                      value: formatBriefAddress(getAddress(job)),
                    },
                    {
                      icon: ClipboardClock,
                      label: "Kinh nghiệm",
                      value:
                        job.experienceYears === 0
                          ? "Không yêu cầu"
                          : job.experienceYears
                            ? `${job.experienceYears} năm`
                            : "Chưa cập nhật",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4 border border-outline-variant/20"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-outline-variant/15">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.label}
                        </span>
                        <span className="truncate text-sm font-bold text-slate-800">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-5">
                  <p className="text-sm text-slate-500">
                    Hạn nộp hồ sơ:{" "}
                    <span className="font-bold text-slate-850">
                      {formatDate(job.expiredAt)}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary/70 px-6 py-2.5 font-bold text-white shadow-md cursor-not-allowed text-sm"
                    >
                      <Send className="h-4 w-4" /> Ứng tuyển ngay (Giả lập)
                    </button>

                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-white px-6 py-2.5 font-bold text-primary/70 cursor-not-allowed text-sm"
                    >
                      <Heart className="h-4 w-4" />
                      Lưu tin
                    </button>
                  </div>
                </div>
              </section>

              {/* Detailed Description */}
              <section className="rounded-3xl border border-outline-variant/80 bg-white p-8 shadow-sm">
                <h2 className="relative flex items-center text-lg font-bold text-primary pl-4">
                  <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-linear-to-b from-primary to-secondary-container" />
                  Mô tả chi tiết tuyển dụng
                </h2>
                <div
                  className="prose prose-sm max-w-none mt-6 text-[15px] leading-relaxed text-slate-600 [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-5 [&>ol]:ml-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: (
                      job.description ||
                      "<p className='text-slate-400 italic'>Chưa có thông tin mô tả chi tiết công việc.</p>"
                    ).replace(/&nbsp;/g, " "),
                  }}
                />
              </section>
            </div>

            {/* Right Column (1/3) */}
            <aside className="space-y-6">
              {/* Company Profile Card */}
              <section className="border border-outline-variant/80 bg-white rounded-3xl overflow-hidden shadow-sm">
                {job.company?.bannerUrl ? (
                  <img
                    src={job.company.bannerUrl}
                    className="h-28 w-full object-cover"
                    alt="Company Banner"
                  />
                ) : (
                  <div className="bg-linear-to-r from-primary-soft to-secondary-soft h-24 w-full relative" />
                )}

                <div className="px-6 pb-6 text-left">
                  <img
                    src={job.company?.logoUrl ?? "/logo.png"}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-md -mt-8 relative z-10 bg-white"
                    alt={companyName}
                  />
                  <h2 className="font-extrabold text-base text-slate-800 mt-3 truncate">
                    {companyName}
                  </h2>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <p className="flex items-start gap-2 text-slate-600">
                      <Box className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-bold shrink-0 text-slate-500">
                        Lĩnh vực:{" "}
                      </span>
                      <span className="font-semibold text-primary line-clamp-1">
                        {job.careerCategory?.name ?? "Chưa cập nhật"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-slate-600">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-bold shrink-0 text-slate-500">
                        Quy mô:
                      </span>{" "}
                      <span className="font-semibold text-primary line-clamp-1">
                        {job.company?.employeeMin ||
                        job.company?.employeeMax ? (
                          <>
                            {job.company.employeeMin && job.company.employeeMax
                              ? `${job.company.employeeMin} - ${job.company.employeeMax} nhân viên`
                              : job.company.employeeMin
                                ? `Từ ${job.company.employeeMin} nhân viên`
                                : `Đến ${job.company.employeeMax} nhân viên`}
                          </>
                        ) : (
                          "Đang cập nhật"
                        )}
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-slate-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="font-bold shrink-0 text-slate-500">
                        Địa điểm:
                      </span>{" "}
                      <span className="font-semibold text-primary line-clamp-2">
                        {getAddress(job)}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Map Card */}
              <section className="border border-outline-variant/80 bg-white p-5 shadow-sm rounded-3xl text-left">
                <h3 className="text-sm font-bold text-slate-800">
                  Địa điểm trên bản đồ
                </h3>
                {mapsUrl ? (
                  <div className="relative mt-3 aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-100 shadow-xs">
                    <a
                      href={buildMapLink(job)}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-primary shadow-sm transition hover:bg-slate-50 cursor-pointer"
                    >
                      Mở Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                    <iframe
                      allowFullScreen
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapsUrl}
                      title="Vị trí công ty"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-4/3 flex-col items-center justify-center gap-2 p-6 text-center mt-3 bg-slate-50 rounded-2xl border border-dashed border-outline-variant">
                    <MapPin className="h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium">
                      Địa điểm chưa được định vị tọa độ
                    </p>
                  </div>
                )}
              </section>

              {/* Job General Info */}
              <section className="border border-outline-variant/80 bg-white p-6 shadow-sm rounded-3xl">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Thông tin chung
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-outline-variant/10">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Loại hình công việc
                      </p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {EJobTypeLabels[job.jobType] || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-outline-variant/10">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Hình thức làm việc
                      </p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {job.workArrangement
                          ? EJobWorkArrangementLabels[job.workArrangement]
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-outline-variant/10">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Trình độ học vấn
                      </p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {job.educationLevel
                          ? EJobEducationLevelLabels[job.educationLevel]
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-outline-variant/10">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Số lượng tuyển dụng
                      </p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {job.vacancyCount
                          ? `${job.vacancyCount} người`
                          : "1 người"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-outline-variant/10">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Cập nhật cuối
                      </p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {formatDate(job.updatedAt || new Date())}
                      </p>
                    </div>
                  </div>
                </div>

                {job.skills?.length ? (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-2.5">
                      Kỹ năng cần thiết
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => {
                        const isMainSkill = (skill.weight ?? 1) >= 4;
                        return (
                          <span
                            key={skill.id}
                            className={cn(
                              "inline-flex items-center justify-center rounded-full transition-all duration-200",
                              isMainSkill
                                ? "bg-blue-100/80 border border-blue-200/80 px-2.5 py-1 text-[11px] font-bold text-primary shadow-3xs hover:bg-blue-100"
                                : "bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-100",
                            )}
                          >
                            {skill.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>
            </aside>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-outline-variant/15 shrink-0 bg-white">
          {job.status === EJobStatus.OPEN && onCloseJob && (
            <BaseButton
              variant="secondary"
              loading={closing}
              startIcon={<SquareX className="h-4 w-4 text-error" />}
              className="text-error border-error/20 hover:bg-error/10 hover:text-error"
              onClick={handleCloseJobAction}
            >
              Đóng tuyển dụng
            </BaseButton>
          )}
          <BaseButton onClick={onClose}>Đóng lại</BaseButton>
        </div>
      </div>
    </div>
  );
}
