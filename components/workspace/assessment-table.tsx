"use client";

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import { FlaskConical, GripVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssessmentComposerDialog } from "@/components/workspace/assessment-composer-dialog";
import { GroupedAssessmentDialog } from "@/components/workspace/grouped-assessment-dialog";
import {
  WorkspaceTable,
  WorkspaceTableCell,
  WorkspaceTableFrame,
  WorkspaceTableHeader,
  WorkspaceTableHeaderCell,
  WorkspaceTableRow,
} from "@/components/workspace/workspace-table";
import {
  formatPercent,
  getAssessmentPercent,
  getGroupedAssessmentMetrics,
  isSingleAssessment,
} from "@/lib/grade-utils";
import {
  Assessment,
  Module,
  GroupedAssessment,
  SingleAssessment,
} from "@/lib/types";

interface AssessmentTableProps {
  module: Module;
  isExperimenting: boolean;
  onToggleExperiment: () => void;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  onReorderAssessments: (
    moduleId: string,
    fromAssessmentId: string,
    toAssessmentId: string,
  ) => void;
}

const inlineTextInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-base font-medium leading-normal text-stone-950 shadow-none focus-visible:ring-0";

const inlineValueInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-stone-950 shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function AssessmentTable({
  module,
  isExperimenting,
  onToggleExperiment,
  onSaveAssessment,
  onReorderAssessments,
}: AssessmentTableProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="grid min-h-0 content-start">
      <div className="hidden md:block">
        <WorkspaceTableFrame>
          <WorkspaceTable>
            <WorkspaceTableHeader>
              <tr>
                <WorkspaceTableHeaderCell className="w-7 px-1 text-center align-middle lg:w-8 lg:px-2 min-[1024px]:max-[1120px]:w-6 min-[1024px]:max-[1120px]:px-0.5">
                  <div className="flex justify-center">
                    <Button
                      aria-label={
                        isExperimenting
                          ? "Stop experiment mode"
                          : "Start experiment mode"
                      }
                      className={`group relative h-auto w-auto rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent ${
                        isExperimenting
                          ? "text-sky-600"
                          : "text-stone-400 hover:text-sky-600"
                      }`}
                      onClick={onToggleExperiment}
                      size="icon"
                      title={
                        isExperimenting
                          ? "Stop experiment mode"
                          : "Experiment mode"
                      }
                      type="button"
                      variant="ghost"
                    >
                      <span className="pointer-events-none absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-[7px] rounded-full bg-sky-400/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-400/80 group-hover:opacity-100 group-hover:animate-ping" />
                      <span
                        className="pointer-events-none absolute -top-2 left-1/2 h-1 w-1 -translate-x-[1px] rounded-full bg-sky-300/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-300/90 group-hover:opacity-100 group-hover:animate-ping"
                        style={{ animationDelay: "120ms" }}
                      />
                      <span
                        className="pointer-events-none absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-[5px] rounded-full bg-sky-200/0 opacity-0 transition-opacity duration-200 group-hover:bg-sky-200/90 group-hover:opacity-100 group-hover:animate-ping"
                        style={{ animationDelay: "240ms" }}
                      />
                      <FlaskConical className="-scale-x-100 h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                    </Button>
                  </div>
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[48%] min-[1024px]:max-[1120px]:px-2">
                  Assignment
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[18%] min-[1024px]:max-[1120px]:px-2">
                  Weight
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[22%] min-[1024px]:max-[1120px]:px-2">
                  Grade
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {module.assessments.map((assessment) =>
                isSingleAssessment(assessment) ? (
                  <SingleAssessmentRow
                    assessment={assessment}
                    module={module}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(module.id, fromId, toId)
                    }
                    onSaveAssessment={onSaveAssessment}
                  />
                ) : (
                  <GroupedAssessmentRow
                    assessment={assessment}
                    module={module}
                    draggingId={draggingId}
                    key={assessment.id}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={() => setDraggingId(assessment.id)}
                    onDropRow={(fromId, toId) =>
                      onReorderAssessments(module.id, fromId, toId)
                    }
                    onSaveAssessment={onSaveAssessment}
                  />
                ),
              )}
              <AddAssessmentRow
                module={module}
                onSaveAssessment={onSaveAssessment}
              />
            </tbody>
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>

      <div className="grid max-h-full gap-3 overflow-auto md:hidden">
        <WorkspaceTableFrame className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                aria-label="Start experiment mode"
                className={`h-8 w-8 rounded-full border bg-white/90 p-0 shadow-none hover:bg-white hover:text-sky-600 ${
                  isExperimenting
                    ? "border-sky-200 text-sky-600"
                    : "border-stone-200 text-stone-500"
                }`}
                onClick={onToggleExperiment}
                size="icon"
                type="button"
                variant="ghost"
              >
                <FlaskConical className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">
                Assignments
              </p>
            </div>
            <AssessmentComposerDialog
              module={module}
              onSaveAssessment={onSaveAssessment}
              triggerAsChild
              triggerChildren={
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white/90 px-3.5 text-sm font-semibold text-stone-900 transition hover:bg-white"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              }
            />
          </div>

          <WorkspaceTable className="table-auto">
            <WorkspaceTableHeader>
              <tr>
                <WorkspaceTableHeaderCell className="w-[48%] px-4 py-2.5 text-[0.65rem]">
                  Name
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[22%] px-3 py-2.5 text-[0.65rem]">
                  Weight
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[30%] px-4 py-2.5 text-[0.65rem] text-right">
                  Grade
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {module.assessments.map((assessment) =>
                isSingleAssessment(assessment) ? (
                  <MobileSingleAssessmentRow
                    assessment={assessment}
                    key={assessment.id}
                    moduleId={module.id}
                    onSaveAssessment={onSaveAssessment}
                  />
                ) : (
                  <MobileGroupedAssessmentRow
                    assessment={assessment}
                    key={assessment.id}
                    moduleId={module.id}
                    onSaveAssessment={onSaveAssessment}
                  />
                ),
              )}
              <tr className="border-t border-stone-200/80 bg-white/80">
                <td className="px-4 py-3" colSpan={3}>
                  <AssessmentComposerDialog
                    module={module}
                    onSaveAssessment={onSaveAssessment}
                    triggerAsChild
                    triggerChildren={
                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 px-4 py-3 text-sm font-medium text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        New assignment
                      </button>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>
    </div>
  );
}

