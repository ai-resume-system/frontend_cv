import {
  AUTH_CLIENTS,
  type AuthClient,
} from "@/shared/constants/constants/auth-client";
import {
  JOBSEEKER_ROUTES,
  RECRUITER_ROUTES,
} from "@/shared/constants/constants/routes";
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

export function getLoginRouteForRole(role: EUserRole): string {
  return role === EUserRole.RECRUITER
    ? RECRUITER_ROUTES.LOGIN
    : JOBSEEKER_ROUTES.LOGIN;
}

export function getDefaultAuthenticatedRouteForRole(role: EUserRole): string {
  return role === EUserRole.RECRUITER
    ? RECRUITER_ROUTES.DASHBOARD
    : JOBSEEKER_ROUTES.HOME;
}

export function getProtectedFallbackRouteForPath(pathname: string): string {
  return getLoginRouteForRole(getExpectedRoleForPath(pathname));
}

export function buildAuthRedirectPath(
  pathname: string,
  search = "",
): string {
  return `${pathname}${search}`;
}
