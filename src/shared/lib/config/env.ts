type PortalMode = "single-domain" | "multi-domain";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const JOBSEEKER_URL = process.env.NEXT_PUBLIC_JOBSEEKER_URL ?? APP_URL;
const RECRUITER_URL =
  process.env.NEXT_PUBLIC_RECRUITER_URL ?? `${APP_URL}/recruiter`;
const PORTAL_MODE = process.env.NEXT_PUBLIC_PORTAL_MODE ?? "single-domain";

if (PORTAL_MODE !== "single-domain" && PORTAL_MODE !== "multi-domain") {
  throw new Error(
    "[env] NEXT_PUBLIC_PORTAL_MODE must be single-domain or multi-domain",
  );
}

export const env = {
  NEXT_PUBLIC_API_URL: API_URL,
  NEXT_PUBLIC_APP_URL: APP_URL,
  NEXT_PUBLIC_JOBSEEKER_URL: JOBSEEKER_URL,
  NEXT_PUBLIC_RECRUITER_URL: RECRUITER_URL,
  NEXT_PUBLIC_PORTAL_MODE: PORTAL_MODE as PortalMode,
} as const;
