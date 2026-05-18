export const AUTH_MESSAGES = {
  validation: {
    required: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
    email: "Email không hợp lệ.",
    passwordLength: "Mật khẩu cần tối thiểu 6 ký tự.",
    passwordMatch: "Mật khẩu xác nhận không khớp.",
    otpLength: "Mã OTP phải gồm 6 chữ số.",
  },
} as const;

export const COMMON_MESSAGES = {
  appName: "Fuse",
  nav: {
    jobs: "Việc làm",
    cv: "CV AI",
    employers: "Nhà tuyển dụng",
    login: "Đăng nhập",
    register: "Đăng ký",
  },
  actions: {
    findJobs: "Tìm việc ngay",
    postJob: "Đăng tin tuyển dụng",
    chooseRole: "Chọn loại tài khoản",
    continue: "Tiếp tục",
    submit: "Gửi thông tin",
    backHome: "Về trang chủ",
  },
} as const;

export const HOME_MESSAGES = {
  nav: {
    jobs: "Việc làm",
    employers: "Nhà tuyển dụng",
    analysis: "Phân tích hồ sơ",
    login: "Đăng nhập",
    register: "Đăng ký",
  },
  stats: [
    { value: "2.4k", label: "Việc làm mới" },
    { value: "850", label: "Doanh nghiệp" },
    { value: "15k", label: "Kết nối AI" },
    { value: "98%", label: "Tỉ lệ chính xác" },
  ],
  partners: {
    title: "Đối tác chiến lược toàn cầu",
    logos: ["Google", "Meta", "Vinfast", "Shopee", "Viettel", "Grab"],
  },
  market: {
    label: "Thị trường việc làm",
    title: "Tăng trưởng ngành Công nghệ",
    badge: "+24% năm nay",
    heading: "Cơ hội bùng nổ trong kỷ nguyên mới",
    description:
      "Theo dữ liệu từ hệ thống AI của FUSE, nhu cầu nhân lực chất lượng cao trong các ngành Công nghệ và Tài chính đang đạt mức kỷ lục. Đừng bỏ lỡ làn sóng phát triển này.",
    insights: [
      {
        color: "bg-primary",
        text: "120+ vị trí Management mở mới hằng tuần",
      },
      {
        color: "bg-ai",
        text: "Mức lương khởi điểm tăng 15% so với 2023",
      },
    ],
    chart: [40, 55, 45, 85, 70, 95],
    chartLabels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Current"],
  },
  categories: {
    title: "Khám phá theo ngành nghề",
    empty: "Chưa có ngành nghề để hiển thị.",
    error: "Chưa tải được danh sách ngành nghề.",
    viewMore: "Xem thêm",
    items: [
      { icon: "⌘", label: "Công nghệ" },
      { icon: "⌥", label: "Tài chính" },
      { icon: "⚕", label: "Y tế" },
      { icon: "◉", label: "Marketing" },
      { icon: "◆", label: "Giáo dục" },
      { icon: "⬡", label: "Logistics" },
    ],
  },
  userMenu: {
    guestName: "Người dùng",
    accountTitle: "Tài khoản của bạn",
    jobManagement: "Quản lý tìm việc",
    savedJobs: "Việc làm đã lưu",
    appliedJobs: "Việc làm đã ứng tuyển",
    cvManagement: "Quản lý CV",
    myCv: "CV của tôi",
    recruiterReview: "Nhà tuyển dụng xem hồ sơ",
    accountSecurity: "Cá nhân và bảo mật",
    profileSettings: "Cài đặt thông tin cá nhân",
    changePassword: "Đổi mật khẩu",
    logout: "Đăng xuất",
  },
} as const;
