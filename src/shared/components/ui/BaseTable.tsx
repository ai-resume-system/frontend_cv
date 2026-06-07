"use client";

import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface BaseTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface BaseTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface BaseTableProps<T> {
  columns: BaseTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: BaseTablePagination;
}

export function BaseTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "Chưa có dữ liệu hiển thị.",
  pagination,
}: BaseTableProps<T>) {
  // Tạo danh sách các số trang hiển thị
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { page, totalPages } = pagination;
    const pages = [];
    
    // Luôn hiển thị trang đầu, trang cuối, trang hiện tại và các trang lân cận
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col w-full">
      {/* Bọc bảng trong thẻ có bo góc và shadow mềm mại */}
      <div className="overflow-hidden rounded-[24px] border border-outline-variant/15 bg-white/90 shadow-sm transition">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-outline-variant/10 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4.5 font-semibold ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-xs text-on-surface-variant font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <Inbox className="h-10 w-10 stroke-[1.5]" />
                      <span className="text-sm font-medium text-slate-500">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/40 transition duration-150"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 text-on-surface align-middle ${
                          col.className ?? ""
                        }`}
                      >
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Khu vực phân trang (Pagination) ở chân bảng */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-outline-variant/10 bg-slate-50/40 px-6 py-4">
            <div className="text-xs text-on-surface-variant font-medium">
              Hiển thị trang <span className="font-bold text-on-surface">{pagination.page}</span> /{" "}
              <span className="font-bold text-on-surface">{pagination.totalPages}</span> (Tổng số{" "}
              <span className="font-bold text-on-surface">{pagination.total}</span> bản ghi)
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Nút lùi trang */}
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-outline-variant/15 text-on-surface hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Danh sách trang số */}
              {pagination.page > 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(1)}
                    className={`h-8 px-3 text-xs font-bold rounded-xl transition ${
                      pagination.page === 1
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-white border border-outline-variant/15 text-on-surface hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    1
                  </button>
                  {pagination.page > 3 && <span className="text-xs text-slate-400 px-1">...</span>}
                </>
              )}

              {pages.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => pagination.onPageChange(p)}
                  className={`h-8 px-3 text-xs font-bold rounded-xl transition ${
                    pagination.page === p
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-white border border-outline-variant/15 text-on-surface hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pagination.page < pagination.totalPages - 1 && (
                <>
                  {pagination.page < pagination.totalPages - 2 && (
                    <span className="text-xs text-slate-400 px-1">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(pagination.totalPages)}
                    className={`h-8 px-3 text-xs font-bold rounded-xl transition ${
                      pagination.page === pagination.totalPages
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-white border border-outline-variant/15 text-on-surface hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}

              {/* Nút tiến trang */}
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-outline-variant/15 text-on-surface hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
