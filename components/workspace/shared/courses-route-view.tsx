"use client";

import { PageBackground } from "@/components/ui/page-background";
import { CourseScreen } from "@/components/workspace/course/module-screen";
import { SemesterScreen } from "@/components/workspace/semester/semester-screen";
import { useCoursesLocation } from "@/lib/course/courses-navigation";

export function CoursesRouteView() {
  const location = useCoursesLocation();

  if (location.moduleId) {
    return (
      <>
        <PageBackground variant="detail" />
        <CourseScreen moduleId={location.moduleId} />
      </>
    );
  }

  return (
    <>
      <PageBackground variant="overview" />
      <SemesterScreen />
    </>
  );
}
