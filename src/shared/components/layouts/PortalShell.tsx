import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/cn";

interface PortalShellProps {
  children: ReactNode;
  contentClassName?: string;
  floatingContent?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  mainClassName?: string;
}

export function PortalShell({
  children,
  contentClassName,
  floatingContent,
  footer,
  header,
  mainClassName,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {header}
      <main className={cn("flex-1", mainClassName)}>
        <div className={contentClassName}>{children}</div>
      </main>
      {footer}
      {floatingContent}
    </div>
  );
}
