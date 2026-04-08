import { describe, expect, it } from "vitest";

import {
  termsOfServiceIntro,
  termsOfServiceLastUpdated,
  termsOfServiceSections,
  termsOfServiceTitle,
} from "@/lib/legal/terms-of-service";

describe("terms-of-service", () => {
  it("exports the expected metadata", () => {
    expect(termsOfServiceTitle).toBe("Terms of Service");
    expect(termsOfServiceLastUpdated).toBe("April 3, 2026");
    expect(termsOfServiceIntro).toContain("local-first");
  });

  it("defines structured sections with expected key topics", () => {
    expect(termsOfServiceSections.length).toBeGreaterThan(5);
    expect(termsOfServiceSections[0]?.title).toBe("Overview");
    expect(
      termsOfServiceSections.some(
        (section) => section.title === "Acceptable use",
      ),
    ).toBe(true);
    expect(
      termsOfServiceSections.some((section) => section.title === "Privacy"),
    ).toBe(true);
    expect(
      termsOfServiceSections.find(
        (section) => section.title === "What GradeLog is",
      )?.negativeList,
    ).toBe(true);
  });
});
