export const AUTH_CLIENTS = {
  JOBSEEKER: "job_seeker",
  RECRUITER: "recruiter",
} as const;

export type AuthClient = (typeof AUTH_CLIENTS)[keyof typeof AUTH_CLIENTS];

export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
