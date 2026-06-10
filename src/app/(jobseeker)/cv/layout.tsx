import type { ReactNode } from "react";

import { PortalAccessGuard } from "@/shared/components/providers/PortalAccessGuard";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export default function CvProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PortalAccessGuard
      mode="protected"
      requiredRole={EUserRole.JOB_SEEKER}
    >
      {children}
    </PortalAccessGuard>
  );
}
