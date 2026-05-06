import { ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main className={cn("min-h-screen bg-canvas text-foreground", className)}>
      {children}
    </main>
  );
}
