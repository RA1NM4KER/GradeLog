// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/course-template/course-template-import-screen", () => ({
  CourseTemplateImportScreen: () =>
    React.createElement(
      "div",
      { "data-testid": "course-template-import-screen" },
      "Import",
    ),
}));

import ImportCourseTemplatePage from "@/app/import-course-template/page";

describe("app/import-course-template/page", () => {
  it("renders the import screen", () => {
    render(React.createElement(ImportCourseTemplatePage));

    expect(
      screen.getByTestId("course-template-import-screen").textContent,
    ).toBe("Import");
  });
});
