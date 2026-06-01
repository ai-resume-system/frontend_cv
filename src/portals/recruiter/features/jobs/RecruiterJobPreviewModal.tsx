"use client";

import { BriefcaseBusiness, CalendarDays, MapPin, X } from "lucide-react";

import { EJobStatus, EJobType } from "@/shared/constants/enums/job.enum";
import type { Job } from "@/shared/types/job";

interface RecruiterJobPreviewModalProps {
  job: Job;
  onClose: () => void;
}

function getJobTypeLabel(type: EJobType): string {
  switch (type) {
    case EJobType.FULL_TIME:
      return "Toàn thời gian";
    case EJobType.PART_TIME:
      return "Bán thời gian";
    case EJobType.INTERNSHIP:
      return "Thực tập";
  }
}

function getJobStatusLabel(status: EJobStatus): string {
  switch (status) {
    case EJobStatus.OPEN:
      return "Đang mở";
    case EJobStatus.CLOSED:
      return "Đã đóng";
    case EJobStatus.PENDING:
      return "Chờ duyệt";
    case EJobStatus.REJECTED:
      return "Bị từ chối";
    case EJobStatus.EXPIRED:
      return "Hết hạn";
  }
}

function formatSalary(value?: number): string {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function RecruiterJobPreviewModal({
  job,
  onClose,
}: RecruiterJobPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">Xem trước tin tuyển dụng</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{job.title}</h3>
            {job.careerCategory?.name ? (
              <p className="mt-1 text-sm text-on-surface-variant">
                {job.careerCategory.name}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
            {job.address ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.address}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4" />
              {getJobTypeLabel(job.jobType)}
            </span>
            {job.expiredAt ? (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Hạn:{" "}
                {new Intl.DateTimeFormat("vi-VN").format(new Date(job.expiredAt))}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                job.status === EJobStatus.OPEN
                  ? "bg-tertiary-fixed/20 text-tertiary"
                  : job.status === EJobStatus.CLOSED
                    ? "bg-error/10 text-error"
                    : "bg-warning/10 text-warning"
              }`}
            >
              {getJobStatusLabel(job.status)}
            </span>
            {job.salaryMin != null || job.salaryMax != null ? (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)} VNĐ
              </span>
            ) : null}
            {job.experienceYears != null ? (
              <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
                {job.experienceYears} năm KN
              </span>
            ) : null}
          </div>

          {job.shortDescription ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Mô tả ngắn
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {job.shortDescription}
              </p>
            </div>
          ) : null}

          {job.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Mô tả chi tiết
              </p>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">
                {job.description}
              </div>
            </div>
          ) : null}

          {job.skills && job.skills.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Kỹ năng yêu cầu
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
