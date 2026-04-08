import { describe, expect, it } from "vitest";

import { parseOptionalPercent } from "@/lib/assessments/assessment-form-utils";

describe("assessment-form-utils", () => {
  it("returns null for empty, invalid, or non-positive values", () => {
    expect(parseOptionalPercent("")).toBeNull();
    expect(parseOptionalPercent("abc")).toBeNull();
    expect(parseOptionalPercent("0")).toBeNull();
    expect(parseOptionalPercent("-5")).toBeNull();
  });

  it("returns the numeric percent and caps values at 100", () => {
    expect(parseOptionalPercent(" 45 ")).toBe(45);
    expect(parseOptionalPercent("180")).toBe(100);
  });
});
