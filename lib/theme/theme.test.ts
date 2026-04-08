import { describe, expect, it } from "vitest";

import {
  getThemeInitializerScript,
  isThemeMode,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme/theme";

describe("theme", () => {
  it("recognizes valid theme modes only", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(true);
    expect(isThemeMode("sepia")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });

  it("resolves system mode from the browser preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("builds the boot script with the expected constants", () => {
    const script = getThemeInitializerScript();

    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain("prefers-color-scheme: dark");
    expect(script).toContain('root.classList.toggle("dark"');
    expect(script).toContain("root.style.colorScheme");
  });
});
