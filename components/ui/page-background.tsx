"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { useActiveBackground } from "@/components/ui/page-background-context";
import { cn } from "@/lib/shared/utils";

export const backgroundAssets = {
  landing: {
    light: {
      mobile: "/backgrounds/gradelog-mobile-01.png",
      desktop: "/backgrounds/gradelog-desktop-01.png",
    },
    dark: {
      mobile: "/backgrounds/gradelog-mobile-01-dark.png",
      desktop: "/backgrounds/gradelog-desktop-01-dark.png",
    },
  },
  overview: {
    light: {
      mobile: "/backgrounds/gradelog-mobile-02.png",
      desktop: "/backgrounds/gradelog-desktop-02.png",
    },
    dark: {
      mobile: "/backgrounds/gradelog-mobile-02-dark.png",
      desktop: "/backgrounds/gradelog-desktop-02-dark.png",
    },
  },
  detail: {
    light: {
      mobile: "/backgrounds/gradelog-mobile-03.png",
      desktop: "/backgrounds/gradelog-desktop-03.png",
    },
    dark: {
      mobile: "/backgrounds/gradelog-mobile-03-dark.png",
      desktop: "/backgrounds/gradelog-desktop-03-dark.png",
    },
  },
} as const;

export type PageBackgroundVariant = keyof typeof backgroundAssets;

export function toWebp(pngPath: string) {
  return pngPath.replace(/\.png$/, ".webp");
}

export function layerStyle(pngPath: string) {
  return {
    "--bg-fallback": `url(${pngPath})`,
    "--bg-webp": `url(${toWebp(pngPath)})`,
  } as CSSProperties;
}

/**
 * Full-viewport, fixed brand background for a screen. Renders behind all
 * content — AppShell's <main> has no background color of its own so this
 * shows through. Picks mobile/desktop art by breakpoint and light/dark art
 * by the active theme. Serves WebP with the source PNG as a CSS-level
 * fallback (`.bg-progressive`) for browsers below the WebP floor — no JS
 * format sniffing, no filters or CSS approximations of dark mode.
 */
export function PageBackground({
  variant,
}: {
  variant: PageBackgroundVariant;
}) {
  const { resolvedTheme } = useTheme();
  const { mobile, desktop } = backgroundAssets[variant][resolvedTheme];
  const { setActive } = useActiveBackground();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setActive({ desktop, isLoaded, mobile });
  }, [desktop, isLoaded, mobile, setActive]);

  useEffect(() => {
    setIsLoaded(false);
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 640px)").matches;
    const targetPng = isDesktop ? desktop : mobile;
    const targetWebp = toWebp(targetPng);

    const img = new window.Image();
    img.src = targetWebp;

    if (img.complete) {
      setIsLoaded(true);
      return;
    }

    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      const fallback = new window.Image();
      fallback.src = targetPng;
      fallback.onload = () => setIsLoaded(true);
      fallback.onerror = () => setIsLoaded(true);
    };
  }, [desktop, mobile]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-canvas"
    >
      <div
        className={cn(
          "bg-progressive absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 sm:hidden",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        style={layerStyle(mobile)}
      />
      <div
        className={cn(
          "bg-progressive absolute inset-0 hidden bg-cover bg-center bg-no-repeat transition-opacity duration-300 sm:block",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        style={layerStyle(desktop)}
      />
    </div>
  );
}
