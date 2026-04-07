export interface GradeBand {
  id: string;
  label: string;
  threshold: number;
}

export interface SubminimumRequirement {
  achievedPercent: number | null;
  assessmentId: string;
  assessmentName: string;
  minimumPercent: number;
  status: "failed" | "met" | "pending";
}

export interface RequiredScoreResult {
  achievable: boolean;
  hasFailedSubminimums: boolean;
  hasPendingSubminimums: boolean;
  neededAverage: number;
  neededPoints: number;
  remainingWeight: number;
  subminimumRequirements: SubminimumRequirement[];
  message: string;
}
