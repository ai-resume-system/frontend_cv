import { API_ROUTES } from "@/shared/constants/constants/api";
import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/shared/constants/constants/auth-client";
import { resolveApiDisplayMessage } from "@/shared/lib/errors/getErrorDisplayMessage";
import { env } from "@/shared/lib/config/env";
import {
  clearAuthStore,
  getAccessToken,
  getAccessTokenExpiresAt,
  redirectToLogin,
  setAccessToken,
  setCurrentUser,
  shouldRefreshAccessToken,
} from "@/shared/services/auth-store";
import { resolveAuthClient } from "@/shared/services/auth-client";
import type {
  RefreshTokenResponseData,
} from "@/shared/types/auth";
import type { AuthUser } from "@/shared/types/account";
import type {
  ApiFieldErrorResponse,
  AppApiError,
  IResponseApiItem,
} from "@/shared/types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestConfig extends Omit<RequestInit, "body" | "method"> {
  auth?: boolean;
  body?: BodyInit | null;
}

interface JsonRequestConfig extends Omit<ApiRequestConfig, "body"> {
  body?: unknown;
}

function buildAuthHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-auth-client", resolveAuthClient());
  return nextHeaders;
}

const REFRESH_TOKEN_EXPIRED_CODE = 1007;

function buildApiUrl(path: string): string {
  return `${env.NEXT_PUBLIC_API_URL}${path}`;
}

function isJsonBody(body: unknown): boolean {
  return (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  );
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function parseApiError(response: Response): Promise<AppApiError> {
  const payload = await readJson<ApiFieldErrorResponse>(response).catch(
    (): ApiFieldErrorResponse => ({}),
  );
  const rawMessage = payload.message ?? "";
  const displayMessage = resolveApiDisplayMessage(rawMessage, response.status);
  const message = displayMessage;

  return Object.assign(new Error(message), {
    displayMessage,
    fields: payload.error?.fields,
    rawMessage,
    status: response.status,
  });
}

function isTokenExpiredError(error: Error): boolean {
  const apiError = error as Error & { status?: number };
  return apiError.status === 401;
}

function isRefreshTokenExpiredError(error: Error): boolean {
  const apiError = error as Error & { code?: number | string; status?: number };

  return (
    apiError.status === 401 &&
    (apiError.code === REFRESH_TOKEN_EXPIRED_CODE ||
      apiError.code === `${REFRESH_TOKEN_EXPIRED_CODE}`)
  );
}

async function fetchCurrentUserAfterRefresh(
  accessToken: string,
): Promise<AuthUser> {
  const response = await fetch(buildApiUrl(API_ROUTES.ACCOUNT.ME), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-auth-client": resolveAuthClient(),
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const payload = await readJson<IResponseApiItem<AuthUser>>(response);
  return payload.data;
}

let ongoingRefresh: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const response = await fetch(buildApiUrl(API_ROUTES.AUTH.REFRESH_TOKEN), {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    if (isRefreshTokenExpiredError(error) || response.status === 401) {
      clearAuthStore();
    }
    return false;
  }

  const payloadResponse =
    await readJson<IResponseApiItem<RefreshTokenResponseData>>(response);
  const nextAccessToken = payloadResponse.data.accessToken;
  setAccessToken(
    nextAccessToken,
    payloadResponse.data.expiresAt,
    payloadResponse.data.expiresIn,
    false,
  );

  try {
    const currentUser = await fetchCurrentUserAfterRefresh(nextAccessToken);
    setCurrentUser(currentUser);
    return true;
  } catch (error) {
    const apiError = error as Error & { status?: number };

    if (apiError.status === 401 || apiError.status === 403) {
      clearAuthStore();
      return false;
    }

    setCurrentUser(null);
    return true;
  }
}

async function refreshAccessToken(force = false): Promise<boolean> {
  if (
    !force &&
    getAccessToken() &&
    getAccessTokenExpiresAt() &&
    !shouldRefreshAccessToken(ACCESS_TOKEN_REFRESH_BUFFER_MS)
  ) {
    return true;
  }

  if (ongoingRefresh) {
    return ongoingRefresh;
  }

  ongoingRefresh = doRefresh().finally(() => {
    ongoingRefresh = null;
  });

  return ongoingRefresh;
}

class ApiService {
  async get<TResponse>(
    path: string,
    config?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "GET", config);
  }

  async post<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "POST", {
      ...config,
      body: payload,
    });
  }

  async put<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "PUT", {
      ...config,
      body: payload,
    });
  }

  async patch<TResponse, TPayload = unknown>(
    path: string,
    payload?: TPayload,
    config?: JsonRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "PATCH", {
      ...config,
      body: payload,
    });
  }

  async delete<TResponse>(
    path: string,
    config?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, "DELETE", config);
  }

  private async request<TResponse>(
    path: string,
    method: HttpMethod,
    config: JsonRequestConfig = {},
    retried = false,
  ): Promise<TResponse> {
    const { auth, body, headers, ...requestConfig } = config;
    const requestHeaders = buildAuthHeaders(headers);

    if (auth) {
      const currentAccessToken = getAccessToken();

      if (
        !currentAccessToken ||
        shouldRefreshAccessToken(ACCESS_TOKEN_REFRESH_BUFFER_MS)
      ) {
        if (!retried) {
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            return this.request<TResponse>(path, method, config, true);
          }
        }

        if (!getAccessToken()) {
          throw new Error("Not authenticated");
        }
      }

      const latestAccessToken = getAccessToken();

      if (!latestAccessToken) {
        throw new Error("Not authenticated");
      }

      requestHeaders.set("Authorization", `Bearer ${latestAccessToken}`);
    }

    const requestBody = isJsonBody(body) ? JSON.stringify(body) : body;

    if (isJsonBody(body) && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(buildApiUrl(path), {
      ...requestConfig,
      method,
      headers: requestHeaders,
      body: requestBody as BodyInit | null | undefined,
      cache:
        requestConfig.cache ??
        (method === "GET" ? requestConfig.cache : "no-store"),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await parseApiError(response);

      if (auth && !retried && isTokenExpiredError(error)) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          return this.request<TResponse>(path, method, config, true);
        }

        redirectToLogin();
        throw error;
      }

      throw error;
    }

    return readJson<TResponse>(response);
  }
}

export const apiService = new ApiService();
export { refreshAccessToken };
