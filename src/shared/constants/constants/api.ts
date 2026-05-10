export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER_JOBSEEKER: "/auth/register/job-seeker",
    REGISTER_RECRUITER: "/auth/register/recruiter",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  ACCOUNT: {
    ME: "/account/me",
    ME_PROFILE: "/account/me/profile",
    ME_COMPANY: "/account/me/company",
    ME_CHANGE_PASSWORD: "/account/me/change-password",
  },
  CAREER_CATEGORY: {
    BASE: "/career-categories",
  },
  CV: {
    BASE: "/cvs",
    DOWNLOAD: (id: string) => `/cvs/${id}/download`,
    PREVIEW: (id: string) => `/cvs/${id}/preview`,
    DEFAULT: (id: string) => `/cvs/${id}/default`,
  },
  JOB: {
    BASE: "/jobs",
    MY: "/jobs/my",
    ADMIN: "/jobs/admin",
    APPROVE: (id: string) => `/jobs/${id}/approve`,
    REJECT: (id: string) => `/jobs/${id}/reject`,
    CLOSE: (id: string) => `/jobs/${id}/close`,
  },
  APPLICATION: {
    BASE: "/applications",
    MY: "/applications/my",
    JOB: (jobId: string) => `/applications/jobs/${jobId}`,
  },
};
