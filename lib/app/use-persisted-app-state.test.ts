// @vitest-environment jsdom

import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "@/lib/app/types";
import type { PersistedAppStateMetadata } from "@/lib/app/types";

const mockGetPersistedAppStateSnapshot = vi.fn(
  (state: AppState) => `snapshot:${state.selectedSemesterId}`,
);
const mockNormalizeAppState = vi.fn(
  (state?: AppState | null) =>
    state ?? {
      selectedSemesterId: "default-semester",
      semesters: [
        {
          id: "default-semester",
          name: "Semester 1 2026",
          periodLabel: "January to June",
          courses: [],
          modules: [],
        },
      ],
    },
);
const mockLoadAppStateMetadata = vi.fn();
const mockLoadAppStateRecord = vi.fn();
const mockSaveAppState = vi.fn();

vi.mock("@/lib/app/app-state", () => ({
  getPersistedAppStateSnapshot: mockGetPersistedAppStateSnapshot,
  normalizeAppState: mockNormalizeAppState,
}));

vi.mock("@/lib/app/app-state-storage", () => ({
  loadAppStateMetadata: mockLoadAppStateMetadata,
  loadAppStateRecord: mockLoadAppStateRecord,
  saveAppState: mockSaveAppState,
}));

function createState(selectedSemesterId: string): AppState {
  return {
    selectedSemesterId,
    semesters: [
      {
        id: selectedSemesterId,
        name: `Semester ${selectedSemesterId}`,
        periodLabel: "January to June",
        courses: [],
        modules: [],
      },
    ],
  };
}

function createMetadata(snapshot: string): PersistedAppStateMetadata {
  return {
    snapshot,
    updatedAt: "2026-04-08T12:00:00.000Z",
    version: 3,
  };
}

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];

  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
    FakeBroadcastChannel.instances.push(this);
  }
}

async function loadHook() {
  const hookModule = await import("@/lib/app/use-persisted-app-state");
  return hookModule.usePersistedAppState;
}

