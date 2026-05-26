import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import type { AuthUser } from "@/shared/types/auth";

export const AUTH_STORE_CHANGED_EVENT = "auth-store-changed";
export const AUTH_SYNC_CHANNEL_NAME = "auth-sync";

export type AuthSyncMessage = { type: "login" } | { type: "logout" };

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;
let authSyncChannel: BroadcastChannel | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
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

export function setAccessToken(token: string | null): void {
  if (accessToken === token) {
    return;
  }

  accessToken = token;
  emitAuthStoreChanged();

  if (token) {
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
  const hadAuthenticatedState = accessToken !== null || currentUser !== null;

  accessToken = null;
  currentUser = null;

  if (!hadAuthenticatedState) {
    return;
  }

  emitAuthStoreChanged();
  broadcastAuthSync({ type: "logout" });
}

export function clearAuthStoreFromSync(): void {
  const hadAuthenticatedState = accessToken !== null || currentUser !== null;

  accessToken = null;
  currentUser = null;

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
