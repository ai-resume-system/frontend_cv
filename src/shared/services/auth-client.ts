import {
  AUTH_CLIENTS,
  type AuthClient,
} from "@/shared/constants/constants/auth-client";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export function resolveAuthClient(pathname?: string): AuthClient {
  const currentPath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");

  return currentPath.startsWith("/recruiter")
    ? AUTH_CLIENTS.RECRUITER
    : AUTH_CLIENTS.JOBSEEKER;
}

export function getExpectedRoleForPath(pathname?: string): EUserRole {
  return resolveAuthClient(pathname) === AUTH_CLIENTS.RECRUITER
    ? EUserRole.RECRUITER
    : EUserRole.JOB_SEEKER;
}
