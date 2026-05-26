"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Menu,
  ScanSearch,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/constants/local-storage";
import { HOME_MESSAGES } from "@/shared/constants/constants/messages";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCareerCategories } from "@/shared/hooks/data/useCareerCategories";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { useAuth } from "@/shared/hooks/ui/useAuth";
import { cn } from "@/shared/lib/utils/cn";

import { CategoriesDropdown } from "./CategoriesDropdown";
import { UserMenuContent, UserMenuDropdown } from "./UserMenuDropdown";
import { useAvatarRefreshOnError } from "@/shared/hooks/data/useAvatarRefreshOnError";

type DrawerState = "menu" | "user" | null;
type NavIcon = typeof BriefcaseBusiness;

interface MobileNavChildItem {
  href: string;
  label: string;
}

interface MobileNavItem {
  children?: MobileNavChildItem[];
  href: string;
  icon: NavIcon;
  label: string;
}

export function Header() {
  const { isLoggedIn } = useAuth();
  const { user, logout, refreshUser } = useCurrentUser();
  const { categories, error, loading } = useCareerCategories({ limit: 10 });
  const [activeDrawer, setActiveDrawer] = useState<DrawerState>(null);
  const [expandedNavHref, setExpandedNavHref] = useState<string | null>(null);
  const router = useRouter();
  const t = HOME_MESSAGES;

  const mainNavItems = useMemo(
    () => [
      {
        href: ROUTES.JOBS,
        icon: BriefcaseBusiness,
        label: t.nav.jobs,
      },
      {
        href: ROUTES.JOB_SEEKER_COMPANY,
        icon: UserRound,
        label: t.nav.employers,
      },
      {
        href: ROUTES.JOB_SEEKER_ANALYSIS,
        icon: ScanSearch,
        label: t.nav.analysis,
      },
    ],
    [t.nav.analysis, t.nav.employers, t.nav.jobs],
  );
  const mobileNavItems = useMemo<MobileNavItem[]>(
    () => [
      {
        ...mainNavItems[0],
        children: categories.map((category) => ({
          href: `${ROUTES.JOBS}?careerCategoryId=${category.id}`,
          label: category.name,
        })),
      },
      ...mainNavItems.slice(1),
    ],
    [categories, mainNavItems],
  );

  const avatarUrl = user?.profile?.avatarUrl || "/user-default.png";

  const { handleError: handleAvatarError } = useAvatarRefreshOnError({
    src: avatarUrl,
    onRefresh: refreshUser,
  });

  useEffect(() => {
    if (!activeDrawer) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveDrawer(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDrawer]);

  function closeDrawer() {
    setActiveDrawer(null);
  }

  function openMenuDrawer() {
    setExpandedNavHref(null);
    setActiveDrawer("menu");
  }

  function openUserDrawer() {
    setActiveDrawer("user");
  }

  function navigateTo(path: string) {
    closeDrawer();
    router.push(path);
  }

  async function handleLogout() {
    closeDrawer();
    await logout();
  }

  function navigateToAuth(path: string, mode: "login" | "register") {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.AUTH_SELECTED_ROLE);
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.AUTH_FLOW_MODE, mode);
      window.sessionStorage.setItem(SESSION_STORAGE_KEYS.AUTH_ROLE_PROMPT, "1");
    }

    router.push(path);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
              onClick={openMenuDrawer}
              type="button"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>

            <Link
              className="flex min-w-0 items-center md:gap-2 font-extrabold tracking-tight text-primary"
              href={ROUTES.HOME}
            >
              <Image
                alt="FUSE"
                height={48}
                priority
                src="/logo.png"
                width={48}
              />
              <span className="truncate text-xl uppercase leading-none sm:text-2xl">
                {INFOMATION_WEB.COMPANY_NAME}
              </span>
            </Link>
          </div>

          <nav className="hidden h-full items-center justify-center gap-1 text-sm font-medium md:flex">
            <CategoriesDropdown
              categories={categories}
              error={error}
              loading={loading}
            />
            <Link
              className="flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              href={ROUTES.RECRUITER_HOME}
            >
              <span>{t.nav.employers}</span>
            </Link>
            <Link
              className="flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              href={ROUTES.JOB_SEEKER_ANALYSIS}
            >
              <span>{t.nav.analysis}</span>
            </Link>
          </nav>

          <div className="flex h-full items-center justify-end gap-2">
            {isLoggedIn ? (
              <>
                <div className="hidden md:block">
                  <UserMenuDropdown />
                </div>
                <button
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
                  onClick={openUserDrawer}
                  type="button"
                >
                  <img
                    alt="Avatar"
                    className="h-11 w-11 rounded-full border-2 border-gray-300 object-cover"
                    onError={handleAvatarError}
                    src={avatarUrl}
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  className="hidden h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
                  onClick={() =>
                    navigateToAuth(ROUTES.JOB_SEEKER_REGISTER, "register")
                  }
                  type="button"
                >
                  <span>{t.nav.register}</span>
                </button>
                <button
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() =>
                    navigateToAuth(ROUTES.JOB_SEEKER_LOGIN, "login")
                  }
                  type="button"
                >
                  <span>{t.nav.login}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        aria-hidden={activeDrawer === null}
        className={cn(
          "fixed inset-0 z-[60] bg-foreground/30 transition-opacity duration-300 md:hidden",
          activeDrawer
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
      />

      <aside
        aria-hidden={activeDrawer !== "menu"}
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex flex-col border-r border-border bg-surface shadow-2xl transition-transform duration-300 md:hidden",
          activeDrawer === "menu" ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-300 px-3 py-4">
          <Link
            className="flex min-w-0 items-center font-extrabold tracking-tight text-primary"
            href={ROUTES.HOME}
            onClick={closeDrawer}
          >
            <Image alt="FUSE" height={40} src="/logo.png" width={40} />
            <span className="truncate text-xl uppercase leading-none">
              {INFOMATION_WEB.COMPANY_NAME}
            </span>
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={closeDrawer}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="overflow-y-auto px-3">
            <nav className="space-y-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isJobsItem = item.href === ROUTES.JOBS;
                const hasChildren =
                  !!item.children?.length ||
                  (isJobsItem &&
                    (loading || !!error || item.children?.length === 0));
                const isExpanded = expandedNavHref === item.href;

                return (
                  <div key={item.href}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                      <Link
                        className="flex min-w-0 flex-1 items-center gap-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        href={item.href}
                        onClick={closeDrawer}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-primary"
                        />
                        <span>{item.label}</span>
                      </Link>

                      {hasChildren ? (
                        <button
                          aria-expanded={isExpanded}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          onClick={() =>
                            setExpandedNavHref((current) =>
                              current === item.href ? null : item.href,
                            )
                          }
                          type="button"
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasChildren ? (
                      <div
                        className={cn(
                          "overflow-hidden transition-[max-height] duration-300",
                          isExpanded ? "max-h-[40rem]" : "max-h-0",
                        )}
                      >
                        <div className="border-t border-border/80 pb-2 pt-1">
                          {isJobsItem && loading
                            ? Array.from({ length: 6 }).map((_, index) => (
                                <div
                                  className="mx-4 my-2 h-11 animate-pulse rounded-xl bg-muted"
                                  key={index}
                                />
                              ))
                            : item.children?.map((child) => (
                                <Link
                                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                                  href={child.href}
                                  key={child.href}
                                  onClick={closeDrawer}
                                >
                                  <span>{child.label}</span>
                                </Link>
                              ))}

                          {isJobsItem && !loading && error ? (
                            <p className="px-4 py-3 text-sm text-muted-foreground">
                              {t.categories.error}
                            </p>
                          ) : null}

                          {isJobsItem &&
                          !loading &&
                          !error &&
                          item.children?.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-muted-foreground">
                              {t.categories.empty}
                            </p>
                          ) : null}

                          {isJobsItem ? (
                            <div className="px-4 pb-2 pt-1">
                              <Link
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                                href={ROUTES.JOBS}
                                onClick={closeDrawer}
                              >
                                {t.categories.viewMore}
                                <ChevronRight
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                />
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border px-4 py-4">
            <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground text-center">
              &copy; {INFOMATION_WEB.COPYRIGHT_YEAR}{" "}
              <span className="uppercase">{INFOMATION_WEB.COMPANY_NAME}</span>.
              Kiến tạo sự nghiệp bền vững.
            </p>
          </div>
        </div>
      </aside>

      {isLoggedIn ? (
        <aside
          aria-hidden={activeDrawer !== "user"}
          className={cn(
            "fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,360px)] flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300 md:hidden",
            activeDrawer === "user" ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <img
                alt="Avatar"
                className="relative h-13 w-13 rounded-full border border-gray-300 object-cover"
                onError={handleAvatarError}
                src={avatarUrl}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {user?.profile?.fullName || t.userMenu.guestName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={closeDrawer}
              type="button"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <div className="border-b border-border px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t.userMenu.accountTitle}
              </p>
            </div>
            <UserMenuContent onLogout={handleLogout} onNavigate={navigateTo} />
          </div>
        </aside>
      ) : null}
    </>
  );
}
