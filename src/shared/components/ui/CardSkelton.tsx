// Bộ khung load 1 - dọc
export function CompanyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-surface-container-high bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-surface-container-low" />
      <div className="space-y-4 p-6 pt-12">
        <div className="h-7 w-4/5 animate-pulse rounded bg-surface-container" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-surface-container" />
        <div className="h-20 animate-pulse rounded bg-surface-container" />
      </div>
    </div>
  );
}

// Bộ khung load 2 - ngang
export function HotJobSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-3 h-6 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mb-8 h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="flex gap-3">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

interface JobCardSkeletonProps {
  length?: number;
  type?: "row" | "column";
}

export function JobCardSkeleton({
  length = 5,
  type = "column",
}: JobCardSkeletonProps) {
  const containerClass =
    type === "row"
      ? "grid grid-cols-1 gap-4"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={containerClass}>
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-surface-container-high bg-white shadow-sm"
        >
          <div className="h-20 animate-pulse bg-surface-container-low" />
          <div className="space-y-4 p-6">
            <div className="h-7 w-4/5 animate-pulse rounded bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ApplicationCardSkeletonProps {
  length: number;
}

export function ApplicationCardSkeleton({
  length,
}: ApplicationCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-slate-100" />
            <div className="h-6 w-24 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="h-5 w-3/4 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-6 w-1/3 rounded bg-slate-100" />
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-10 flex-1 rounded-2xl bg-slate-100" />
            <div className="h-10 w-10 rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
