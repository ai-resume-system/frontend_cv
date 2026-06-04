"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Footer } from "@/shared/components/layouts/Footer";
import { Header } from "@/shared/components/layouts/Header";
import { PortalShell } from "@/shared/components/layouts/PortalShell";
import { FloatingFavouriteButton } from "@/shared/components/layouts/FloatingFavouriteButton";

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
      footer={<Footer />}
      header={<Header />}
      mainClassName="flex-1 bg-background text-foreground"
    >
      {children}
    </PortalShell>
  );
}
