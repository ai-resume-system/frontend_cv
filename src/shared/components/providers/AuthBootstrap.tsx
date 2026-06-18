"use client";

import { FileText, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/shared/constants/constants/auth-client";
import { fetchCurrentUser } from "@/shared/services/account.service";
import { refreshAccessToken } from "@/shared/services/api-service";
import {
  clearAuthStore,
  clearAuthStoreFromSync,
  getAccessToken,
  getCurrentUser,
  hydrateAuthStoreFromStorage,
  setCurrentUser,
  shouldRefreshAccessToken,
  subscribeToAuthSync,
} from "@/shared/services/auth-store";

export const AUTH_BOOTSTRAP_READY_EVENT = "auth-bootstrap-ready";

interface AuthBootstrapProps {
  children: ReactNode;
}

function dispatchAuthBootstrapReady(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_BOOTSTRAP_READY_EVENT));
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function syncCurrentUserFromToken(): Promise<void> {
      const accessToken = getAccessToken();

      if (!accessToken) {
        if (isActive) {
          setCurrentUser(null);
        }
        return;
      }

      if (getCurrentUser()) {
        return;
      }

      const hydratedUser = await fetchCurrentUser();

      if (isActive) {
        setCurrentUser(hydratedUser);
      }
    }

    async function bootstrapAuth() {
      hydrateAuthStoreFromStorage();

      try {
        const initialToken = getAccessToken();

        if (
          initialToken &&
          shouldRefreshAccessToken(ACCESS_TOKEN_REFRESH_BUFFER_MS)
        ) {
          await refreshAccessToken();
        }

        await syncCurrentUserFromToken();
      } catch (error) {
        const apiError = error as Error & { status?: number };

        if (apiError.status === 401 || apiError.status === 403) {
          clearAuthStore();
        } else if (isActive) {
          setCurrentUser(null);
        }
      }

      if (!isActive) {
        return;
      }

      setIsReady(true);
      dispatchAuthBootstrapReady();
    }

    void bootstrapAuth();

    const unsubscribe = subscribeToAuthSync((message) => {
      if (message.type === "logout") {
        clearAuthStoreFromSync();
        return;
      }

      hydrateAuthStoreFromStorage();
      void syncCurrentUserFromToken().catch((error: unknown) => {
        const apiError = error as Error & { status?: number };

        if (apiError.status === 401 || apiError.status === 403) {
          clearAuthStoreFromSync();
        } else if (isActive) {
          setCurrentUser(null);
        }
      });
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-slate-900">
        <style>{`
            @keyframes infiniteScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            @keyframes gentleBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }

            .animate-infinite-carousel {
              display: flex;
              width: max-content;
              animation: infiniteScroll 4s linear infinite;
            }
        `}</style>

        <div className="flex flex-col items-center">
          <div className="relative flex h-28 w-56 items-center justify-center overflow-hidden">
            <div className="absolute inset-y-0 left-0 flex items-center">
              <div className="animate-infinite-carousel gap-16 px-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <FileText
                    key={index}
                    className="h-16 w-16 shrink-0 text-blue-300"
                    strokeWidth={1.8}
                  />
                ))}
              </div>
            </div>

            <div
              className="absolute z-10 rounded-full bg-white/20 p-2"
              style={{ animation: "gentleBounce 2s ease-in-out infinite" }}
            >
              <Search
                className="h-16 w-16 -rotate-12 text-slate-400"
                strokeWidth={2}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-blue-50/10 to-transparent" />
          </div>

          <span className="text-sm font-medium tracking-wide text-slate-400">
            Đang tải phiên làm việc...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
