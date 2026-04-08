// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OfflinePage from "@/app/offline/page";

describe("app/offline/page", () => {
  it("renders the offline message and return link", () => {
    render(React.createElement(OfflinePage));

    expect(
      screen.getByRole("heading", { name: "Offline for now" }),
    ).toBeTruthy();
    expect(screen.getByText(/reconnect once to open this route/i)).toBeTruthy();

    const homeLink = screen.getByRole("link", { name: "Open home" });
    expect(homeLink.getAttribute("href")).toBe("/");
  });
});
