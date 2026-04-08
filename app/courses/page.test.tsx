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

import CoursesPage from "@/app/courses/page";

describe("app/courses/page", () => {
  it("renders the semester workspace", () => {
    render(React.createElement(CoursesPage));

    expect(screen.getByTestId("semester-screen").textContent).toBe("Semester");
  });
});
