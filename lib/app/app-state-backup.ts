import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
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

async function exportNativeAppStateBackup(
  serializedState: string,
  fileName: string,
) {
  const canShareResult = await Share.canShare();

  if (!canShareResult.value) {
    throw new Error(
      "This Android device cannot open the backup share sheet right now.",
    );
  }

  const { uri } = await Filesystem.writeFile({
    path: `backups/${fileName}`,
    data: serializedState,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true,
  });

  await Share.share({
    title: fileName,
    text: "GradeLog local backup",
    files: [uri],
    dialogTitle: "Export GradeLog backup",
  });
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
    await exportNativeAppStateBackup(serializedState, fileName);
    return;
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
