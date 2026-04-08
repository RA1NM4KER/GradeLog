import { describe, expect, it } from "vitest";

import { cn } from "@/lib/shared/utils";

describe("shared utils", () => {
  it("merges conditional tailwind classes predictably", () => {
    expect(cn("px-2", false && "hidden", "px-4", "text-sm")).toBe(
      "px-4 text-sm",
    );
  });
});
