import { describe, expect, it } from "vitest";

import { GROUPED_ASSESSMENT_CATEGORY } from "@/lib/assessments/types";
import {
  buildGroupedAssessment,
  buildGroupedAssessmentItems,
  getGroupedAssessmentDefaults,
  getGroupedAssessmentDefinition,
  getGroupedAssessmentItemPrefix,
  normalizeDropLowest,
  resizeGroupedAssessmentItems,
} from "@/lib/assessments/grouped-assessment-utils";

describe("grouped-assessment-utils", () => {
  it("returns the grouped assessment definition for tutorials", () => {
    expect(
      getGroupedAssessmentDefinition(GROUPED_ASSESSMENT_CATEGORY.TUTORIALS),
    ).toMatchObject({
      defaultDropLowest: 2,
      defaultItemCount: 10,
      dueDateLabel: "Category series",
      itemPrefix: "Tut",
    });
  });

  it("normalizes common grouped item prefixes", () => {
    expect(getGroupedAssessmentItemPrefix("quizzes")).toBe("Quiz");
    expect(getGroupedAssessmentItemPrefix("quiz")).toBe("Quiz");
    expect(getGroupedAssessmentItemPrefix("tutorials")).toBe("Tutorial");
    expect(getGroupedAssessmentItemPrefix("tut")).toBe("Tut");
    expect(getGroupedAssessmentItemPrefix("labs")).toBe("Lab");
    expect(getGroupedAssessmentItemPrefix("stories")).toBe("Story");
    expect(getGroupedAssessmentItemPrefix("quizes")).toBe("Quiz");
    expect(getGroupedAssessmentItemPrefix("midterm")).toBe("Midterm");
    expect(getGroupedAssessmentItemPrefix("")).toBe("Item");
  });

  it("builds and resizes grouped items while preserving existing entries", () => {
    const initialItems = buildGroupedAssessmentItems(
      GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      2,
      "Tutorials",
    );

    expect(initialItems).toHaveLength(2);
    expect(initialItems[0]?.label).toBe("Tutorial 1");
    expect(initialItems[1]?.label).toBe("Tutorial 2");

    const resizedItems = resizeGroupedAssessmentItems(
      GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      3,
      "Tutorials",
      initialItems,
    );

    expect(resizedItems).toHaveLength(3);
    expect(resizedItems[0]).toBe(initialItems[0]);
    expect(resizedItems[1]).toBe(initialItems[1]);
    expect(resizedItems[2]).toMatchObject({
      label: "Tutorial 3",
      scoreAchieved: null,
      totalPossible: 100,
    });

    const clampedItems = buildGroupedAssessmentItems(
      GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      Number.NaN,
      "Midterm",
    );

    expect(clampedItems).toHaveLength(1);
    expect(clampedItems[0]?.label).toBe("Midterm 1");
  });

  it("clamps dropLowest and builds grouped assessments consistently", () => {
    expect(normalizeDropLowest(10, 3)).toBe(2);
    expect(normalizeDropLowest(-1, 3)).toBe(0);

    const assessment = buildGroupedAssessment(
      GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      {
        dropLowest: 9,
        itemCount: 2,
        name: "Tuts",
        weight: 25,
      },
    );

    expect(assessment).toMatchObject({
      category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      dueDate: "Category series",
      dropLowest: 1,
      kind: "group",
      name: "Tuts",
      status: "ongoing",
      weight: 25,
    });
    expect(assessment.items).toHaveLength(2);
    expect(assessment.items[0]?.label).toBe("Tut 1");
  });

  it("returns the default grouped assessment editor state", () => {
    const defaults = getGroupedAssessmentDefaults(
      GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
    );

    expect(defaults.weight).toBe("20");
    expect(defaults.itemCount).toBe(10);
    expect(defaults.dropLowest).toBe(2);
    expect(defaults.items).toHaveLength(10);
  });
});
