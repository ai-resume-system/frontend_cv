export const AUTH_MESSAGES = {
  validation: {
    required: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
    email: "Email không hợp lệ.",
    passwordLength: "Mật khẩu cần tối thiểu 6 ký tự.",
    passwordMatch: "Mật khẩu xác nhận không khớp.",
    otpLength: "Mã OTP phải gồm 6 chữ số.",
  },
} as const;

export const HOME_MESSAGES = {
  nav: {
    jobs: "Việc làm",
    employers: "Danh sách công ty",
    analysis: "Phân tích hồ sơ",
    login: "Đăng nhập",
    register: "Đăng ký",
  },
  userMenu: {
    guestName: "Người dùng",
    accountTitle: "Tài khoản của bạn",
    jobManagement: "Quản lý tìm việc",
    savedJobs: "Việc làm đã lưu",
    appliedJobs: "Việc làm đã ứng tuyển",
    cvManagement: "Quản lý hồ sơ",
    myCv: "CV của tôi",
    recruiterReview: "Nhà tuyển dụng xem hồ sơ",
    accountSecurity: "Cá nhân và bảo mật",
    profileSettings: "Cài đặt thông tin cá nhân",
    changePassword: "Đổi mật khẩu",
    logout: "Đăng xuất",
  },
} as const;
