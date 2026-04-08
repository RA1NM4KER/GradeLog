import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/supabase-browser", () => ({
  getSupabaseBrowserClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

import { deleteCurrentAccount } from "@/lib/supabase/delete-account";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/supabase-browser";

describe("delete-account", () => {
  const client = {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.mocked(getSupabaseBrowserClient).mockReset();
    vi.mocked(isSupabaseConfigured).mockReset();
    client.auth.getSession.mockReset();
    client.functions.invoke.mockReset();
  });

  it("rejects when account deletion is not configured", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(null);
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    await expect(deleteCurrentAccount()).rejects.toThrow(
      "Account deletion is not configured in this build.",
    );
  });

  it("rejects when the session cannot be loaded or lacks an access token", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    client.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error("session failed"),
    });
    await expect(deleteCurrentAccount()).rejects.toThrow("session failed");

    client.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    await expect(deleteCurrentAccount()).rejects.toThrow(
      "Sign in again before deleting your account.",
    );
  });

  it("invokes the delete-account function with a bearer token", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    client.auth.getSession.mockResolvedValueOnce({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    client.functions.invoke.mockResolvedValueOnce({ error: null });

    await expect(deleteCurrentAccount()).resolves.toBeUndefined();
    expect(client.functions.invoke).toHaveBeenCalledWith("delete-account", {
      body: {},
      headers: {
        Authorization: "Bearer token-123",
      },
    });
  });

  it("surfaces function invocation errors with a fallback message", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    client.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    client.functions.invoke.mockResolvedValueOnce({
      error: { message: "failed upstream" },
    });
    await expect(deleteCurrentAccount()).rejects.toThrow("failed upstream");

    client.functions.invoke.mockResolvedValueOnce({
      error: { message: "" },
    });
    await expect(deleteCurrentAccount()).rejects.toThrow(
      "GradeLog could not delete your account right now.",
    );
  });
});
