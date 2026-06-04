export enum EJobApplicationStatus {
  APPLIED = "applied", // vừa apply
  REVIEWING = "reviewing", // HR đang xem
  INTERVIEW = "interview", // đã lên lịch phỏng vấn
  REJECTED = "rejected", // bị từ chối
  OFFERED = "offered", // HR gửi offer
  ACCEPTED = "accepted", // ứng viên nhận việc
  WITHDRAWN = "withdrawn", // ứng viên rút CV
}

export const EJobApplicationStatusLabels: Record<
  EJobApplicationStatus,
  string
> = {
  [EJobApplicationStatus.APPLIED]: "Đã ứng tuyển",
  [EJobApplicationStatus.REVIEWING]: "Đang xem xét",
  [EJobApplicationStatus.INTERVIEW]: "Đã lên lịch phỏng vấn",
  [EJobApplicationStatus.REJECTED]: "Đã từ chối",
  [EJobApplicationStatus.OFFERED]: "Đã gửi lời mời làm việc",
  [EJobApplicationStatus.ACCEPTED]: "Đã chấp nhận lời mời",
  [EJobApplicationStatus.WITHDRAWN]: "Đã rút hồ sơ",
};
