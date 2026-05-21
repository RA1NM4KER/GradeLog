import {
  APP_STATE_VERSION,
  validateImportedAppState,
  serializePersistedAppState,
} from "@/lib/app/app-state";
import { AppState, AppStateBackupSummary } from "@/lib/app/types";
import { isNativeApp } from "@/lib/platform/platform";

function buildBackupFileName(date = new Date()) {
  const timestamp = date.toISOString().replaceAll(":", "-");
  return `gradeflow-backup-${timestamp}.json`;
}

export function getAppStateBackupSummary(
  state: AppState,
): AppStateBackupSummary {
  return {
    assessmentCount: state.semesters.reduce(
      (count, semester) =>
        count +
        semester.courses.reduce(
          (courseCount, course) => courseCount + course.assessments.length,
          0,
        ),
      0,
    ),
    semesterCount: state.semesters.length,
    courseCount: state.semesters.reduce(
      (count, semester) => count + semester.courses.length,
      0,
    ),
    moduleCount: state.semesters.reduce(
      (count, semester) => count + semester.courses.length,
      0,
    ),
    version: APP_STATE_VERSION,
  };
}

export async function downloadAppStateBackup(state: AppState) {
  const fileName = buildBackupFileName();
  const serializedState = serializePersistedAppState(state);
  const blob = new Blob([serializedState], {
    type: "application/json",
  });

  if (isNativeApp()) {
    const file = new File([blob], fileName, {
      type: "application/json",
    });
    const shareData = {
      files: [file],
      text: "GradeLog local backup",
      title: fileName,
    };

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(shareData)
    ) {
      await navigator.share(shareData);
      return;
    }

    throw new Error(
      "This device cannot export backup files yet. Try from the web app on this device instead.",
    );
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}

export async function importAppStateBackup(file: File): Promise<AppState> {
  const serializedState = await file.text();
  return validateImportedAppState(JSON.parse(serializedState));
}
