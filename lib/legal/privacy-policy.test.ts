import { describe, expect, it } from "vitest";

import {
  privacyPolicyIntro,
  privacyPolicyLastUpdated,
  privacyPolicySections,
  privacyPolicyTitle,
} from "@/lib/legal/privacy-policy";

describe("privacy-policy", () => {
  it("exports the expected metadata", () => {
    expect(privacyPolicyTitle).toBe("Privacy Policy");
    expect(privacyPolicyLastUpdated).toBe("April 3, 2026");
    expect(privacyPolicyIntro).toContain("local-first");
  });

  it("defines structured sections with expected key topics", () => {
    expect(privacyPolicySections.length).toBeGreaterThan(5);
    expect(privacyPolicySections[0]?.title).toBe("Overview");
    expect(
      privacyPolicySections.some(
        (section) => section.title === "Current encryption status",
      ),
    ).toBe(true);
    expect(
      privacyPolicySections.some(
        (section) => section.title === "Third-party services",
      ),
    ).toBe(true);
    expect(
      privacyPolicySections.every(
        (section) =>
          section.body.length > 0 ||
          (section.bullets?.length ?? 0) > 0 ||
          Boolean(section.footer),
      ),
    ).toBe(true);
  });
});
