import { ReactNode } from "react";

import { NativeBackHandler } from "@/components/layout/native-back-handler";
import { SyncProvider } from "@/components/sync/sync-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CoursesProvider } from "@/components/workspace/shared/courses-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SyncProvider>
        <CoursesProvider>
          <NativeBackHandler />
          {children}
        </CoursesProvider>
      </SyncProvider>
    </ThemeProvider>
  );
}
