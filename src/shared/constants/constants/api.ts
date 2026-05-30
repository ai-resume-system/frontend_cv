export const API_PREFIX = "/api/v1";

export const API_ROUTES = {
  AUTH: {
    REGISTER_JOBSEEKER: `${API_PREFIX}/auth/register/job-seeker`,
    REGISTER_RECRUITER: `${API_PREFIX}/auth/register/recruiter`,
    SEND_OTP: `${API_PREFIX}/auth/send-otp`,
    VERIFY_OTP: `${API_PREFIX}/auth/verify-otp`,
    LOGIN: `${API_PREFIX}/auth/login`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
  },
  ACCOUNT: {
    ME: `${API_PREFIX}/account/me`,
    ME_PROFILE: `${API_PREFIX}/account/me/profile`,
    ME_COMPANY: `${API_PREFIX}/account/me/company`,
    ME_CHANGE_PASSWORD: `${API_PREFIX}/account/me/change-password`,
    ME_DELETE_AVATAR: `${API_PREFIX}/account/me/avatar`,
    ME_DELETE_LOGO: `${API_PREFIX}/account/me/logo`,
    ME_DELETE_BANNER: `${API_PREFIX}/account/me/banner`,
  },
  CAREER_CATEGORY: {
    BASE: `${API_PREFIX}/career-categories`,
  },
  COMPANY: {
    BASE: `${API_PREFIX}/companies`,
  },
  CV: {
    BASE: `${API_PREFIX}/cvs`,
    DOWNLOAD: (id: string) => `${API_PREFIX}/cvs/${id}/download`,
    PREVIEW: (id: string) => `${API_PREFIX}/cvs/${id}/preview`,
    DEFAULT: (id: string) => `${API_PREFIX}/cvs/${id}/default`,
  },
  JOB_PUBLIC: {
    BASE: `${API_PREFIX}/jobs`,
    DETAIL: (slug: string) => `${API_PREFIX}/jobs/${slug}`,
  },
  JOB_RECRUITER: {
    BASE: `${API_PREFIX}/recruiter/jobs`,
    DETAIL: (id: string) => `${API_PREFIX}/recruiter/jobs/${id}`,
    CLOSE: (id: string) => `${API_PREFIX}/recruiter/jobs/${id}/close`,
  },
  APPLICATION: {
    BASE: `${API_PREFIX}/applications`,
    MY: `${API_PREFIX}/applications/my`,
    JOB: (jobId: string) => `${API_PREFIX}/applications/jobs/${jobId}`,
  },
  FAVORITE_JOB: {
    BASE: `${API_PREFIX}/favourite-jobs`,
    DETAIL: (jobId: string) => `${API_PREFIX}/favourite-jobs/${jobId}`,
  },
  UPLOAD: {
    BASE: `${API_PREFIX}/uploads`,
  },
};
