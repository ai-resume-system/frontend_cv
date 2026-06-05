export enum ECVStatus {
  ACTIVE = "active",
}

export const ECVStatusLabels: Record<ECVStatus, string> = {
  [ECVStatus.ACTIVE]: "Đang hoạt động",
};

export enum EProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export const EProcessingStatusLabels: Record<EProcessingStatus, string> = {
  [EProcessingStatus.PENDING]: "Chưa phân tích",
  [EProcessingStatus.PROCESSING]: "Đang xử lý",
  [EProcessingStatus.COMPLETED]: "Đã xử lý",
  [EProcessingStatus.FAILED]: "Phân tích thất bại",
};

export const PROCESSING_STATUS_CONFIG = {
  pending: {
    label: EProcessingStatusLabels[EProcessingStatus.PENDING],
    className: "bg-slate-100 text-slate-600",
  },
  processing: {
    label: EProcessingStatusLabels[EProcessingStatus.PROCESSING],
    className: "bg-blue-50 text-blue-600 animate-pulse",
  },
  completed: {
    label: EProcessingStatusLabels[EProcessingStatus.COMPLETED],
    className: "bg-emerald-50 text-emerald-600",
  },
  failed: {
    label: EProcessingStatusLabels[EProcessingStatus.FAILED],
    className: "bg-rose-50 text-rose-600",
  },
} as const;
