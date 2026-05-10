export const authMessages = {
  choice: {
    greeting: "Chào mừng bạn gia nhập Fuse",
    helper: "Bạn hãy dành ra vài giây để xác nhận thông tin dưới đây nhé!",
    instruction:
      "Để tối ưu tốt nhất cho trải nghiệm của bạn với Fuse, vui lòng cho chúng tôi biết bạn là ai?",
    title: "Bạn muốn sử dụng Fuse với vai trò nào?",
    subtitle:
      "Chọn đúng loại tài khoản để nhận trải nghiệm phù hợp cho tìm việc hoặc tuyển dụng.",
    jobSeekerTitle: "Ứng viên",
    jobSeekerButton: "Tôi là ứng viên tìm việc",
    jobSeekerDescription:
      "Tìm việc, tải CV, nhận điểm phù hợp AI và theo dõi ứng tuyển.",
    recruiterTitle: "Nhà tuyển dụng",
    recruiterButton: "Tôi là nhà tuyển dụng",
    recruiterDescription:
      "Đăng tin, quản lý ứng viên và ưu tiên hồ sơ bằng điểm AI.",
    switchToRegister: "Bạn chưa có tài khoản?",
    switchToLogin: "Bạn đã có tài khoản?",
    registerLink: "Đăng ký",
    loginLink: "Đăng nhập",
  },
  login: {
    jobSeekerTitle: "Đăng nhập người tìm việc",
    recruiterTitle: "Đăng nhập nhà tuyển dụng",
    subtitle: "Truy cập không gian làm việc của bạn trên Fuse.",
    submit: "Đăng nhập",
    switchToRegister: "Chưa có tài khoản?",
    success: "Đăng nhập thành công.",
  },
  register: {
    jobSeekerTitle: "Đăng ký người tìm việc",
    recruiterTitle: "Đăng ký nhà tuyển dụng",
    subtitle:
      "Tạo tài khoản để bắt đầu sử dụng hệ thống tuyển dụng AI.",
    submit: "Tạo tài khoản",
    switchToLogin: "Đã có tài khoản?",
    successFallback:
      "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.",
  },
  fields: {
    fullName: "Họ và tên",
    companyName: "Tên công ty",
    industry: "Ngành nghề",
    address: "Địa chỉ",
    email: "Email",
    companyEmail: "Email công ty",
    phone: "Số điện thoại",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
  },
  validation: {
    required: "Vui lòng nhập đầy đủ thông tin bắt buộc.",
    email: "Email không hợp lệ.",
    passwordLength: "Mật khẩu cần tối thiểu 6 ký tự.",
    passwordMatch: "Mật khẩu xác nhận không khớp.",
  },
  brand: {
    title: "AI tuyển dụng làm việc cùng bạn",
    description:
      "Phân tích CV, gợi ý công việc phù hợp và giúp doanh nghiệp ưu tiên ứng viên có tiềm năng.",
  },
} as const;
