export enum EUserRole {
  ADMIN = "admin",
  JOB_SEEKER = "job_seeker",
  RECRUITER = "recruiter",
}

export enum EUserStatus {
  ACTIVE = "active",
  UNVERIFIED = "unverified",
  LOCKED = "locked",
}

export const EUserRoleLabels: Record<EUserRole, string> = {
  [EUserRole.ADMIN]: "Quản trị",
  [EUserRole.JOB_SEEKER]: "Ứng viên",
  [EUserRole.RECRUITER]: "Nhà tuyển dụng",
};

export const EUserStatusLabels: Record<EUserStatus, string> = {
  [EUserStatus.ACTIVE]: "Hoạt động",
  [EUserStatus.UNVERIFIED]: "Chưa xác minh",
  [EUserStatus.LOCKED]: "Đã khóa",
};
