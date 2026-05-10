export enum EJobStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSED = "closed",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum EJobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  INTERNSHIP = "internship",
  CONTRACT = "contract",
}

export const JOB_TYPE_LABELS: Record<EJobType, string> = {
  [EJobType.FULL_TIME]: "Full Time",
  [EJobType.PART_TIME]: "Part Time",
  [EJobType.INTERNSHIP]: "Thực tập",
  [EJobType.CONTRACT]: "Hợp đồng",
};
