"use client";

import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  calculateRequiredScore,
  formatPercent,
  getCompletedWeight,
  getCourseCurrentGrade,
  getCourseGuaranteedGrade,
  getGradeBandState,
  getRemainingWeight,
  getSortedGradeBands,
} from "@/lib/grade-utils";
import { Course, GradeBand } from "@/lib/types";

const inlineInputClassName =
  "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-inherit shadow-none focus-visible:ring-0";

interface GradeBandPanelProps {
  course: Course;
  onUpdateGradeBand: (bandId: string, threshold: number) => void;
}

export function GradeBandPanel({
  course,
  onUpdateGradeBand,
}: GradeBandPanelProps) {
  const currentGrade = getCourseCurrentGrade(course);
  const guaranteedGrade = getCourseGuaranteedGrade(course);
  const remainingWeight = getRemainingWeight(course);
  const ceiling = guaranteedGrade + remainingWeight;
  const completion = getCompletedWeight(course);
  const bands = getSortedGradeBands(course);

  return (
    <div className="grid gap-4 min-[900px]:grid-cols-[280px_minmax(0,1fr)] min-[900px]:items-start">
      <div className="min-w-0">
        <div className="relative h-[500px] overflow-hidden rounded-[24px] border border-stone-200 bg-white/90">
          <div
            className="absolute inset-x-0 top-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.62),rgba(214,211,209,0.62)_3px,transparent_3px,transparent_7px)]"
            style={{ height: `${100 - getLinePosition(ceiling)}%` }}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.58),rgba(214,211,209,0.58)_3px,transparent_3px,transparent_7px)]"
            style={{ height: `${getLinePosition(guaranteedGrade)}%` }}
          />

          {[90, 80, 70, 60, 50, 40, 30, 20, 10].map((line) => (
            <GuideLine key={line} value={line} />
          ))}

          {bands.map((band) => (
            <BandLine
              band={band}
              key={band.id}
              state={getGradeBandState(course, band)}
            />
          ))}

          <CurrentLine value={currentGrade} />
          <CurrentPill value={currentGrade} />

          <p className="absolute inset-x-0 bottom-4 text-center text-sm text-stone-600">
            {formatPercent(completion)} complete
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[24px] border border-stone-200 bg-white/90">
        {bands.map((band) => {
          const result = calculateRequiredScore(course, band.threshold);
          const state = getGradeBandState(course, band);
          const needed =
            state === "guaranteed"
              ? formatPercent(band.threshold)
              : result.remainingWeight === 0
                ? "Closed"
                : `${result.neededAverage}%`;

          return (
            <div
              className={`grid gap-1.5 border-t border-stone-200 px-4 py-3 first:border-t-0 ${
                state === "unreachable" ? "text-stone-400" : "text-stone-700"
              }`}
              key={band.id}
            >
              <div className="flex items-baseline gap-2">
                <p className="text-[1.7rem] font-semibold leading-none tracking-tight">
                  {renderNeededValue(needed)}
                </p>
                <p className="text-base leading-none">
                  <span className="font-medium text-stone-500">for a </span>
                  <span className="font-semibold text-stone-950">
                    {band.label}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs text-stone-500">
                <span>{band.threshold}% cutoff</span>
                <InlineBandThreshold
                  band={band}
                  onCommit={(threshold) =>
                    onUpdateGradeBand(band.id, threshold)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderNeededValue(value: string) {
  if (!value.endsWith("%")) {
    return value;
  }

  return (
    <>
      {value.slice(0, -1)}
      <span className="text-base font-medium text-stone-500">%</span>
    </>
  );
}

function getLinePosition(value: number) {
  return Math.min(Math.max(value, 8), 92);
}

function GuideLine({ value }: { value: number }) {
  return (
    <div
      className="absolute inset-x-0 border-t border-stone-200"
      style={{ bottom: `${getLinePosition(value)}%` }}
    >
      <span className="absolute right-4 top-0 -translate-y-1/2 text-[11px] text-stone-400">
        {value}%
      </span>
    </div>
  );
}

function BandLine({
  band,
  state,
}: {
  band: GradeBand;
  state: "guaranteed" | "reachable" | "unreachable";
}) {
  return (
    <div
      className="absolute inset-x-0"
      style={{ bottom: `${getLinePosition(band.threshold)}%` }}
    >
      <div
        className={`border-t ${
          state === "unreachable"
            ? "border-stone-300/80"
            : "border-stone-500/90"
        }`}
      />
      <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-4">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white text-sm ${
            state === "unreachable"
              ? "border-stone-300 text-stone-400"
              : "border-stone-500 text-stone-700"
          }`}
        >
          {band.label}
        </span>
      </div>
    </div>
  );
}

function CurrentLine({ value }: { value: number }) {
  return (
    <div
      className="absolute inset-x-0 border-t-2 border-stone-500"
      style={{ bottom: `${getLinePosition(value)}%` }}
    />
  );
}

function CurrentPill({ value }: { value: number }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: `calc(${getLinePosition(value)}% - 20px)` }}
    >
      <div className="rounded-full border border-stone-500 bg-white px-6 py-2 shadow-sm">
        <p className="text-[1.75rem] font-semibold leading-none tracking-tight text-stone-700">
          {formatPercent(value)}
        </p>
      </div>
    </div>
  );
}

function InlineBandThreshold({
  band,
  onCommit,
}: {
  band: GradeBand;
  onCommit: (threshold: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(band.threshold));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(String(band.threshold));
  }, [band.threshold]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (!input) return;
        const position = input.value.length;
        input.setSelectionRange(position, position);
      });
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className="cursor-text text-stone-500"
        onClick={() => setEditing(true)}
        type="button"
      >
        cutoff {band.threshold}%
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Input
        className={`${inlineInputClassName} w-10 text-right`}
        onBlur={() => {
          setEditing(false);
          onCommit(Math.max(Math.min(Number(draft || 0), 100), 0));
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) =>
          handleInlineNumberKeyDown(
            event,
            inputRef,
            setEditing,
            setDraft,
            band.threshold,
          )
        }
        ref={inputRef}
        type="number"
        value={draft}
      />
      <span className="text-stone-500">%</span>
    </div>
  );
}

function handleInlineNumberKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setEditing: (value: boolean) => void,
  setDraft: (value: string) => void,
  value: number,
) {
  if (event.key === "Enter") {
    inputRef.current?.blur();
  }

  if (event.key === "Escape") {
    setDraft(String(value));
    setEditing(false);
  }
}
