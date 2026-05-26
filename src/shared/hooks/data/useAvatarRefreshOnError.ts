"use client";

import { useEffect, useRef } from "react";

interface UseAvatarRefreshOnErrorOptions {
  src?: string | null;
  onRefresh: () => Promise<unknown> | unknown;
}

export function useAvatarRefreshOnError({
  src,
  onRefresh,
}: UseAvatarRefreshOnErrorOptions) {
  const failedSrcRef = useRef<string | null>(null);

  useEffect(() => {
    if (src && failedSrcRef.current !== src) {
      failedSrcRef.current = null;
    }
  }, [src]);

  function handleError() {
    if (!src) {
      return;
    }

    if (failedSrcRef.current === src) {
      return;
    }

    failedSrcRef.current = src;
    void onRefresh();
  }

  return { handleError };
}
