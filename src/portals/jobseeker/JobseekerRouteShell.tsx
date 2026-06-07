// Trang dùng để định tuyến ??
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { JobseekerFooter } from "@/portals/jobseeker/components/layouts/JobseekerFooter";
import { JobseekerHeader } from "@/portals/jobseeker/components/layouts/JobseekerHeader";
import { PortalShell } from "@/shared/components/layouts/PortalShell";
import { FloatingFavouriteButton } from "@/portals/jobseeker/components/layouts/FloatingFavouriteButton";

interface JobseekerRouteShellProps {
  children: ReactNode;
}

const AUTH_PATHS = new Set(["/login", "/register", "/forgot-password"]);

export function JobseekerRouteShell({ children }: JobseekerRouteShellProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <PortalShell
      floatingContent={<FloatingFavouriteButton />}
      footer={<JobseekerFooter />}
      header={<JobseekerHeader />}
      mainClassName="flex-1 bg-background text-foreground"
    >
      {children}
    </PortalShell>
  );
}
