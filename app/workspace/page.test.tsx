// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/workspace/semester/semester-screen", () => ({
  SemesterScreen: () =>
    React.createElement(
      "div",
      { "data-testid": "semester-screen" },
      "Semester",
    ),
}));

import WorkspacePage from "@/app/workspace/page";

describe("app/workspace/page", () => {
  it("renders the semester workspace", () => {
    render(React.createElement(WorkspacePage));

    expect(screen.getByTestId("semester-screen").textContent).toBe("Semester");
  });
});
