import Link from "next/link";
import { ArrowLeft, Cog } from "lucide-react";

import { CourseDialog } from "@/components/dashboard/course-dialog";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";

export function ModuleHeader({
  course,
  onSaveCourse,
}: {
  course: Course;
  onSaveCourse: (course: Course) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-950"
          href="/workspace"
        >
          <ArrowLeft className="h-4 w-4" />
          Semester
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
            {course.name}
          </h1>
          <CourseDialog
            course={course}
            onSaveCourse={onSaveCourse}
            triggerAsChild
            triggerChildren={
              <Button
                aria-label="Edit module"
                className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-stone-500 shadow-none hover:bg-transparent hover:text-stone-800"
                size="icon"
                title="Edit module"
                type="button"
                variant="ghost"
              >
                <Cog className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            }
          />
        </div>
        <p className="mt-1 text-sm text-stone-600">
          {course.code} · Lecturer: {course.instructor} · {course.credits}{" "}
          credits
        </p>
      </div>
    </div>
  );
}
