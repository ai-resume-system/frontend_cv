import {
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
} from "@/shared/constants/constants/local-storage";
import type { AuthUser } from "@/shared/types/auth";

export const AUTH_STORE_CHANGED_EVENT = "auth-store-changed";
export const AUTH_SYNC_CHANNEL_NAME = "auth-sync";

export type AuthSyncMessage = { type: "login" } | { type: "logout" };

let accessToken: string | null = null;
let accessTokenExpiresAt: string | null = null;
let accessTokenExpiresIn: number | null = null;
let currentUser: AuthUser | null = null;
let authSyncChannel: BroadcastChannel | null = null;

function readAccessTokenExpiresIn(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function persistAccessTokenToStorage(
  token: string | null,
  expiresAt?: string | null,
  expiresIn?: number | null,
): void {
  if (!isBrowser()) {
    return;
  }

  if (!token) {
    clearAccessTokenStorage();
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, token);

  if (expiresAt) {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT,
      expiresAt,
    );
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
  }

  if (typeof expiresIn === "number") {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN,
      String(expiresIn),
    );
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN);
  }
}

export function clearAccessTokenStorage(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN);
}

export function hydrateAuthStoreFromStorage(): void {
  if (!isBrowser()) {
    return;
  }

  const storedToken = window.localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const storedExpiresAt = window.localStorage.getItem(
    LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT,
  );
  const storedExpiresIn = readAccessTokenExpiresIn(
    window.localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_IN),
  );

  if (!storedToken) {
    if (
      accessToken !== null ||
      accessTokenExpiresAt !== null ||
      accessTokenExpiresIn !== null
    ) {
      accessToken = null;
      accessTokenExpiresAt = null;
      accessTokenExpiresIn = null;
      emitAuthStoreChanged();
    }
    return;
  }

  if (
    accessToken === storedToken &&
    accessTokenExpiresAt === storedExpiresAt &&
    accessTokenExpiresIn === storedExpiresIn
  ) {
    return;
  }

  accessToken = storedToken;
  accessTokenExpiresAt = storedExpiresAt;
  accessTokenExpiresIn = storedExpiresIn;
  emitAuthStoreChanged();
}

function emitAuthStoreChanged(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_STORE_CHANGED_EVENT));
}

function getAuthSyncChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!authSyncChannel) {
    authSyncChannel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);
  }

  return authSyncChannel;
}

function broadcastAuthSync(message: AuthSyncMessage): void {
  getAuthSyncChannel()?.postMessage(message);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAccessTokenExpiresAt(): string | null {
  return accessTokenExpiresAt;
}

export function shouldRefreshAccessToken(bufferMs = 60_000): boolean {
  if (!accessToken || !accessTokenExpiresAt) {
    return true;
  }

  return new Date(accessTokenExpiresAt).getTime() - Date.now() <= bufferMs;
}

export function setAccessToken(
  token: string | null,
  expiresAt?: string | null,
  expiresIn?: number | null,
  shouldBroadcastLogin = true,
): void {
  if (
    accessToken === token &&
    accessTokenExpiresAt === (expiresAt ?? null) &&
    accessTokenExpiresIn === (expiresIn ?? null)
  ) {
    return;
  }

  accessToken = token;
  accessTokenExpiresAt = expiresAt ?? null;
  accessTokenExpiresIn = expiresIn ?? null;
  persistAccessTokenToStorage(token, expiresAt, expiresIn);
  emitAuthStoreChanged();

  if (token && shouldBroadcastLogin) {
    broadcastAuthSync({ type: "login" });
  }
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

export function setCurrentUser(user: AuthUser | null): void {
  if (currentUser === user) {
    return;
  }

  currentUser = user;
  emitAuthStoreChanged();
}

export function clearAuthStore(): void {
  const hadAuthenticatedState =
    accessToken !== null || currentUser !== null || accessTokenExpiresAt !== null;

  accessToken = null;
  accessTokenExpiresAt = null;
  accessTokenExpiresIn = null;
  currentUser = null;
  clearAccessTokenStorage();

  if (!hadAuthenticatedState) {
    return;
  }

  emitAuthStoreChanged();
  broadcastAuthSync({ type: "logout" });
}

export function clearAuthStoreFromSync(): void {
  const hadAuthenticatedState =
    accessToken !== null || currentUser !== null || accessTokenExpiresAt !== null;

  accessToken = null;
  accessTokenExpiresAt = null;
  accessTokenExpiresIn = null;
  currentUser = null;
  clearAccessTokenStorage();

  if (!hadAuthenticatedState) {
    return;
  }

  emitAuthStoreChanged();
}

export function redirectToLogin(): void {
  if (!isBrowser()) {
    return;
  }

  const currentPath = window.location.pathname;
  const isRecruiter = currentPath.startsWith("/recruiter");
  const loginUrl = isRecruiter ? "/recruiter/login" : "/login";

  if (currentPath !== loginUrl) {
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
      currentPath,
    );
  }

  window.location.href = loginUrl;
}

export function isAuthenticated(): boolean {
  return accessToken !== null;
}

export function subscribeToAuthSync(
  listener: (message: AuthSyncMessage) => void,
): () => void {
  const channel = getAuthSyncChannel();

  if (!channel) {
    return () => undefined;
  }

  const handleMessage = (event: MessageEvent<AuthSyncMessage>) => {
    if (!event.data) {
      return;
    }

    listener(event.data);
  };

  channel.addEventListener("message", handleMessage);

  return () => {
    channel.removeEventListener("message", handleMessage);
  };
}
