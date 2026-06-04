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
  [EProcessingStatus.PENDING]: "Đang chờ xử lý",
  [EProcessingStatus.PROCESSING]: "Đang xử lý",
  [EProcessingStatus.COMPLETED]: "Đã xử lý",
  [EProcessingStatus.FAILED]: "Thất bại",
};
