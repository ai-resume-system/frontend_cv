"use client";

import { useEffect, useState } from "react";
import { X, Calendar, MapPin, Link as LinkIcon, FileText } from "lucide-react";
import { EJobApplicationStatus, EJobApplicationStatusLabels } from "@/shared/constants/enums/job-application.enum";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import type { UpdateApplicationStatusPayload } from "@/shared/types/application";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  targetStatus: EJobApplicationStatus | null;
  onConfirm: (payload: UpdateApplicationStatusPayload) => Promise<void>;
}

export function StatusUpdateModal({
  isOpen,
  onClose,
  candidateName,
  targetStatus,
  onConfirm,
}: StatusUpdateModalProps) {
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [scheduleLink, setScheduleLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset form when modal opens/closes or targetStatus changes
  useEffect(() => {
    if (isOpen) {
      setScheduleTime("");
      setScheduleLocation("");
      setScheduleLink("");
      setNotes("");
      setErrors({});
      setGeneralError(null);
    }
  }, [isOpen, targetStatus]);

  if (!isOpen || !targetStatus) return null;

  const isInterview = targetStatus === EJobApplicationStatus.INTERVIEW;

  const getModalTitle = () => {
    switch (targetStatus) {
      case EJobApplicationStatus.REVIEWING:
        return "Duyệt sơ bộ hồ sơ";
      case EJobApplicationStatus.INTERVIEW:
        return "Lên lịch phỏng vấn";
      case EJobApplicationStatus.OFFERED:
        return "Gửi lời mời làm việc (Offer)";
      case EJobApplicationStatus.ACCEPTED:
        return "Xác nhận nhận việc";
      case EJobApplicationStatus.REJECTED:
        return "Từ chối hồ sơ ứng viên";
      default:
        return "Cập nhật trạng thái hồ sơ";
    }
  };

  const getNotesLabel = () => {
    switch (targetStatus) {
      case EJobApplicationStatus.REJECTED:
        return "Lý do từ chối";
      case EJobApplicationStatus.REVIEWING:
        return "Ghi chú đánh giá sơ bộ";
      case EJobApplicationStatus.OFFERED:
        return "Ghi chú điều kiện / Lời nhắn mời làm việc";
      case EJobApplicationStatus.ACCEPTED:
        return "Ghi chú nhận việc";
      case EJobApplicationStatus.INTERVIEW:
        return "Ghi chú phỏng vấn (Lời nhắn cho ứng viên)";
      default:
        return "Ghi chú";
    }
  };

  const getNotesPlaceholder = () => {
    switch (targetStatus) {
      case EJobApplicationStatus.REJECTED:
        return "Nhập lý do từ chối hồ sơ này (ví dụ: Chưa phù hợp với yêu cầu kinh nghiệm)...";
      case EJobApplicationStatus.INTERVIEW:
        return "Nhập lời nhắn hoặc ghi chú phỏng vấn gửi đến ứng viên...";
      case EJobApplicationStatus.OFFERED:
        return "Nhập chi tiết về mức lương đề xuất, ngày bắt đầu công việc...";
      default:
        return "Nhập ghi chú hoặc đánh giá thêm...";
    }
  };

  const handleConfirmClick = async () => {
    setErrors({});
    setGeneralError(null);

    const validationErrors: Record<string, string> = {};

    if (isInterview) {
      if (!scheduleTime) {
        validationErrors.scheduleTime = "Vui lòng chọn thời gian phỏng vấn.";
      }
      if (!scheduleLocation.trim()) {
        validationErrors.scheduleLocation = "Vui lòng nhập địa điểm hoặc nền tảng phỏng vấn.";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload: UpdateApplicationStatusPayload = {
        status: targetStatus,
      };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      if (isInterview) {
        payload.scheduleTime = new Date(scheduleTime).toISOString();
        payload.scheduleLocation = scheduleLocation.trim();
        if (scheduleLink.trim()) {
          payload.scheduleLink = scheduleLink.trim();
        }
      }

      await onConfirm(payload);
      onClose();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật trạng thái.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-lg flex-col rounded-[28px] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <div>
            <h3 className="text-lg font-bold text-on-surface">
              {getModalTitle()}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ứng viên: <span className="font-semibold text-primary">{candidateName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 max-h-[60vh] pr-1">
          {generalError && (
            <div className="rounded-xl bg-error/10 p-3.5 text-sm font-semibold text-error">
              {generalError}
            </div>
          )}

          {isInterview && (
            <>
              <BaseField
                id="scheduleTime"
                type="datetime-local"
                label="Thời gian phỏng vấn"
                required
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                error={errors.scheduleTime}
                leadingIcon={<Calendar className="h-5 w-5" />}
              />

              <BaseField
                id="scheduleLocation"
                type="text"
                label="Địa điểm phỏng vấn"
                placeholder="Ví dụ: Tầng 5, Tòa nhà A hoặc Google Meet"
                required
                value={scheduleLocation}
                onChange={(e) => setScheduleLocation(e.target.value)}
                error={errors.scheduleLocation}
                leadingIcon={<MapPin className="h-5 w-5" />}
              />

              <BaseField
                id="scheduleLink"
                type="text"
                label="Link phỏng vấn trực tuyến (nếu có)"
                placeholder="Ví dụ: https://meet.google.com/abc-xyz"
                value={scheduleLink}
                onChange={(e) => setScheduleLink(e.target.value)}
                leadingIcon={<LinkIcon className="h-5 w-5" />}
              />
            </>
          )}

          <BaseField
            id="notes"
            as="textarea"
            label={getNotesLabel()}
            placeholder={getNotesPlaceholder()}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            leadingIcon={<FileText className="h-5 w-5" />}
            inputClassName="resize-none min-h-24 py-2"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/15">
          <BaseButton variant="secondary" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </BaseButton>
          <BaseButton onClick={handleConfirmClick} loading={loading}>
            Xác nhận
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
