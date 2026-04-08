import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/supabase-browser", () => ({
  getSupabaseBrowserClient: vi.fn(),
}));

import {
  clearPasswordRecoverySession,
  getCurrentSyncSession,
  hasPasswordRecoverySession,
  markPasswordRecoverySession,
  requestPasswordResetForEmail,
  signInWithEmailPassword,
  signOutFromSync,
  signUpWithEmailPassword,
  updateCurrentSyncPassword,
} from "@/lib/sync/sync-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";

describe("sync-auth", () => {
  const originalWindow = globalThis.window;

  const client = {
    auth: {
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      updateUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.mocked(getSupabaseBrowserClient).mockReset();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          hash: "",
          origin: "https://gradelog.app",
          search: "",
        },
        sessionStorage: {
          getItem: vi.fn(() => null),
          removeItem: vi.fn(),
          setItem: vi.fn(),
        },
      },
    });
    Object.values(client.auth).forEach((mock) => mock.mockReset());
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("requires a configured client for sign-in and sign-up flows", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    client.auth.signUp.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    client.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
    });
    client.auth.updateUser.mockResolvedValueOnce({ data: { user: {} } });
    client.auth.signOut.mockResolvedValueOnce({ error: null });

    await signUpWithEmailPassword("user@example.com", "password");
    await signInWithEmailPassword("user@example.com", "password");
    await updateCurrentSyncPassword("new-password");
    await signOutFromSync();

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password",
    });
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password",
    });
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      password: "new-password",
    });
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it("throws a clear error when sync is not configured", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(null);

    await expect(
      signUpWithEmailPassword("user@example.com", "password"),
    ).rejects.toThrow("Sync is not configured in this build.");
  });

  it("requests password reset in the browser and tracks recovery sessions", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    client.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    await requestPasswordResetForEmail("user@example.com");

    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo: "https://gradelog.app/reset-password",
      },
    );

    markPasswordRecoverySession();
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      "gradelog-password-recovery",
      "true",
    );

    expect(hasPasswordRecoverySession()).toBe(false);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        hash: "#type=recovery",
        origin: "https://gradelog.app",
        search: "",
      },
    });
    expect(hasPasswordRecoverySession()).toBe(true);

    clearPasswordRecoverySession();
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      "gradelog-password-recovery",
    );
  });

  it("handles password recovery checks safely outside the browser", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);

    expect(hasPasswordRecoverySession()).toBe(false);
    expect(clearPasswordRecoverySession()).toBeUndefined();
    expect(markPasswordRecoverySession()).toBeUndefined();
    await expect(
      requestPasswordResetForEmail("user@example.com"),
    ).rejects.toThrow("Password reset is only available in the browser.");
  });

  it("returns the current session and surfaces Supabase errors", async () => {
    vi.mocked(getSupabaseBrowserClient).mockReturnValue(client as never);
    client.auth.getSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });

    await expect(getCurrentSyncSession()).resolves.toEqual({
      access_token: "token",
    });

    client.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error("session failed"),
    });
    await expect(getCurrentSyncSession()).rejects.toThrow("session failed");

    vi.mocked(getSupabaseBrowserClient).mockReturnValue(null);
    await expect(getCurrentSyncSession()).resolves.toBeNull();
  });
});
