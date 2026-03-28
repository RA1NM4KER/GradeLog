"use client";

import { SyntheticEvent, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course, SingleAssessment } from "@/lib/types";

interface AssessmentDialogProps {
  course: Course;
  onSaveAssessment: (courseId: string, assessment: SingleAssessment) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  assessment?: SingleAssessment;
}

export function AssessmentDialog({
  course,
  onSaveAssessment,
  triggerLabel = "Add assignment",
  triggerVariant = "outline",
  assessment,
}: AssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: assessment?.name ?? "",
    weight: String(assessment?.weight ?? 20),
  });

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const nextAssessment: SingleAssessment = {
      kind: "single",
      id: assessment?.id ?? crypto.randomUUID(),
      name: form.name,
      weight: Number(form.weight),
      scoreAchieved: assessment?.scoreAchieved ?? null,
      totalPossible: 100,
      dueDate: assessment?.dueDate ?? "",
      category: assessment?.category ?? "assignment",
      status: assessment?.status ?? "ongoing",
    };

    onSaveAssessment(course.id, nextAssessment);
    setForm({
      name: assessment?.name ?? "",
      weight: String(assessment?.weight ?? 20),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {assessment ? "Edit assignment" : "Add assignment"}
          </DialogTitle>
          <DialogDescription>{course.code}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="assessment-name">Assignment name</Label>
            <Input
              id="assessment-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Midterm Essay"
              required
              value={form.name}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assessment-weight">Weight (%)</Label>
              <Input
                id="assessment-weight"
                max={100}
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    weight: event.target.value,
                  }))
                }
                required
                type="number"
                value={form.weight}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {assessment ? "Save changes" : "Save assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
