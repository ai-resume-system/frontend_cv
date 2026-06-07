import {
  API_ERROR_MESSAGES,
  API_STATUS_FALLBACK_MESSAGES,
  UNKNOWN_API_ERROR_MESSAGE,
  normalizeApiErrorMessage,
} from "@/shared/constants/constants/api-error-messages";
import type { AppApiError } from "@/shared/types/api";

export function isAppApiError(error: unknown): error is AppApiError {
  return (
    error instanceof Error &&
    "displayMessage" in error &&
    typeof (error as AppApiError).displayMessage === "string"
  );
}

function getStatusFallbackMessage(status?: number): string | undefined {
  if (typeof status !== "number") {
    return undefined;
  }

  return API_STATUS_FALLBACK_MESSAGES[status];
}

function containsNonAsciiCharacter(value: string): boolean {
  return /[^\x00-\x7F]/.test(value);
}

export function resolveApiDisplayMessage(
  message?: string,
  status?: number,
): string {
  if (message) {
    const normalizedMessage = normalizeApiErrorMessage(message);
    const mappedMessage = API_ERROR_MESSAGES[normalizedMessage];

    if (mappedMessage) {
      return mappedMessage;
    }

    if (containsNonAsciiCharacter(message)) {
      return message.trim();
    }
  }

  return getStatusFallbackMessage(status) ?? message ?? UNKNOWN_API_ERROR_MESSAGE;
}

export function getErrorDisplayMessage(
  error: unknown,
  fallbackMessage = UNKNOWN_API_ERROR_MESSAGE,
): string {
  if (isAppApiError(error)) {
    return error.displayMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
