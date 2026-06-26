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
  UPLOAD: {
    BASE: `${API_PREFIX}/uploads`,
  },
  COMPANY: {
    BASE: `${API_PREFIX}/companies`,
    DETAIL: (slug: string) => `${API_PREFIX}/companies/${slug}`,
    JOBS: (slug: string) => `${API_PREFIX}/companies/${slug}/jobs`,
  },
  CAREER_CATEGORY: {
    BASE: `${API_PREFIX}/career-categories`,
    TOP: `${API_PREFIX}/career-categories/top`,
    DETAIL: (slug: string) => `${API_PREFIX}/career-categories/${slug}`,
  },
  SKILL: {
    BASE: `${API_PREFIX}/skills`,
    DETAIL: (slug: string) => `${API_PREFIX}/skills/${slug}`,
  },
  CV: {
    BASE: `${API_PREFIX}/cvs`,
    DETAIL: (id: string) => `${API_PREFIX}/cvs/${id}`,
    DOWNLOAD: (id: string) => `${API_PREFIX}/cvs/${id}/download`,
    PREVIEW: (id: string) => `${API_PREFIX}/cvs/${id}/preview`,
    DEFAULT: (id: string) => `${API_PREFIX}/cvs/${id}/default`,
    ANALYZE: (id: string) => `${API_PREFIX}/cvs/${id}/analyze`,
    ANALYSIS: (id: string) => `${API_PREFIX}/cvs/${id}/analysis`,
    RECOMMENDED_JOBS: (id: string) => `${API_PREFIX}/cvs/${id}/recommended-jobs`,
  },
  CV_ANALYSIS_PREVIEW: {
    UPLOAD_TEMP: `${API_PREFIX}/cv-analysis/upload-temp`,
    PREVIEW: `${API_PREFIX}/cv-analysis/preview`,
    SAVE_PREVIEW: `${API_PREFIX}/cv-analysis/save-preview`,
  },
  JOB_PUBLIC: {
    BASE: `${API_PREFIX}/jobs`,
    DETAIL: (slug: string) => `${API_PREFIX}/jobs/${slug}`,
    RELATED: (slug: string) => `${API_PREFIX}/jobs/${slug}/related`,
  },
  JOB_RECRUITER: {
    BASE: `${API_PREFIX}/recruiter/jobs`,
    DETAIL: (slug: string) => `${API_PREFIX}/recruiter/jobs/${slug}`,
    ACTION: (id: string) => `${API_PREFIX}/recruiter/jobs/${id}`,
    CLOSE: (id: string) => `${API_PREFIX}/recruiter/jobs/${id}/close`,
  },
  JOB_APPLICATION: {
    BASE: `${API_PREFIX}/job-applications`,
    MY: `${API_PREFIX}/job-applications/me`,
    DETAIL: (id: string) => `${API_PREFIX}/job-applications/${id}`,
  },
  FAVORITE_JOB: {
    BASE: `${API_PREFIX}/favourite-jobs`,
    DETAIL: (jobId: string) => `${API_PREFIX}/favourite-jobs/${jobId}`,
  },
  RECRUITER_JOB_APPLICATION: {
    ALL: `${API_PREFIX}/recruiter/job-applications`,
    NEW: `${API_PREFIX}/recruiter/job-applications/new`,
    INTERVIEWS: `${API_PREFIX}/recruiter/job-applications/interviews`,
    BY_JOB: (jobId: string) =>
      `${API_PREFIX}/recruiter/job-applications/jobs/${jobId}`,
    DETAIL: (id: string) => `${API_PREFIX}/recruiter/job-applications/${id}`,
    CV: (applicationId: string) =>
      `${API_PREFIX}/recruiter/job-applications/${applicationId}/cv`,
    STATUS: (id: string) =>
      `${API_PREFIX}/recruiter/job-applications/${id}/status`,
    INTERVIEW_STATUS: (id: string) =>
      `${API_PREFIX}/recruiter/job-applications/${id}/interview-status`,
  },
};
