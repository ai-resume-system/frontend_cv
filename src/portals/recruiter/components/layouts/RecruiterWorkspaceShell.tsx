"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState, useEffect, useRef } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  UserRound,
  UsersRound,
  Menu,
  X,
  ChevronDown,
  Building2,
} from "lucide-react";

import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { cn } from "@/shared/lib/utils/cn";
import Image from "next/image";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";

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
    href: RECRUITER_ROUTES.JOBS,
    label: "Tin tuyển dụng",
    icon: BriefcaseBusiness,
  },
  {
    href: RECRUITER_ROUTES.APPLICANTS,
    label: "Ứng viên",
    icon: UsersRound,
  },
  {
    href: RECRUITER_ROUTES.INTERVIEWS,
    label: "Phỏng vấn",
    icon: CalendarCheck,
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

  // State đóng/mở sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State dropdown avatar
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,88,190,0.12),_transparent_35%),linear-gradient(180deg,_#f8f9fa_0%,_#eef2f7_100%)] text-on-surface">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar cho Desktop (khóa theo view, hỗ trợ collapse) */}
        <aside
          className={cn(
            "sticky top-0 h-screen hidden shrink-0 border-r border-white/70 bg-white/75 py-8 backdrop-blur xl:flex xl:flex-col overflow-y-auto z-30 transition-all duration-300",
            isSidebarCollapsed ? "w-20 px-4 items-center" : "w-72 px-6",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isSidebarCollapsed && "justify-center",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center shrink-0">
              <Image
                src={user?.company?.logoUrl ?? "/logo.png"}
                alt="Logo"
                width={48}
                height={48}
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary truncate">
                  {INFOMATION_WEB.COMPANY_NAME}
                </h2>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Nhà tuyển dụng
                </p>
              </div>
            )}
          </div>

          <nav className="mt-10 space-y-2 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl py-3 text-sm font-semibold transition",
                    isSidebarCollapsed
                      ? "justify-center px-0 w-12 h-12 mx-auto"
                      : "px-4",
                    active
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/15"
                      : "text-on-surface-variant hover:bg-primary-soft/60 hover:text-primary",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={cn(
            "fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-white/70 bg-white/95 px-6 py-8 backdrop-blur transition-transform duration-300 ease-in-out xl:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center shrink-0">
                <Image
                  src={user?.company?.logoUrl ?? "/logo.png"}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary truncate">
                  {INFOMATION_WEB.COMPANY_NAME}
                </h2>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Nhà tuyển dụng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant hover:text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-10 space-y-2 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/15"
                      : "text-on-surface-variant hover:bg-primary-soft/60 hover:text-primary",
                  )}
                >
                  <Icon className="h-5 w-5 animate-none shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              {/* Nút Toggle Sidebar và Logo di động */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarCollapsed((prev) => !prev);
                    setIsMobileOpen(true);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 xl:hidden">
                  <Image
                    src={user?.company?.logoUrl ?? "/logo.png"}
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-full object-cover shrink-0"
                    unoptimized
                  />
                  <span className="font-bold text-primary text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                    {INFOMATION_WEB.COMPANY_NAME}
                  </span>
                </div>
              </div>

              {/* Actions + Bell + Avatar Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                {action}
                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-on-surface-variant transition hover:text-primary sm:inline-flex"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                </button>

                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white p-1.5 pr-3 text-on-surface-variant transition hover:text-primary hover:border-primary/20"
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      {user?.company?.logoUrl ? (
                        <Image
                          src={user.company.logoUrl}
                          alt="Company Logo"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserRound className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-semibold text-on-surface sm:inline-block">
                      {user?.company?.name ??
                        user?.profile?.fullName ??
                        "Tài khoản"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isDropdownOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-3 py-2 border-b border-surface-container-high mb-1">
                        <p className="truncate text-sm font-bold text-on-surface">
                          {user?.company?.name ??
                            user?.profile?.fullName ??
                            "Tài khoản recruiter"}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href={RECRUITER_ROUTES.COMPANY_PROFILE}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-primary-soft/60 hover:text-primary transition"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Hồ sơ công ty</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error hover:bg-error/5 transition text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Vùng nội dung chính */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {heading && (
              <div className="mb-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/70 mb-2">
                  <Link
                    href={RECRUITER_ROUTES.DASHBOARD}
                    className="hover:text-primary transition"
                  >
                    Trang chủ
                  </Link>
                  <span>/</span>
                  <span className="text-primary font-bold">{heading}</span>
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                    {heading}
                  </h1>
                  {subheading && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {subheading}
                    </p>
                  )}
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
