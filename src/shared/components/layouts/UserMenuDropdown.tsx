"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { useAvatarRefreshOnError } from "@/shared/hooks/ui/useAvatarRefreshOnError";
import { cn } from "@/shared/lib/utils/cn";
import type { AuthUser } from "@/shared/types/account";
import { ChevronDown, LogOut } from "lucide-react";

interface UserMenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface UserMenuSection {
  items: UserMenuItem[];
  title?: string;
  hasDivider?: boolean;
}

interface UserMenuContentProps {
  className?: string;
  sections: UserMenuSection[];
  showLogoutDivider?: boolean;
  onLogout: () => void | Promise<void>;
  onNavigate: (path: string) => void;
}

interface UserMenuDropdownProps {
  sections: UserMenuSection[];
  logoutHandler?: () => Promise<void>;
  userData?: AuthUser | null;
  avatarUrl?: string;
  fullName?: string;
  email?: string;
  showLogoutDivider?: boolean;
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

function UserMenuContent({
  className,
  sections,
  showLogoutDivider = true,
  onLogout,
  onNavigate,
}: UserMenuContentProps) {
  return (
    <div className={cn("py-1", className)}>
      {sections.map((section, sectionIndex) => {
        const showDivider = section.hasDivider ?? sectionIndex > 0;
        return (
          <div
            className={cn(showDivider && "border-t border-gray-200")}
            key={section.title || sectionIndex}
          >
            {section.title && (
              <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  type="button"
                >
                  {Icon && (
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}

      <div
        className={cn("py-1", showLogoutDivider && "border-t border-gray-200")}
      >
        <button
          className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-error-soft"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export function UserMenuDropdown({
  logoutHandler,
  userData,
  avatarUrl: customAvatarUrl,
  fullName: customFullName,
  email: customEmail,
  sections,
  showLogoutDivider,
}: UserMenuDropdownProps) {
  const { user, logout, refreshUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentUser = userData ?? user;

  const avatarUrl =
    customAvatarUrl ?? currentUser?.profile?.avatarUrl ?? "/user-default.png";
  const fullName =
    customFullName ?? currentUser?.profile?.fullName ?? "Tài khoản";
  const email = customEmail ?? currentUser?.email;

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

  // navigateTo
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
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-surface py-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border-b border-gray-200 px-4 py-4">
            <p className="font-semibold text-foreground truncate">{fullName}</p>
            {email && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {email}
              </p>
            )}
          </div>

          <UserMenuContent
            sections={sections}
            showLogoutDivider={showLogoutDivider}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        </div>
      ) : null}
    </div>
  );
}
