// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactPage from "@/app/contact/page";
import { contactEmail, contactHref } from "@/lib/contact";

describe("app/contact/page", () => {
  it("renders contact details", () => {
    render(React.createElement(ContactPage));

    expect(
      screen.getByRole("heading", { name: "Tell me what would help" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Good reasons to reach out" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: contactEmail }).getAttribute("href"),
    ).toBe(contactHref);
    expect(
      screen.getByRole("link", { name: "Email feedback" }).getAttribute("href"),
    ).toBe(contactHref);
  });
});
