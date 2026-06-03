export enum EJobStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSED = "closed",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export const EJobStatusLabels: Record<EJobStatus, string> = {
  [EJobStatus.PENDING]: "Đang chờ duyệt",
  [EJobStatus.OPEN]: "Đang mở",
  [EJobStatus.CLOSED]: "Đã đóng",
  [EJobStatus.REJECTED]: "Đã từ chối",
  [EJobStatus.EXPIRED]: "Đã hết hạn",
};

export enum EJobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  INTERNSHIP = "internship",
}

export const EJobTypeLabels: Record<EJobType, string> = {
  [EJobType.FULL_TIME]: "Toàn thời gian",
  [EJobType.PART_TIME]: "Bán thời gian",
  [EJobType.INTERNSHIP]: "Thực tập",
};
