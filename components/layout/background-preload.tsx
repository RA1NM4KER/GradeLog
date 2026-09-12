"use client";

import { usePathname } from "next/navigation";

import {
  backgroundAssets,
  toWebp,
  type PageBackgroundVariant,
} from "@/components/ui/page-background";

function variantForPath(pathname: string): PageBackgroundVariant | null {
  if (pathname === "/") {
    return "landing";
  }

  if (
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms"
  ) {
    return "detail";
  }

  if (pathname === "/courses" || pathname === "/workspace") {
    return "overview";
  }

  return null;
}

/**
 * Renders <link rel=preload> for the current route's background art.
 * PageBackground itself lives under CoursesProvider, which bails the whole
 * tree to client-only rendering (it reads localStorage during render), so
 * nothing inside it makes it into the static HTML <head> — the browser only
 * learns the image URL after JS boots and that provider resolves. Placed
 * here in RootLayout, outside that provider, this renders eagerly into the
 * prerendered <head> so the image fetch can start in parallel with the JS
 * bundle instead of waiting for hydration.
 */
export function BackgroundPreload() {
  const pathname = usePathname();
  const variant = variantForPath(pathname);

  if (!variant) {
    return null;
  }

  const { light, dark } = backgroundAssets[variant];

  return (
    <>
      <link
        rel="preload"
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(min-width: 640px) and (prefers-color-scheme: light)"
        href={toWebp(light.desktop)}
      />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(min-width: 640px) and (prefers-color-scheme: dark)"
        href={toWebp(dark.desktop)}
      />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(max-width: 639.98px) and (prefers-color-scheme: light)"
        href={toWebp(light.mobile)}
      />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        fetchPriority="high"
        media="(max-width: 639.98px) and (prefers-color-scheme: dark)"
        href={toWebp(dark.mobile)}
      />
    </>
  );
}
