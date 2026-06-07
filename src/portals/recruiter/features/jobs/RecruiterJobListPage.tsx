"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  SquareX,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import { EJobStatus } from "@/shared/constants/enums/job.enum";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseSearch } from "@/shared/components/ui/BaseSearch";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import type { Job } from "@/shared/types/job";

function formatSalary(value?: number): string {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getJobStatusClass(status: EJobStatus): string {
  switch (status) {
    case EJobStatus.OPEN:
      return "bg-tertiary-soft text-tertiary";
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
      return "Từ chối";
    case EJobStatus.EXPIRED:
      return "Hết hạn";
    case EJobStatus.DRAFT:
      return "Bản nháp";
  }
}

export function RecruiterJobListPage() {
  const { jobs, loading, error, handleDelete, handleClose } =
    useRecruiterJobList();

  // State bộ lọc và tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  const limit = 8;

  // Lọc danh sách công việc
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.careerCategory?.name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" ? true : job.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Số lượng tin theo từng trạng thái để hiển thị lên 3 Card
  const countOpen = jobs.filter((j) => j.status === EJobStatus.OPEN).length;
  const countPending = jobs.filter(
    (j) => j.status === EJobStatus.PENDING,
  ).length;
  const countClosed = jobs.filter((j) => j.status === EJobStatus.CLOSED).length;

  // Phân trang
  const startIndex = (page - 1) * limit;
  const pagedJobs = filteredJobs.slice(startIndex, startIndex + limit);

  // Định nghĩa các cột của BaseTable
  const columns: BaseTableColumn<Job>[] = [
    {
      key: "title",
      header: "Tiêu đề công việc",
      render: (job) => (
        <div>
          <p className="font-bold text-on-surface hover:text-primary transition">
            {job.title}
          </p>
          {job.careerCategory?.name && (
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {job.careerCategory.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (job) => (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getJobStatusClass(
            job.status,
          )}`}
        >
          {getJobStatusLabel(job.status)}
        </span>
      ),
    },
    {
      key: "salary",
      header: "Mức lương",
      render: (job) =>
        job.salaryMin != null || job.salaryMax != null
          ? `${formatSalary(job.salaryMin)} - ${formatSalary(job.salaryMax)}`
          : "Thỏa thuận",
    },
    {
      key: "address",
      header: "Địa điểm",
      render: (job) => job.address ?? "---",
    },
    {
      key: "expiredAt",
      header: "Hạn nộp",
      render: (job) =>
        job.expiredAt
          ? new Intl.DateTimeFormat("vi-VN").format(new Date(job.expiredAt))
          : "Chưa cập nhật",
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (job) => (
        <div className="flex items-center justify-end gap-2">
          {/* Nút Xem ứng viên */}
          <Link
            href={RECRUITER_ROUTES.APPLICANTS_BY_JOB(job.id)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Danh sách ứng viên"
          >
            <Eye className="h-4 w-4" />
          </Link>

          {/* Nút Xem preview bài đăng */}
          <button
            type="button"
            onClick={() => setPreviewJob(job)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-slate-100 hover:text-slate-700"
            title="Xem bài đăng"
          >
            <BriefcaseBusiness className="h-4 w-4" />
          </button>

          {/* Nút Chỉnh sửa */}
          <Link
            href={RECRUITER_ROUTES.JOB_EDIT(job.slug ?? job.id)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Chỉnh sửa tin"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          {/* Nút Đóng tin */}
          {job.status === EJobStatus.OPEN && (
            <button
              type="button"
              onClick={async () => {
                const reason = window.prompt("Nhập lý do đóng tin tuyển dụng:");
                if (reason === null) return;
                if (!reason.trim()) {
                  showErrorToast("Lý do đóng tin là bắt buộc.");
                  return;
                }
                try {
                  await handleClose(job.id, reason.trim());
                  showSuccessToast("Đóng tuyển dụng thành công.");
                } catch (err) {
                  showErrorToast(
                    err instanceof Error
                      ? err.message
                      : "Không thể đóng tin tuyển dụng.",
                  );
                }
              }}
              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-warning/10 hover:text-warning"
              title="Đóng tuyển dụng"
            >
              <SquareX className="h-4 w-4" />
            </button>
          )}

          {/* Nút Xóa tin */}
          <button
            type="button"
            onClick={async () => {
              if (
                window.confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")
              ) {
                try {
                  await handleDelete(job.id);
                  showSuccessToast("Xóa tin tuyển dụng thành công.");
                } catch (err) {
                  showErrorToast(
                    err instanceof Error
                      ? err.message
                      : "Không thể xóa tin tuyển dụng.",
                  );
                }
              }
            }}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
            title="Xóa tin"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <RecruiterWorkspaceShell
      heading="Tin tuyển dụng"
      subheading="Quản lý các chiến dịch tuyển dụng và tin đăng của doanh nghiệp."
      action={
        <Link href={RECRUITER_ROUTES.JOB_CREATE}>
          <BaseButton startIcon={<Plus className="h-4 w-4" />}>
            Đăng tin mới
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

        {/* 3 Thẻ chỉ số trạng thái tin */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="rounded-2xl bg-green-200 p-3.5 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tin đang mở
              </p>
              <p className="text-2xl font-extrabold text-on-surface mt-0.5">
                {loading ? "..." : countOpen}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="rounded-2xl bg-warning/15 p-3.5 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chờ duyệt / Nháp
              </p>
              <p className="text-2xl font-extrabold text-on-surface mt-0.5">
                {loading ? "..." : countPending}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="rounded-2xl bg-error/10 p-3.5 text-error">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tin đã đóng
              </p>
              <p className="text-2xl font-extrabold text-on-surface mt-0.5">
                {loading ? "..." : countClosed}
              </p>
            </div>
          </div>
        </section>

        {/* Bộ lọc và Tìm kiếm */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-outline-variant/15 shadow-sm">
          <BaseSearch
            placeholder="Tìm tin tuyển dụng, ngành nghề..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearchQuery("");
              setPage(1);
            }}
            containerClassName="flex-1 max-w-md"
            inputClassName="border-outline-variant/35 bg-surface focus:border-primary"
          />

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Tất cả", value: "ALL" },
              { label: "Đang tuyển", value: EJobStatus.OPEN },
              { label: "Chờ duyệt", value: EJobStatus.PENDING },
              { label: "Bản nháp", value: EJobStatus.DRAFT },
              { label: "Từ chối", value: EJobStatus.REJECTED },
              { label: "Đã đóng", value: EJobStatus.CLOSED },
              { label: "Hết hạn", value: EJobStatus.EXPIRED },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  selectedStatus === tab.value
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng danh sách tin */}
        <BaseTable
          columns={columns}
          data={pagedJobs}
          loading={loading}
          emptyMessage="Doanh nghiệp của bạn chưa có tin tuyển dụng nào phù hợp bộ lọc."
          pagination={{
            page,
            limit,
            total: filteredJobs.length,
            totalPages: Math.ceil(filteredJobs.length / limit),
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>

      {/* Modal Preview Tin tuyển dụng */}
      {previewJob && (
        <RecruiterJobPreviewModal
          job={previewJob}
          onClose={() => setPreviewJob(null)}
          onCloseJob={handleClose}
        />
      )}
    </RecruiterWorkspaceShell>
  );
}
