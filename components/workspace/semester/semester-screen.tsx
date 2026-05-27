"use client";

import { BookMarked, Plus } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { CourseListItem } from "@/components/dashboard/course-list-item";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ExperimentModePill } from "@/components/workspace/shared/experiment-mode-pill";
import {
  SemesterOwnedSummaryStrip,
  SemesterSummaryStrip,
} from "@/components/workspace/semester/semester-summary-strip";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  getCourseDetailsUrl,
  getSemesterCoursesUrl,
  navigateCourses,
  useCoursesLocation,
} from "@/lib/course/courses-navigation";
import {
  getCompletedWeight,
  getSemesterAverage,
  getSemesterGpa,
} from "@/lib/grades/grade-utils";
import { Course } from "@/lib/shared/types";

export function SemesterScreen() {
  const coursesLocation = useCoursesLocation();
  const {
    semester,
    semesters,
    addCourse,
    isExperimenting,
    stopExperiment,
    updateSemester,
  } = useCourses();

  const isAllCoursesView = coursesLocation.scope === "all";
  const average = getSemesterAverage(semester);
  const gpa = getSemesterGpa(semester);
  const totalCredits = semester.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const completedCourses = semester.courses.filter(
    (course) => getCompletedWeight(course) >= 100,
  ).length;
  const allCourseEntries = semesters.flatMap((item) =>
    item.courses.map((course) => ({
      course,
      semesterId: item.id,
      semesterName: item.name,
    })),
  );
  const displayedCourseEntries = isAllCoursesView
    ? allCourseEntries
    : semester.courses.map((course) => ({
        course,
        semesterId: semester.id,
        semesterName: semester.name,
      }));
  const allCompletedCourses = allCourseEntries.filter(
    ({ course }) => getCompletedWeight(course) >= 100,
  ).length;

  function handleSaveCourse(course: Course) {
    addCourse(course);
    navigateCourses(getCourseDetailsUrl(semester.id, course.id));
  }

  function showAllCourses() {
    navigateCourses("/courses?scope=all");
  }

  function showSemesterCourses(nextSemesterId: string) {
    navigateCourses(getSemesterCoursesUrl(nextSemesterId));
  }

  function handleScopeChange(value: string) {
    if (value === "all") {
      showAllCourses();
      return;
    }

    showSemesterCourses(value);
  }

  return (
    <div className="mx-auto max-w-7xl overflow-auto px-4 py-4 sm:px-8 sm:py-6 ">
      {isExperimenting ? (
        <div className="pointer-events-none fixed left-1/2 top-[4.7rem] z-40 w-[calc(100%-2rem)] max-w-max -translate-x-1/2 sm:top-[5.25rem]">
          <div className="pointer-events-auto">
            <ExperimentModePill onStopAction={stopExperiment} />
          </div>
        </div>
      ) : null}

      {isAllCoursesView ? (
        <Card className="rounded-[28px] bg-transparent shadow-none sm:rounded-[34px]">
          <CardContent className="grid gap-4 p-0">
            <SemesterSummaryStrip
              description="A quick look at all your semesters together."
              eyebrow="Courses"
              hideSubtitleOnMobile
              stats={[
                { label: "Courses", value: String(allCourseEntries.length) },
                { label: "Complete", value: String(allCompletedCourses) },
                { label: "Semesters", value: String(semesters.length) },
              ]}
              subtitle="All courses, all semesters."
              title="All courses"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[28px] bg-transparent shadow-none sm:rounded-[34px]">
          <CardContent className="grid gap-4 p-0">
            <SemesterOwnedSummaryStrip
              average={average}
              credits={totalCredits}
              gpa={gpa}
              periodLabel={semester.periodLabel}
              semester={semester}
              semesterName={semester.name}
              onSaveSemester={(nextSemester) =>
                updateSemester(nextSemester.id, {
                  name: nextSemester.name,
                  periodLabel: nextSemester.periodLabel,
                })
              }
            />
          </CardContent>
        </Card>
      )}

      <section className="mt-4 px-3 sm:mt-7 sm:px-7">
        <div>
          <h2 className="text-[1.55rem] font-semibold leading-none tracking-[-0.04em] text-foreground sm:text-[1.7rem]">
            Courses
          </h2>
          <div className="mt-2.5 flex items-center justify-between gap-3 sm:mt-3 sm:items-end sm:gap-4">
            <p className="min-w-0 whitespace-nowrap text-[0.95rem] text-ink-soft">
              {displayedCourseEntries.length} active,{" "}
              {isAllCoursesView ? allCompletedCourses : completedCourses}{" "}
              complete
            </p>
            <div className="w-[9.75rem] shrink-0 sm:w-[11.5rem]">
              <Select
                aria-label="Filter courses by semester"
                className="h-9 rounded-full border-line/80 bg-surface-soft px-3 pr-8 text-[0.82rem] shadow-none"
                onChange={(event) => handleScopeChange(event.target.value)}
                value={isAllCoursesView ? "all" : semester.id}
              >
                <option value="all">All courses</option>
                {semesters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          {displayedCourseEntries.length > 0 ? (
            <div className="grid gap-3.5 md:auto-rows-fr md:grid-cols-2 md:items-stretch sm:gap-5 xl:grid-cols-3">
              {displayedCourseEntries.map((entry) => (
                <CourseListItem
                  contextLabel={
                    isAllCoursesView ? entry.semesterName : undefined
                  }
                  course={entry.course}
                  isActive={false}
                  key={`${entry.semesterId}:${entry.course.id}`}
                  onSelect={() =>
                    navigateCourses(
                      getCourseDetailsUrl(entry.semesterId, entry.course.id),
                    )
                  }
                />
              ))}
              <CourseDialog
                onSaveCourse={handleSaveCourse}
                triggerAsChild
                triggerChildren={
                  <button
                    className="group relative flex h-full w-full overflow-hidden rounded-[20px] border border-line bg-surface text-left shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft dark:bg-surface-soft sm:rounded-[24px]"
                    type="button"
                  >
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-surface-strip sm:w-3" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 pl-2.5 text-center text-ink-muted transition group-hover:text-foreground sm:gap-2.5 sm:pl-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-soft transition group-hover:bg-surface group-hover:text-foreground sm:h-11 sm:w-11">
                        <Plus className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                      </span>
                      <span className="text-[0.84rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.92rem]">
                        Add course
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="invisible grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 px-3 py-2.5 pl-5 sm:gap-x-4 sm:px-4 sm:py-3 sm:pl-6"
                    >
                      <div className="min-w-0">
                        <div className="min-h-[5.2rem] min-w-0 pr-2">
                          <span className="block line-clamp-2 max-w-[18ch] text-[0.95rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[1.08rem]">
                            Placeholder course
                          </span>
                          <span className="mt-1 block text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-muted sm:text-[0.72rem] sm:tracking-[0.12em]">
                            CODE000
                          </span>
                        </div>
                        <p className="mt-0.5 text-[0.82rem] sm:text-[0.92rem]">
                          Placeholder instructor · 00 credits
                        </p>
                      </div>

                      <div className="flex min-w-[96px] flex-col items-end text-right sm:min-w-[110px]">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em]">
                            Current grade
                          </p>
                          <p className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.05em] sm:text-[1.9rem]">
                            00.0%
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px]">
                          Placeholder
                        </span>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px]">
                          Placeholder
                        </span>
                      </div>

                      <div className="flex min-w-[96px] justify-end sm:min-w-[110px]">
                        <span className="rounded-full px-2.5 py-1 text-[9px] font-medium sm:text-[10px]">
                          0 assessments
                        </span>
                      </div>
                    </div>
                  </button>
                }
              />
            </div>
          ) : (
            <EmptyState
              action={
                <CourseDialog
                  onSaveCourse={handleSaveCourse}
                  triggerAsChild
                  triggerChildren={
                    <button
                      className="flex min-h-[260px] w-full max-w-sm flex-col items-center justify-center rounded-[28px] bg-surface-panel p-6 text-center text-ink-muted shadow-card transition hover:bg-surface-panel-hover hover:text-foreground"
                      type="button"
                    >
                      <Plus className="h-8 w-8" />
                      <span className="mt-4 text-sm font-semibold uppercase tracking-[0.14em]">
                        Add course
                      </span>
                    </button>
                  }
                />
              }
              description="Add your first course."
              icon={<BookMarked className="h-5 w-5" />}
              title="No courses yet"
            />
          )}
        </div>
      </section>
    </div>
  );
}
