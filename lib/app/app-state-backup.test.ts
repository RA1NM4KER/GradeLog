const { canShare, share, writeFile } = vi.hoisted(() => ({
  canShare: vi.fn(),
  share: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("@capacitor/filesystem", () => ({
  Directory: {
    Cache: "CACHE",
  },
  Encoding: {
    UTF8: "utf8",
  },
  Filesystem: {
    writeFile,
  },
}));

vi.mock("@capacitor/share", () => ({
  Share: {
    canShare,
    share,
  },
}));

import { afterEach, describe, expect, it, vi } from "vitest";

import { APP_STATE_VERSION, getDefaultAppState } from "@/lib/app/app-state";
import {
  downloadAppStateBackup,
  getAppStateBackupSummary,
  importAppStateBackup,
} from "@/lib/app/app-state-backup";

describe("app-state-backup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    canShare.mockReset();
    share.mockReset();
    writeFile.mockReset();
  });

  it("summarizes the app state for backups", () => {
    const state = getDefaultAppState();

    state.semesters.push({
      id: "sem-1",
      name: "Semester 1",
      periodLabel: "January to June",
      modules: [],
      courses: [
        {
          id: "course-1",
          code: "MAT101",
          name: "Calculus",
          instructor: "Dr. Maya Patel",
          credits: 16,
          accent: "teal",
          gradeBands: [],
          assessments: [
            {
              id: "a1",
              kind: "single",
              name: "Quiz 1",
              weight: 20,
              dueDate: "2026-04-10",
              status: "ongoing",
              scoreAchieved: null,
              subminimumPercent: null,
              totalPossible: 100,
              category: "assignment",
            },
          ],
        },
      ],
    });

    expect(getAppStateBackupSummary(state)).toEqual({
      assessmentCount: 1,
      courseCount: 1,
      moduleCount: 1,
      semesterCount: 1,
      version: APP_STATE_VERSION,
    });
  });

  it("downloads a serialized backup file", () => {
    const click = vi.fn();
    const createElement = vi.fn(() => ({ click, download: "", href: "" }));
    const createObjectURL = vi.fn(() => "blob:backup");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("document", { createElement });
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.setSystemTime(new Date("2026-04-08T10:00:00.000Z"));

    downloadAppStateBackup(getDefaultAppState());

    expect(createObjectURL).toHaveBeenCalled();
    expect(createElement).toHaveBeenCalledWith("a");
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");
  });

  it("exports a serialized backup file through Capacitor on native apps", async () => {
    canShare.mockResolvedValue({ value: true });
    writeFile.mockResolvedValue({
      uri: "file:///cache/backups/gradeflow-backup-2026-04-08T10-00-00.000Z.json",
    });
    vi.stubGlobal("window", { Capacitor: {} });
    vi.setSystemTime(new Date("2026-04-08T10:00:00.000Z"));

    await downloadAppStateBackup(getDefaultAppState());

    expect(writeFile).toHaveBeenCalledWith({
      path: "backups/gradeflow-backup-2026-04-08T10-00-00.000Z.json",
      data: expect.any(String),
      directory: "CACHE",
      encoding: "utf8",
      recursive: true,
    });
    expect(share).toHaveBeenCalledWith({
      title: "gradeflow-backup-2026-04-08T10-00-00.000Z.json",
      text: "GradeLog local backup",
      files: [
        "file:///cache/backups/gradeflow-backup-2026-04-08T10-00-00.000Z.json",
      ],
      dialogTitle: "Export GradeLog backup",
    });
  });

  it("fails clearly when native sharing is unavailable", async () => {
    canShare.mockResolvedValue({ value: false });
    vi.stubGlobal("window", { Capacitor: {} });

    await expect(downloadAppStateBackup(getDefaultAppState())).rejects.toThrow(
      "This Android device cannot open the backup share sheet right now.",
    );
    expect(writeFile).not.toHaveBeenCalled();
    expect(share).not.toHaveBeenCalled();
  });

  it("imports a backup file through the shared validator", async () => {
    const imported = await importAppStateBackup(
      new File(
        [
          JSON.stringify({
            version: APP_STATE_VERSION,
            selectedSemesterId: "semester-1",
            semesters: [
              {
                id: "semester-1",
                name: "Semester 1",
                periodLabel: "January to June",
                courses: [],
              },
            ],
          }),
        ],
        "backup.json",
        { type: "application/json" },
      ),
    );

    expect(imported.selectedSemesterId).toBe(imported.semesters[0]?.id);
    expect(imported.semesters).toHaveLength(1);
  });
});
