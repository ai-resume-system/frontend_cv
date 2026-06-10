import type { ReactNode } from "react";

import { PortalShell } from "@/shared/components/layouts/PortalShell";
import { PortalAccessGuard } from "@/shared/components/providers/PortalAccessGuard";
import { RECRUITER_ROUTES } from "@/shared/constants/constants/routes";
import { EUserRole } from "@/shared/constants/enums/user.enum";

export default function RecruiterLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PortalAccessGuard
      bypassPaths={[
        RECRUITER_ROUTES.LOGIN,
        RECRUITER_ROUTES.REGISTER,
        RECRUITER_ROUTES.FORGOT_PASSWORD,
      ]}
      mode="protected"
      requiredRole={EUserRole.RECRUITER}
    >
      <PortalShell mainClassName="flex-1 bg-background text-foreground">
        {children}
      </PortalShell>
    </PortalAccessGuard>
  );
}
