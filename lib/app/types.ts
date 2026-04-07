import { Semester } from "@/lib/course/types";

export interface AppState {
  semesters: Semester[];
  selectedSemesterId: string;
}

export interface PersistedAppState extends AppState {
  version: number;
}

export interface PersistedAppStateMetadata {
  snapshot: string;
  updatedAt: string;
  version: number;
}

export interface StoredAppStateRecord {
  metadata: PersistedAppStateMetadata;
  state: AppState;
}

export interface AppStateBackupSummary {
  assessmentCount: number;
  courseCount: number;
  moduleCount: number;
  semesterCount: number;
  version: number;
}
