"use client";

import {
  getCourseCurrentGrade,
  getCourseCeilingGrade,
  getCourseGuaranteedGrade,
  getSortedGradeBands,
  hasRecordedCourseGrade,
} from "@/lib/grades/grade-utils";
import { CourseMobileOverviewChart } from "@/components/workspace/course/course-mobile-overview-chart";
import { CourseMobileOverviewNeededGrid } from "@/components/workspace/course/course-mobile-overview-needed-grid";
import { Course } from "@/lib/shared/types";

export function CourseMobileOverview({
  module,
  isExperimenting = false,
  onSaveBandsAction,
}: {
  module: Course;
  isExperimenting?: boolean;
  onSaveBandsAction: (bands: Course["gradeBands"]) => void;
}) {
  const hasRecordedGrade = hasRecordedCourseGrade(module);
  const currentGrade = getCourseCurrentGrade(module);
  const guaranteedGrade = getCourseGuaranteedGrade(module);
  const ceiling = getCourseCeilingGrade(module);
  const bands = getSortedGradeBands(module);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <CourseMobileOverviewChart
          bands={bands}
          ceiling={ceiling}
          currentGrade={currentGrade}
          guaranteedGrade={guaranteedGrade}
          hasAssessments={module.assessments.length > 0}
          hasRecordedGrade={hasRecordedGrade}
          isExperimenting={isExperimenting}
          module={module}
        />
      </div>

      <CourseMobileOverviewNeededGrid
        bands={bands}
        isExperimenting={isExperimenting}
        module={module}
        onSaveBandsAction={onSaveBandsAction}
      />
    </div>
  );
}
