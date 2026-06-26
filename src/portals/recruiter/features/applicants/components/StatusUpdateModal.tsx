"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Link as LinkIcon,
  FileText,
  Video,
} from "lucide-react";
import { EJobApplicationStatus } from "@/shared/constants/enums/job-application.enum";
import { EInterviewType } from "@/shared/constants/enums/job-application.enum";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { RichTextEditor } from "@/portals/recruiter/components/ui/RichTextEditor";
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
  const [interviewType, setInterviewType] = useState<EInterviewType>(
    EInterviewType.OFFLINE,
  );
  const [interviewNotes, setInterviewNotes] = useState("");
  const [onboardingNotes, setOnboardingNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset form when modal opens/closes or targetStatus changes
  useEffect(() => {
    if (isOpen) {
      setScheduleTime("");
      setScheduleLocation("");
      setScheduleLink("");
      setInterviewType(EInterviewType.OFFLINE);
      setInterviewNotes("");
      setOnboardingNotes("");
      setRejectionReason("");
      setErrors({});
      setGeneralError(null);
    }
  }, [isOpen, targetStatus]);

  if (!isOpen || !targetStatus) return null;

  const isInterview = targetStatus === EJobApplicationStatus.INTERVIEW;

  const getModalTitle = () => {
    switch (targetStatus) {
      case EJobApplicationStatus.INTERVIEW:
        return "Lên lịch phỏng vấn";
      case EJobApplicationStatus.ACCEPTED:
        return "Thông báo trúng tuyển";
      case EJobApplicationStatus.REJECTED:
        return "Từ chối hồ sơ ứng viên";
      default:
        return "Cập nhật trạng thái hồ sơ";
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
      if (
        interviewType === EInterviewType.OFFLINE &&
        !scheduleLocation.trim()
      ) {
        validationErrors.scheduleLocation = "Vui lòng nhập địa điểm phỏng vấn.";
      }
      if (interviewType === EInterviewType.ONLINE && !scheduleLink.trim()) {
        validationErrors.scheduleLink =
          "Vui lòng nhập link phỏng vấn trực tuyến.";
      }
    }

    if (targetStatus === EJobApplicationStatus.ACCEPTED) {
      if (
        !onboardingNotes.trim() ||
        onboardingNotes.replace(/<[^>]*>/g, "").trim() === ""
      ) {
        validationErrors.onboardingNotes =
          "Vui lòng nhập thông tin nhắc nhở chuẩn bị đi làm.";
      }
    }

    if (targetStatus === EJobApplicationStatus.REJECTED) {
      if (
        !rejectionReason.trim() ||
        rejectionReason.replace(/<[^>]*>/g, "").trim() === ""
      ) {
        validationErrors.rejectionReason = "Vui lòng nhập lý do từ chối hồ sơ.";
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

      if (isInterview) {
        payload.interviewType = interviewType;
        payload.scheduleTime = new Date(scheduleTime).toISOString();
        if (interviewType === EInterviewType.OFFLINE) {
          payload.scheduleLocation = scheduleLocation.trim();
        } else {
          payload.scheduleLink = scheduleLink.trim();
        }
        if (interviewNotes.trim()) {
          payload.interviewNotes = interviewNotes.trim();
        }
      } else if (targetStatus === EJobApplicationStatus.ACCEPTED) {
        payload.onboardingNotes = onboardingNotes.trim();
      } else if (targetStatus === EJobApplicationStatus.REJECTED) {
        payload.rejectionReason = rejectionReason.trim();
      }

      await onConfirm(payload);
      onClose();
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi cập nhật trạng thái.",
      );
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
              Ứng viên:{" "}
              <span className="font-semibold text-primary">
                {candidateName}
              </span>
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
              {/* Chọn hình thức phỏng vấn */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Hình thức phỏng vấn
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewType(EInterviewType.OFFLINE);
                      setErrors((prev) => ({ ...prev, scheduleLocation: "" }));
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition cursor-pointer ${
                      interviewType === EInterviewType.OFFLINE
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Trực tiếp (Offline)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewType(EInterviewType.ONLINE);
                      setErrors((prev) => ({ ...prev, scheduleLink: "" }));
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition cursor-pointer ${
                      interviewType === EInterviewType.ONLINE
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>Trực tuyến (Online)</span>
                  </button>
                </div>
              </div>

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

              {interviewType === EInterviewType.OFFLINE ? (
                <BaseField
                  id="scheduleLocation"
                  type="text"
                  label="Địa điểm phỏng vấn"
                  placeholder="Ví dụ: Tòa nhà FUSE, phòng họp 301, tầng 3"
                  required
                  value={scheduleLocation}
                  onChange={(e) => setScheduleLocation(e.target.value)}
                  error={errors.scheduleLocation}
                  leadingIcon={<MapPin className="h-5 w-5" />}
                />
              ) : (
                <BaseField
                  id="scheduleLink"
                  type="text"
                  label="Link phỏng vấn trực tuyến"
                  placeholder="Ví dụ: https://meet.google.com/abc-xyz"
                  required
                  value={scheduleLink}
                  onChange={(e) => setScheduleLink(e.target.value)}
                  error={errors.scheduleLink}
                  leadingIcon={<LinkIcon className="h-5 w-5" />}
                />
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Quy định phỏng vấn
                </label>
                <RichTextEditor
                  value={interviewNotes}
                  onChange={(val) => setInterviewNotes(val)}
                  placeholder="Nhập quy định cho buổi phỏng vấn..."
                />
              </div>
            </>
          )}

          {targetStatus === EJobApplicationStatus.ACCEPTED && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Yêu cầu chuẩn bị nhận việc <span className="text-error">*</span>
              </label>
              <RichTextEditor
                value={onboardingNotes}
                onChange={(val) => {
                  setOnboardingNotes(val);
                  setErrors((prev) => ({ ...prev, onboardingNotes: "" }));
                }}
                placeholder="Nhập hướng dẫn chuẩn bị đi làm (thời gian, địa điểm, hồ sơ cần mang theo)..."
              />
              {errors.onboardingNotes && (
                <p className="text-xs text-error mt-1">
                  {errors.onboardingNotes}
                </p>
              )}
            </div>
          )}

          {targetStatus === EJobApplicationStatus.REJECTED && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Lý do từ chối hồ sơ <span className="text-error">*</span>
              </label>
              <RichTextEditor
                value={rejectionReason}
                onChange={(val) => {
                  setRejectionReason(val);
                  setErrors((prev) => ({ ...prev, rejectionReason: "" }));
                }}
                placeholder="Nhập chi tiết lý do từ chối hồ sơ ứng viên..."
              />
              {errors.rejectionReason && (
                <p className="text-xs text-error mt-1">
                  {errors.rejectionReason}
                </p>
              )}
            </div>
          )}
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
