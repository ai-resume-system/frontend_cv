import { env } from "@/shared/lib/config/env";

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    return new URL(trimmedValue, env.NEXT_PUBLIC_API_URL).toString();
  } catch {
    return trimmedValue;
  }
}
