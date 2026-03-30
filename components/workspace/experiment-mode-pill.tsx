"use client";

import { FlaskConical, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExperimentModePill({
  onStopAction,
}: {
  onStopAction: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-3 top-[4.75rem] z-[70] sm:left-1/2 sm:right-auto sm:top-[5.25rem] sm:w-fit sm:max-w-[min(92vw,40rem)] sm:-translate-x-1/2">
      <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-[22px] border border-sky-200 bg-sky-50/95 px-3 py-2.5 text-sky-950 shadow-card backdrop-blur sm:rounded-full sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/85 text-sky-700 sm:h-9 sm:w-9">
            <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none sm:leading-normal">
              Experiment mode
            </p>
            <p className="mt-1 text-xs text-sky-800/80 sm:text-sm">
              <span className="sm:hidden">Changes here are temporary.</span>
              <span className="hidden sm:inline">
                Try grade changes freely. Nothing here will be kept.
              </span>
            </p>
          </div>
        </div>
        <Button
          className="h-9 shrink-0 rounded-full bg-white/90 px-3 text-xs text-sky-900 hover:bg-white sm:h-10 sm:px-4 sm:text-sm"
          onClick={onStopAction}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sm:hidden">Reset</span>
          <span className="hidden sm:inline">Back to saved</span>
        </Button>
      </div>
    </div>
  );
}
