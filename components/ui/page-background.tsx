"use client";

import { useEffect, type CSSProperties } from "react";

import {
  BrandBackgroundArt,
  type BrandBackgroundVariant,
} from "@/components/ui/brand-background-art";
import { useActiveBackground } from "@/components/ui/page-background-context";

export type PageBackgroundVariant = BrandBackgroundVariant;

export function PageBackground({
  variant,
  style,
}: {
  variant: PageBackgroundVariant;
  style?: CSSProperties;
}) {
  const { setActive } = useActiveBackground();

  useEffect(() => {
    setActive(variant, style);
  }, [setActive, style, variant]);

  return (
    <BrandBackgroundArt
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={style}
      variant={variant}
    />
  );
}
