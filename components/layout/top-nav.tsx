"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DatabaseBackup,
  FlaskConical,
  Menu,
  Smartphone,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { InstallAppButton } from "@/components/pwa/install-app-button";
import { LocalBackupDialog } from "@/components/pwa/local-backup-dialog";
import { ConnectDevicesDialog } from "@/components/sync/connect-devices-dialog";
import { useSyncConnection } from "@/components/sync/sync-provider";
import { formatLastSyncedAt, getSyncStatusLabel } from "@/lib/sync/sync-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeModePanel, ThemeSelect } from "@/components/theme/theme-select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BrandBackgroundArt } from "@/components/ui/brand-background-art";
import { useActiveBackground } from "@/components/ui/page-background-context";
import { cn } from "@/lib/shared/utils";
import { useCourses } from "@/components/workspace/shared/courses-provider";
import {
  SYNC_STATUS_CONNECTING,
  SYNC_STATUS_ERROR,
  SYNC_STATUS_OFFLINE_PENDING,
  SYNC_STATUS_SYNCING,
  SYNC_STATUS_UP_TO_DATE,
} from "@/lib/sync/types";

export function TopNav() {
  const { appState, isExperimenting, replaceAppState, stopExperiment } =
    useCourses();
  const { isAuthenticated, lastSyncedAt, status } = useSyncConnection();
  const { active, style } = useActiveBackground();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new ResizeObserver(([entry]) => {
      const borderBoxHeight = entry.borderBoxSize?.[0]?.blockSize;
      setHeaderHeight(borderBoxHeight ?? entry.contentRect.height);
    });
    observer.observe(header, { box: "border-box" });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (headerHeight > 0) {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${headerHeight}px`,
      );
    }
  }, [headerHeight]);

  useEffect(() => {
    if (isExperimenting) {
      setMobileMenuOpen(false);
    }
  }, [isExperimenting]);
  const syncLabel = isAuthenticated
    ? getSyncStatusLabel(status)
    : "Connect devices";
  const syncDetail =
    isAuthenticated && status === SYNC_STATUS_UP_TO_DATE
      ? formatLastSyncedAt(lastSyncedAt)
      : null;

  function renderSyncIndicator() {
    if (status === SYNC_STATUS_SYNCING || status === SYNC_STATUS_CONNECTING) {
      return <LoadingSpinner className="text-ink-muted" size="sm" />;
    }

    return (
      <span
        className={
          status === SYNC_STATUS_UP_TO_DATE
            ? "h-2 w-2 rounded-full bg-success-solid"
            : status === SYNC_STATUS_OFFLINE_PENDING
              ? "h-2 w-2 rounded-full bg-warning-solid"
              : status === SYNC_STATUS_ERROR
                ? "h-2 w-2 rounded-full bg-danger-solid"
                : "h-2 w-2 rounded-full bg-ink-muted/40"
        }
      />
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-canvas pt-safe" ref={headerRef}>
      {active && headerHeight > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ clipPath: `inset(0 0 calc(100% - ${headerHeight}px) 0)` }}
        >
          <BrandBackgroundArt
            className="absolute inset-0 h-full w-full"
            style={style}
            variant={active}
          />
        </div>
      )}
      <div className="relative mx-auto h-14 max-w-7xl overflow-hidden sm:hidden">
        <div
          aria-hidden={isExperimenting}
          className={cn(
            "absolute inset-0 flex items-center justify-between gap-3 px-4 transition-[transform,opacity] duration-[600ms] ease-in-out motion-reduce:transition-none",
            isExperimenting
              ? "pointer-events-none -translate-y-full opacity-0"
              : "translate-y-0 opacity-100",
          )}
          inert={isExperimenting}
        >
          <BrandLink />
          <nav className="flex items-center gap-1">
            <Link
              className="px-1 text-sm font-medium text-ink-strong transition hover:text-foreground"
              href="/"
              prefetch={false}
            >
              Semesters
            </Link>
            <Button
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              size="icon-responsive"
              type="button"
              variant="ghost"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          </nav>
        </div>

        <div
          aria-hidden={!isExperimenting}
          aria-live="polite"
          className={cn(
            "absolute inset-0 flex items-center justify-between gap-3 px-4 transition-[transform,opacity] duration-[600ms] ease-in-out motion-reduce:transition-none",
            isExperimenting
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-0",
          )}
          inert={!isExperimenting}
        >
          <div className="flex min-w-0 items-center gap-2 text-experiment-accent-strong">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-experiment-accent-soft bg-experiment-accent-soft">
              <span className="pointer-events-none absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-[7px] animate-ping rounded-full bg-experiment-ping-1 [animation-duration:1.8s]" />
              <span className="pointer-events-none absolute -top-1.5 left-1/2 h-1 w-1 translate-x-[2px] animate-ping rounded-full bg-experiment-ping-2 [animation-delay:300ms] [animation-duration:2.1s]" />
              <span className="pointer-events-none absolute top-0 left-1/2 h-1 w-1 -translate-x-[2px] animate-ping rounded-full bg-experiment-ping-3 [animation-delay:650ms] [animation-duration:1.6s]" />
              <FlaskConical className="h-4 w-4" />
            </span>
            <span className="truncate text-sm font-semibold">
              Experiment mode is on
            </span>
          </div>
          <Button
            className="h-8 shrink-0 rounded-full border border-white/60 bg-white/75 px-3 text-xs font-semibold text-[hsl(277_44%_16%)] shadow-[0_10px_28px_-18px_rgba(38,20,76,0.5),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl hover:bg-white/90 dark:border-white/20 dark:bg-white/[0.18] dark:hover:bg-white/[0.24]"
            onClick={stopExperiment}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2.75} />
            Exit
          </Button>
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-8 py-3.5 sm:flex">
        <BrandLink />

        <div className="flex min-w-0 flex-1 items-center justify-end">
          <nav className="flex items-center gap-2">
            <ThemeSelect />
            <ConnectDevicesDialog
              triggerAsChild
              triggerChildren={
                <Button
                  size={null}
                  variant="nav"
                  type="button"
                  title={syncDetail ?? undefined}
                >
                  <span className="inline-flex items-center gap-2">
                    {renderSyncIndicator()}
                    {syncLabel}
                  </span>
                </Button>
              }
            />
            <LocalBackupDialog
              appState={appState}
              onRestoreAppStateAction={replaceAppState}
            />
            <Link
              className="ml-1.5 rounded-full border border-line bg-surface-muted px-3.5 py-1.5 text-[13px] font-medium text-ink-strong transition hover:text-foreground"
              href="/"
              prefetch={false}
            >
              Semesters
            </Link>
          </nav>
        </div>
      </div>

      <Dialog onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
        <DialogContent className="left-auto right-0 top-0 grid h-dvh w-[min(86vw,320px)] max-w-none grid-rows-[auto_1fr] translate-x-0 translate-y-0 rounded-none rounded-l-[28px] border-l border-r-0 border-t-0 border-line p-5 motion-safe:data-[state=open]:!animate-sheet-in-right sm:hidden">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-lg">Menu</DialogTitle>
            <DialogDescription>
              Theme, backup, and install controls for this device.
            </DialogDescription>
          </DialogHeader>

          <div className="grid auto-rows-min content-start items-start gap-5 self-start">
            <InstallAppButton
              className="w-full justify-start"
              onInstalledAction={() => setMobileMenuOpen(false)}
            />

            <ThemeModePanel />

            <section className="grid gap-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Data
              </p>
              <LocalBackupDialog
                appState={appState}
                onRestoreAppStateAction={replaceAppState}
                triggerAsChild
                triggerChildren={
                  <Button
                    className="w-full justify-start text-left"
                    size="panel"
                    variant="glass-panel"
                  >
                    <DatabaseBackup className="h-4 w-4" />
                    Backup and restore
                  </Button>
                }
              />
              <ConnectDevicesDialog
                triggerAsChild
                triggerChildren={
                  <Button
                    className="w-full justify-start text-left"
                    size="panel"
                    variant="glass-panel"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="inline-flex items-center gap-2">
                      {renderSyncIndicator()}
                      {isAuthenticated ? syncLabel : "Connect your devices"}
                    </span>
                  </Button>
                }
              />
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function BrandLink() {
  return (
    <Link
      className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-3"
      href="/"
      prefetch={false}
    >
      <div className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
        <Image
          alt="GradeLog logo"
          className="object-contain"
          fill
          sizes="40px"
          src="/logo.svg"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[0.84rem] font-semibold text-foreground sm:text-[0.92rem]">
          GradeLog
        </p>
        <p className="hidden text-xs text-ink-muted sm:block">
          Local-first grade tracking.
        </p>
      </div>
    </Link>
  );
}
