import { afterEach, describe, expect, it, vi } from "vitest";

import { isNativeApp } from "@/lib/platform/platform";

describe("platform", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false without a browser window", () => {
    vi.stubGlobal("window", undefined);
    expect(isNativeApp()).toBe(false);
  });

  it("detects the Capacitor bridge in the browser", () => {
    vi.stubGlobal("window", { Capacitor: {} });
    expect(isNativeApp()).toBe(true);
  });
});
