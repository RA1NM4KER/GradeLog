import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

describe("supabase-browser", () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockReset();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    vi.unstubAllGlobals();
  });

  it("reports configuration only when both env vars are present", async () => {
    const { isSupabaseConfigured } =
      await import("@/lib/supabase/supabase-browser");

    expect(isSupabaseConfigured()).toBe(false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "   ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(isSupabaseConfigured()).toBe(false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(isSupabaseConfigured()).toBe(true);
  });

  it("returns null without a browser window or missing config", async () => {
    const { getSupabaseBrowserClient } =
      await import("@/lib/supabase/supabase-browser");

    expect(getSupabaseBrowserClient()).toBeNull();

    vi.stubGlobal("window", {});
    expect(getSupabaseBrowserClient()).toBeNull();
  });

  it("creates and caches the browser client when configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    vi.stubGlobal("window", {});
    createClient.mockReturnValue({ kind: "client" });

    const { getSupabaseBrowserClient } =
      await import("@/lib/supabase/supabase-browser");

    const first = getSupabaseBrowserClient();
    const second = getSupabaseBrowserClient();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      },
    );
    expect(first).toBe(second);
  });
});
