"use client";

import { BaseModal } from "@/shared/components/ui/BaseModal";
import type { RecruiterApplicationApiItem } from "@/shared/types/application";
import {
  EJobApplicationStatus,
  EInterviewType,
} from "@/shared/constants/enums/job-application.enum";
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  Video,
  Link2,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: RecruiterApplicationApiItem | null;
}

function getStatusLabel(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "Mới ứng tuyển";
    case EJobApplicationStatus.INTERVIEW:
      return "Lịch phỏng vấn";
    case EJobApplicationStatus.REJECTED:
      return "Đã từ chối";
    case EJobApplicationStatus.ACCEPTED:
      return "Nhận việc";
    case EJobApplicationStatus.WITHDRAWN:
      return "Đã rút";
  }
}

function getStatusClass(status: EJobApplicationStatus): string {
  switch (status) {
    case EJobApplicationStatus.APPLIED:
      return "bg-warning/15 text-warning";
    case EJobApplicationStatus.INTERVIEW:
      return "bg-primary-soft text-primary";
    case EJobApplicationStatus.REJECTED:
      return "bg-error/10 text-error";
    case EJobApplicationStatus.ACCEPTED:
      return "bg-tertiary-fixed/20 text-tertiary";
    case EJobApplicationStatus.WITHDRAWN:
      return "bg-outline/10 text-on-surface-variant";
  }
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
}: ApplicationDetailModalProps) {
  if (!application) return null;

  const formatDateTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const email =
    application.contactEmail || application.user?.email || "Chưa cung cấp";
  const phone =
    application.contactPhone || application.user?.phone || "Chưa cung cấp";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="font-bold">Chi tiết đơn ứng tuyển</span>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(
              application.status,
            )}`}
          >
            {getStatusLabel(application.status)}
          </span>
        </div>
      }
      size="xl"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-outline-variant/40 bg-surface-container-low shrink-0 flex items-center justify-center text-xl font-bold text-primary shadow-xs">
              {application.user?.avatarUrl ? (
                <img
                  src={application.user.avatarUrl}
                  alt={application.fullName || "Avatar"}
                  className="object-cover h-full w-full"
                />
              ) : (
                (application.fullName || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">
                {application.fullName ?? "Chưa có tên"}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Ứng tuyển vị trí:{" "}
                <span className="text-primary font-semibold">
                  {application.job?.title || "Không rõ"}
                </span>
              </p>
            </div>
          </div>

          {/* Matching score */}
          <div className="flex items-center gap-3 bg-surface-container-low/50 p-2.5 rounded-2xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Độ phù hợp
            </span>
            {application.matchingScore != null &&
            application.matchingScore > 0 ? (
              <div className="flex items-center gap-2">
                <svg className="h-10 w-10 shrink-0" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={
                      application.matchingScore >= 70
                        ? "#10b981"
                        : application.matchingScore >= 40
                          ? "#eab308"
                          : "#ef4444"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${application.matchingScore > 100 ? 100 : application.matchingScore} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[9px] font-extrabold"
                    fill="currentColor"
                  >
                    {Math.round(application.matchingScore)}%
                  </text>
                </svg>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                Chưa có điểm
              </span>
            )}
          </div>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5 text-primary">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">
                Email liên hệ
              </p>
              <p className="text-sm font-semibold text-on-surface truncate">
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5 text-primary">
              <Phone className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">
                Số điện thoại
              </p>
              <p className="text-sm font-semibold text-on-surface truncate">
                {phone}
              </p>
            </div>
          </div>
        </div>

        {/* Cover letter */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-outline" />
            <span>Thư giới thiệu</span>
          </h4>
          <div className="rounded-2xl bg-surface-container-low/75 p-4 text-sm text-on-surface-variant whitespace-pre-wrap border border-outline-variant/10 italic">
            {application.coverLetter
              ? application.coverLetter
              : "Không gửi kèm thư giới thiệu."}
          </div>
        </div>

        {/* Status specific notes */}
        {application.status === EJobApplicationStatus.INTERVIEW &&
          application.scheduleTime && (
            <div className="space-y-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5" />
                <span>Thông tin cuộc hẹn phỏng vấn</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">
                    Thời gian
                  </span>
                  <span className="font-semibold text-on-surface">
                    {formatDateTime(application.scheduleTime)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">
                    Hình thức
                  </span>
                  <span className="font-semibold text-on-surface flex items-center gap-1.5 mt-0.5">
                    {application.interviewType === EInterviewType.ONLINE ? (
                      <>
                        <Video className="h-4 w-4 text-secondary" />
                        <span>Trực tuyến (Online)</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-secondary" />
                        <span>Trực tiếp (Offline)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {application.interviewType === EInterviewType.ONLINE &&
                application.scheduleLink && (
                  <div className="text-sm pt-2 border-t border-primary/10">
                    <span className="text-xs text-on-surface-variant block font-medium">
                      Link phỏng vấn
                    </span>
                    <a
                      href={application.scheduleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-secondary hover:underline flex items-center gap-1.5 mt-0.5 break-all"
                    >
                      <Link2 className="h-4 w-4 shrink-0" />
                      <span>{application.scheduleLink}</span>
                    </a>
                  </div>
                )}

              {application.interviewType === EInterviewType.OFFLINE &&
                application.scheduleLocation && (
                  <div className="text-sm pt-2 border-t border-primary/10">
                    <span className="text-xs text-on-surface-variant block font-medium">
                      Địa điểm phỏng vấn
                    </span>
                    <span className="font-semibold text-on-surface flex items-start gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-outline shrink-0 mt-0.5" />
                      <span>{application.scheduleLocation}</span>
                    </span>
                  </div>
                )}

              {application.interviewNotes && (
                <div className="text-sm pt-2 border-t border-primary/10">
                  <span className="text-xs text-on-surface-variant block font-medium mb-1">
                    Quy định phỏng vấn
                  </span>
                  <div
                    className="rounded-xl bg-white p-3 border border-slate-200 text-slate-700 prose prose-sm max-w-none break-words [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: application.interviewNotes.replace(
                        /&nbsp;/g,
                        " ",
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          )}

        {application.status === EJobApplicationStatus.ACCEPTED &&
          application.onboardingNotes && (
            <div className="space-y-2 p-4 rounded-2xl border border-tertiary/20 bg-tertiary-fixed/10">
              <h4 className="text-sm font-bold text-tertiary flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Hướng dẫn chuẩn bị nhận việc</span>
              </h4>
              <div
                className="rounded-xl bg-white p-4 border border-outline-variant/10 text-on-surface-variant prose prose-sm max-w-none break-words shadow-xs [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: application.onboardingNotes.replace(/&nbsp;/g, " "),
                }}
              />
            </div>
          )}

        {application.status === EJobApplicationStatus.REJECTED &&
          application.rejectionReason && (
            <div className="space-y-2 p-4 rounded-2xl border border-error/20 bg-error/5">
              <h4 className="text-sm font-bold text-error flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>Chi tiết lý do từ chối</span>
              </h4>
              <div
                className="rounded-xl bg-white p-4 border border-outline-variant/10 text-on-surface-variant prose prose-sm max-w-none break-words shadow-xs [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: application.rejectionReason.replace(/&nbsp;/g, " "),
                }}
              />
            </div>
          )}

        {/* CV Attachments Area */}
        <div className="space-y-3 pt-4 border-t border-outline-variant/15">
          <h4 className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
            Tài liệu đính kèm
          </h4>
          {application.cv?.fileUrl ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {application.cv.title || "CV_UngVien.pdf"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Định dạng: PDF
                  </p>
                </div>
              </div>

              <div className="flex flex-row items-center gap-2">
                <a
                  href={application.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft/30 cursor-pointer shadow-xs"
                >
                  <Eye className="h-4 w-4" />
                  <span>Xem CV</span>
                </a>
                <a
                  href={application.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover cursor-pointer shadow-xs"
                  title="Tải CV"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải về</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-outline italic">
              Không tìm thấy tệp CV đính kèm.
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
