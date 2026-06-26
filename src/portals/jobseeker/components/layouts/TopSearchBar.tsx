"use client";

import {
  Check,
  ChevronRight,
  List,
  MapPin,
  Search,
  X,
  Folder,
  Briefcase,
  Tag,
} from "lucide-react";

import { useSearch } from "@/shared/hooks/ui/useSearch";
import { cn } from "@/shared/lib/utils/cn";

interface TopSearchBarProps {
  className?: string;
  initialKeyword?: string;
  initialAddress?: string;
  initialCategory?: string;
  initialSkillSlugs?: string[];
}

export function TopSearchBar({
  className,
  initialKeyword = "",
  initialAddress = "",
  initialCategory = "",
  initialSkillSlugs,
}: TopSearchBarProps) {
  const {
    activeCategory,
    activeParentSkill,
    address,
    applyDraftSelection,
    categoriesLoading,
    categoryDisplayLabel,
    closeCategoryPanel,
    draftCategory,
    draftSkillSlugs,
    dropdownRef,
    filteredCategories,
    handleSearch,
    isCategoryOpen,
    keyword,
    openCategoryPanel,
    searchTerm,
    selectedDraftCount,
    selectedFilterCount,
    setActiveCategoryId,
    setAddress,
    toggleDraftCategory,
    toggleDraftParentSkill,
    setKeyword,
    setSearchTerm,
    skillsError,
    skillsLoading,
    toggleDraftSkill,
    triggerRef,
    visibleChildSkills,
    visibleParentSkills,
    resetDraftSelection,
    searchSuggestions,
    handleSelectSuggestion,
    isCategoryFullySelected,
    isParentSkillFullySelected,
    allSkills,
  } = useSearch({
    initialAddress,
    initialCategory,
    initialKeyword,
    initialSkillSlugs,
  });

  return (
    <form className={cn("relative w-full", className)} onSubmit={handleSearch}>
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-stretch">
        <div className="relative flex min-w-0 flex-1">
          <div className="relative flex w-full flex-col gap-2 rounded-sm border border-gray-200 bg-white md:flex-row md:items-center md:gap-0">
            <div className="relative min-w-0 flex-1 md:border-r md:border-gray-200">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <MapPin className="h-5 w-5 text-on-surface-variant/60" />
              </div>
              <input
                className="h-11 w-full border-none bg-transparent pl-11 pr-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Địa điểm..."
                type="text"
                value={address}
              />
            </div>

            <div className="relative min-w-0 flex-1 md:border-r md:border-gray-200">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Search className="h-5 w-5 text-on-surface-variant/60" />
              </div>
              <input
                className="h-11 w-full border-none bg-transparent pl-11 pr-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên công ty..."
                type="text"
                value={keyword}
              />
            </div>

            <div className="relative min-w-0 flex-1" ref={triggerRef}>
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <List className="h-5 w-5 text-on-surface-variant/60" />
              </div>

              <button
                className="flex h-11 w-full items-center gap-2 overflow-hidden border-none bg-transparent pl-11 pr-10 text-left text-sm text-on-surface outline-none focus:ring-0"
                onClick={openCategoryPanel}
                type="button"
              >
                <span className="truncate">
                  {selectedFilterCount > 0
                    ? `${categoryDisplayLabel} (${selectedFilterCount})`
                    : categoryDisplayLabel}
                </span>
              </button>

              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg
                  className="h-4 w-4 text-on-surface-variant/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm bg-blue-600 px-8 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2 md:w-auto"
          type="submit"
        >
          <Search className="h-4 w-4" />
          Tìm kiếm
        </button>
      </div>

      {isCategoryOpen ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+15px)] z-49 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-2xl"
          ref={dropdownRef}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 md:text-xl">
              Chọn nghề hoặc kỹ năng phù hợp với bạn
            </h3>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              onClick={closeCategoryPanel}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              className="h-10 w-full rounded-lg border border-slate-400 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập từ khóa tìm kiếm"
              type="text"
              value={searchTerm}
            />
          </div>

          {searchTerm ? (
            <div className="h-[300px] overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 text-sm shadow-inner">
              {searchSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <div className="p-3 rounded-full bg-slate-100 text-slate-300">
                    <Search className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-xs text-center">
                    Không tìm thấy kết quả nào khớp với "{searchTerm}"
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">
                    Vui lòng thử từ khóa khác hoặc duyệt danh sách bên dưới.
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/80">
                    Kết quả gợi ý ({searchSuggestions.length})
                  </p>
                  {searchSuggestions.map((suggestion) => {
                    const IconComponent =
                      suggestion.type === "category"
                        ? Folder
                        : suggestion.type === "skill-parent"
                          ? Briefcase
                          : Tag;

                    const iconColor =
                      suggestion.type === "category"
                        ? "text-emerald-500 bg-emerald-50"
                        : suggestion.type === "skill-parent"
                          ? "text-amber-500 bg-amber-50"
                          : "text-blue-500 bg-blue-50";

                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition hover:bg-white hover:text-blue-600 hover:shadow-md border border-transparent hover:border-slate-200 cursor-pointer group"
                        type="button"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${iconColor}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                              {suggestion.name}
                            </span>

                            <span className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                              {suggestion.type === "category" ? (
                                <span>Danh mục ngành nghề</span>
                              ) : (
                                <>
                                  {suggestion.type === "skill-child" &&
                                    suggestion.parentName && (
                                      <>
                                        Nhóm:{" "}
                                        <strong className="text-slate-500 font-semibold">
                                          {suggestion.parentName}
                                        </strong>{" "}
                                        •{" "}
                                      </>
                                    )}
                                  {suggestion.categoryName && (
                                    <>
                                      Ngành:{" "}
                                      <strong className="text-slate-500 font-semibold">
                                        {suggestion.categoryName}
                                      </strong>
                                    </>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 text-[10px] bg-blue-50 text-blue-500 rounded-lg px-2.5 py-1 font-bold uppercase tracking-wider border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                          Chọn nhanh
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col border-b border-slate-100 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nhóm nghề
                </p>
                <div className="h-[240px] space-y-1 overflow-y-auto pr-1 text-sm">
                  {categoriesLoading ? (
                    <p className="text-sm text-slate-500">
                      Đang tải danh mục...
                    </p>
                  ) : (
                    filteredCategories.map((item) => {
                      const isActive = item.id === activeCategory?.id;
                      const isSelected = isCategoryFullySelected(
                        item.id,
                        draftSkillSlugs,
                      );

                      return (
                        <button
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition",
                            isActive
                              ? "bg-blue-50 font-medium text-primary"
                              : "text-slate-700 hover:bg-slate-50",
                          )}
                          key={item.id}
                          onClick={() =>
                            item.slug
                              ? toggleDraftCategory({
                                  id: item.id,
                                  slug: item.slug,
                                })
                              : undefined
                          }
                          onMouseEnter={() => setActiveCategoryId(item.id)}
                          type="button"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white",
                              )}
                            >
                              {isSelected ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nghề
                </p>
                <div className="h-[300px] space-y-1 overflow-y-auto pr-1 text-sm">
                  {skillsLoading ? (
                    <p className="text-sm text-slate-500">
                      Đang tải kỹ năng...
                    </p>
                  ) : skillsError ? (
                    <p className="p-3 text-xs italic text-error">
                      {skillsError}
                    </p>
                  ) : visibleParentSkills.length ? (
                    visibleParentSkills.map((item) => {
                      const isSelected = isParentSkillFullySelected(
                        item,
                        draftSkillSlugs,
                      );
                      const isActive = item.id === activeParentSkill?.id;

                      return (
                        <button
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                            isActive
                              ? "bg-slate-100 font-medium text-slate-900"
                              : "text-slate-700 hover:bg-slate-50",
                          )}
                          key={item.id}
                          onClick={() => {
                            toggleDraftParentSkill(item);
                          }}
                          type="button"
                        >
                          <span
                            className={cn(
                              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white",
                            )}
                          >
                            {isSelected ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="p-3 text-xs italic text-slate-400">
                      Chưa có nghề phù hợp với nhóm nghề này.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vị trí chuyên môn
                </p>
                <div className="h-[300px] overflow-y-auto pr-1">
                  {skillsError ? (
                    <p className="p-3 text-xs italic text-error">
                      {skillsError}
                    </p>
                  ) : visibleChildSkills.length ? (
                    <div className="flex flex-wrap gap-2 p-1">
                      {visibleChildSkills.map((item) => {
                        const isSelected = draftSkillSlugs.includes(
                          item.slug ?? "",
                        );

                        return (
                          <button
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
                              isSelected
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                            )}
                            key={item.id}
                            onClick={() => {
                              if (item.slug) {
                                toggleDraftSkill(item.slug);
                              }
                            }}
                            type="button"
                          >
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="p-3 text-xs italic text-slate-400">
                      Chọn một nghề tuyển dụng để hiển thị chuyên môn chi tiết.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Danh sách Badge/Chip các kỹ năng đã chọn */}
          {draftSkillSlugs.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl max-h-[85px] overflow-y-auto">
              {draftSkillSlugs.map((slug) => {
                const skillItem = allSkills.find((s) => s.slug === slug);
                if (!skillItem) return null;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 shadow-xs"
                  >
                    <span>{skillItem.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleDraftSkill(slug)}
                      className="rounded-full p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Đã chọn{" "}
              <span className="font-bold text-blue-600">
                {selectedDraftCount}
              </span>{" "}
              mục
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                onClick={resetDraftSelection}
                type="button"
              >
                Bỏ chọn tất cả
              </button>
              <button
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                onClick={closeCategoryPanel}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                onClick={applyDraftSelection}
                type="button"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
