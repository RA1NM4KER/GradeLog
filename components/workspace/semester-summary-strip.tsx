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
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
          Semester
        </p>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold tracking-tight text-stone-950">
              {semesterName}
            </p>
            <SemesterDialog
              onSaveSemester={onSaveSemester}
              semester={semester}
              triggerAsChild
              triggerChildren={
                <Button
                  aria-label="Edit semester"
                  className="group h-auto w-auto rounded-none border-0 bg-transparent p-0 text-stone-500 shadow-none hover:bg-transparent hover:text-stone-800"
                  size="icon"
                  title="Edit semester"
                  type="button"
                  variant="ghost"
                >
                  <Cog className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                </Button>
              }
            />
          </div>
          <p className="mt-1 text-sm text-stone-600">{periodLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Grade average
          </p>
          <p className="mt-1 text-lg font-semibold text-stone-950">
            {formatPercent(average)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            GPA
          </p>
          <p className="mt-1 text-lg font-semibold text-stone-950">
            {gpa.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Total credits
          </p>
          <p className="mt-1 text-lg font-semibold text-stone-950">{credits}</p>
        </div>
      </div>
    </div>
  );
}
