import { ResolvedTheme, ThemeMode } from "@/lib/theme/types";

export type { ResolvedTheme, ThemeMode } from "@/lib/theme/types";

export const THEME_STORAGE_KEY = "gradelog-theme";

export const THEME_MODES = ["system", "light", "dark"] as const;

export function isThemeMode(
  value: string | null | undefined,
): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveTheme(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}
