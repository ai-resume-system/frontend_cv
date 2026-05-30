"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { cn } from "@/shared/lib/utils/cn";

interface RecruiterWorkspaceShellProps {
  children: ReactNode;
  heading: string;
  subheading: string;
  action?: ReactNode;
}

interface RecruiterNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: RecruiterNavItem[] = [
  {
    href: RECRUITER_ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: RECRUITER_ROUTES.JOB_POSTING,
    label: "Đăng tin tuyển dụng",
    icon: FilePlus2,
  },
];

export function RecruiterWorkspaceShell({
  children,
  heading,
  subheading,
  action,
}: RecruiterWorkspaceShellProps) {
  const pathname = usePathname();
  const { user, logout } = useCurrentUser();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,88,190,0.12),_transparent_35%),linear-gradient(180deg,_#f8f9fa_0%,_#eef2f7_100%)] text-on-surface">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/75 px-6 py-8 backdrop-blur xl:flex xl:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/15">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                Fuse Recruiter
              </p>
              <h2 className="text-lg font-bold text-primary">Nhà tuyển dụng</h2>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/15"
                      : "text-on-surface-variant hover:bg-primary-soft/60 hover:text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-primary/10 bg-primary-soft/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Ghi chú API
            </p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Những khối AI phân tích tổng hợp, lịch phỏng vấn và độ phủ ứng viên
              đang hiển thị từ dữ liệu hiện có hoặc được gắn nhãn rõ nếu backend
              chưa cung cấp endpoint chuyên biệt.
            </p>
          </div>

          <div className="mt-auto space-y-3 rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {user?.company?.companyName ?? user?.profile?.fullName ?? "Tài khoản recruiter"}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {user?.email ?? "Chưa tải thông tin tài khoản"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void logout();
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-error/15 px-4 py-3 text-sm font-semibold text-error transition hover:bg-error/5"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Bảng điều hành recruiter
                </p>
                <h1 className="truncate text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  {heading}
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {subheading}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {action}
                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary lg:inline-flex"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary lg:inline-flex"
                  aria-label="Thiết lập"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/70 px-4 py-3 xl:hidden">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-on-primary"
                        : "bg-white text-on-surface-variant",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
