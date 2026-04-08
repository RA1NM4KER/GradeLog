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
  });

  it("summarizes the app state for backups", () => {
    const state = getDefaultAppState();

    state.semesters[0]?.courses.push({
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
