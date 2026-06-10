"use client";

import {
  Check,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  Plus,
  Search,
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
import { CvCard } from "../../components/cv/CvCard";
import { CvRow } from "../../components/cv/CvRow";
import { RenameModal } from "../../components/cv/RenameModal";
import { UploadModal } from "../../components/cv/UploadModal";

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

          {/* Control */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              ref={sortDropdownRef}
              className="flex flex-1 relative shrink-0"
            >
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
                <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-gray-300 bg-white p-2 shadow-md z-50 animate-in fade-in zoom-in-95 duration-200">
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

            <div className="relative flex flex-1 items-center p-1 rounded-2xl border-2 border-gray-300 bg-gray-200 h-12 w-[110px] shrink-0">
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
          </div>

          <BaseButton
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto"
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
                    onNavigateToAnalysis={handleNavigateToAnalysis}
                  />
                ) : (
                  <CvRow
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
