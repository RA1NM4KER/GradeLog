"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ActiveBackground = { mobile: string; desktop: string };

const ActiveBackgroundContext = createContext<{
  active: ActiveBackground | null;
  setActive: (value: ActiveBackground) => void;
} | null>(null);

export function ActiveBackgroundProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveBackground | null>(null);

  return (
    <ActiveBackgroundContext.Provider value={{ active, setActive }}>
      {children}
    </ActiveBackgroundContext.Provider>
  );
}

/**
 * Lets the page's PageBackground publish which art it's showing so TopNav
 * can paint the same viewport-fixed image behind itself — the nav stays
 * opaque to scrolling content while looking like a window onto the page bg.
 */
export function useActiveBackground() {
  const ctx = useContext(ActiveBackgroundContext);
  if (!ctx) {
    throw new Error(
      "useActiveBackground must be used within ActiveBackgroundProvider",
    );
  }
  return ctx;
}
