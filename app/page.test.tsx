// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/landing/minimal-landing", () => ({
  MinimalLanding: () =>
    React.createElement("div", { "data-testid": "minimal-landing" }, "Landing"),
}));

import HomePage from "@/app/page";

describe("app/page", () => {
  it("renders the landing screen", () => {
    render(React.createElement(HomePage));

    expect(screen.getByTestId("minimal-landing").textContent).toBe("Landing");
  });
});
