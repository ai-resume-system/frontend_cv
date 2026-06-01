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
