import type { ReactNode } from "react";

import { PortalShell } from "@/shared/components/layouts/PortalShell";

export default function RecruiterLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PortalShell mainClassName="flex-1 bg-background text-foreground">
      {children}
    </PortalShell>
  );
}
