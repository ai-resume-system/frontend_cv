import type { ReactNode } from "react";

import { AuthShell } from "@/shared/components/layouts/AuthShell";

export default function JobseekerAuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthShell>{children}</AuthShell>;
}
