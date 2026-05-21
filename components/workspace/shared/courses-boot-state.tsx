"use client";

import { ReactNode } from "react";

import { PageContainer } from "@/components/ui/page-container";

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
    <PageContainer className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center py-8">
      <div className="w-full max-w-xl">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <span className="border-loader-sand-top border-loader-sand-right border-loader-sand-bottom absolute inset-[5px] rounded-full border-[3px] border-transparent animate-[spin_2.8s_linear_infinite]" />
            <span className="border-loader-sand-top border-loader-sand-bottom border-loader-sand-left absolute inset-[19px] rounded-full border-[3px] border-transparent animate-[spin_2.2s_linear_infinite_reverse]" />
            <span className="border-loader-coral-top border-loader-coral-bottom border-loader-coral-left absolute inset-[33px] rounded-full border-[3px] border-transparent animate-[spin_1.6s_linear_infinite]" />
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
    </PageContainer>
  );
}
