import { CheckCircle2, CircleDashed } from "lucide-react";

import { getCourseTheme } from "@/lib/course/course-theme";
import { cn } from "@/lib/shared/utils";
import {
  formatPercent,
  getAssessmentPace,
  getCourseCurrentGrade,
  getRemainingWeight,
  hasRecordedCourseGrade,
} from "@/lib/grades/grade-utils";
import { Course } from "@/lib/shared/types";

interface CourseListItemProps {
  course: Course;
  contextLabel?: string;
  isActive: boolean;
  onSelect: () => void;
}

export function CourseListItem({
  course,
  contextLabel,
  isActive,
  onSelect,
}: CourseListItemProps) {
  const instructor = course.instructor.trim();
  const hasAssignments = course.assessments.length > 0;
  const hasRecordedGrade = hasRecordedCourseGrade(course);
  const grade = getCourseCurrentGrade(course);
  const remainingWeight = getRemainingWeight(course);
  const theme = getCourseTheme(course);

  return (
    <button
      aria-pressed={isActive}
      className={cn(
        "group relative flex h-full w-full overflow-hidden rounded-[20px] border border-line bg-surface text-left transition-all duration-200 dark:bg-surface-soft sm:rounded-[24px]",
        "shadow-card hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.99] active:translate-y-0",
        isActive && "border-line-strong shadow-soft",
      )}
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-2.5 sm:w-3", theme.band)}
      />
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 px-3 py-2.5 pl-5 sm:content-between sm:gap-x-4 sm:px-4 sm:pb-3 sm:pt-3 sm:pl-6">
        <div className="min-w-0">
          <div className="min-h-[5.2rem] min-w-0 sm:min-h-[4rem]">
            {contextLabel ? (
              <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:text-[0.68rem]">
                {contextLabel}
              </p>
            ) : null}
            <div className="min-w-0 pr-2">
              <h3 className="line-clamp-2 max-w-[18ch] text-[0.95rem] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[1.08rem]">
                {course.name}
              </h3>
              <span className="mt-1 block text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-muted sm:text-[0.72rem] sm:tracking-[0.12em]">
                {course.code}
              </span>
            </div>
            <p className="mt-0.5 text-[0.82rem] text-ink-muted sm:text-[0.92rem]">
              {instructor ? `${instructor} · ` : ""}
              {course.credits} credits
            </p>
          </div>
        </div>

        <div className="flex min-w-[96px] flex-col items-end text-right sm:min-w-[110px]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-subtle sm:text-[10px] sm:tracking-[0.18em]">
              Current grade
            </p>
            <p
              className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.05em] sm:text-[1.9rem]"
              style={{ color: theme.accentColorValue }}
            >
              {hasRecordedGrade ? formatPercent(grade) : "--"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium sm:gap-2 sm:px-2.5 sm:text-[10px] dark:!border dark:!border-white/10 dark:!bg-surface-muted dark:!text-foreground",
              theme.chip,
            )}
          >
            {hasAssignments && remainingWeight === 0 ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-foreground dark:text-foreground sm:h-3 sm:w-3" />
            ) : (
              <CircleDashed className="h-2.5 w-2.5 text-ink-muted dark:text-ink-subtle sm:h-3 sm:w-3" />
            )}
            {!hasAssignments
              ? "Not started"
              : remainingWeight === 0
                ? "Complete"
                : `${formatPercent(remainingWeight)} remaining`}
          </span>
          <span className="rounded-full bg-surface-muted px-2 py-1 text-[9px] font-medium text-ink-soft sm:px-2.5 sm:text-[10px]">
            {getAssessmentPace(course)}
          </span>
        </div>

        <div className="flex min-w-[96px] justify-end sm:min-w-[110px]">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[9px] font-medium sm:text-[10px]",
              isActive
                ? "bg-surface text-foreground"
                : "bg-surface-muted text-ink-soft",
            )}
          >
            {course.assessments.length} assessments
          </span>
        </div>
      </div>
    </button>
  );
}
