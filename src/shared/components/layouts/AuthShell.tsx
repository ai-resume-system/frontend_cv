import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface AuthShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function AuthShell({ children, contentClassName }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className={cn("min-h-screen", contentClassName)}>{children}</div>
    </div>
  );
}
