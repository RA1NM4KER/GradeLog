"use client";

import { Button } from "@/components/ui/button";
import type { GradingScale } from "@/lib/course/types";
import { cn } from "@/lib/shared/utils";

export function WeightingScaleControl({
  value,
  onChange,
}: {
  value: GradingScale;
  onChange: (value: GradingScale) => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-2">
      <span className="hidden text-xs font-medium text-ink-subtle min-[360px]:inline">
        Weighting
      </span>
      <div
        aria-label="Course weighting scale"
        className="inline-flex items-center rounded-[10px] border border-line bg-surface-muted p-0.5"
        role="group"
      >
        {(
          [
            ["percentage", "%"],
            ["points", "PTS"],
          ] as const
        ).map(([scale, label]) => (
          <Button
            aria-pressed={value === scale}
            className={cn(
              "h-7 min-w-9 rounded-[8px] px-2 text-[0.68rem] font-semibold tracking-[0.08em] shadow-none",
              value === scale
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "text-ink-soft hover:bg-surface hover:text-foreground",
            )}
            key={scale}
            onClick={() => onChange(scale)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
