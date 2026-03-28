import { Semester } from "@/lib/types";

export interface AppState {
  semesters: Semester[];
  selectedSemesterId: string;
}

export function getDefaultAppState(): AppState {
  const initialSemester: Semester = {
    id: "semester-1-2026",
    name: "Semester 1 2026",
    periodLabel: "January to June",
    courses: [],
  };

  return {
    semesters: [initialSemester],
    selectedSemesterId: initialSemester.id,
  };
}

export function normalizeAppState(state?: Partial<AppState> | null): AppState {
  const fallback = getDefaultAppState();
  const semesters =
    state?.semesters && state.semesters.length > 0
      ? state.semesters
      : fallback.semesters;
  const selectedSemesterId =
    state?.selectedSemesterId &&
    semesters.some((semester) => semester.id === state.selectedSemesterId)
      ? state.selectedSemesterId
      : (semesters[0]?.id ?? "");

  return {
    semesters,
    selectedSemesterId,
  };
}
