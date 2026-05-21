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

  it("builds semester and course URLs with explicit hierarchy", async () => {
    const { getCourseDetailsUrl, getSemesterCoursesUrl } =
      await import("@/lib/course/courses-navigation");

    expect(getSemesterCoursesUrl("sem 1")).toBe("/courses?semester=sem%201");
    expect(getCourseDetailsUrl("sem 1", "course/42")).toBe(
      "/courses?semester=sem%201&course=course%2F42",
    );
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

  describe("readCoursesLocation", () => {
    it("returns default location when window is undefined", async () => {
      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result).toEqual({
        moduleId: null,
        pathname: "/courses",
        scope: "semester",
        semesterId: null,
      });
    });

    it("parses basic /courses pathname with no params", async () => {
      vi.stubGlobal("window", {
        location: { pathname: "/courses", search: "" },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result).toEqual({
        moduleId: null,
        pathname: "/courses",
        scope: "semester",
        semesterId: null,
      });
    });

    it("parses semesterId and scope=all from search params", async () => {
      vi.stubGlobal("window", {
        location: {
          pathname: "/courses",
          search: "?semester=sem-1&scope=all",
        },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result).toEqual({
        moduleId: null,
        pathname: "/courses",
        scope: "all",
        semesterId: "sem-1",
      });
    });

    it("parses moduleId from course query param", async () => {
      vi.stubGlobal("window", {
        location: {
          pathname: "/courses",
          search: "?course=mod-42",
        },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result.moduleId).toBe("mod-42");
    });

    it("parses moduleId from /courses/:id pathname", async () => {
      vi.stubGlobal("window", {
        location: { pathname: "/courses/mod-99", search: "" },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result.moduleId).toBe("mod-99");
    });

    it("parses moduleId from /workspace/modules/:id pathname", async () => {
      vi.stubGlobal("window", {
        location: { pathname: "/workspace/modules/mod-77", search: "" },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result.moduleId).toBe("mod-77");
    });

    it("returns cached location when called twice with same URL", async () => {
      vi.stubGlobal("window", {
        location: { pathname: "/courses", search: "?semester=s1" },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const first = readCoursesLocation();
      const second = readCoursesLocation();

      expect(first).toBe(second);
    });

    it("decodes URI-encoded moduleId from pathname", async () => {
      vi.stubGlobal("window", {
        location: {
          pathname: "/courses/hello%20world",
          search: "",
        },
      });

      const { readCoursesLocation } =
        await import("@/lib/course/courses-navigation");

      const result = readCoursesLocation();

      expect(result.moduleId).toBe("hello world");
    });
  });
});
