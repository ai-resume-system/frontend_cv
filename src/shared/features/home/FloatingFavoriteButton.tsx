"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useFavoriteJobs } from "@/shared/hooks/data/useFavoriteJobs";
import { useAuth } from "@/shared/hooks/ui/useAuth";

export function FloatingFavoriteButton() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { favoriteJobCount } = useFavoriteJobs();

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
    <button
      aria-label="Viec lam da luu"
      className="fixed bottom-5 right-4 z-[55] inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
      onClick={handleClick}
      type="button"
    >
      <Heart className="h-6 w-6 text-primary" />
      <span className="absolute right-0 top-0 flex min-h-5 min-w-5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white">
        {favoriteJobCount}
      </span>
    </button>
  );
}
