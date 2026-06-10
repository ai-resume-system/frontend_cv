import type { ReactNode } from "react";

import { AuthShell } from "@/shared/components/layouts/AuthShell";
import { PortalAccessGuard } from "@/shared/components/providers/PortalAccessGuard";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export default function JobseekerAuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PortalAccessGuard
      mode="guest-only"
      requiredRole={EUserRole.JOB_SEEKER}
    >
      <AuthShell>{children}</AuthShell>
    </PortalAccessGuard>
  );
}
