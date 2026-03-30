"use client";

import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  calculateRequiredScore,
  formatPercent,
  getCompletedWeight,
  getModuleCurrentGrade,
  getModuleGuaranteedGrade,
  getGradeBandState,
  getRemainingWeight,
  getSortedGradeBands,
  hasRecordedModuleGrade,
} from "@/lib/grade-utils";
import { Module, GradeBand } from "@/lib/types";

const inlineInputClassName =
  "h-auto rounded-none border-0 bg-transparent px-0 py-0 text-inherit shadow-none focus-visible:ring-0";

interface GradeBandPanelProps {
  module: Module;
  onUpdateGradeBand: (bandId: string, threshold: number) => void;
}

export function GradeBandPanel({
  module,
  onUpdateGradeBand,
}: GradeBandPanelProps) {
  const hasAssessments = module.assessments.length > 0;
  const hasRecordedGrade = hasRecordedModuleGrade(module);
  const currentGrade = getModuleCurrentGrade(module);
  const animatedCurrentGrade = useAnimatedNumber(currentGrade);
  const guaranteedGrade = getModuleGuaranteedGrade(module);
  const remainingWeight = getRemainingWeight(module);
  const ceiling = guaranteedGrade + remainingWeight;
  const completion = getCompletedWeight(module);
  const bands = getSortedGradeBands(module);
  const bandTargets = bands.map((band) => {
    const result = calculateRequiredScore(module, band.threshold);
    const state = hasAssessments
      ? getGradeBandState(module, band)
      : "reachable";
    const needed = !hasAssessments
      ? "Not set"
      : state === "guaranteed"
        ? formatPercent(band.threshold)
        : result.remainingWeight === 0
          ? "Closed"
          : `${result.neededAverage}%`;

    return {
      band,
      needed,
      state,
    };
  });

  return (
    <div className="grid gap-4">
      <div className="min-w-0 md:hidden">
        <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white/90 shadow-card">
          <div className="border-b border-stone-200 px-4 py-2.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Progress
                </p>
                <p className="mt-1 text-[1.7rem] font-semibold leading-none tracking-tight text-stone-900">
                  {hasRecordedGrade
                    ? formatPercent(animatedCurrentGrade)
                    : "No grade yet"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Completion
                </p>
                <p className="mt-1 text-xs font-medium text-stone-700">
                  {hasRecordedGrade
                    ? `${formatPercent(completion)} complete`
                    : hasAssessments
                      ? "Waiting for first grade"
                      : "Add assignments"}
                </p>
              </div>
            </div>
          </div>
          <MobileStandingChart
            bands={bands}
            ceiling={ceiling}
            currentGrade={animatedCurrentGrade}
            guaranteedGrade={guaranteedGrade}
            hasAssessments={hasAssessments}
            hasRecordedGrade={hasRecordedGrade}
          />
          <div className="border-t border-stone-200 px-3 py-2">
            <p className="mb-2 text-center text-[0.72rem] font-medium uppercase tracking-[0.18em] text-stone-400">
              What do I need?
            </p>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(Math.max(bandTargets.length, 1), 5)}, minmax(0, 1fr))`,
              }}
            >
              {bandTargets.map(({ band, needed, state }) => (
                <div
                  className={`rounded-2xl border px-2 py-2 text-center ${
                    state === "unreachable"
                      ? "border-stone-200 bg-stone-50/70 text-stone-400"
                      : "border-stone-200 bg-stone-50/80 text-stone-700"
                  }`}
                  key={band.id}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {band.label}
                  </p>
                  <p className="mt-1 text-[1.15rem] font-semibold leading-none tracking-tight">
                    {renderNeededValue(needed)}
                  </p>
                  <div className="mt-1.5 flex justify-center">
                    <InlineBandThreshold
                      band={band}
                      onCommit={(threshold) =>
                        onUpdateGradeBand(band.id, threshold)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] md:items-start lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden min-w-0 md:block">
          <p className="mb-3 text-center text-sm text-stone-500">
            Current standing
          </p>
          <div className="relative h-[500px] overflow-hidden rounded-[24px] border border-stone-200 bg-white/90">
            {hasAssessments ? (
              <>
                <div
                  className="absolute inset-x-0 top-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.62),rgba(214,211,209,0.62)_3px,transparent_3px,transparent_7px)] transition-[height] duration-500 ease-out"
                  style={{ height: `${100 - getLinePosition(ceiling)}%` }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.58),rgba(214,211,209,0.58)_3px,transparent_3px,transparent_7px)] transition-[height] duration-500 ease-out"
                  style={{ height: `${getLinePosition(guaranteedGrade)}%` }}
                />
              </>
            ) : null}

            {[90, 80, 70, 60, 50, 40, 30, 20, 10].map((line) => (
              <GuideLine key={line} value={line} />
            ))}

            {hasAssessments
              ? bands.map((band) => (
                  <BandLine
                    band={band}
                    key={band.id}
                    state={getGradeBandState(module, band)}
                  />
                ))
              : null}

            {hasRecordedGrade ? (
              <CurrentLine value={animatedCurrentGrade} />
            ) : null}
            {hasRecordedGrade ? (
              <CurrentPill value={animatedCurrentGrade} />
            ) : null}

            <p className="absolute inset-x-0 bottom-4 text-center text-sm text-stone-600">
              {hasRecordedGrade
                ? `${formatPercent(completion)} complete`
                : hasAssessments
                  ? "Waiting for first grade"
                  : "Add assignments to start tracking"}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white/90">
            <div className="hidden md:block">
              {bandTargets.map(({ band, needed, state }) => (
                <div
                  className={`grid gap-1.5 border-t border-stone-200 px-4 py-3 first:border-t-0 ${
                    state === "unreachable"
                      ? "text-stone-400"
                      : "text-stone-700"
                  }`}
                  key={band.id}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-[1.7rem] font-semibold leading-none tracking-tight">
                        {renderNeededValue(needed)}
                      </p>
                      <p className="text-base leading-none">
                        <span className="font-medium text-stone-500">
                          for a{" "}
                        </span>
                        <span className="font-semibold text-stone-950">
                          {band.label}
                        </span>
                      </p>
                    </div>
                    <InlineBandThreshold
                      band={band}
                      onCommit={(threshold) =>
                        onUpdateGradeBand(band.id, threshold)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStandingChart({
  bands,
  ceiling,
  currentGrade,
  guaranteedGrade,
  hasAssessments,
  hasRecordedGrade,
}: {
  bands: GradeBand[];
  ceiling: number;
  currentGrade: number;
  guaranteedGrade: number;
  hasAssessments: boolean;
  hasRecordedGrade: boolean;
}) {
  return (
    <div className="px-4 pb-3 pt-3">
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50/70 px-3 pb-8 pt-8">
        {hasAssessments ? (
          <>
            <div
              className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.62),rgba(214,211,209,0.62)_3px,transparent_3px,transparent_7px)] transition-[width] duration-500 ease-out"
              style={{ width: `${100 - getLinePosition(ceiling)}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(135deg,rgba(214,211,209,0.58),rgba(214,211,209,0.58)_3px,transparent_3px,transparent_7px)] transition-[width] duration-500 ease-out"
              style={{ width: `${getLinePosition(guaranteedGrade)}%` }}
            />
          </>
        ) : null}

        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((line) => (
          <div
            className="absolute inset-y-0 border-l border-stone-200"
            key={line}
            style={{ left: `${getLinePosition(line)}%` }}
          >
            <span className="absolute bottom-2 -translate-x-1/2 text-[10px] text-stone-400">
              {line}%
            </span>
          </div>
        ))}

        {bands.map((band) => (
          <div
            className="absolute top-2 -translate-x-1/2"
            key={band.id}
            style={{ left: `${getLinePosition(band.threshold)}%` }}
          >
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-stone-400 bg-white px-2 text-xs font-medium text-stone-700 shadow-sm">
              {band.label}
            </span>
          </div>
        ))}

        {hasRecordedGrade ? (
          <>
            <div
              className="absolute inset-y-0 border-l-2 border-stone-600 transition-[left] duration-500 ease-out"
              style={{ left: `${getLinePosition(currentGrade)}%` }}
            />
            <div
              className="absolute bottom-8 -translate-x-1/2 transition-[left] duration-500 ease-out"
              style={{ left: `${getLinePosition(currentGrade)}%` }}
            >
              <div className="rounded-full border border-stone-500 bg-white px-3 py-1 shadow-sm">
                <p className="text-base font-semibold leading-none tracking-tight text-stone-700">
                  {formatPercent(currentGrade)}
                </p>
              </div>
            </div>
          </>
        ) : null}
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
      className="absolute inset-x-0 border-t border-stone-200 transition-[bottom] duration-500 ease-out"
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
      className="absolute inset-x-0 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `${getLinePosition(band.threshold)}%` }}
    >
      <div
        className={`border-t transition-colors duration-300 ${
          state === "unreachable"
            ? "border-stone-300/80"
            : "border-stone-500/90"
        }`}
      />
      <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-4">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white text-sm transition-colors duration-300 ${
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
      className="absolute inset-x-0 border-t-2 border-stone-500 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `${getLinePosition(value)}%` }}
    />
  );
}

function CurrentPill({ value }: { value: number }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 transition-[bottom] duration-500 ease-out"
      style={{ bottom: `calc(${getLinePosition(value)}% - 20px)` }}
    >
      <div className="rounded-full border border-stone-500 bg-white px-6 py-2 shadow-sm transition-shadow duration-300">
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
        className="cursor-text text-sm font-medium leading-none text-stone-400"
        onClick={() => setEditing(true)}
        type="button"
      >
        cutoff {band.threshold}%
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm font-medium leading-none text-stone-400">
      <Input
        className={`${inlineInputClassName} w-10 text-right text-sm`}
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

function useAnimatedNumber(target: number, duration = 450) {
  const [animated, setAnimated] = useState(target);
  const frameRef = useRef<number | null>(null);
  const previousTargetRef = useRef(target);

  useEffect(() => {
    const startValue = previousTargetRef.current;
    const delta = target - startValue;

    if (Math.abs(delta) < 0.05) {
      setAnimated(target);
      previousTargetRef.current = target;
      return;
    }

    const start = performance.now();

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + delta * eased;

      setAnimated(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      previousTargetRef.current = target;
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, target]);

  return animated;
}
