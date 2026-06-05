"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HOME_MESSAGES } from "@/shared/constants/constants/messages";
import { ROUTES } from "@/shared/constants/constants/routes";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { useAvatarRefreshOnError } from "@/shared/hooks/ui/useAvatarRefreshOnError";
import { cn } from "@/shared/lib/utils/cn";
import type { AuthUser } from "@/shared/types/account";
import { ChevronDown, LogOut } from "lucide-react";

interface UserMenuItem {
  href: string;
  label: string;
}

interface UserMenuSection {
  items: UserMenuItem[];
  title: string;
}

interface UserMenuContentProps {
  className?: string;
  onLogout: () => void | Promise<void>;
  onNavigate: (path: string) => void;
}

interface UserMenuDropdownProps {
  logoutHandler?: () => Promise<void>;
  userData?: AuthUser | null;
}

export function getUserInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return email?.[0]?.toUpperCase() ?? "U";
}

export function getUserMenuSections(): UserMenuSection[] {
  const t = HOME_MESSAGES.userMenu;

  return [
    {
      title: t.jobManagement,
      items: [
        {
          href: ROUTES.JOB_SEEKER_FAVOURITES,
          label: t.savedJobs,
        },
        {
          href: ROUTES.JOB_SEEKER_APPLICATIONS,
          label: t.appliedJobs,
        },
      ],
    },
    {
      title: t.cvManagement,
      items: [
        {
          href: ROUTES.JOB_SEEKER_CV,
          label: t.myCv,
        },
        // {
        //   href: ROUTES.RECRUITER_CV_ANALYSIS,
        //   label: t.recruiterReview,
        // },
      ],
    },
    {
      title: t.accountSecurity,
      items: [
        {
          href: ROUTES.JOB_SEEKER_PROFILE,
          label: t.profileSettings,
        },
        {
          href: ROUTES.JOB_SEEKER_PROFILE_CHANGE_PASSWORD,
          label: t.changePassword,
        },
      ],
    },
  ];
}

export function UserMenuContent({
  className,
  onLogout,
  onNavigate,
}: UserMenuContentProps) {
  const sections = getUserMenuSections();
  const t = HOME_MESSAGES.userMenu;

  return (
    <div className={cn("py-1", className)}>
      {sections.map((section, sectionIndex) => (
        <div
          className={cn(sectionIndex > 0 && "border-t border-border")}
          key={section.title}
        >
          <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </p>
          {section.items.map((item) => (
            <button
              className="block w-full px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              key={item.href}
              onClick={() => onNavigate(item.href)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}

      <div className="border-t border-border py-1">
        <button
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-error-soft"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </div>
  );
}

export function UserMenuDropdown({
  logoutHandler,
  userData,
}: UserMenuDropdownProps = {}) {
  const { user, logout, refreshUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = HOME_MESSAGES.userMenu;
  const currentUser = userData ?? user;

  const avatarUrl = currentUser?.profile?.avatarUrl || "/user-default.png";

  const { handleError: handleAvatarError } = useAvatarRefreshOnError({
    src: avatarUrl,
    onRefresh: refreshUser,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setIsOpen(false);

    if (logoutHandler) {
      await logoutHandler();
      return;
    }

    await logout();
  }

  function navigateTo(path: string) {
    setIsOpen(false);
    router.push(path);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="flex items-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="relative inline-flex">
          <img
            alt="Avatar"
            className="h-11 w-11 rounded-full border-2 border-gray-300 object-cover"
            onError={handleAvatarError}
            src={avatarUrl}
          />
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 rounded-full bg-surface text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            size={14}
            strokeWidth={2.5}
          />
        </span>
      </button>

      {isOpen && currentUser ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface py-2 shadow-xl">
          <div className="border-b border-border px-4 py-4">
            <p className="font-semibold text-foreground">
              {currentUser?.profile?.fullName || t.guestName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {currentUser?.email}
            </p>
          </div>

          <UserMenuContent onLogout={handleLogout} onNavigate={navigateTo} />
        </div>
      ) : null}
    </div>
  );
}
