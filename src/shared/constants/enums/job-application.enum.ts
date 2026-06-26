export enum EJobApplicationStatus {
  APPLIED = "applied", // vừa apply
  INTERVIEW = "interview", // đã lên lịch phỏng vấn
  REJECTED = "rejected", // bị từ chối
  ACCEPTED = "accepted", // hoàn tất tuyển dụng (nhận việc)
  WITHDRAWN = "withdrawn", // ứng viên rút CV
}

export const EJobApplicationStatusLabels: Record<
  EJobApplicationStatus,
  string
> = {
  [EJobApplicationStatus.APPLIED]: "Mới ứng tuyển",
  [EJobApplicationStatus.INTERVIEW]: "Lịch phỏng vấn",
  [EJobApplicationStatus.REJECTED]: "Đã từ chối",
  [EJobApplicationStatus.ACCEPTED]: "Hoàn tất tuyển dụng",
  [EJobApplicationStatus.WITHDRAWN]: "Đã rút",
};

export enum EInterviewType {
  ONLINE = "online",
  OFFLINE = "offline",
}

export const EInterviewTypeLabels: Record<EInterviewType, string> = {
  [EInterviewType.ONLINE]: "Phỏng vấn online",
  [EInterviewType.OFFLINE]: "Phỏng vấn offline",
};

export enum EInterviewStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
}

export const EInterviewStatusLabels: Record<EInterviewStatus, string> = {
  [EInterviewStatus.SCHEDULED]: "Chưa phỏng vấn",
  [EInterviewStatus.COMPLETED]: "Đã phỏng vấn",
};
