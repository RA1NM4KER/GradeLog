"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { BrandBackgroundVariant } from "@/components/ui/brand-background-art";

const ActiveBackgroundContext = createContext<{
  active: BrandBackgroundVariant | null;
  style?: CSSProperties;
  setActive: (value: BrandBackgroundVariant, style?: CSSProperties) => void;
} | null>(null);

export function ActiveBackgroundProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [active, setActive] = useState<BrandBackgroundVariant | null>(null);
  const [style, setStyle] = useState<CSSProperties>();

  const setActiveBackground = useCallback(function setActiveBackground(
    value: BrandBackgroundVariant,
    nextStyle?: CSSProperties,
  ) {
    setActive(value);
    setStyle(nextStyle);
  }, []);

  return (
    <ActiveBackgroundContext.Provider
      value={{ active, setActive: setActiveBackground, style }}
    >
      {children}
    </ActiveBackgroundContext.Provider>
  );
}

export function useActiveBackground() {
  const ctx = useContext(ActiveBackgroundContext);
  if (!ctx) {
    throw new Error(
      "useActiveBackground must be used within ActiveBackgroundProvider",
    );
  }
  return ctx;
}
