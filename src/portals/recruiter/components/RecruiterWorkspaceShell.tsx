"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState, useRef, useEffect } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck,
  LayoutDashboard,
  UsersRound,
  X,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { useCurrentUser } from "@/shared/hooks/data/useCurrentUser";
import { cn } from "@/shared/lib/utils/cn";
import Image from "next/image";
import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";
import { RecruiterHeader } from "@/portals/recruiter/components/layouts/RecruiterHeader";
import { RecruiterWorkspaceShellProps } from "../types/recruiter-layout.types";
import { RecruiterSidebar } from "./layouts/RecruiterSideBar";

export function RecruiterWorkspaceShell({
  children,
  heading,
  subheading,
  action,
}: RecruiterWorkspaceShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar (collapsed by default) */}
      <RecruiterSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Header */}
        <RecruiterHeader
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Vùng nội dung chính */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 min-w-0">
          {(heading || subheading || action) && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {heading && (
                  <h1 className="text-2xl font-bold tracking-tight text-primary">
                    {heading}
                  </h1>
                )}
                {subheading && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {subheading}
                  </p>
                )}
              </div>
              {action && (
                <div className="flex shrink-0 items-center gap-3">{action}</div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
