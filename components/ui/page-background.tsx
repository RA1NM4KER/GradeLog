"use client";

import { useTheme } from "@/components/theme/theme-provider";

const backgroundAssets = {
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

/**
 * Full-viewport, fixed brand background for a screen. Renders behind all
 * content — AppShell's <main> has no background color of its own so this
 * shows through. Picks mobile/desktop art by breakpoint and light/dark art
 * by the active theme; no filters or CSS approximations of dark mode.
 */
export function PageBackground({ variant }: { variant: PageBackgroundVariant }) {
  const { resolvedTheme } = useTheme();
  const { mobile, desktop } = backgroundAssets[variant][resolvedTheme];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-canvas"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden"
        style={{ backgroundImage: `url(${mobile})` }}
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat sm:block"
        style={{ backgroundImage: `url(${desktop})` }}
      />
    </div>
  );
}
