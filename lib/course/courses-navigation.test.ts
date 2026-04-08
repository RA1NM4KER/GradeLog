import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("courses-navigation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does nothing when navigating without a browser window", async () => {
    const { navigateCourses } = await import("@/lib/course/courses-navigation");

    expect(() => navigateCourses("/courses")).not.toThrow();
  });

  it("returns a no-op cleanup when listeners are added without a browser window", async () => {
    const { addCoursesNavigationListener } =
      await import("@/lib/course/courses-navigation");

    const cleanup = addCoursesNavigationListener(() => undefined);

    expect(() => cleanup()).not.toThrow();
  });

  it("updates history, warms the route, and dispatches the workspace event", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const postMessage = vi.fn();
    const ready = Promise.resolve({ active: { postMessage } });
    const pushState = vi.fn();
    const dispatchEvent = vi.fn();

    vi.stubGlobal("navigator", {
      onLine: true,
      serviceWorker: { ready },
    });
    vi.stubGlobal("window", {
      dispatchEvent,
      history: {
        pushState,
        replaceState: vi.fn(),
        state: { from: "test" },
      },
    });

    const { navigateCourses } = await import("@/lib/course/courses-navigation");

    navigateCourses("/courses?semester=1");
    await Promise.resolve();

    expect(pushState).toHaveBeenCalledWith(
      { from: "test" },
      "",
      "/courses?semester=1",
    );
    expect(postMessage).toHaveBeenCalledWith({
      type: "CACHE_ROUTE",
      url: "/courses?semester=1",
    });
    expect(dispatchEvent).toHaveBeenCalled();
  });

  it("uses replaceState and skips route warming when no active service worker is available", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const replaceState = vi.fn();
    const dispatchEvent = vi.fn();

    vi.stubGlobal("navigator", {
      onLine: true,
      serviceWorker: { ready: Promise.resolve({ active: undefined }) },
    });
    vi.stubGlobal("window", {
      dispatchEvent,
      history: {
        pushState: vi.fn(),
        replaceState,
        state: { from: "test" },
      },
    });

    const { navigateCourses } = await import("@/lib/course/courses-navigation");

    navigateCourses("/courses?semester=2", { replace: true });
    await Promise.resolve();

    expect(replaceState).toHaveBeenCalledWith(
      { from: "test" },
      "",
      "/courses?semester=2",
    );
    expect(dispatchEvent).toHaveBeenCalled();
  });

  it("skips route warming when browser preconditions are not met", async () => {
    const pushState = vi.fn();
    const dispatchEvent = vi.fn();

    vi.stubGlobal("navigator", {
      onLine: false,
      serviceWorker: {
        ready: Promise.resolve({
          active: { postMessage: vi.fn() },
        }),
      },
    });
    vi.stubGlobal("window", {
      dispatchEvent,
      history: {
        pushState,
        replaceState: vi.fn(),
        state: { from: "test" },
      },
    });

    const { navigateCourses } = await import("@/lib/course/courses-navigation");

    navigateCourses("/courses?semester=3");
    await Promise.resolve();

    expect(pushState).toHaveBeenCalledWith(
      { from: "test" },
      "",
      "/courses?semester=3",
    );
    expect(dispatchEvent).toHaveBeenCalled();
  });

  it("registers and unregisters navigation listeners", async () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
    });

    const { addCoursesNavigationListener } =
      await import("@/lib/course/courses-navigation");

    const listener = vi.fn();
    const cleanup = addCoursesNavigationListener(listener);

    expect(addEventListener).toHaveBeenCalledTimes(2);
    cleanup();
    expect(removeEventListener).toHaveBeenCalledTimes(2);
  });
});
