import { ReactNode } from "react";

import { NativeBackHandler } from "@/components/layout/native-back-handler";
import { SyncProvider } from "@/components/sync/sync-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ActiveBackgroundProvider } from "@/components/ui/page-background-context";
import { CoursesProvider } from "@/components/workspace/shared/courses-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SyncProvider>
        <CoursesProvider>
          <ActiveBackgroundProvider>
            <NativeBackHandler />
            {children}
          </ActiveBackgroundProvider>
        </CoursesProvider>
      </SyncProvider>
    </ThemeProvider>
  );
}
