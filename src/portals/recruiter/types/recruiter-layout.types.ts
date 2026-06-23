import type { ReactNode } from "react";

export interface RecruiterWorkspaceShellProps {
  children: ReactNode;
  heading?: string;
  subheading?: ReactNode;
  action?: ReactNode;
}
