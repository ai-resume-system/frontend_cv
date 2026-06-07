"use client";

import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { cn } from "@/shared/lib/utils/cn";
import { HelpCircle, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RECRUITER_NAV_ITEMS } from "../../types/recruiter-nav-items";

interface RecruiterSidebarProps {
  isSidebarCollapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function RecruiterSidebar({
  isSidebarCollapsed,
  isOpen,
  onClose,
}: RecruiterSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useCurrentUser();

  return (
    <>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 h-screen hidden shrink-0 border-r border-white/10 bg-[#0a2266] py-8 xl:flex xl:flex-col overflow-hidden z-30 transition-all duration-300",
            isSidebarCollapsed ? "w-20 px-4 items-center" : "w-72 px-6",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isSidebarCollapsed && "justify-center",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center border border-outline-variant/60 bg-white rounded-full overflow-hidden shrink-0 shadow-xs">
              <img
                src={user?.company?.logoUrl ?? "/logo.png"}
                alt="Logo"
                className="object-cover h-full w-full"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                  Nhà tuyển dụng
                </p>
                <h2 className="text-lg font-bold text-white truncate">
                  {user?.company?.name}
                </h2>
              </div>
            )}
          </div>

          <nav className="mt-10 space-y-2 w-full flex-1 overflow-y-auto custom-scroll">
            {RECRUITER_NAV_ITEMS.map((item) => {
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
                      ? "bg-primary-soft text-primary shadow-lg shadow-primary-soft/10"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
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

          <div className="mt-auto pt-4 border-t border-white/10 w-full space-y-1">
            <a
              href={`tel:${INFOMATION_WEB.PHONE}`}
              title={isSidebarCollapsed ? "Hỗ trợ" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl py-2 text-sm font-semibold transition text-white/70 hover:bg-white/10 hover:text-white",
                isSidebarCollapsed
                  ? "justify-center px-0 w-12 h-12 mx-auto"
                  : "px-4",
              )}
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Hỗ trợ</span>}
            </a>

            <button
              type="button"
              onClick={() => void logout()}
              title={isSidebarCollapsed ? "Đăng xuất" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl py-2 text-sm font-semibold transition text-red-400 hover:bg-red-500/10",
                isSidebarCollapsed
                  ? "justify-center px-0 w-12 h-12 mx-auto"
                  : "px-4",
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden",
          )}
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 top-0 left-0 z-50 flex h-[calc(100dvh-1px)] w-72 flex-col border-r border-white/10 bg-[#0a2266] px-4 py-6 transition-transform duration-300 ease-in-out xl:hidden overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border border-outline-variant/60 bg-white rounded-full overflow-hidden shrink-0 shadow-xs">
              <img
                src={user?.company?.logoUrl ?? "/logo.png"}
                alt="Logo"
                className="object-cover h-full w-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Nhà tuyển dụng
              </p>
              <h2 className="text-lg font-bold text-white truncate">
                {user?.company?.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-white shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-10 space-y-2 flex-1 overflow-y-auto custom-scroll">
          {RECRUITER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-primary-soft text-primary shadow-lg shadow-primary-soft/10"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 animate-none shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 w-full space-y-1">
          <a
            href={`tel:${INFOMATION_WEB.PHONE}`}
            className="flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition text-white/70 hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            <span>Hỗ trợ</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              void logout();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition text-red-400 hover:bg-red-500/10 text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
