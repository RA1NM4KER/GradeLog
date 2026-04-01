import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-canvas text-foreground",
        "[background-position:center_top]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-surface-overlay/55 via-surface-overlay/15 to-transparent" />
      {children}
    </main>
  );
}
