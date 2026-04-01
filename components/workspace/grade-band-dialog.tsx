"use client";

import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GradeBandEditor } from "@/components/workspace/grade-band-editor";
import { GradeBand } from "@/lib/types";

const dialogPrimaryButtonClassName =
  "border border-white/35 bg-white/70 text-foreground shadow-[0_10px_24px_rgba(28,25,23,0.08)] backdrop-blur-sm hover:bg-white/85 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12";

interface GradeBandDialogProps {
  bands: GradeBand[];
  onSave: (bands: GradeBand[]) => void;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function GradeBandDialog({
  bands,
  onSave,
  triggerAsChild = false,
  triggerChildren,
}: GradeBandDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftBands, setDraftBands] = useState(bands);

  useEffect(() => {
    if (open) {
      setDraftBands(bands);
    }
  }, [bands, open]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild={triggerAsChild}>{triggerChildren}</DialogTrigger>
      <DialogContent className="flex max-h-[92vh] w-[min(94vw,640px)] flex-col overflow-hidden rounded-[28px] p-4 sm:rounded-[32px] sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit cutoffs</DialogTitle>
          <DialogDescription>
            Choose the grade bands you want to track and set their cutoffs.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <GradeBandEditor bands={draftBands} onChange={setDraftBands} />
        </div>
        <DialogFooter className="shrink-0 pt-3">
          <Button
            className={dialogPrimaryButtonClassName}
            onClick={() => {
              onSave(draftBands);
              setOpen(false);
            }}
            type="button"
          >
            Save cutoffs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
