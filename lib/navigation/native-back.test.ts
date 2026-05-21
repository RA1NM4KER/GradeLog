import { describe, expect, it } from "vitest";

import {
  normalizeAppUrl,
  resolveNativeBack,
  syncNavigationStack,
} from "@/lib/navigation/native-back";

describe("native back navigation helpers", () => {
  it("normalizes pathname and search into a single app URL", () => {
    expect(normalizeAppUrl("/courses", "")).toBe("/courses");
    expect(normalizeAppUrl("/courses", "?semester=sem-1")).toBe(
      "/courses?semester=sem-1",
    );
  });

  it("pushes new routes and ignores duplicate current routes", () => {
    expect(syncNavigationStack([], "/")).toEqual(["/"]);
    expect(syncNavigationStack(["/"], "/courses?semester=1")).toEqual([
      "/",
      "/courses?semester=1",
    ]);
    expect(syncNavigationStack(["/"], "/")).toEqual(["/"]);
  });

  it("pops the stack when the route change is a browser back to the previous URL", () => {
    expect(
      syncNavigationStack(
        ["/", "/courses?semester=1", "/courses?semester=1&course=abc"],
        "/courses?semester=1",
      ),
    ).toEqual(["/", "/courses?semester=1"]);
  });

  it("collapses back to an earlier matching route instead of duplicating it", () => {
    expect(
      syncNavigationStack(
        ["/", "/privacy", "/contact", "/privacy"],
        "/contact",
      ),
    ).toEqual(["/", "/privacy", "/contact"]);
  });

  it("resolves course and semester back steps before exiting at home", () => {
    expect(
      resolveNativeBack([
        "/",
        "/courses?semester=1",
        "/courses?semester=1&course=abc",
      ]),
    ).toEqual({
      action: "navigate",
      nextStack: ["/", "/courses?semester=1"],
      targetUrl: "/courses?semester=1",
    });

    expect(resolveNativeBack(["/", "/courses?semester=1"])).toEqual({
      action: "navigate",
      nextStack: ["/"],
      targetUrl: "/",
    });

    expect(resolveNativeBack(["/"])).toEqual({
      action: "exit",
      nextStack: ["/"],
      targetUrl: null,
    });
  });

  it("falls back to home when there is no prior in-app route", () => {
    expect(resolveNativeBack(["/courses?semester=1"])).toEqual({
      action: "navigate",
      nextStack: ["/"],
      targetUrl: "/",
    });
  });
});