function AddAssessmentRow({
  module,
  onSaveAssessment,
}: {
  module: Module;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  return (
    <WorkspaceTableRow className="bg-stone-100/90">
      <WorkspaceTableCell className="px-1 py-2 text-center lg:px-2 min-[1024px]:max-[1120px]:px-0.5">
        <Plus className="mx-auto h-3.5 w-3.5 text-stone-500" />
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-2 lg:px-5 min-[1024px]:max-[1120px]:px-2"
        colSpan={3}
      >
        <AssessmentComposerDialog
          module={module}
          onSaveAssessment={onSaveAssessment}
          triggerAsChild
          triggerChildren={
            <button
              className="flex w-full items-center text-left text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:text-stone-900"
              type="button"
            >
              Add assignment
            </button>
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function SingleAssessmentRow({
  module,
  assessment,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  module: Module;
  assessment: SingleAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  return (
    <WorkspaceTableRow
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingId) {
          onDropRow(draggingId, assessment.id);
        }
      }}
    >
      <WorkspaceTableCell className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-0.5">
        <button
          className="cursor-grab text-stone-300 transition hover:text-stone-500 active:cursor-grabbing"
          draggable
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          type="button"
        >
          <GripVertical className="mx-auto h-4 w-4" />
        </button>
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineText
          align="left"
          display={
            <p className="cursor-text font-medium text-stone-950">
              {assessment.name}
            </p>
          }
          onCommit={(name) =>
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          onCommit={(weight) =>
            onSaveAssessment(module.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        <InlineAssessmentResult
          align="left"
          assessment={assessment}
          onCommit={(scoreAchieved) =>
            onSaveAssessment(module.id, {
              ...assessment,
              scoreAchieved,
              totalPossible: 100,
              status: scoreAchieved === null ? "ongoing" : "completed",
            })
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function GroupedAssessmentRow({
  module,
  assessment,
  onSaveAssessment,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  module: Module;
  assessment: GroupedAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
  draggingId: string | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: (fromId: string, toId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);

  return (
    <WorkspaceTableRow
      className="cursor-pointer transition hover:bg-stone-50/70"
      onClick={() => setOpen(true)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingId) {
          onDropRow(draggingId, assessment.id);
        }
      }}
    >
      <WorkspaceTableCell
        className="px-1 py-3 text-center lg:px-2 lg:py-4 min-[1024px]:max-[1120px]:px-0.5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="cursor-grab text-stone-300 transition hover:text-stone-500 active:cursor-grabbing"
          draggable
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          type="button"
        >
          <GripVertical className="mx-auto h-4 w-4" />
        </button>
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <InlineText
          align="left"
          display={
            <div className="cursor-text font-medium text-stone-950">
              <span>{assessment.name}</span>
              <span className="ml-1.5 text-sm font-normal text-stone-400">
                ({metrics.totalCount})
              </span>
            </div>
          }
          onCommit={(name) =>
            onSaveAssessment(module.id, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell
        className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2"
        onClick={(event) => event.stopPropagation()}
      >
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          onCommit={(weight) =>
            onSaveAssessment(module.id, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-3 text-sm text-stone-600 lg:px-5 lg:py-4 min-[1024px]:max-[1120px]:px-2">
        {metrics.currentPercent === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <div className="font-medium text-stone-950">
            <span className="text-stone-400">Av:</span>{" "}
            <span>{formatPercent(metrics.currentPercent)}</span>
          </div>
        )}
      </WorkspaceTableCell>
      <GroupedAssessmentDialog
        assessment={assessment}
        moduleId={module.id}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </WorkspaceTableRow>
  );
}

function MobileSingleAssessmentRow({
  moduleId,
  assessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: SingleAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  return (
    <WorkspaceTableRow>
      <WorkspaceTableCell className="px-4 py-2.5 align-top">
        <InlineText
          display={
            <span className="block text-sm font-medium text-stone-950">
              {assessment.name}
            </span>
          }
          onCommit={(name) =>
            onSaveAssessment(moduleId, { ...assessment, name })
          }
          value={assessment.name}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-2.5 align-top text-sm text-stone-600">
        <InlineNumber
          align="left"
          display={String(assessment.weight)}
          onCommit={(weight) =>
            onSaveAssessment(moduleId, { ...assessment, weight })
          }
          value={assessment.weight}
        />
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-4 py-2.5 align-top text-right text-sm text-stone-600">
        <InlineAssessmentResult
          align="right"
          assessment={assessment}
          onCommit={(scoreAchieved) =>
            onSaveAssessment(moduleId, {
              ...assessment,
              scoreAchieved,
              totalPossible: 100,
              status: scoreAchieved === null ? "ongoing" : "completed",
            })
          }
        />
      </WorkspaceTableCell>
    </WorkspaceTableRow>
  );
}

function MobileGroupedAssessmentRow({
  moduleId,
  assessment,
  onSaveAssessment,
}: {
  moduleId: string;
  assessment: GroupedAssessment;
  onSaveAssessment: (moduleId: string, assessment: Assessment) => void;
}) {
  const [open, setOpen] = useState(false);
  const metrics = getGroupedAssessmentMetrics(assessment);

  return (
    <WorkspaceTableRow
      className="cursor-pointer transition hover:bg-stone-50/70"
      onClick={() => setOpen(true)}
    >
      <WorkspaceTableCell className="px-4 py-2.5 align-top">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-950">
            {assessment.name}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            {metrics.gradedCount}/{metrics.totalCount} graded
          </p>
        </div>
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-3 py-2.5 align-top text-sm font-medium text-stone-700">
        {assessment.weight}
      </WorkspaceTableCell>
      <WorkspaceTableCell className="px-4 py-2.5 align-top text-right text-sm">
        {metrics.currentPercent === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <span className="font-medium text-stone-950">
            {formatPercent(metrics.currentPercent)}
          </span>
        )}
      </WorkspaceTableCell>
      <GroupedAssessmentDialog
        assessment={assessment}
        moduleId={moduleId}
        onOpenChange={setOpen}
        onSaveAssessment={onSaveAssessment}
        open={open}
        triggerChildren={<span className="hidden" />}
        triggerAsChild
      />
    </WorkspaceTableRow>
  );
}

function InlineText({
  value,
  display,
  onCommit,
  align = "left",
}: {
  value: string;
  display: ReactNode;
  onCommit: (value: string) => void;
  align?: "left" | "center" | "right";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`-mx-2 -my-3 block w-full px-2 py-3 ${
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left"
        }`}
        onClick={() => setEditing(true)}
        type="button"
      >
        {display}
      </button>
    );
  }

  return (
    <Input
      className={`${inlineTextInputClassName} ${
        align === "center"
          ? "text-center"
          : align === "right"
            ? "text-right"
            : "text-left"
      }`}
      onBlur={() => {
        setEditing(false);
        if (draft !== value) {
          onCommit(draft);
        }
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          inputRef.current?.blur();
        }
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      ref={inputRef}
      value={draft}
    />
  );
}

function InlineNumber({
  value,
  display,
  onCommit,
  align = "left",
}: {
  value: number;
  display: string;
  onCommit: (value: number) => void;
  align?: "left" | "center" | "right";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`-mx-2 -my-3 block w-full cursor-text px-2 py-3 ${
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left"
        }`}
        onClick={() => setEditing(true)}
        type="button"
      >
        <span className="font-medium text-stone-950">{display}</span>
      </button>
    );
  }

  return (
    <Input
      className={`${inlineValueInputClassName} w-full ${
        align === "center"
          ? "text-center"
          : align === "right"
            ? "text-right"
            : "text-left"
      }`}
      inputMode="decimal"
      onBlur={() => {
        setEditing(false);
        onCommit(parsePlainNumber(draft));
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) =>
        handleInlineNumberKeyDown(event, inputRef, setEditing, setDraft, value)
      }
      ref={inputRef}
      type="text"
      value={draft}
    />
  );
}

function InlineAssessmentResult({
  assessment,
  onCommit,
  align = "left",
}: {
  assessment: SingleAssessment;
  onCommit: (scoreAchieved: number | null) => void;
  align?: "left" | "center" | "right";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    assessment.scoreAchieved === null
      ? ""
      : formatEditablePercent(
          assessment.scoreAchieved,
          assessment.totalPossible,
        ),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(
      assessment.scoreAchieved === null
        ? ""
        : formatEditablePercent(
            assessment.scoreAchieved,
            assessment.totalPossible,
          ),
    );
  }, [assessment.scoreAchieved, assessment.totalPossible]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      placeCaretAtEnd(inputRef.current);
    }
  }, [editing]);

  if (!editing) {
    return (
      <button
        className={`-mx-2 -my-3 block w-full cursor-text px-2 py-3 ${
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left"
        }`}
        onClick={() => setEditing(true)}
        type="button"
      >
        {assessment.scoreAchieved === null ? (
          <span className="text-stone-400">Pending</span>
        ) : (
          <p className="font-medium text-stone-950">
            {formatPercent(getAssessmentPercent(assessment) ?? 0)}
          </p>
        )}
      </button>
    );
  }

  return (
    <Input
      className={`${inlineValueInputClassName} w-full ${
        align === "center"
          ? "text-center"
          : align === "right"
            ? "text-right"
            : "text-left"
      }`}
      onBlur={() => {
        setEditing(false);
        onCommit(parseGradeInput(draft));
      }}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          inputRef.current?.blur();
        }
        if (event.key === "Escape") {
          setDraft(
            assessment.scoreAchieved === null
              ? ""
              : formatEditablePercent(
                  assessment.scoreAchieved,
                  assessment.totalPossible,
                ),
          );
          setEditing(false);
        }
      }}
      ref={inputRef}
      type="text"
      value={draft}
    />
  );
}

function handleInlineNumberKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setEditing: (value: boolean) => void,
  setDraft: (value: string) => void,
  value: number,
) {
  if (event.key === "Enter") {
    inputRef.current?.blur();
  }

  if (event.key === "Escape") {
    setDraft(String(value));
    setEditing(false);
  }
}

function parseGradeInput(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (trimmed.includes("/")) {
    const [left, right] = trimmed.split("/");
    const score = Number(left);
    const total = Number(right);

    if (Number.isFinite(score) && Number.isFinite(total) && total > 0) {
      return Number(((score / total) * 100).toFixed(1));
    }
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function formatEditablePercent(scoreAchieved: number, totalPossible: number) {
  if (totalPossible <= 0) {
    return String(scoreAchieved);
  }

  return String(Number(((scoreAchieved / totalPossible) * 100).toFixed(1)));
}

function parsePlainNumber(value: string) {
  const numeric = Number(value.trim());
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return numeric;
}

function placeCaretAtEnd(input: HTMLInputElement | null) {
  if (!input) {
    return;
  }

  requestAnimationFrame(() => {
    const position = input.value.length;
    input.setSelectionRange(position, position);
  });
}
