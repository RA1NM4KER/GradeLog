import { afterEach, describe, expect, it, vi } from "vitest";

import { createUuid, ensureUuid, isUuidV4 } from "@/lib/shared/uuid";

describe("uuid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates UUID v4 strings", () => {
    expect(isUuidV4("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuidV4("not-a-uuid")).toBe(false);
  });

  it("uses crypto.randomUUID when it is available", () => {
    const randomUUID = vi.fn(() => "550e8400-e29b-41d4-a716-446655440000");
    vi.stubGlobal("crypto", { randomUUID });

    expect(createUuid()).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(randomUUID).toHaveBeenCalled();
  });

  it("builds a UUID from crypto.getRandomValues when randomUUID is unavailable", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set([
        0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x11, 0xd4, 0x27, 0x16, 0x44, 0x66,
        0x55, 0x44, 0x00, 0x00,
      ]);
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues });

    const uuid = createUuid();

    expect(getRandomValues).toHaveBeenCalled();
    expect(uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(isUuidV4(uuid)).toBe(true);
  });

  it("falls back to Math.random and Date.now when crypto is unavailable", () => {
    vi.stubGlobal("crypto", undefined);
    vi.spyOn(Date, "now").mockReturnValue(1712577600000);
    vi.spyOn(Math, "random").mockReturnValue(0.25);

    const uuid = createUuid();

    expect(isUuidV4(uuid)).toBe(true);
  });

  it("replaces invalid ids and preserves valid UUIDs", () => {
    expect(ensureUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(ensureUuid("legacy-id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(ensureUuid(undefined)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
