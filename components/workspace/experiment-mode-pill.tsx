"use client";

import { FlaskConical, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExperimentModePill({
  onStopAction,
}: {
  onStopAction: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/48 px-3 py-2 text-violet-950 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.28),0_1px_0_rgba(255,255,255,0.45)_inset] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/62 text-violet-700 backdrop-blur-sm sm:h-8 sm:w-8 dark:border-white/10 dark:bg-white/12">
          <span className="pointer-events-none absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full bg-violet-400/70 animate-ping [animation-duration:1.8s]" />
          <span className="pointer-events-none absolute -top-1.5 left-1/2 h-1 w-1 translate-x-[2px] rounded-full bg-violet-300/80 animate-ping [animation-delay:300ms] [animation-duration:2.1s]" />
          <span className="pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-[2px] rounded-full bg-violet-200/90 animate-ping [animation-delay:650ms] [animation-duration:1.6s]" />
          <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.82rem] font-semibold sm:text-sm">
            Experiment mode is on
          </p>
          <p className="text-[0.68rem] text-violet-900/75 sm:text-[0.72rem]">
            Test changes safely. Nothing is saved until you exit.
          </p>
        </div>
      </div>
      <Button
        className="h-8 shrink-0 rounded-full border border-white/28 bg-white/60 px-3 text-[0.75rem] text-violet-900 backdrop-blur-sm hover:bg-white/78 sm:h-9 sm:px-3.5 sm:text-[0.82rem] dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
        onClick={onStopAction}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Undo
      </Button>
    </div>
  );
}
