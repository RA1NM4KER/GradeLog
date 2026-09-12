// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MinimalLanding } from "@/components/landing/minimal-landing";

const mockUseCourses = vi.fn();
const mockUseSyncConnection = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/ui/page-background", () => ({
  PageBackground: () => <div data-testid="page-background" />,
}));

vi.mock("@/components/workspace/shared/courses-provider", () => ({
  useCourses: () => mockUseCourses(),
}));

vi.mock("@/components/sync/sync-provider", () => ({
  useSyncConnection: () => mockUseSyncConnection(),
}));

describe("MinimalLanding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders guest state with suggestions and no skeleton when not syncing", () => {
    mockUseCourses.mockReturnValue({
      addSemester: vi.fn(),
      deleteSemester: vi.fn(),
      selectSemester: vi.fn(),
      semesters: [],
    });
    mockUseSyncConnection.mockReturnValue({
      isAuthenticated: false,
      isConfigured: false,
      isReady: true,
      isRestoringSession: false,
      isSyncEnabled: false,
      isSyncing: false,
      lastSyncedAt: null,
    });

    render(<MinimalLanding />);

    expect(
      screen.getByText("Private. No sign up. Works offline."),
    ).toBeDefined();
    expect(screen.getByText("New semester")).toBeDefined();
  });

  it("renders skeleton cards and restoring badge when restoring session", () => {
    mockUseCourses.mockReturnValue({
      addSemester: vi.fn(),
      deleteSemester: vi.fn(),
      selectSemester: vi.fn(),
      semesters: [],
    });
    mockUseSyncConnection.mockReturnValue({
      isAuthenticated: true,
      isConfigured: true,
      isReady: true,
      isRestoringSession: false,
      isSyncEnabled: true,
      isSyncing: true,
      lastSyncedAt: null,
    });

    const { container } = render(<MinimalLanding />);

    expect(screen.getByText("Restoring your semesters...")).toBeDefined();
    expect(
      screen.queryByText("Private. No sign up. Works offline."),
    ).toBeNull();
    expect(screen.queryByText("New semester")).toBeNull();

    const pulsingSkeletons = container.querySelectorAll(".animate-pulse");
    expect(pulsingSkeletons.length).toBeGreaterThanOrEqual(3);
  });
});
