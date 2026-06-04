export enum EJobStatus {
  DRAFT = "draft", // Bản nháp
  PENDING = "pending", // Chờ duyệt
  OPEN = "open", // Đang mở
  CLOSED = "closed", // Đã đóng
  REJECTED = "rejected", // Đã từ chối
  EXPIRED = "expired", // Hết hạn
}

export const EJobStatusLabels: Record<EJobStatus, string> = {
  [EJobStatus.DRAFT]: "Bản nháp",
  [EJobStatus.PENDING]: "Chờ duyệt",
  [EJobStatus.OPEN]: "Đang mở",
  [EJobStatus.CLOSED]: "Đã đóng",
  [EJobStatus.REJECTED]: "Đã từ chối",
  [EJobStatus.EXPIRED]: "Hết hạn",
};

export enum EJobType {
  FULL_TIME = "full_time", // Toàn thời gian
  PART_TIME = "part_time", // Bán thời gian
  INTERNSHIP = "internship", // Thực tập
}

export const EJobTypeLabels: Record<EJobType, string> = {
  [EJobType.FULL_TIME]: "Toàn thời gian",
  [EJobType.PART_TIME]: "Bán thời gian",
  [EJobType.INTERNSHIP]: "Thực tập",
};

export enum EJobEducationLevel {
  NONE = "none", // Không yêu cầu
  COLLEGE = "college", // Cao đẳng
  UNIVERSITY = "university", // Đại học
  POSTGRADUATE = "postgraduate", // Sau đại học
}

export const EJobEducationLevelLabels: Record<EJobEducationLevel, string> = {
  [EJobEducationLevel.NONE]: "Không yêu cầu",
  [EJobEducationLevel.COLLEGE]: "Cao đẳng",
  [EJobEducationLevel.UNIVERSITY]: "Đại học",
  [EJobEducationLevel.POSTGRADUATE]: "Sau đại học",
};

export enum EJobWorkArrangement {
  ONSITE = "onsite", // Tại văn phòng
  HYBRID = "hybrid", // Kết hợp
  REMOTE = "remote", // Làm việc từ xa
}

export const EJobWorkArrangementLabels: Record<EJobWorkArrangement, string> = {
  [EJobWorkArrangement.ONSITE]: "Tại văn phòng",
  [EJobWorkArrangement.HYBRID]: "Kết hợp",
  [EJobWorkArrangement.REMOTE]: "Làm việc từ xa",
};

export enum EJobAction {
  DRAFT = "draft", // Tạo bản nháp
  SUBMIT = "submit", // Gửi
}

export const EJobActionLabels: Record<EJobAction, string> = {
  [EJobAction.DRAFT]: "Lưu nháp",
  [EJobAction.SUBMIT]: "Gửi",
};
