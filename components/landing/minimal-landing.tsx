"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, HeartHandshake, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/ui/page-background";
import { PageContainer } from "@/components/ui/page-container";
import { PageIntro } from "@/components/ui/page-intro";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { AboutSupportDialog } from "@/components/landing/about-support-dialog";
import { SemesterDialog } from "@/components/landing/semester-dialog";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  createSemester,
  getSuggestedSemesters,
} from "@/lib/course/semester-utils";

function SemesterCardSkeleton({ index }: { index: number }) {
  const titleWidths = ["w-32", "w-28", "w-36"];
  const subtitleWidths = ["w-44", "w-36", "w-48"];

  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-[14px] bg-surface-soft px-4 py-3 shadow-card sm:rounded-[18px] sm:px-5 sm:py-3.5"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2 py-0.5">
          <div
            className={`h-4 ${titleWidths[index % titleWidths.length]} rounded-md bg-ink-subtle/15`}
          />
          <div
            className={`h-3 ${subtitleWidths[index % subtitleWidths.length]} rounded-md bg-ink-subtle/10`}
          />
        </div>
        <div className="h-4.5 w-4.5 shrink-0 rounded-full bg-ink-subtle/10" />
      </div>
    </div>
  );
}

export function MinimalLanding() {
  const router = useRouter();
  const { addSemester, deleteSemester, semesters, selectSemester } =
    useCourses();
  const {
    isAuthenticated,
    isConfigured,
    isReady,
    isRestoringSession,
    isSyncEnabled,
    isSyncing,
    lastSyncedAt,
  } = useSyncConnection();
  const [suggestionNames, setSuggestionNames] = useState<string[]>([]);

  const isLandingLoading =
    semesters.length === 0 &&
    ((isConfigured && !isReady && isSyncEnabled) ||
      isRestoringSession ||
      (isAuthenticated && (isSyncing || lastSyncedAt === null)));

  const existingNames = new Set(semesters.map((semester) => semester.name));
  const suggestions = getSuggestedSemesters().filter(
    (suggestion) =>
      suggestionNames.includes(suggestion.name) &&
      !existingNames.has(suggestion.name),
  );

  useEffect(() => {
    setSuggestionNames(
      getSuggestedSemesters().map((suggestion) => suggestion.name),
    );
  }, []);

  function openSemester(semesterId: string) {
    selectSemester(semesterId);
    router.push(`/courses?semester=${semesterId}`);
  }

  function createSuggestedSemester(name: string, periodLabel: string) {
    const semester = createSemester({
      name,
      periodLabel,
    });
    addSemester(semester);
    router.push(`/courses?semester=${semester.id}`);
  }

  function removeSemester(semesterId: string, semesterName: string) {
    const confirmed = window.confirm(
      `Delete "${semesterName}"? This will remove its courses and assignments from your local state.`,
    );

    if (!confirmed) {
      return;
    }

    deleteSemester(semesterId);
  }

  function getSuggestionPillLabel(name: string) {
    return name.replace(/^Semester /, "Sem ");
  }

  return (
    <PageContainer className="flex h-[calc(100dvh-var(--app-header-height,5.5rem))] flex-col overflow-hidden px-3 pt-7 pb-0 sm:px-8 sm:pt-12 sm:pb-4">
      <PageBackground variant="landing" />
      <PageIntro
        badge="GradeLog"
        descriptionClassName="sm:text-[1.08rem] sm:leading-7"
        description="Keep track of your marks and know exactly where you stand."
        maxWidthClassName="max-w-2xl"
        title="Your semesters"
      >
        {isLandingLoading ? (
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-line/80 bg-surface-soft px-3 py-1.5 text-[0.74rem] font-medium text-ink-muted shadow-none sm:mt-4 sm:bg-surface sm:px-3.5 sm:py-2 sm:text-[0.78rem] sm:shadow-card">
            <span className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
            Restoring your semesters...
          </div>
        ) : isAuthenticated ? (
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-line/80 bg-surface-soft px-3 py-1.5 text-[0.74rem] font-medium text-ink-soft shadow-none sm:mt-4 sm:bg-surface sm:px-3.5 sm:py-2 sm:text-[0.78rem] sm:shadow-card">
            <span className="h-2 w-2 rounded-full bg-success-solid" />
            Sync active. Connected across devices.
          </div>
        ) : (
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-line/80 bg-surface-soft px-3 py-1.5 text-[0.74rem] font-medium text-ink-soft shadow-none sm:mt-4 sm:bg-surface sm:px-3.5 sm:py-2 sm:text-[0.78rem] sm:shadow-card">
            <span className="bg-brand-teal h-2 w-2 rounded-full" />
            Private. No sign up. Works offline.
          </div>
        )}
      </PageIntro>

      {!isLandingLoading && suggestions.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:flex sm:flex-wrap">
          {suggestions.map((suggestion) => (
            <Button
              className="min-w-0 bg-surface-soft px-2 text-[0.7rem] text-ink-soft shadow-card hover:bg-surface hover:text-foreground sm:px-3 sm:text-xs"
              key={suggestion.name}
              onClick={() =>
                createSuggestedSemester(suggestion.name, suggestion.periodLabel)
              }
              size="sm"
              type="button"
              variant="secondary"
            >
              <span className="truncate">
                + {getSuggestionPillLabel(suggestion.name)}
              </span>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-6 sm:mt-8 sm:pb-3">
        <div className="grid gap-2.5 sm:gap-3">
          {isLandingLoading ? (
            <>
              <SemesterCardSkeleton index={0} />
              <SemesterCardSkeleton index={1} />
              <SemesterCardSkeleton index={2} />
            </>
          ) : (
            <>
              {semesters.map((semester) => (
                <div className="relative" key={semester.id}>
                  <button
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-surface-soft px-4 py-3 pr-24 text-left shadow-card transition active:scale-[0.985] hover:bg-surface sm:gap-3.5 sm:rounded-[18px] sm:px-5 sm:py-3.5 sm:pr-28"
                    onClick={() => openSemester(semester.id)}
                    type="button"
                  >
                    <div className="min-w-0">
                      <p className="text-[1rem] font-semibold leading-tight text-foreground sm:text-[1.02rem]">
                        {semester.name}
                      </p>
                      <p className="mt-1 text-[0.92rem] text-ink-muted sm:text-sm">
                        {semester.periodLabel}
                      </p>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 shrink-0 text-ink-subtle transition group-hover:text-ink-strong" />
                  </button>
                  <RowActionMenu
                    className="absolute top-1/2 right-3 -translate-y-1/2 sm:top-4 sm:right-4 sm:translate-y-0"
                    items={[
                      {
                        icon: <Trash2 className="h-4 w-4" />,
                        id: "delete",
                        label: "Delete",
                        onSelect: () =>
                          removeSemester(semester.id, semester.name),
                        tone: "danger",
                      },
                    ]}
                    label={`More actions for ${semester.name}`}
                  />
                </div>
              ))}
              <SemesterDialog
                onSaveSemester={addSemester}
                triggerAsChild
                triggerChildren={
                  <Button
                    className="min-h-[64px] w-full rounded-[14px] border border-dashed border-line bg-transparent px-4 py-3 text-ink-muted shadow-none hover:border-foreground/28 hover:bg-transparent hover:text-foreground sm:min-h-[82px] sm:rounded-[18px] sm:px-5 sm:py-3.5"
                    size={null}
                    type="button"
                    variant="secondary"
                  >
                    <div className="flex flex-col items-center text-center">
                      <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
                      <span className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.14em] sm:mt-2 sm:text-[0.82rem]">
                        New semester
                      </span>
                    </div>
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-line/70 py-3 pb-safe text-center sm:py-3.5">
        <AboutSupportDialog
          triggerAsChild
          triggerChildren={
            <button
              className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-ink-muted transition hover:text-foreground"
              type="button"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              About &amp; support
            </button>
          }
        />
      </div>
    </PageContainer>
  );
}
