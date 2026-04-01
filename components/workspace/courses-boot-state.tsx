"use client";

import { ReactNode } from "react";

export function CoursesBootState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl items-center justify-center px-5 py-8 sm:px-8">
      <div className="w-full max-w-xl">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-line bg-surface/80" />
            <span className="absolute inset-[7px] rounded-full border-2 border-line border-t-ink-soft animate-spin" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-ink-soft animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[1.02rem] font-semibold tracking-tight text-foreground sm:text-lg">
              {title}
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-ink-soft">
              {description}
            </p>
          </div>
          {!action ? null : (
            <div className="mt-6 flex justify-center">{action}</div>
          )}
        </div>
        <div className="mx-auto mt-8 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-line to-transparent" />
        <div className="mx-auto mt-3 flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-line-strong animate-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-ink-subtle animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-line-strong animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
