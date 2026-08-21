"use client";

import Link from "next/link";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTriggerAction } from "@/components/ui/dialog-trigger-action";

interface AboutSupportDialogProps {
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function AboutSupportDialog({
  triggerAsChild = false,
  triggerChildren,
}: AboutSupportDialogProps) {
  return (
    <Dialog>
      <DialogTriggerAction asChild={triggerAsChild}>
        {triggerChildren}
      </DialogTriggerAction>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted text-brand">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <DialogTitle>Built by a student, for students</DialogTitle>
          <DialogDescription>
            GradeLog stays free, local-first, and account-free. If it helps,
            you can support its development.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Button
            asChild
            className="border-brand/40 text-brand hover:bg-brand/8"
            size="lg"
            variant="outline"
          >
            <a
              href="https://ko-fi.com/kefasaleck"
              rel="noreferrer"
              target="_blank"
            >
              Buy me a coffee
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
            <Link
              className="text-sm font-medium text-ink-soft underline decoration-ink-soft/40 underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
              href="/privacy"
              prefetch={false}
            >
              Privacy policy
            </Link>
            <Link
              className="text-sm font-medium text-ink-soft underline decoration-ink-soft/40 underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
              href="/terms"
              prefetch={false}
            >
              Terms of service
            </Link>
            <Link
              className="text-sm font-medium text-ink-soft underline decoration-ink-soft/40 underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
              href="/contact"
              prefetch={false}
            >
              Contact
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
