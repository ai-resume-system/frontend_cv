"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  SlidersHorizontal,
} from "lucide-react";

import { showSuccessToast, showErrorToast } from "@/shared/lib/ui/toast";
import { RecruiterWorkspaceShell } from "@/portals/recruiter/components/RecruiterWorkspaceShell";
import { useRecruiterJobList } from "@/portals/recruiter/features/jobs/useRecruiterJobList";
import { BaseTable, BaseTableColumn } from "@/shared/components/ui/BaseTable";
import { RecruiterJobPreviewModal } from "@/portals/recruiter/features/jobs/RecruiterJobPreviewModal";
import {
  EJobStatus,
  EJobStatusLabels,
  EJobType,
  EJobEducationLevel,
  EJobWorkArrangement,
} from "@/shared/constants/enums/job.enum";
import {
  JOB_TYPE_OPTIONS,
  JOB_WORK_ARRANGEMENT_OPTIONS,
  JOB_EDUCATION_LEVEL_OPTIONS,
} from "@/shared/constants/constants/filter.constants";
import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseSearch } from "@/shared/components/ui/BaseSearch";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { cn } from "@/shared/lib/utils/cn";
import type { Job } from "@/shared/types/job";

function formatSalary(value?: number): string {
  if (value == null) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getJobStatusClass(status: EJobStatus): string {
  switch (status) {
    case EJobStatus.OPEN:
      return "bg-green-200 text-green-800";
    case EJobStatus.CLOSED:
      return "bg-red-200 text-red-800";
    case EJobStatus.PENDING:
      return "bg-yellow-200 text-yellow-800";
    case EJobStatus.REJECTED:
      return "bg-error/10 text-error";
    case EJobStatus.EXPIRED:
      return "bg-orange-200 text-orange-800";
    case EJobStatus.DRAFT:
      return "bg-outline/20 text-on-surface-variant";
  }
}

export function RecruiterJobListPage() {
  const {
    jobs,
    pagination,
    allJobsForCounts,
    loading,
    error,
    loadJobs,
    handleDelete,
    handleClose,
  } = useRecruiterJobList();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Đọc các giá trị bộ lọc hiện tại từ URL Search Params làm Source of Truth
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const searchQuery = searchParams.get("q") ?? "";
  const selectedStatus = searchParams.get("status") ?? "ALL";
  const selectedJobType = searchParams.get("jobType") ?? "ALL";
  const selectedWorkArrangement = searchParams.get("workArrangement") ?? "ALL";
  const selectedEducationLevel = searchParams.get("educationLevel") ?? "ALL";
  const experienceYearsMin = searchParams.get("experienceYearsMin") ?? "";
  const experienceYearsMax = searchParams.get("experienceYearsMax") ?? "";
  const salaryMin = searchParams.get("salaryMin") ?? "";
  const salaryMax = searchParams.get("salaryMax") ?? "";

  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  // State cục bộ cho ô tìm kiếm chữ (để debounce tránh giật lag khi gõ)
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);

  // Đồng bộ lại ô tìm kiếm khi URL thay đổi (như khi bấm Back/Forward trình duyệt)
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);

  // Quản lý đóng mở Dropdown Lọc
  const [showFilters, setShowFilters] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // State tạm thời trong Hộp thoại lọc (chỉ áp dụng khi người dùng bấm OK/Áp dụng)
  const [pendingJobType, setPendingJobType] = useState("ALL");
  const [pendingWorkArrangement, setPendingWorkArrangement] = useState("ALL");
  const [pendingEducationLevel, setPendingEducationLevel] = useState("ALL");
  const [pendingExperienceMin, setPendingExperienceMin] = useState("");
  const [pendingExperienceMax, setPendingExperienceMax] = useState("");
  const [pendingSalaryMin, setPendingSalaryMin] = useState("");
  const [pendingSalaryMax, setPendingSalaryMax] = useState("");

  // Đồng bộ lại các bộ lọc tạm thời với URL params khi mở Dropdown
  useEffect(() => {
    if (showFilters) {
      setPendingJobType(selectedJobType);
      setPendingWorkArrangement(selectedWorkArrangement);
      setPendingEducationLevel(selectedEducationLevel);
      setPendingExperienceMin(experienceYearsMin);
      setPendingExperienceMax(experienceYearsMax);
      setPendingSalaryMin(salaryMin);
      setPendingSalaryMax(salaryMax);
    }
  }, [
    showFilters,
    selectedJobType,
    selectedWorkArrangement,
    selectedEducationLevel,
    experienceYearsMin,
    experienceYearsMax,
    salaryMin,
    salaryMax,
  ]);

  // Click ra ngoài để tự động đóng Dropdown Lọc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm cập nhật URL Search Params
  const updateUrl = (
    newParams: Record<string, string | number | undefined | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "ALL"
      ) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Tự động cập nhật từ khóa lên URL sau 500ms khi người dùng dừng gõ phím (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempSearchQuery !== searchQuery) {
        updateUrl({ q: tempSearchQuery, page: 1 });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [tempSearchQuery, searchQuery]);

  // Lọc và phân trang ở Server-side qua useEffect khi URL thay đổi
  useEffect(() => {
    void loadJobs({
      page,
      limit,
      q: searchQuery,
      status:
        selectedStatus === "ALL" ? undefined : (selectedStatus as EJobStatus),
      jobType:
        selectedJobType === "ALL" ? undefined : (selectedJobType as EJobType),
      workArrangement:
        selectedWorkArrangement === "ALL"
          ? undefined
          : (selectedWorkArrangement as EJobWorkArrangement),
      educationLevel:
        selectedEducationLevel === "ALL"
          ? undefined
          : (selectedEducationLevel as EJobEducationLevel),
      experienceYearsMin: experienceYearsMin
        ? parseInt(experienceYearsMin, 10)
        : undefined,
      experienceYearsMax: experienceYearsMax
        ? parseInt(experienceYearsMax, 10)
        : undefined,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
    });
  }, [
    page,
    searchQuery,
    selectedStatus,
    selectedJobType,
    selectedWorkArrangement,
    selectedEducationLevel,
    experienceYearsMin,
    experienceYearsMax,
    salaryMin,
    salaryMax,
    limit,
    loadJobs,
  ]);

  // Số lượng bộ lọc nâng cao đang hoạt động để hiển thị số badge đỏ
  const activeFiltersCount = [
    selectedJobType !== "ALL",
    selectedWorkArrangement !== "ALL",
    selectedEducationLevel !== "ALL",
    Boolean(experienceYearsMin),
    Boolean(experienceYearsMax),
    Boolean(salaryMin),
    Boolean(salaryMax),
  ].filter(Boolean).length;

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = () => {
    updateUrl({
      jobType: pendingJobType,
      workArrangement: pendingWorkArrangement,
      educationLevel: pendingEducationLevel,
      experienceYearsMin: pendingExperienceMin,
      experienceYearsMax: pendingExperienceMax,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      page: 1,
    });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setPendingJobType("ALL");
    setPendingWorkArrangement("ALL");
    setPendingEducationLevel("ALL");
    setPendingExperienceMin("");
    setPendingExperienceMax("");
    setPendingSalaryMin("");
    setPendingSalaryMax("");
  };

  // Số lượng tin theo từng trạng thái để hiển thị lên 3 Card từ allJobsForCounts
  const countOpen = allJobsForCounts.filter(
    (j) => j.status === EJobStatus.OPEN,
  ).length;
  const countPending = allJobsForCounts.filter(
    (j) => j.status === EJobStatus.PENDING,
  ).length;
  const countClosed = allJobsForCounts.filter(
    (j) => j.status === EJobStatus.CLOSED,
  ).length;

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
          {EJobStatusLabels[job.status]}
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
      header: "Hạn nộp hồ sơ",
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
          {/* Nút Xem ứng viên - Truyền kèm backUrl chứa đầy đủ các bộ lọc hiện tại */}
          <Link
            href={`${RECRUITER_ROUTES.APPLICANTS_BY_JOB(job.id)}?backUrl=${encodeURIComponent(
              searchParams.toString()
                ? `${pathname}?${searchParams.toString()}`
                : pathname,
            )}`}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
            title="Danh sách ứng viên"
          >
            <BriefcaseBusiness className="h-4 w-4" />
          </Link>

          {/* Nút Xem preview bài đăng */}
          <button
            type="button"
            onClick={() => setPreviewJob(job)}
            className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            title="Xem bài đăng"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Nút Chỉnh sửa */}
          {job.status !== EJobStatus.CLOSED &&
            job.status !== EJobStatus.REJECTED && (
              <Link
                href={RECRUITER_ROUTES.JOB_EDIT(job.slug ?? job.id)}
                className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-primary-soft hover:text-primary"
                title="Chỉnh sửa tin"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            )}

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
              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-warning/10 hover:text-warning cursor-pointer"
              title="Đóng tuyển dụng"
            >
              <SquareX className="h-4 w-4" />
            </button>
          )}

          {/* Nút Xóa tin */}
          {job.status === EJobStatus.DRAFT && (
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    "Bạn có chắc chắn muốn xóa tin tuyển dụng này?",
                  )
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
              className="rounded-xl border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error cursor-pointer"
              title="Xóa tin"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <RecruiterWorkspaceShell
      heading="Danh sách tin tuyển dụng"
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-outline-variant/15 shadow-sm">
          <div className="flex flex-1 items-center gap-3 w-full lg:max-w-xl">
            <BaseSearch
              placeholder="Tìm tin tuyển dụng, ngành nghề..."
              value={tempSearchQuery}
              onChange={(e) => {
                setTempSearchQuery(e.target.value);
              }}
              onClear={() => {
                setTempSearchQuery("");
                updateUrl({ q: "", page: 1 });
              }}
              containerClassName="flex-1"
              inputClassName="border-outline-variant/35 bg-surface focus:border-primary"
            />

            {/* Hộp lọc Dropdown Popover */}
            <div className="relative shrink-0" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={handleToggleFilters}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer h-10 select-none",
                  activeFiltersCount > 0
                    ? "border-primary bg-primary-soft text-primary shadow-xs"
                    : "border-outline-variant/35 bg-surface text-slate-600 hover:bg-slate-50",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white font-extrabold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-80 sm:w-105 rounded-3xl border border-outline-variant/15 bg-white p-5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  {/* Grid các trường lọc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-87.5 overflow-y-auto pr-1">
                    {/* Job Type Filter */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Loại hình công việc
                      </label>
                      <select
                        value={pendingJobType}
                        onChange={(e) => setPendingJobType(e.target.value)}
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200 cursor-pointer"
                      >
                        {JOB_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value || "ALL"}>
                            {opt.label || "Tất cả loại hình"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Work Arrangement Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Hình thức làm việc
                      </label>
                      <select
                        value={pendingWorkArrangement}
                        onChange={(e) =>
                          setPendingWorkArrangement(e.target.value)
                        }
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200 cursor-pointer"
                      >
                        {JOB_WORK_ARRANGEMENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value || "ALL"}>
                            {opt.label || "Tất cả hình thức"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Education Level Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Trình độ học vấn
                      </label>
                      <select
                        value={pendingEducationLevel}
                        onChange={(e) =>
                          setPendingEducationLevel(e.target.value)
                        }
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200 cursor-pointer"
                      >
                        {JOB_EDUCATION_LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value || "ALL"}>
                            {opt.label || "Tất cả trình độ"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Years Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Kinh nghiệm tối thiểu (năm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 1, 2..."
                        value={pendingExperienceMin}
                        onChange={(e) =>
                          setPendingExperienceMin(e.target.value)
                        }
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Kinh nghiệm tối đa (năm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 3, 5..."
                        value={pendingExperienceMax}
                        onChange={(e) =>
                          setPendingExperienceMax(e.target.value)
                        }
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Salary Range Filter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Lương tối thiểu (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 10000000"
                        value={pendingSalaryMin}
                        onChange={(e) => setPendingSalaryMin(e.target.value)}
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Lương tối đa (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ví dụ: 20000000"
                        value={pendingSalaryMax}
                        onChange={(e) => setPendingSalaryMax(e.target.value)}
                        className="w-full border border-outline-variant/35 bg-surface px-3 py-2 text-xs md:text-sm text-on-surface rounded-xl focus:border-primary focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Chân hộp thoại Dropdown */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer select-none"
                    >
                      Bỏ chọn tất cả
                    </button>
                    <BaseButton
                      size="sm"
                      onClick={handleApplyFilters}
                      className="px-5 py-1.5 text-xs font-bold rounded-full h-8"
                    >
                      Áp dụng
                    </BaseButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {[
              { label: "Tất cả", value: "ALL" },
              { label: "Đang mở", value: EJobStatus.OPEN },
              { label: "Chờ duyệt", value: EJobStatus.PENDING },
              { label: "Từ chối", value: EJobStatus.REJECTED },
              { label: "Đã đóng", value: EJobStatus.CLOSED },
              { label: "Hết hạn", value: EJobStatus.EXPIRED },
              { label: "Bản nháp", value: EJobStatus.DRAFT },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  updateUrl({ status: tab.value, page: 1 });
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
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
          data={jobs}
          loading={loading}
          emptyMessage="Doanh nghiệp của bạn chưa có tin tuyển dụng nào phù hợp bộ lọc."
          itemName="tin tuyển dụng"
          pagination={{
            page,
            limit,
            total: pagination?.totalItems ?? 0,
            totalPages: pagination?.totalPages ?? 1,
            onPageChange: (newPage) => updateUrl({ page: newPage }),
            onLimitChange: (newLimit) =>
              updateUrl({ limit: newLimit, page: 1 }),
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
