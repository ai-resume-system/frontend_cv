"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  FAVORITE_JOB_ADDED_EVENT,
  FAVORITE_JOB_FEEDBACK_DURATION_MS,
} from "@/shared/constants/constants/favorite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { cn } from "@/shared/lib/utils/cn";

interface FavoriteJobAddedEventDetail {
  jobId?: string;
  title?: string;
}

export function FloatingFavoriteButton() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { favoriteJobCount } = useFavoriteJobs();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function handleFavoriteAdded(_event: Event) {
      const customEvent = _event as CustomEvent<FavoriteJobAddedEventDetail>;

      if (!customEvent.detail?.jobId) {
        return;
      }

      setIsCelebrating(true);
      setShowToast(true);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setIsCelebrating(false);
        setShowToast(false);
      }, FAVORITE_JOB_FEEDBACK_DURATION_MS);
    }

    window.addEventListener(FAVORITE_JOB_ADDED_EVENT, handleFavoriteAdded);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      window.removeEventListener(FAVORITE_JOB_ADDED_EVENT, handleFavoriteAdded);
    };
  }, []);

  function handleClick() {
    if (!isLoggedIn) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
          ROUTES.JOB_SEEKER_FAVORITES,
        );
      }

      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }

    router.push(ROUTES.JOB_SEEKER_FAVORITES);
  }

  return (
    <div className="fixed bottom-5 right-4 z-[55] sm:bottom-6 sm:right-6">
      <div
        className={cn(
          "pointer-events-none absolute bottom-[1rem] right-15 w-[330px] translate-y-2 opacity-0 transition-all duration-300 sm:w-[320px]",
          showToast && "translate-y-0 opacity-100",
        )}
      >
        <div className="rounded-2xl bg-slate-700/90 px-4 py-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)]"> /// day
          <p className="text-base font-semibold">Lưu tin thành công!</p>
          <p className="mt-1 text-sm leading-6 text-slate-100">
            Xem{" "}
            <Link
              className="pointer-events-auto font-semibold text-secondary-container underline underline-offset-2"
              href={ROUTES.JOB_SEEKER_FAVORITES}
            >
              Danh sách việc làm đã lưu
            </Link>
            , click vào đây.
          </p>
        </div>
      </div>

      <button
        aria-label="Việc làm đã lưu"
        className={cn(
          "relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isCelebrating &&
            "animate-[favorite-heart-bounce_0.75s_ease-in-out_4]",
        )}
        onClick={handleClick}
        type="button"
      >
        <Heart
          className={cn(
            "h-6 w-6 transition-colors duration-300",
            favoriteJobCount > 0 ? "fill-primary text-primary" : "text-primary",
          )}
        />
        <span className="absolute right-0 top-0 flex min-h-5 min-w-5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white">
          {favoriteJobCount}
        </span>
      </button>
    </div>
  );
}
