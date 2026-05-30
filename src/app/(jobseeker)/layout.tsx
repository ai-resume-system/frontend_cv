import type { ReactNode } from "react";

import { JobseekerRouteShell } from "./JobseekerRouteShell";

export default function JobseekerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <JobseekerRouteShell>{children}</JobseekerRouteShell>;
}
