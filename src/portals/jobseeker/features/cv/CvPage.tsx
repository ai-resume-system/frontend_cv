"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit2,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BaseButton } from "@/shared/components/ui/BaseButton";
import { BaseField } from "@/shared/components/ui/BaseField";
import { BasePagination } from "@/shared/components/ui/BasePagination";
import { JOBSEEKER_ROUTES } from "@/shared/constants/constants/routes";
import { useCvList } from "@/shared/hooks/data/useCvList";
import {
  showAppAlert,
  showConfirmAlert,
  showErrorAlert,
} from "@/shared/lib/ui/alert";
import { cn } from "@/shared/lib/utils/cn";
import { fetchCvPreview } from "@/shared/services/cv.service";
import type { CvItem } from "@/shared/types/cv";
import { RenameModal } from "../../components/cv/RenameModal";
import { UploadModal } from "../../components/cv/UploadModal";

const PROCESSING_STATUS_CONFIG = {
  pending: {
    label: "Chưa phân tích",
    className: "bg-slate-100 text-slate-600",
  },
  processing: {
    label: "Đang xử lý...",
    className: "bg-blue-50 text-blue-600 animate-pulse",
  },
  completed: {
    label: "Đã xử lý",
    className: "bg-emerald-50 text-emerald-600",
  },
  failed: {
    label: "Lỗi phân tích",
    className: "bg-rose-50 text-rose-600",
  },
} as const;

function formatDateTime(value?: Date | string | null): string {
  if (!value) return "Đang cập nhật";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==================== COMPONENT: CV CARD (GRID) ====================
interface CvCardProps {
  cv: CvItem;
  isPreviewing: boolean;
  isDownloading: boolean;
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, isDefault: boolean) => void;
  onRenameOpen: (id: string, currentTitle: string) => void;
  onCopyLink: (id: string) => void;
  onShareFacebook: (id: string) => void;
  onNavigateToAnalysis: (id: string, status: string) => void;
}

