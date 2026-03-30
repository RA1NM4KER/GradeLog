import { Cog } from "lucide-react";

import { SemesterDialog } from "@/components/landing/semester-dialog";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/grade-utils";
import { Semester } from "@/lib/types";

interface SemesterSummaryStripProps {
  semester: Semester;
  semesterName: string;
  periodLabel: string;
  average: number;
  gpa: number;
  credits: number;
  onSaveSemester: (semester: Semester) => void;
}

export function SemesterSummaryStrip({
  semester,
  semesterName,
  periodLabel,
  average,
  gpa,
  credits,
  onSaveSemester,
}: SemesterSummaryStripProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
          Semester
        </p>
        <div className="mt-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className="min-w-0 text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
              {semesterName}
            </p>
            <SemesterDialog
              onSaveSemester={onSaveSemester}
              semester={semester}
              triggerAsChild
              triggerChildren={
                <Button
                  aria-label="Edit semester"
                  className="group h-auto w-auto shrink-0 rounded-none border-0 bg-transparent p-0 text-stone-500 shadow-none hover:bg-transparent hover:text-stone-800"
                  size="icon"
                  title="Edit semester"
                  type="button"
                  variant="ghost"
                >
                  <Cog className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-90 sm:h-5 sm:w-5" />
                </Button>
              }
            />
          </div>
          <p className="mt-1 text-sm text-stone-600">{periodLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-stone-200 bg-white/80 px-3 py-2.5 sm:gap-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-xs sm:tracking-[0.2em]">
            Grade average
          </p>
          <p className="mt-1 text-base font-semibold text-stone-950 sm:text-lg">
            {formatPercent(average)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-xs sm:tracking-[0.2em]">
            GPA
          </p>
          <p className="mt-1 text-base font-semibold text-stone-950 sm:text-lg">
            {gpa.toFixed(2)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-xs sm:tracking-[0.2em]">
            Total credits
          </p>
          <p className="mt-1 text-base font-semibold text-stone-950 sm:text-lg">
            {credits}
          </p>
        </div>
      </div>
    </div>
  );
}
