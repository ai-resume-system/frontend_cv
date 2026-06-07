"use client";

import { useState } from "react";
import { BriefcaseBusiness, CalendarDays, MapPin, X, Users, GraduationCap, Laptop, SquareX } from "lucide-react";

import {
  EJobStatus,
  EJobStatusLabels,
  EJobType,
  EJobTypeLabels,
  EJobEducationLevelLabels,
  EJobWorkArrangementLabels,
} from "@/shared/constants/enums/job.enum";
import type { Job } from "@/shared/types/job";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";

interface RecruiterJobPreviewModalProps {
  job: Job;
  onClose: () => void;
  onCloseJob?: (id: string, reason: string) => Promise<void>;
}

function formatSalary(value?: number): string {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function RecruiterJobPreviewModal({
  job,
  onClose,
  onCloseJob,
}: RecruiterJobPreviewModalProps) {
  const [closing, setClosing] = useState(false);

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
        err instanceof Error ? err.message : "Không thể đóng tin tuyển dụng."
      );
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[28px] bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <h2 className="text-xl font-bold text-on-surface">
            Chi tiết tin tuyển dụng
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-6 pr-1">
          <div>
            <h3 className="text-xl font-bold text-on-surface">{job.title}</h3>
            {job.careerCategory?.name ? (
              <p className="mt-1 text-sm text-on-surface-variant">
                {job.careerCategory.name}
              </p>
            ) : null}
          </div>

          {/* Các thông tin cơ bản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-on-surface-variant bg-slate-50 p-4 rounded-2xl border border-outline-variant/15">
            {job.address ? (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate" title={job.address}>
                  Địa điểm: {job.address}
                </span>
              </span>
            ) : null}
            <span className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-primary shrink-0" />
              <span>Hình thức: {EJobTypeLabels[job.jobType]}</span>
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>Số lượng tuyển: {job.vacancyCount ?? 1} chỉ tiêu</span>
            </span>
            {job.educationLevel ? (
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <span>Học vấn: {EJobEducationLevelLabels[job.educationLevel]}</span>
              </span>
            ) : null}
            {job.workArrangement ? (
              <span className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary shrink-0" />
                <span>Nơi làm việc: {EJobWorkArrangementLabels[job.workArrangement]}</span>
              </span>
            ) : null}
            {job.expiredAt ? (
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Hạn nộp:{" "}
                  {new Intl.DateTimeFormat("vi-VN").format(new Date(job.expiredAt))}
                </span>
              </span>
            ) : null}
          </div>

          {/* Nhãn trạng thái, lương, kinh nghiệm */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                job.status === EJobStatus.OPEN
                  ? "bg-tertiary-soft text-tertiary border border-tertiary/20"
                  : job.status === EJobStatus.CLOSED
                    ? "bg-error/10 text-error"
                    : job.status === EJobStatus.PENDING
                      ? "bg-warning/10 text-warning"
                      : "bg-outline/20 text-on-surface-variant"
              }`}
            >
              {EJobStatusLabels[job.status]}
            </span>
            {job.salaryMin != null || job.salaryMax != null ? (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)} VNĐ
              </span>
            ) : (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                Thỏa thuận
              </span>
            )}
            {job.experienceYears != null ? (
              <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
                Yêu cầu {job.experienceYears} năm KN
              </span>
            ) : null}
          </div>

          {job.shortDescription ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mô tả ngắn
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {job.shortDescription}
              </p>
            </div>
          ) : null}

          {job.description ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mô tả chi tiết
              </p>
              {job.description.includes("<") && job.description.includes(">") ? (
                <div
                  className="mt-2 text-sm leading-6 text-on-surface-variant ql-editor-content"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">
                  {job.description}
                </div>
              )}
            </div>
          ) : null}

          {job.skills && job.skills.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ma trận kỹ năng AI yêu cầu
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-3.5 py-1.5 text-xs font-semibold text-on-surface border border-outline-variant/10 shadow-sm"
                  >
                    <span>{skill.name}</span>
                    <span className="text-primary font-bold shrink-0">
                      ({skill.weight ?? 1}/5)
                    </span>
                    {(skill.weight ?? 1) >= 4 && (
                      <span className="ml-1 rounded-full bg-tertiary-soft px-1.5 py-0.5 text-[8px] font-bold text-tertiary uppercase tracking-wider shrink-0">
                        Chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/15 mt-6 shrink-0">
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
