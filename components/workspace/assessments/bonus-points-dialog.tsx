"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizePlainNumberInput } from "@/lib/assessments/numeric-input";

export function BonusPointsDialog({
  bonusPoints,
  open,
  onOpenChange,
  onSave,
}: {
  bonusPoints: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bonusPoints: number) => void;
}) {
  const [draft, setDraft] = useState(String(bonusPoints));

  useEffect(() => {
    if (open) {
      setDraft(String(bonusPoints));
    }
  }, [bonusPoints, open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(Math.max(Number(draft) || 0, 0));
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent layout="workspace-compact">
        <DialogHeader>
          <DialogTitle>Bonus points</DialogTitle>
          <DialogDescription>
            Added to your final course grade after weighting. This does not
            change the course weighting.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="course-bonus-points">Bonus points</Label>
            <Input
              autoFocus
              id="course-bonus-points"
              inputMode="decimal"
              min={0}
              onChange={(event) =>
                setDraft(sanitizePlainNumberInput(event.target.value))
              }
              placeholder="0"
              type="text"
              value={draft}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="dialog-primary">
              Save bonus
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
