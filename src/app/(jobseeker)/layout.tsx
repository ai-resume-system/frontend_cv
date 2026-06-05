import type { ReactNode } from "react";

import { JobseekerRouteShell } from "../../portals/JobseekerRouteShell";

export default function JobseekerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <JobseekerRouteShell>{children}</JobseekerRouteShell>;
}