describe("use-persisted-app-state", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
    FakeBroadcastChannel.instances = [];

    Object.defineProperty(globalThis, "BroadcastChannel", {
      configurable: true,
      value: FakeBroadcastChannel,
    });

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        randomUUID: vi.fn(() => "tab-1"),
      },
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("hydrates successfully from storage", async () => {
    const state = createState("semester-1");
    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state,
    });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());

    expect(result.current.appState).toBeNull();
    expect(result.current.isHydrated).toBe(false);

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.bootError).toBeNull();
    expect(result.current.appState).toEqual(state);
    expect(FakeBroadcastChannel.instances).toHaveLength(1);
  });

  it("reuses the hydrated module cache on a later mount", async () => {
    const state = createState("semester-cache");
    mockLoadAppStateRecord
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-cache"),
        state,
      })
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-cache"),
        state,
      });

    const usePersistedAppState = await loadHook();
    const firstRender = renderHook(() => usePersistedAppState());
    await waitFor(() =>
      expect(firstRender.result.current.isHydrated).toBe(true),
    );
    firstRender.unmount();

    const secondRender = renderHook(() => usePersistedAppState());
    expect(secondRender.result.current.isHydrated).toBe(true);
    expect(secondRender.result.current.appState).toEqual(state);
  });

  it("surfaces a boot error when hydration fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockLoadAppStateRecord.mockRejectedValueOnce(new Error("blocked"));

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());

    await waitFor(() => expect(result.current.bootError).not.toBeNull());
    expect(result.current.isHydrated).toBe(false);
    expect(result.current.bootError).toContain("private browser storage");
    expect(consoleError).toHaveBeenCalled();
  });

  it("replaces and saves state, then broadcasts the new snapshot", async () => {
    const initialState = createState("semester-1");
    const nextState = createState("semester-2");

    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state: initialState,
    });
    mockSaveAppState.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-2"),
      state: nextState,
    });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.replaceAppState(nextState);
    });

    await waitFor(() =>
      expect(mockSaveAppState).toHaveBeenCalledWith(nextState),
    );
    expect(FakeBroadcastChannel.instances[0]?.postMessage).toHaveBeenCalledWith(
      {
        snapshot: "snapshot:semester-2",
        sourceTabId: "tab-1",
        type: "app-state-updated",
      },
    );
  });

  it("reloads state explicitly when storage changed", async () => {
    const initialState = createState("semester-1");
    const refreshedState = createState("semester-2");

    mockLoadAppStateRecord
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-1"),
        state: initialState,
      })
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-2"),
        state: refreshedState,
      });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      await result.current.reloadAppState();
    });

    await waitFor(() =>
      expect(result.current.appState?.selectedSemesterId).toBe("semester-2"),
    );
  });

  it("keeps the current state when a reload returns the same snapshot", async () => {
    const initialState = createState("semester-1");

    mockLoadAppStateRecord
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-1"),
        state: initialState,
      })
      .mockResolvedValueOnce({
        metadata: createMetadata("snapshot:semester-1"),
        state: createState("semester-9"),
      });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      await result.current.reloadAppState();
    });

    expect(result.current.appState?.selectedSemesterId).toBe("semester-1");
  });

  it("logs save failures without crashing the hook", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const initialState = createState("semester-1");
    const nextState = createState("semester-4");

    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state: initialState,
    });
    mockSaveAppState.mockRejectedValueOnce(new Error("save failed"));

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.replaceAppState(nextState);
    });

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(result.current.appState?.selectedSemesterId).toBe("semester-4");
  });

  it("works without BroadcastChannel support", async () => {
    const state = createState("semester-1");
    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state,
    });

    Object.defineProperty(globalThis, "BroadcastChannel", {
      configurable: true,
      value: undefined,
    });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(FakeBroadcastChannel.instances).toHaveLength(0);
  });

  it("ignores unrelated broadcast updates", async () => {
    const state = createState("semester-1");
    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state,
    });

    const usePersistedAppState = await loadHook();
    const { result } = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      FakeBroadcastChannel.instances[0]?.onmessage?.({
        data: {
          snapshot: "snapshot:semester-2",
          sourceTabId: "tab-1",
          type: "app-state-updated",
        },
      } as MessageEvent);
      FakeBroadcastChannel.instances[0]?.onmessage?.({
        data: {
          snapshot: "snapshot:semester-2",
          sourceTabId: "other-tab",
          type: "other-event",
        },
      } as MessageEvent);
      FakeBroadcastChannel.instances[0]?.onmessage?.({
        data: {
          snapshot: "snapshot:semester-1",
          sourceTabId: "other-tab",
          type: "app-state-updated",
        },
      } as MessageEvent);
    });

    expect(result.current.appState?.selectedSemesterId).toBe("semester-1");
    expect(mockLoadAppStateRecord).toHaveBeenCalledTimes(1);
  });

  it("checks storage on focus when there is no pending external snapshot", async () => {
    const state = createState("semester-1");
    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state,
    });
    mockLoadAppStateMetadata.mockResolvedValueOnce(
      createMetadata("snapshot:semester-1"),
    );

    const usePersistedAppState = await loadHook();
    renderHook(() => usePersistedAppState());
    await waitFor(() =>
      expect(mockLoadAppStateRecord).toHaveBeenCalledTimes(1),
    );

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    expect(mockLoadAppStateMetadata).toHaveBeenCalledTimes(1);
    expect(mockLoadAppStateRecord).toHaveBeenCalledTimes(1);
  });

  it("ignores hidden visibility changes and clears pending timers on cleanup", async () => {
    const state = createState("semester-1");
    mockLoadAppStateRecord.mockResolvedValueOnce({
      metadata: createMetadata("snapshot:semester-1"),
      state,
    });

    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const usePersistedAppState = await loadHook();
    const rendered = renderHook(() => usePersistedAppState());
    await waitFor(() => expect(rendered.result.current.isHydrated).toBe(true));

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(mockLoadAppStateMetadata).not.toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    act(() => {
      FakeBroadcastChannel.instances[0]?.onmessage?.({
        data: {
          snapshot: "snapshot:semester-2",
          sourceTabId: "other-tab",
          type: "app-state-updated",
        },
      } as MessageEvent);
    });

    rendered.unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(FakeBroadcastChannel.instances[0]?.close).toHaveBeenCalled();
  });
});
