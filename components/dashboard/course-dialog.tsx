"use client";

import { ReactNode, SyntheticEvent, useState } from "react";

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
import { Course } from "@/lib/types";

const defaultGradeBands = [
  { id: "grade-band-a", label: "A", threshold: 80 },
  { id: "grade-band-b", label: "B", threshold: 70 },
  { id: "grade-band-c", label: "C", threshold: 60 },
  { id: "grade-band-d", label: "D", threshold: 50 },
];

interface CourseDialogProps {
  onSaveCourse: (course: Course) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "outline" | "ghost";
  course?: Course;
  triggerAsChild?: boolean;
  triggerChildren?: ReactNode;
}

export function CourseDialog({
  onSaveCourse,
  triggerLabel = "Add course",
  triggerVariant = "default",
  course,
  triggerAsChild = false,
  triggerChildren,
}: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: course?.code ?? "",
    name: course?.name ?? "",
    instructor: course?.instructor ?? "",
    credits: String(course?.credits ?? 12),
  });

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    const nextCourse: Course = {
      id: course?.id ?? crypto.randomUUID(),
      code: form.code.toUpperCase(),
      name: form.name,
      instructor: form.instructor,
      credits: Number(form.credits),
      accent: course?.accent ?? "from-stone-950 via-stone-900 to-stone-700",
      gradeBands:
        course?.gradeBands ??
        defaultGradeBands.map((band) => ({
          ...band,
          id: `${form.code.toLowerCase() || "course"}-${band.id}`,
        })),
      assessments: course?.assessments ?? [],
    };

    onSaveCourse(nextCourse);
    setForm({
      code: course?.code ?? "",
      name: course?.name ?? "",
      instructor: course?.instructor ?? "",
      credits: String(course?.credits ?? 12),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerChildren ? (
        <DialogTrigger asChild={triggerAsChild}>
          {triggerChildren}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant={triggerVariant}>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Edit module" : "Add module"}</DialogTitle>
          <DialogDescription>
            {course ? "Update module details." : "Create a module."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-code">Course code</Label>
              <Input
                id="course-code"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase().slice(0, 7),
                  }))
                }
                maxLength={7}
                placeholder="ECO214"
                required
                value={form.code}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-credits">Credits</Label>
              <Input
                id="course-credits"
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    credits: event.target.value,
                  }))
                }
                required
                type="number"
                value={form.credits}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-name">Course title</Label>
            <Input
              id="course-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Behavioral Economics"
              required
              value={form.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-instructor">Lecturer</Label>
            <Input
              id="course-instructor"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  instructor: event.target.value,
                }))
              }
              placeholder="Dr. Maya Patel"
              required
              value={form.instructor}
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              {course ? "Save changes" : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
