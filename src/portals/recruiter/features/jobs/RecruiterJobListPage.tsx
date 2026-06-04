"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  SquareX,
  Trash2,
} from "lucide-react";

import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/layouts/RecruiterWorkspaceShell";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { EJobStatus } from "@/shared/constants/enums/job.enum";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";

function formatSalary(value?: number): string {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getJobStatusClass(status: EJobStatus): string {
  switch (status) {
    case EJobStatus.OPEN:
      return "bg-tertiary-fixed/20 text-tertiary";
    case EJobStatus.CLOSED:
      return "bg-error/10 text-error";
    case EJobStatus.PENDING:
      return "bg-warning/10 text-warning";
    case EJobStatus.REJECTED:
      return "bg-error/10 text-error";
    case EJobStatus.EXPIRED:
      return "bg-outline/10 text-on-surface-variant";
    case EJobStatus.DRAFT:
      return "bg-outline/20 text-on-surface-variant";
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
    case EJobStatus.DRAFT:
      return "Bản nháp";
  }
}

export function RecruiterJobListPage() {
  const { jobs, loading, error, reload, handleDelete, handleClose } =
    useRecruiterJobList();

  return (
    <RecruiterWorkspaceShell
      heading="Tin tuyển dụng"
      subheading="Quản lý tất cả tin tuyển dụng của doanh nghiệp."
      action={
        <Link href={RECRUITER_ROUTES.JOB_CREATE}>
          <BaseButton startIcon={<Plus className="h-4 w-4" />}>
            Tạo tin mới
          </BaseButton>
        </Link>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-error/15 bg-error-container px-5 py-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-white/80 bg-white/85 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-on-surface-variant">Đang tải...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <BriefcaseBusiness className="h-12 w-12 text-outline" />
              <p className="text-sm text-on-surface-variant">
                Chưa có tin tuyển dụng nào.
              </p>
              <Link href={RECRUITER_ROUTES.JOB_CREATE}>
                <BaseButton variant="secondary" startIcon={<Plus className="h-4 w-4" />}>
                  Tạo tin đầu tiên
                </BaseButton>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    <th className="px-6 py-4">Tiêu đề</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Lương</th>
                    <th className="px-6 py-4">Địa điểm</th>
                    <th className="px-6 py-4">Hạn nộp</th>
                    <th className="px-6 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-outline-variant/10 transition hover:bg-surface-container-low/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface">{job.title}</p>
                        {job.careerCategory?.name ? (
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {job.careerCategory.name}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getJobStatusClass(job.status)}`}
                        >
                          {getJobStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {job.salaryMin != null || job.salaryMax != null
                          ? `${formatSalary(job.salaryMin)} - ${formatSalary(job.salaryMax)}`
                          : "---"}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {job.address ?? "---"}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {job.expiredAt
                          ? new Intl.DateTimeFormat("vi-VN").format(
                              new Date(job.expiredAt),
                            )
                          : "---"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(job.id)}
                            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                            title="Xem ứng viên"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={RECRUITER_ROUTES.JOB_EDIT(job.slug ?? job.id)}
                            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          {job.status === EJobStatus.OPEN ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const reason = window.prompt("Nhập lý do đóng tin tuyển dụng:");
                                if (reason === null) return;
                                if (!reason.trim()) {
                                  alert("Lý do đóng tin là bắt buộc.");
                                  return;
                                }
                                try {
                                  await handleClose(job.id, reason.trim());
                                } catch {
                                  alert("Không thể đóng tin.");
                                }
                              }}
                              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-warning/10 hover:text-warning"
                              title="Đóng tin"
                            >
                              <SquareX className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm("Xóa tin tuyển dụng này?")) {
                                try {
                                  await handleDelete(job.id);
                                } catch {
                                  alert("Không thể xóa tin.");
                                }
                              }
                            }}
                            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RecruiterWorkspaceShell>
  );
}
