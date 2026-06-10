"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { EUserRole } from "@/shared/constants/enums/user.enum";
import { fetchCurrentUser } from "@/shared/services/account.service";
import {
  AUTH_STORE_CHANGED_EVENT,
  clearAuthStore,
  getAccessToken,
  getCurrentUser,
  setCurrentUser,
} from "@/shared/services/auth-store";
import {
  buildAuthRedirectPath,
  getDefaultAuthenticatedRouteForRole,
  getProtectedFallbackRouteForPath,
} from "@/shared/services/auth-client";
import type { AuthUser } from "@/shared/types/account";

type PortalAccessMode = "protected" | "guest-only";

interface PortalAccessGuardProps {
  bypassPaths?: string[];
  children: ReactNode;
  mode: PortalAccessMode;
  requiredRole: EUserRole.JOB_SEEKER | EUserRole.RECRUITER;
}

interface AuthSnapshot {
  accessToken: string | null;
  user: AuthUser | null;
}

function getAuthSnapshot(): AuthSnapshot {
  return {
    accessToken: getAccessToken(),
    user: getCurrentUser(),
  };
}

function AccessGuardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-5 h-4 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-slate-100 mx-auto" />
      </div>
    </div>
  );
}

export function PortalAccessGuard({
  bypassPaths = [],
  children,
  mode,
  requiredRole,
}: PortalAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authSnapshot, setAuthSnapshot] = useState<AuthSnapshot>(
    getAuthSnapshot,
  );
  const [isResolvingUser, setIsResolvingUser] = useState(
    () => Boolean(getAuthSnapshot().accessToken && !getAuthSnapshot().user),
  );

  const search = useMemo(() => {
    const searchValue = searchParams.toString();
    return searchValue ? `?${searchValue}` : "";
  }, [searchParams]);
  const isBypassedPath = bypassPaths.includes(pathname);
  const redirectTarget = useMemo(() => {
    if (isBypassedPath || isResolvingUser) {
      return null;
    }

    const { accessToken, user } = authSnapshot;

    if (mode === "guest-only") {
      if (!accessToken || !user) {
        return null;
      }

      return getDefaultAuthenticatedRouteForRole(user.role);
    }

    if (!accessToken || !user) {
      return getProtectedFallbackRouteForPath(pathname);
    }

    if (user.role !== requiredRole) {
      return getDefaultAuthenticatedRouteForRole(user.role);
    }

    return null;
  }, [
    authSnapshot,
    isBypassedPath,
    isResolvingUser,
    mode,
    pathname,
    requiredRole,
  ]);

  useEffect(() => {
    function syncAuthSnapshot() {
      setAuthSnapshot(getAuthSnapshot());
    }

    syncAuthSnapshot();
    window.addEventListener(AUTH_STORE_CHANGED_EVENT, syncAuthSnapshot);

    return () => {
      window.removeEventListener(AUTH_STORE_CHANGED_EVENT, syncAuthSnapshot);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function hydrateUserFromToken() {
      if (!authSnapshot.accessToken || authSnapshot.user) {
        setIsResolvingUser(false);
        return;
      }

      setIsResolvingUser(true);

      try {
        const hydratedUser = await fetchCurrentUser();

        if (!isActive) {
          return;
        }

        setCurrentUser(hydratedUser);
        setAuthSnapshot({
          accessToken: getAccessToken(),
          user: hydratedUser,
        });
      } catch (error) {
        const apiError = error as Error & { status?: number };

        if (!isActive) {
          return;
        }

        if (apiError.status === 401 || apiError.status === 403) {
          clearAuthStore();
        } else {
          setCurrentUser(null);
          setAuthSnapshot({
            accessToken: getAccessToken(),
            user: null,
          });
        }
      } finally {
        if (isActive) {
          setIsResolvingUser(false);
        }
      }
    }

    void hydrateUserFromToken();

    return () => {
      isActive = false;
    };
  }, [authSnapshot.accessToken, authSnapshot.user]);

  useEffect(() => {
    if (!redirectTarget) {
      return;
    }

    if (mode === "protected") {
      const redirectPath = buildAuthRedirectPath(pathname, search);

      if (pathname !== redirectTarget) {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
          redirectPath,
        );
      }
    }

    if (pathname !== redirectTarget) {
      router.replace(redirectTarget);
      return;
    }
  }, [mode, pathname, redirectTarget, router, search]);

  if (isResolvingUser || Boolean(redirectTarget && redirectTarget !== pathname)) {
    return <AccessGuardFallback />;
  }

  if (isBypassedPath) {
    return <>{children}</>;
  }

  if (mode === "protected") {
    if (!authSnapshot.accessToken || !authSnapshot.user) {
      return <AccessGuardFallback />;
    }

    if (authSnapshot.user.role !== requiredRole) {
      return <AccessGuardFallback />;
    }
  }

  if (mode === "guest-only" && authSnapshot.accessToken && authSnapshot.user) {
    return <AccessGuardFallback />;
  }

  return <>{children}</>;
}
