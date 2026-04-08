// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TermsPage from "@/app/terms/page";

describe("app/terms/page", () => {
  it("renders the terms legal page", () => {
    render(React.createElement(TermsPage));

    expect(
      screen.getByRole("heading", { name: "Terms of Service" }),
    ).toBeTruthy();
    expect(screen.getByText(/last updated:/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to GradeLog" })).toBeTruthy();
  });
});
