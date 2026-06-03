"use client";

import { Search, XIcon, LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { CompanyCard } from "@/portals/jobseeker/features/company/CompanyCard";
import { BaseField } from "@/shared/components/ui/BaseField";
import { BasePagination } from "@/shared/components/ui/BasePagination";
import { useCompanies } from "@/shared/hooks/data/useCompanies";
import Image from "next/image";
import { CompanyCardSkeleton } from "@/shared/components/ui/CardSkelton";
import { cn } from "@/shared/lib/utils/cn";

interface CompanyListFilterState {
  q: string;
}


function readFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CompanyListFilterState {
  return {
    q: searchParams.get("q") ?? "",
  };
}

export function CompanyListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CompanyListFilterState>(() =>
    readFiltersFromSearchParams(searchParams),
  );
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    setFilters(readFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const { companies, pagination, loading, error } = useCompanies({
    page,
    limit: 30,
    q: filters.q.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const totalItems = pagination?.totalItems ?? companies.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  function pushFilters(nextPage = 1) {
    const nextSearchParams = new URLSearchParams();

    if (filters.q.trim()) {
      nextSearchParams.set("q", filters.q.trim());
    }

    if (nextPage > 1) {
      nextSearchParams.set("page", `${nextPage}`);
    }

    const nextQuery = nextSearchParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushFilters(1);
  }

  return (
    <section className="bg-background pb-14">
      <div
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(37,99,235,0.6), transparent 60%), linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%)",
        }}
        className="border-b border-surface-container-high"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-16">
          <div className="max-w-3xl flex-1">
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Khám phá 100.000+ công ty nổi bật
            </h1>
            <p className="mt-4 text-base leading-7 text-on-surface-variant sm:text-lg">
              Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành
              cho bạn. Chúng tôi kết nối bạn với những môi trường chuyên nghiệp
              hàng đầu Việt Nam.
            </p>

            <form className="mt-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 rounded-[28px] border border-gray-400 bg-white p-2 shadow-sm sm:flex-row">
                <BaseField
                  id="company-search-q"
                  className="border-0 bg-transparent"
                  inputClassName="border-0 bg-transparent px-0 focus:ring-0"
                  leadingIcon={<Search className="h-5 w-5" />}
                  placeholder="Nhập tên công ty..."
                  trailingIcon={
                    filters.q ? (
                      <button
                        className="rounded-full p-1 transition-colors hover:bg-muted"
                        onClick={() => {
                          setFilters((currentState) => ({
                            ...currentState,
                            q: "",
                          }));
                        }}
                        type="button"
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ) : undefined
                  }
                  value={filters.q}
                  wrapperClassName="flex-1"
                  onChange={(event) =>
                    setFilters((currentState) => ({
                      ...currentState,
                      q: event.target.value,
                    }))
                  }
                />
              </div>
            </form>
          </div>

          <div className="hidden flex-1 justify-end lg:flex">
            <img
              src="/cong_ty_noi_bat.png"
              alt="cong-ty-noi-bat"
              className="h-auto w-full max-w-[550px]"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
            DANH SÁCH CÁC CÔNG TY NỔI BẬT ({totalItems} công ty)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayoutMode("grid")}
              className={cn(
                "p-2 rounded-lg border transition-all duration-200 cursor-pointer",
                layoutMode === "grid"
                  ? "border-primary bg-blue-50/50 text-primary"
                  : "border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300"
              )}
              title="Chế độ lưới"
              type="button"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setLayoutMode("list")}
              className={cn(
                "p-2 rounded-lg border transition-all duration-200 cursor-pointer",
                layoutMode === "list"
                  ? "border-primary bg-blue-50/50 text-primary"
                  : "border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300"
              )}
              title="Chế độ danh sách"
              type="button"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <CompanyCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-dashed border-surface-container-high bg-white px-6 py-16 text-center">
            <div className="flex items-center justify-center">
              <Image
                alt="Không có dữ liệu"
                height={100}
                priority
                src="/error_data.png"
                width={100}
              />
            </div>
            <h4 className="mt-4 text-base font-semibold text-foreground">
              Không thể tải danh sách công ty lúc này.
            </h4>
          </div>
        ) : companies.length > 0 ? (
          <>
            <div
              className={cn(
                layoutMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid grid-cols-1 gap-6"
              )}
            >
              {companies.map((company) => (
                <CompanyCard
                  company={company}
                  layout={layoutMode}
                  key={company.id}
                />
              ))}
            </div>

            <BasePagination
              className="mt-10"
              currentPage={page}
              onPageChange={pushFilters}
              totalPages={totalPages}
              variant="text"
            />
          </>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center">
              <Image
                alt="Không có dữ liệu"
                height={100}
                priority
                src="/no_data.png"
                width={100}
              />
            </div>
            <h4 className="mt-4 text-base font-semibold text-foreground">
              Chưa tìm thấy công ty phù hợp
            </h4>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Thử thay đổi tiêu chí bộ lọc khác để tìm kiếm
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