function CvCard({
  cv,
  isPreviewing,
  isDownloading,
  isMenuOpen,
  onMenuToggle,
  onCloseMenu,
  onPreview,
  onDownload,
  onDelete,
  onSetDefault,
  onRenameOpen,
  onCopyLink,
  onShareFacebook,
  onNavigateToAnalysis,
}: CvCardProps) {
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = () => onCloseMenu();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      {/* Thumbnail Area */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-slate-100/70 flex items-center justify-center border border-slate-100">
        {/* Document Icon & Folder Visual */}
        <div className="flex flex-col items-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
          <div className="relative flex h-16 w-20 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20 shadow-xs">
            <FileText className="h-9 w-9 text-primary" />
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm uppercase">
              {cv.fileExtension?.replace(".", "") || "PDF"}
            </div>
          </div>
          <span className="text-[11px] font-extrabold tracking-wider text-primary/80 uppercase mt-1">
            HỒ SƠ XIN VIỆC
          </span>
        </div>

        {/* Ngôi sao gán mặc định (Góc trên bên phải) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(cv.id, !cv.isDefault);
          }}
          className={cn(
            "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition hover:scale-110 active:scale-95",
            cv.isDefault
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-600",
          )}
          title={cv.isDefault ? "Hồ sơ mặc định" : "Đặt làm mặc định"}
          type="button"
        >
          <Star className={cn("h-6 w-6", cv.isDefault && "fill-amber-400")} />
        </button>

        {/* Nút hành động đè lên dưới thumbnail */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2.5 px-3">
          <button
            onClick={() => onPreview(cv.id)}
            disabled={isPreviewing}
            className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 active:scale-97"
            type="button"
          >
            {isPreviewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Xem trước</span>
          </button>

          <button
            onClick={() => onDownload(cv.id)}
            disabled={isDownloading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 active:scale-95"
            title="Tải về"
            type="button"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(e);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
              title="Thao tác khác"
              type="button"
            >
              <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 bottom-11 z-20 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                <button
                  onClick={() => onCopyLink(cv.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  Sao chép liên kết
                </button>
                <button
                  onClick={() => onShareFacebook(cv.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  Chia sẻ trên Facebook
                </button>
                <button
                  onClick={() => onRenameOpen(cv.id, cv.title || "")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                  Đổi tên
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => onDelete(cv.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-error hover:bg-error-container/20"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5 text-error" />
                  Xóa hồ sơ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="mt-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-bold leading-tight text-slate-800 line-clamp-1 flex-1"
            title={cv.title || ""}
          >
            {cv.title ?? "Hồ sơ không tên"}
          </h4>

          <button
            onClick={() => onNavigateToAnalysis(cv.id, processingStatus)}
            disabled={processingStatus === "processing"}
            className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition disabled:opacity-50"
            title="Xem kết quả phân tích AI"
            type="button"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400">
            Cập nhật: {formatDateTime(cv.updatedAt)}
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase",
              statusConfig.className,
            )}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Toggle Switch: Cho phép NTD tìm kiếm */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-500">
            Cho phép NTD tìm kiếm
          </span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={cv.isDefault ?? false}
              onChange={() => onSetDefault(cv.id, !cv.isDefault)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
          </label>
        </div>
      </div>
    </article>
  );
}

// ==================== COMPONENT: CV ROW (LIST) ====================
interface CvRowProps {
  cv: CvItem;
  isPreviewing: boolean;
  isDownloading: boolean;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, isDefault: boolean) => void;
  onRenameOpen: (id: string, currentTitle: string) => void;
  onNavigateToAnalysis: (id: string, status: string) => void;
}

function CvRow({
  cv,
  isPreviewing,
  isDownloading,
  onPreview,
  onDownload,
  onDelete,
  onSetDefault,
  onRenameOpen,
  onNavigateToAnalysis,
}: CvRowProps) {
  const processingStatus = cv.processingStatus ?? "pending";
  const statusConfig =
    PROCESSING_STATUS_CONFIG[processingStatus] ??
    PROCESSING_STATUS_CONFIG.pending;
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:translate-x-0.5 hover:border-primary/20 hover:shadow-[0_8px_16px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <FileText className="h-5.5 w-5.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className="font-bold text-slate-800 truncate"
                title={cv.title || ""}
              >
                {cv.title ?? "Hồ sơ không tên"}
              </h4>
              {cv.isDefault && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  Mặc định
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Cập nhật: {formatDateTime(cv.updatedAt)}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  statusConfig.className,
                )}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end shrink-0">
          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              NTD tìm kiếm
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={cv.isDefault ?? false}
                onChange={() => onSetDefault(cv.id, !cv.isDefault)}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
            </label>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
            <button
              onClick={() => onPreview(cv.id)}
              disabled={isPreviewing}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 disabled:opacity-50"
              title="Xem CV"
              type="button"
            >
              {isPreviewing ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>

            <button
              onClick={() => onDownload(cv.id)}
              disabled={isDownloading}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95 disabled:opacity-50"
              title="Tải xuống"
              type="button"
            >
              {isDownloading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Download className="h-4.5 w-4.5" />
              )}
            </button>

            <button
              onClick={() => onNavigateToAnalysis(cv.id, processingStatus)}
              disabled={processingStatus === "processing"}
              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95 disabled:opacity-50"
              title="Phân tích CV bằng AI"
              type="button"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => onRenameOpen(cv.id, cv.title || "")}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
              title="Đổi tên"
              type="button"
            >
              <Edit2 className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={async () => {
                setIsDeleting(true);
                await onDelete(cv.id);
                setIsDeleting(false);
              }}
              disabled={isDeleting}
              className="rounded-lg p-2 text-error transition-colors hover:bg-error-container/20 active:scale-95 disabled:opacity-50"
              title="Xóa"
              type="button"
            >
              {isDeleting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Trash2 className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE COMPONENT ====================
const CV_SORT_OPTIONS = [
  { value: "newest", label: "Tải lên gần đây" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "updated_new", label: "Cập nhật gần đây" },
] as const;

export function CvPage() {
  const router = useRouter();

  // Custom hook state
  const {
    cvList,
    isLoading,
    isUploading,
    isPreviewingCvId,
    isDownloadingCvId,
    loadError,
    uploadError,
    actionError,
    refresh,
    handleUpload,
    handleDelete,
    handlePreview,
    handleDownload,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    q,
    setQ,
    pagination,
    handleSetDefault,
    handleRename,
  } = useCvList();

  // Local UI State
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [searchVal, setSearchVal] = useState(q);
  const [openMenuCvId, setOpenMenuCvId] = useState<string | null>(null);

  // Modals UI State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [renameData, setRenameData] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Sync Search value when debounce/trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchVal);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal, setQ, setPage]);

  function handleNavigateToAnalysis(id: string, status: string) {
    if (status === "completed") {
      router.push(JOBSEEKER_ROUTES.ANALYSIS_RESULT(id));
    } else {
      router.push(`${JOBSEEKER_ROUTES.ANALYSIS_PROCESS}?cvId=${id}`);
    }
  }

  const handleCopyLink = async (id: string) => {
    try {
      const { previewUrl } = await fetchCvPreview(id);
      await navigator.clipboard.writeText(previewUrl);
      await showAppAlert({
        title: "Sao chép thành công",
        text: "Đã sao chép liên kết xem CV vào bộ nhớ tạm.",
      });
    } catch {
      await showErrorAlert("Không thể lấy liên kết xem CV.");
    }
  };

  const handleShareFacebook = async (id: string) => {
    try {
      const { previewUrl } = await fetchCvPreview(id);
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      await showErrorAlert("Không thể chia sẻ CV này.");
    }
  };

  // Wrapped actions with alerts and confirms
  const onUploadCv = async (file: File) => {
    try {
      await handleUpload(file);
      await showAppAlert({
        title: "Tải lên thành công",
        text: "Hồ sơ của bạn đã được tải lên và sẵn sàng sử dụng.",
        icon: "success",
      });
    } catch (error) {
      await showErrorAlert(
        error instanceof Error ? error.message : "Tải lên hồ sơ thất bại.",
      );
    }
  };

  const onConfirmDelete = async (id: string) => {
    const result = await showConfirmAlert({
      title: "Xác nhận xóa hồ sơ?",
      text: "Bạn có chắc chắn muốn xóa bản CV này không? Thao tác này không thể hoàn tác.",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await handleDelete(id);
        await showAppAlert({
          title: "Đã xóa hồ sơ",
          text: "Hồ sơ của bạn đã được xóa thành công.",
          icon: "success",
        });
      } catch (error) {
        await showErrorAlert(
          error instanceof Error ? error.message : "Không thể xóa hồ sơ.",
        );
      }
    }
  };

  const onRenameCv = async (id: string, newTitle: string) => {
    try {
      await handleRename(id, newTitle);
      await showAppAlert({
        title: "Cập nhật thành công",
        text: `Đã đổi tên hồ sơ thành "${newTitle}"`,
        icon: "success",
      });
    } catch (error) {
      await showErrorAlert(
        error instanceof Error ? error.message : "Không thể đổi tên hồ sơ.",
      );
    }
  };

  const onSetDefaultCv = async (id: string, isDefault: boolean) => {
    try {
      await handleSetDefault(id, isDefault);
      await showAppAlert({
        title: "Cập nhật thành công",
        text: isDefault
          ? "Đã đặt hồ sơ này làm mặc định và cho phép nhà tuyển dụng tìm kiếm."
          : "Đã hủy trạng thái mặc định của hồ sơ.",
        icon: "success",
      });
    } catch (error) {
      await showErrorAlert(
        error instanceof Error
          ? error.message
          : "Cập nhật trạng thái mặc định thất bại.",
      );
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPage(1);
    if (value === "newest") {
      setSortBy("createdAt");
      setSortOrder("DESC");
    } else if (value === "oldest") {
      setSortBy("createdAt");
      setSortOrder("ASC");
    } else if (value === "updated_new") {
      setSortBy("updatedAt");
      setSortOrder("DESC");
    } else if (value === "updated_old") {
      setSortBy("updatedAt");
      setSortOrder("ASC");
    }
  };

  const totalPages = pagination?.totalPages ?? 1;

  const getActiveSortVal = () => {
    if (sortBy === "createdAt" && sortOrder === "DESC") return "newest";
    if (sortBy === "createdAt" && sortOrder === "ASC") return "oldest";
    if (sortBy === "updatedAt" && sortOrder === "DESC") return "updated_new";
    return "newest";
  };

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="bg-slate-50/50 min-h-screen pb-14 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kho hồ sơ của bạn
          </h1>
        </div>

        <div className="mb-6 flex flex-col xl:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1">
            <BaseField
              id="cv-search-q"
              className="bg-white border-2 border-gray-300 rounded-2xl h-12!"
              leadingIcon={<Search className="h-4.5 w-4.5 text-slate-400" />}
              placeholder="Tìm kiếm hồ sơ theo tên..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              trailingIcon={
                searchVal ? (
                  <button
                    onClick={() => setSearchVal("")}
                    className="rounded-full p-1 hover:bg-slate-200/60"
                    type="button"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Controls */}
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex h-12 min-w-[180px] items-center justify-between gap-3 rounded-2xl border-2 border-gray-300 bg-white px-4 text-sm transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              type="button"
            >
              {CV_SORT_OPTIONS.find((o) => o.value === getActiveSortVal())
                ?.label || "Chọn..."}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 w-56 rounded-2xl border border-gray-300 bg-white p-2 shadow-md z-50 animate-in fade-in zoom-in-95 duration-200">
                {CV_SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPage(1);
                      if (option.value === "newest") {
                        setSortBy("createdAt");
                        setSortOrder("DESC");
                      } else if (option.value === "oldest") {
                        setSortBy("createdAt");
                        setSortOrder("ASC");
                      } else if (option.value === "updated_new") {
                        setSortBy("updatedAt");
                        setSortOrder("DESC");
                      }
                      setIsSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition cursor-pointer ${
                      getActiveSortVal() === option.value
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    type="button"
                  >
                    {option.label}
                    {getActiveSortVal() === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sliding Indicator */}
          <div className="relative flex items-center p-1 rounded-2xl border-2 border-gray-300 bg-gray-200 h-12 w-[110px]">
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[48px] rounded-xl bg-white shadow-md border border-gray-200/50 transition-all duration-300 ease-in-out",
                layoutMode === "list" ? "left-[54px]" : "left-1",
              )}
            />
            <button
              onClick={() => setLayoutMode("grid")}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center h-full text-slate-400 transition-colors duration-300 cursor-pointer active:scale-95",
                layoutMode === "grid" && "text-primary font-semibold",
              )}
              title="Chế độ lưới"
              type="button"
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setLayoutMode("list")}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center h-full text-slate-400 transition-colors duration-300 cursor-pointer active:scale-95",
                layoutMode === "list" && "text-primary font-semibold",
              )}
              title="Chế độ danh sách"
              type="button"
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Upload Button */}
          <BaseButton
            type="button"
            onClick={() => setIsUploadOpen(true)}
            startIcon={<Plus className="h-4 w-4" />}
          >
            Tải lên CV
          </BaseButton>
        </div>

        {/* Global Action Error alert */}
        {actionError && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-medium text-rose-600">
            {actionError}
          </div>
        )}

        {/* Data list renderer */}
        {isLoading ? (
          <div
            className={cn(
              layoutMode === "grid"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-4",
            )}
          >
            {[1, 2, 3].map((idx) => (
              <div
                className={cn(
                  "animate-pulse bg-slate-100 rounded-3xl",
                  layoutMode === "grid" ? "aspect-4/3 min-h-[220px]" : "h-20",
                )}
                key={idx}
              />
            ))}
          </div>
        ) : loadError ? (
          /* Error Page */
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/20 px-6 py-14 text-center">
            <p className="font-semibold text-rose-600">
              Không thể tải danh sách hồ sơ tuyển dụng.
            </p>
            <p className="mt-2 text-sm text-slate-500">{loadError}</p>
          </div>
        ) : cvList.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="flex items-center justify-center opacity-60 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Danh sách hồ sơ trống
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {q
                ? "Không tìm thấy hồ sơ nào khớp với từ khóa tìm kiếm của bạn."
                : "Bạn chưa tải lên bất kỳ CV nào. Tải lên CV đầu tiên để bắt đầu ứng tuyển."}
            </p>
            {!q && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-white transition hover:bg-primary-hover active:scale-95"
                type="button"
              >
                Tải lên hồ sơ ngay
              </button>
            )}
          </div>
        ) : (
          /* List */
          <>
            <div
              className={cn(
                layoutMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4",
              )}
            >
              {cvList.map((cv) =>
                layoutMode === "grid" ? (
                  <CvCard
                    cv={cv}
                    isPreviewing={isPreviewingCvId === cv.id}
                    isDownloading={isDownloadingCvId === cv.id}
                    isMenuOpen={openMenuCvId === cv.id}
                    onMenuToggle={(e) => {
                      e.stopPropagation();
                      setOpenMenuCvId((curr) =>
                        curr === cv.id ? null : cv.id,
                      );
                    }}
                    onCloseMenu={() => setOpenMenuCvId(null)}
                    key={cv.id}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onDelete={onConfirmDelete}
                    onSetDefault={onSetDefaultCv}
                    onRenameOpen={(id, title) => setRenameData({ id, title })}
                    onCopyLink={handleCopyLink}
                    onShareFacebook={handleShareFacebook}
                    onNavigateToAnalysis={handleNavigateToAnalysis}
                  />
                ) : (
                  <CvRow
                    cv={cv}
                    isPreviewing={isPreviewingCvId === cv.id}
                    isDownloading={isDownloadingCvId === cv.id}
                    key={cv.id}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onDelete={onConfirmDelete}
                    onSetDefault={onSetDefaultCv}
                    onRenameOpen={(id, title) => setRenameData({ id, title })}
                    onNavigateToAnalysis={handleNavigateToAnalysis}
                  />
                ),
              )}
            </div>

            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <BasePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => setPage(nextPage)}
                  variant="compact"
                />
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        isUploading={isUploading}
        onClose={() => setIsUploadOpen(false)}
        onUpload={onUploadCv}
        uploadError={uploadError}
      />

      <RenameModal
        isOpen={renameData !== null}
        cvId={renameData?.id ?? ""}
        initialTitle={renameData?.title ?? ""}
        onClose={() => setRenameData(null)}
        onRename={onRenameCv}
      />
    </section>
  );
}
