"use client";

import Link from "next/link";
import { BriefcaseBusiness, Building2, Menu } from "lucide-react";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { UserMenuDropdown } from "@/shared/components/layouts/UserMenuDropdown";

interface RecruiterHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export function RecruiterHeader({
  onToggleSidebar,
  onOpenMobileSidebar,
}: RecruiterHeaderProps) {
  const { user, logout } = useCurrentUser();

  const recruiterSections = [
    {
      items: [
        {
          href: RECRUITER_ROUTES.COMPANY_PROFILE,
          label: "Hồ sơ công ty",
          icon: Building2,
        },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur shadow-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => {
            onToggleSidebar();
            onOpenMobileSidebar();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={RECRUITER_ROUTES.JOB_CREATE}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/15 transition hover:bg-primary-hover"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Đăng tin mới</span>
          </Link>

          {/* <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary sm:inline-flex"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
          </button> */}

          <UserMenuDropdown
            avatarUrl={user?.company?.logoUrl ?? "/logo.png"}
            fullName={user?.company?.name ?? "Hiện chưa cập nhật"}
            email={user?.email}
            sections={recruiterSections}
            logoutHandler={logout}
            showLogoutDivider={false}
          />
        </div>
      </div>
    </header>
  );
}
