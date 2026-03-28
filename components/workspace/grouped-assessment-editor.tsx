"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WorkspaceTable,
  WorkspaceTableCell,
  WorkspaceTableFrame,
  WorkspaceTableHeader,
  WorkspaceTableHeaderCell,
  WorkspaceTableRow,
} from "@/components/workspace/workspace-table";
import {
  getGroupedAssessmentDefinition,
  normalizeDropLowest,
  resizeGroupedAssessmentItems,
} from "@/lib/grouped-assessment-utils";
import {
  GroupedAssessment,
  GroupedAssessmentCategory,
  GroupedAssessmentItem,
} from "@/lib/types";

const inlineGroupedInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-center text-sm font-medium leading-normal text-stone-950 shadow-none focus-visible:ring-0";

const inlineGroupedNumberInputClassName =
  "h-auto w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium leading-normal text-stone-950 shadow-none [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

interface GroupedAssessmentEditorProps {
  category: GroupedAssessmentCategory;
  value: {
    name: string;
    weight: string;
    itemCount: number;
    dropLowest: number;
    items: GroupedAssessmentItem[];
  };
  onChange: (nextValue: GroupedAssessmentEditorProps["value"]) => void;
}

export function GroupedAssessmentEditor({
  category,
  value,
  onChange,
}: GroupedAssessmentEditorProps) {
  const definition = getGroupedAssessmentDefinition(category);
  const dropLowest = normalizeDropLowest(value.dropLowest, value.itemCount);

  function update(updates: Partial<GroupedAssessmentEditorProps["value"]>) {
    onChange({
      ...value,
      ...updates,
    });
  }

  function updateItem(itemId: string, updates: Partial<GroupedAssessmentItem>) {
    update({
      items: value.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    });
  }

  return (
    <div className="grid max-w-[760px] gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`${category}-name`}>Category name</Label>
          <Input
            className="text-center"
            id={`${category}-name`}
            onChange={(event) => update({ name: event.target.value })}
            value={value.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-weight`}>Total weight (%)</Label>
          <Input
            className="text-center"
            id={`${category}-weight`}
            max={100}
            min={0}
            onChange={(event) => update({ weight: event.target.value })}
            type="number"
            value={value.weight}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-count`}>Number of items</Label>
          <Input
            className="text-center"
            id={`${category}-count`}
            max={20}
            min={1}
            onChange={(event) => {
              const nextCount = Math.max(Number(event.target.value) || 1, 1);
              const nextItems = resizeGroupedAssessmentItems(
                category,
                nextCount,
                value.items,
              );

              update({
                itemCount: nextItems.length,
                items: nextItems,
                dropLowest: normalizeDropLowest(
                  value.dropLowest,
                  nextItems.length,
                ),
              });
            }}
            type="number"
            value={value.itemCount}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${category}-drop`}>Drop lowest</Label>
          <Input
            className="text-center"
            id={`${category}-drop`}
            max={Math.max(value.itemCount - 1, 0)}
            min={0}
            onChange={(event) =>
              update({
                dropLowest: normalizeDropLowest(
                  Number(event.target.value),
                  value.itemCount,
                ),
              })
            }
            type="number"
            value={dropLowest}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-stone-950">
            {definition.label} items
          </p>
          <p className="text-sm text-stone-500">
            Rename items and capture marks directly in the table.
          </p>
        </div>

        <WorkspaceTableFrame className="mx-auto inline-block max-h-[48vh] w-fit max-w-full rounded-[20px]">
          <WorkspaceTable className="w-auto min-w-[440px] table-auto">
            <WorkspaceTableHeader className="text-[11px] tracking-[0.14em]">
              <tr>
                <WorkspaceTableHeaderCell className="w-[280px] py-2.5 text-center lg:px-5 lg:py-3">
                  Title
                </WorkspaceTableHeaderCell>
                <WorkspaceTableHeaderCell className="w-[120px] py-2.5 text-center lg:px-5 lg:py-3">
                  Mark
                </WorkspaceTableHeaderCell>
              </tr>
            </WorkspaceTableHeader>
            <tbody>
              {value.items.map((item) => (
                <WorkspaceTableRow key={item.id}>
                  <WorkspaceTableCell className="py-2.5 lg:px-5 lg:py-3">
                    <Input
                      className={inlineGroupedInputClassName}
                      id={`${category}-label-${item.id}`}
                      onChange={(event) =>
                        updateItem(item.id, { label: event.target.value })
                      }
                      value={item.label}
                    />
                  </WorkspaceTableCell>
                  <WorkspaceTableCell className="py-2.5 text-center lg:px-5 lg:py-3">
                    <GroupedScoreInput
                      id={`${category}-score-${item.id}`}
                      onCommit={(scoreAchieved) =>
                        updateItem(item.id, {
                          scoreAchieved,
                          totalPossible: 100,
                        })
                      }
                      value={item.scoreAchieved}
                    />
                  </WorkspaceTableCell>
                </WorkspaceTableRow>
              ))}
            </tbody>
          </WorkspaceTable>
        </WorkspaceTableFrame>
      </div>
    </div>
  );
}

export function getGroupedAssessmentEditorValue(assessment: GroupedAssessment) {
  return {
    name: assessment.name,
    weight: String(assessment.weight),
    itemCount: assessment.items.length,
    dropLowest: assessment.dropLowest,
    items: assessment.items,
  };
}

function GroupedScoreInput({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(formatGroupedScoreInput(value));

  useEffect(() => {
    setDraft(formatGroupedScoreInput(value));
  }, [value]);

  return (
    <div className="relative mx-auto w-[88px]">
      <Input
        className={`${inlineGroupedNumberInputClassName} pr-5 text-center`}
        id={id}
        inputMode="decimal"
        onBlur={() => {
          const parsed = parseGroupedScoreInput(draft);
          setDraft(formatGroupedScoreInput(parsed));
          onCommit(parsed);
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            setDraft(formatGroupedScoreInput(value));
            event.currentTarget.blur();
          }
        }}
        placeholder="--"
        type="text"
        value={draft}
      />
      {draft.trim() !== "" && !draft.includes("/") ? (
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          %
        </span>
      ) : null}
    </div>
  );
}

function parseGroupedScoreInput(value: string) {
  const normalized = value.trim();
  if (normalized === "") {
    return null;
  }

  if (normalized.includes("/")) {
    const [left, right] = normalized
      .split("/")
      .map((part) => Number(part.trim()));

    if (Number.isFinite(left) && Number.isFinite(right) && right > 0) {
      return roundGroupedScore((left / right) * 100);
    }

    return null;
  }

  const numeric = Number(normalized.replace("%", "").trim());
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return roundGroupedScore(numeric);
}

function formatGroupedScoreInput(value: number | null) {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : String(value);
}

function roundGroupedScore(value: number) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return Math.round(clamped * 10) / 10;
}
