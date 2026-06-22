"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  FAVOURITE_JOB_ADDED_EVENT,
  FAVOURITE_JOB_FEEDBACK_DURATION_MS,
} from "@/shared/constants/constants/favourite-job";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavouriteJobs } from "@/shared/hooks/data/useFavouriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuthState";
import { cn } from "@/shared/lib/utils/cn";

interface FavouriteJobAddedEventDetail {
  jobId?: string;
  title?: string;
}

export function FloatingFavouriteButton() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { favouriteJobCount } = useFavouriteJobs();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function handleFavouriteAdded(_event: Event) {
      const customEvent = _event as CustomEvent<FavouriteJobAddedEventDetail>;

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
      }, FAVOURITE_JOB_FEEDBACK_DURATION_MS);
    }

    window.addEventListener(FAVOURITE_JOB_ADDED_EVENT, handleFavouriteAdded);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      window.removeEventListener(
        FAVOURITE_JOB_ADDED_EVENT,
        handleFavouriteAdded,
      );
    };
  }, []);

  function handleClick() {
    if (!isLoggedIn) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEYS.AUTH_REDIRECT_PATH,
          ROUTES.JOB_SEEKER_FAVOURITES,
        );
      }

      router.push(ROUTES.JOB_SEEKER_LOGIN);
      return;
    }

    router.push(ROUTES.JOB_SEEKER_FAVOURITES);
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6 flex items-center">
      <div
        className={cn(
          "hidden md:block absolute right-18 w-82.5 transition-all duration-300 opacity-0 translate-x-2",
          showToast
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "pointer-events-none",
        )}
      >
        <div className="relative rounded-xl bg-slate-800/90 px-4 py-2.5 text-white shadow-[0_10px_30px_rgba(15,23,42,0.3)]">
          <p className="text-sm font-semibold">Lưu tin thành công!</p>
          <p className="mt-0.5 text-xs text-slate-200">
            Để xem{" "}
            <Link
              href={ROUTES.JOB_SEEKER_FAVOURITES}
              className="font-semibold text-secondary-container underline underline-offset-2 hover:text-blue-400 transition-colors"
            >
              Danh sách việc làm đã lưu
            </Link>
            , click vào đây!
          </p>

          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-800/95" />
        </div>
      </div>

      <button
        aria-label="Việc làm đã lưu"
        className={cn(
          "cursor-pointer relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isCelebrating &&
            "animate-[favourite-heart-bounce_0.75s_ease-in-out_4]",
        )}
        onClick={handleClick}
        type="button"
      >
        <Heart
          className={cn(
            "h-6 w-6 transition-colors duration-300",
            favouriteJobCount > 0
              ? "fill-primary text-primary"
              : "text-primary",
          )}
        />
        <span className="absolute right-0 top-0 flex min-h-5 min-w-5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white">
          {favouriteJobCount}
        </span>
      </button>
    </div>
  );
}
