// @vitest-environment jsdom

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockClearPasswordRecoverySession,
  mockGetCurrentSyncSession,
  mockHasPasswordRecoverySession,
  mockSignOutFromSync,
  mockUpdateCurrentSyncPassword,
} = vi.hoisted(() => ({
  mockClearPasswordRecoverySession: vi.fn(),
  mockGetCurrentSyncSession: vi.fn(),
  mockHasPasswordRecoverySession: vi.fn(),
  mockSignOutFromSync: vi.fn(),
  mockUpdateCurrentSyncPassword: vi.fn(),
}));

vi.mock("@/lib/sync/sync-auth", () => ({
  clearPasswordRecoverySession: mockClearPasswordRecoverySession,
  getCurrentSyncSession: mockGetCurrentSyncSession,
  hasPasswordRecoverySession: mockHasPasswordRecoverySession,
  signOutFromSync: mockSignOutFromSync,
  updateCurrentSyncPassword: mockUpdateCurrentSyncPassword,
}));

import ResetPasswordPage from "@/app/reset-password/page";

describe("app/reset-password/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOutFromSync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows an expired-link message when there is no recovery session", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(false);
    mockGetCurrentSyncSession.mockResolvedValue(null);

    render(React.createElement(ResetPasswordPage));

    expect(screen.getByText("Verifying your reset link…")).toBeTruthy();
    expect(await screen.findByText(/invalid or has expired/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to GradeLog" })).toBeTruthy();
  });

  it("shows the signed-in-session warning outside the recovery flow", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(false);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });

    render(React.createElement(ResetPasswordPage));

    expect(
      await screen.findByText(/only works from a password reset email/i),
    ).toBeTruthy();
  });

  it("shows the verification error message when session recovery throws", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockRejectedValue(
      new Error("Session lookup failed."),
    );

    render(React.createElement(ResetPasswordPage));

    expect(await screen.findByText("Session lookup failed.")).toBeTruthy();
  });

  it("falls back to the default verification message for non-error failures", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockRejectedValue("nope");

    render(React.createElement(ResetPasswordPage));

    expect(
      await screen.findByText(
        "GradeLog could not verify your password reset link.",
      ),
    ).toBeTruthy();
  });

  it("does not submit when the password is invalid", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });

    const { container } = render(React.createElement(ResetPasswordPage));

    fireEvent.change(await screen.findByLabelText("New password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "short" },
    });

    const submitButton = screen.getByRole("button", {
      name: "Update password",
    });
    expect(submitButton.hasAttribute("disabled")).toBe(true);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(mockUpdateCurrentSyncPassword).not.toHaveBeenCalled();
  });

  it("does not update state after unmount when recovery resolves late", async () => {
    let resolveSession: (
      value: { user: { id: string } } | null,
    ) => void = () => {};
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );

    const { unmount } = render(React.createElement(ResetPasswordPage));
    unmount();
    resolveSession({ user: { id: "user-1" } });

    await waitFor(() =>
      expect(mockGetCurrentSyncSession).toHaveBeenCalledTimes(1),
    );
  });

  it("does not update state after unmount when recovery rejects late", async () => {
    let rejectSession: (reason?: unknown) => void = () => {};
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockReturnValue(
      new Promise((_, reject) => {
        rejectSession = reject;
      }),
    );

    const { unmount } = render(React.createElement(ResetPasswordPage));
    unmount();
    rejectSession(new Error("late failure"));

    await waitFor(() =>
      expect(mockGetCurrentSyncSession).toHaveBeenCalledTimes(1),
    );
  });

  it("submits a new password and shows the success state", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockUpdateCurrentSyncPassword.mockResolvedValue({ error: null });

    render(React.createElement(ResetPasswordPage));

    const passwordInput = await screen.findByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm password");

    fireEvent.change(passwordInput, { target: { value: "new-password" } });
    fireEvent.change(confirmInput, { target: { value: "wrong-password" } });
    expect(await screen.findByText("Passwords do not match.")).toBeTruthy();

    fireEvent.change(confirmInput, { target: { value: "new-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(mockUpdateCurrentSyncPassword).toHaveBeenCalledWith(
        "new-password",
      ),
    );
    expect(mockClearPasswordRecoverySession).toHaveBeenCalled();
    expect(mockSignOutFromSync).toHaveBeenCalled();
    expect(
      await screen.findByText(/your password has been updated/i),
    ).toBeTruthy();
  });

  it("shows a sync error when password update fails", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockUpdateCurrentSyncPassword.mockResolvedValue({
      error: { message: "Password is too weak." },
    });

    render(React.createElement(ResetPasswordPage));

    fireEvent.change(await screen.findByLabelText("New password"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByText("Password is too weak.")).toBeTruthy();
    expect(mockClearPasswordRecoverySession).not.toHaveBeenCalled();
  });

  it("shows a thrown update error message", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockUpdateCurrentSyncPassword.mockRejectedValue(
      new Error("Update request failed."),
    );

    render(React.createElement(ResetPasswordPage));

    fireEvent.change(await screen.findByLabelText("New password"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByText("Update request failed.")).toBeTruthy();
  });

  it("falls back to the default update error for non-error throws", async () => {
    mockHasPasswordRecoverySession.mockReturnValue(true);
    mockGetCurrentSyncSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockUpdateCurrentSyncPassword.mockRejectedValue("broken");

    render(React.createElement(ResetPasswordPage));

    fireEvent.change(await screen.findByLabelText("New password"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(
      await screen.findByText("GradeLog could not update your password."),
    ).toBeTruthy();
  });
});
