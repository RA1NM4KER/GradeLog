"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Check, Copy, LoaderCircle, QrCode, Share2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";
import {
  buildCourseTemplateQrCode,
  createCourseTemplateShare,
  SharedCourseTemplate,
} from "@/lib/course-template";
import { isSupabaseConfigured } from "@/lib/supabase-browser";

interface ShareCourseTemplateDialogProps {
  course: Course;
  triggerChildren: ReactNode;
}

export function ShareCourseTemplateDialog({
  course,
  triggerChildren,
}: ShareCourseTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [didCopyLink, setDidCopyLink] = useState(false);
  const [shareData, setShareData] = useState<SharedCourseTemplate | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const shareDescription = useMemo(
    () =>
      "Anyone with this link can add this course setup to one of their semesters. Your marks are not included.",
    [],
  );

  useEffect(() => {
    if (!open || !isConfigured) {
      return;
    }

    let cancelled = false;

    async function prepareShareData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextShare = await createCourseTemplateShare(course);
        const nextQrCode = await buildCourseTemplateQrCode(nextShare.shareUrl);

        if (cancelled) {
          return;
        }

        setShareData(nextShare);
        setQrCodeDataUrl(nextQrCode);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The course template link could not be created.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void prepareShareData();

    return () => {
      cancelled = true;
    };
  }, [course, isConfigured, open]);

  useEffect(() => {
    if (!didCopyLink) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDidCopyLink(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [didCopyLink]);

  async function handleCopyLink() {
    if (!shareData?.shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setDidCopyLink(true);
    } catch (error) {
      setDidCopyLink(false);
      throw error;
    }
  }

  async function handleShareLink() {
    if (!shareData?.shareUrl) {
      return;
    }

    if (canUseNativeShare) {
      await navigator.share({
        text: `Add the ${course.name} course setup in GradeLog.`,
        title: `Share ${course.name}`,
        url: shareData.shareUrl,
      });
      return;
    }

    await handleCopyLink();
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{triggerChildren}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share course setup</DialogTitle>
          <DialogDescription>{shareDescription}</DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-100">
            Course sharing needs Supabase to be configured in this build.
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[24px] border border-line bg-surface-panel/60">
            <LoaderCircle className="h-6 w-6 animate-spin text-ink-muted" />
            <p className="text-sm text-ink-soft">Preparing your share link</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-200">
            {errorMessage}
          </div>
        ) : shareData ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-center rounded-[24px] border border-line bg-surface-panel/70 p-4">
                {qrCodeDataUrl ? (
                  <img
                    alt="QR code for the course template share link"
                    className="h-40 w-40 rounded-2xl bg-white p-2"
                    src={qrCodeDataUrl}
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-ink-muted">
                    <QrCode className="h-10 w-10" />
                  </div>
                )}
                <p className="mt-3 text-center text-xs text-ink-soft">
                  Scan to open this course setup on another device.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-line bg-surface-panel/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Share link
                  </p>
                  <p className="mt-2 break-all text-sm text-foreground">
                    {shareData.shareUrl}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={() => void handleCopyLink()}
                    type="button"
                    variant="outline"
                  >
                    {didCopyLink ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {didCopyLink ? "Copied" : "Copy link"}
                  </Button>
                  {canUseNativeShare ? (
                    <Button
                      className="flex-1"
                      onClick={() => void handleShareLink()}
                      type="button"
                    >
                      <Share2 className="h-4 w-4" />
                      Share link
                    </Button>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-line bg-surface-panel/70 p-4 text-sm text-ink-soft">
                  This shares the course layout, assignments, and grading scale.
                  It does not share your marks.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
