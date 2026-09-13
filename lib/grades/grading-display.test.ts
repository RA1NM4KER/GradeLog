import { describe, expect, it } from "vitest";

import type { Course } from "@/lib/course/types";
import {
  formatCourseBonusPoints,
  formatCourseRemainingWeight,
  getAssessmentWeightColumnLabel,
  getAssessmentWeightInputLabel,
  getCourseWeightingTotalLabel,
  shouldShowCourseOverweightWarning,
} from "@/lib/grades/grading-display";

function makeCourse(gradingScale: Course["gradingScale"]): Course {
  return {
    id: "course-1",
    code: "MAT101",
    name: "Calculus",
    instructor: "",
    credits: 16,
    accent: "teal",
    gradeBands: [],
    gradingScale,
    bonusPoints: 0,
    assessments: [
      {
        id: "a1",
        kind: "single",
        category: "assignment",
        dueDate: "",
        name: "A1",
        scoreAchieved: null,
        status: "ongoing",
        subminimumPercent: null,
        totalPossible: 100,
        weight: 155,
      },
    ],
  };
}

describe("grading display", () => {
  it("uses percentage labels and preserves the overweight warning", () => {
    const course = makeCourse("percentage");

    expect(getAssessmentWeightColumnLabel(course)).toBe("Weight");
    expect(getAssessmentWeightInputLabel(course)).toBe("Weight (%)");
    expect(getCourseWeightingTotalLabel(course)).toBeNull();
    expect(shouldShowCourseOverweightWarning(course)).toBe(true);
    expect(formatCourseRemainingWeight(course, 40)).toBe("40% remaining");
  });

  it("uses point labels and accepts totals over 100", () => {
    const course = makeCourse("points");

    expect(getAssessmentWeightColumnLabel(course)).toBe("Weight pts");
    expect(getAssessmentWeightInputLabel(course)).toBe("Weight points");
    expect(getCourseWeightingTotalLabel(course)).toBe("155 pts total");
    expect(shouldShowCourseOverweightWarning(course)).toBe(false);
    expect(formatCourseRemainingWeight(course, 55)).toBe(
      "55 weighting points remaining",
    );
  });

  it("formats zero and decimal bonus values", () => {
    expect(formatCourseBonusPoints(0)).toBe("+0%");
    expect(formatCourseBonusPoints(2.5)).toBe("+2.5%");
  });
});
