import { beforeEach, describe, expect, it, vi } from "vitest";

const toDataURL = vi.fn();
const rpc = vi.fn();
const getSupabaseBrowserClient = vi.fn(() => ({ rpc }));
const isSupabaseConfigured = vi.fn(() => true);

vi.mock("qrcode", () => ({
  default: { toDataURL },
}));

vi.mock("@/lib/supabase/supabase-browser", () => ({
  getSupabaseBrowserClient,
  isSupabaseConfigured,
}));

describe("course-template browser flows", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    rpc.mockReset();
    toDataURL.mockReset();
    getSupabaseBrowserClient.mockReturnValue({ rpc });
    isSupabaseConfigured.mockReturnValue(true);
    vi.stubGlobal("window", {
      crypto: {
        subtle: {
          digest: vi.fn(async () => new Uint8Array([1, 2, 3, 4]).buffer),
        },
      },
      location: { origin: "https://gradelog.app" },
    });
    vi.stubGlobal("TextEncoder", TextEncoder);
  });

  it("creates a shared course template from a course", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          created_at: "2026-04-08T10:00:00.000Z",
          public_token: "share-token",
          title: "CSC101 Intro to CS",
          updated_at: "2026-04-08T10:00:00.000Z",
        },
      ],
      error: null,
    });

    const { createCourseTemplateShare } =
      await import("@/lib/course/course-template");

    const result = await createCourseTemplateShare({
      id: "course-1",
      accent: "teal",
      assessments: [],
      code: "CSC101",
      credits: 12,
      gradeBands: [],
      instructor: "Prof. Chen",
      name: "Intro to CS",
    });

    expect(rpc).toHaveBeenCalledWith("share_course_template", {
      template_hash: "01020304",
      template_payload: {
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      },
      template_title: "CSC101 Intro to CS",
    });
    expect(result).toEqual({
      createdAt: "2026-04-08T10:00:00.000Z",
      publicToken: "share-token",
      shareUrl: "https://gradelog.app/import-course-template?t=share-token",
      title: "CSC101 Intro to CS",
      updatedAt: "2026-04-08T10:00:00.000Z",
    });
  });

  it("surfaces sharing setup and row validation failures", async () => {
    isSupabaseConfigured.mockReturnValueOnce(false);

    const { createCourseTemplateShare } =
      await import("@/lib/course/course-template");

    await expect(
      createCourseTemplateShare({
        id: "course-1",
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      }),
    ).rejects.toThrow("Course sharing is not configured in this build.");

    isSupabaseConfigured.mockReturnValue(true);
    rpc.mockResolvedValueOnce({ data: [], error: null });

    await expect(
      createCourseTemplateShare({
        id: "course-1",
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      }),
    ).rejects.toThrow("The shared course template could not be created.");
  });

  it("surfaces hashing and RPC errors when creating a share", async () => {
    const originalWindow = globalThis.window;
    const originalTextEncoder = globalThis.TextEncoder;
    const { createCourseTemplateShare } =
      await import("@/lib/course/course-template");

    vi.stubGlobal("window", {
      location: { origin: "https://gradelog.app" },
    });
    vi.stubGlobal("TextEncoder", TextEncoder);

    await expect(
      createCourseTemplateShare({
        id: "course-1",
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      }),
    ).rejects.toThrow("Secure hashing is unavailable in this browser.");

    vi.stubGlobal("window", originalWindow);
    vi.stubGlobal("TextEncoder", originalTextEncoder);

    rpc.mockResolvedValueOnce({
      data: null,
      error: new Error("rpc failed"),
    });

    await expect(
      createCourseTemplateShare({
        id: "course-1",
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      }),
    ).rejects.toThrow("rpc failed");
  });

  it("fetches a shared course template by token", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          created_at: "2026-04-08T10:00:00.000Z",
          public_token: "share-token",
          title: "CSC101 Intro to CS",
          updated_at: "2026-04-08T10:00:00.000Z",
          course_payload: {
            accent: "teal",
            assessments: [],
            code: "CSC101",
            credits: 12,
            gradeBands: [],
            instructor: "Prof. Chen",
            name: "Intro to CS",
          },
        },
      ],
      error: null,
    });

    const { fetchCourseTemplateByToken } =
      await import("@/lib/course/course-template");

    await expect(fetchCourseTemplateByToken("share-token")).resolves.toEqual({
      createdAt: "2026-04-08T10:00:00.000Z",
      payload: {
        accent: "teal",
        assessments: [],
        code: "CSC101",
        credits: 12,
        gradeBands: [],
        instructor: "Prof. Chen",
        name: "Intro to CS",
      },
      publicToken: "share-token",
      title: "CSC101 Intro to CS",
      updatedAt: "2026-04-08T10:00:00.000Z",
    });
  });

  it("returns null or errors for missing or invalid fetched templates", async () => {
    const { fetchCourseTemplateByToken } =
      await import("@/lib/course/course-template");

    rpc.mockResolvedValueOnce({ data: [], error: null });
    await expect(
      fetchCourseTemplateByToken("missing-token"),
    ).resolves.toBeNull();

    rpc.mockResolvedValueOnce({
      data: null,
      error: new Error("fetch failed"),
    });
    await expect(fetchCourseTemplateByToken("broken-token")).rejects.toThrow(
      "fetch failed",
    );

    isSupabaseConfigured.mockReturnValueOnce(false);
    await expect(fetchCourseTemplateByToken("share-token")).rejects.toThrow(
      "Course sharing is not configured in this build.",
    );
  });

  it("builds a QR code for the share URL", async () => {
    toDataURL.mockResolvedValue("data:image/png;base64,qr");

    const { buildCourseTemplateQrCode } =
      await import("@/lib/course/course-template");

    await expect(
      buildCourseTemplateQrCode("https://gradelog.app/share"),
    ).resolves.toBe("data:image/png;base64,qr");
    expect(toDataURL).toHaveBeenCalledWith("https://gradelog.app/share", {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });
  });
});
