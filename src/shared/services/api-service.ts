import { API_ROUTES } from "@/shared/constants/constants/api";
import { LOCAL_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { env } from "@/shared/lib/config/env";
import type {
  ApiFieldErrorResponse,
  RefreshTokenPayload,
  RefreshTokenResponseData,
} from "@/shared/types/auth";
import type { IResponseApiItem } from "@/shared/types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestConfig extends Omit<RequestInit, "body" | "method"> {
  auth?: boolean;
  body?: BodyInit | null;
}

interface JsonRequestConfig extends Omit<ApiRequestConfig, "body"> {
  body?: unknown;
}

const ACCESS_TOKEN_EXPIRED_CODE = 1006;
const REFRESH_TOKEN_EXPIRED_CODE = 1007;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStoredToken(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key);
}

function getStoredUserSnapshot(): unknown {
  if (!isBrowser()) return null;

  const rawUser = window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function setStoredTokens(tokens: RefreshTokenResponseData): void {
  if (!isBrowser()) return;

  const cachedUser = getStoredUserSnapshot();
  const mergedUser =
    cachedUser &&
    typeof cachedUser === "object" &&
    cachedUser !== null &&
    "id" in cachedUser &&
    cachedUser.id === tokens.user.id
      ? { ...cachedUser, ...tokens.user }
      : tokens.user;

  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.ACCESS_TOKEN,
    tokens.accessToken,
  );
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.REFRESH_TOKEN,
    tokens.refreshToken,
  );
  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.USER,
    JSON.stringify(mergedUser),
  );
}

function clearStoredAuth(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
}

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

async function parseApiError(response: Response): Promise<Error> {
  const payload = await readJson<ApiFieldErrorResponse>(response).catch(
    (): ApiFieldErrorResponse => ({}),
  );
  const message = payload.message ?? `Request failed: ${response.status}`;

  return Object.assign(new Error(message), {
    code: payload.code,
    fields: payload.error?.fields,
    status: response.status,
  });
}

function isTokenExpiredError(error: Error): boolean {
  // const apiError = error as Error & { code?: number | string; status?: number };

  // return (
  //   apiError.status === 401 &&
  //   (apiError.code === ACCESS_TOKEN_EXPIRED_CODE ||
  //     apiError.code === `${ACCESS_TOKEN_EXPIRED_CODE}`)
  // );

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

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStoredToken(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    clearStoredAuth();
    return false;
  }

  const payload: RefreshTokenPayload = { refreshToken };
  const response = await fetch(buildApiUrl(API_ROUTES.AUTH.REFRESH_TOKEN), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    if (isRefreshTokenExpiredError(error) || response.status === 401) {
      clearStoredAuth();
    }
    return false;
  }

  const payloadResponse =
    await readJson<IResponseApiItem<RefreshTokenResponseData>>(response);
  setStoredTokens(payloadResponse.data);
  return true;
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
    const requestHeaders = new Headers(headers);

    if (auth) {
      const accessToken = getStoredToken(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
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
    });

    if (!response.ok) {
      const error = await parseApiError(response);

      if (auth && !retried && isTokenExpiredError(error)) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          return this.request<TResponse>(path, method, config, true);
        }
      }

      throw error;
    }

    return readJson<TResponse>(response);
  }
}

export const apiService = new ApiService();
