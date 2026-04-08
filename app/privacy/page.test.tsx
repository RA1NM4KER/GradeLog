// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "@/app/privacy/page";

describe("app/privacy/page", () => {
  it("renders the privacy legal page", () => {
    render(React.createElement(PrivacyPage));

    expect(
      screen.getByRole("heading", { name: "Privacy Policy" }),
    ).toBeTruthy();
    expect(screen.getByText(/last updated:/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to GradeLog" })).toBeTruthy();
  });
});
