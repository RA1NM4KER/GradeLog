import type { Course } from "@/lib/course/types";
import { getAssignedWeight } from "@/lib/grades/grade-utils";

function formatCompactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function getAssessmentWeightColumnLabel(
  course: Pick<Course, "gradingScale">,
) {
  return course.gradingScale === "points" ? "Weight pts" : "Weight";
}

export function getAssessmentWeightInputLabel(
  course: Pick<Course, "gradingScale">,
) {
  return course.gradingScale === "points" ? "Weight points" : "Weight (%)";
}

export function getCourseWeightingTotalLabel(course: Course) {
  if (course.gradingScale !== "points") {
    return null;
  }

  return `${formatCompactNumber(getAssignedWeight(course))} pts total`;
}

export function shouldShowCourseOverweightWarning(
  course: Course,
  assignedWeight = getAssignedWeight(course),
) {
  return course.gradingScale === "percentage" && assignedWeight > 100;
}

export function formatCourseBonusPoints(bonusPoints: number) {
  return `+${formatCompactNumber(Math.max(bonusPoints, 0))}%`;
}

export function formatCourseRemainingWeight(
  course: Course,
  remainingWeight: number,
) {
  return course.gradingScale === "points"
    ? `${formatCompactNumber(remainingWeight)} weighting points remaining`
    : `${formatCompactNumber(remainingWeight)}% remaining`;
}
