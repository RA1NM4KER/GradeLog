// @vitest-environment jsdom

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("@/components/workspace/course/course-mobile-overview-chart", () => ({
  CourseMobileOverviewChart: ({ ceiling }: { ceiling: number }) => (
    <div data-testid="course-ceiling">{ceiling}</div>
  ),
}));

vi.mock(
  "@/components/workspace/course/course-mobile-overview-needed-grid",
  () => ({
    CourseMobileOverviewNeededGrid: () => <div />,
  }),
);

import { AssessmentTable } from "@/components/workspace/assessments/assessment-table";
import { BonusPointsDialog } from "@/components/workspace/assessments/bonus-points-dialog";
import { CourseMobileOverview } from "@/components/workspace/course/course-mobile-overview";
import type { Course } from "@/lib/course/types";

function makeCourse(
  gradingScale: Course["gradingScale"],
  bonusPoints = 0,
): Course {
  return {
    id: "course-1",
    code: "MAT101",
    name: "Calculus",
    instructor: "",
    credits: 16,
    accent: "teal",
    gradeBands: [],
    gradingScale,
    bonusPoints,
    assessments: [55, 35, 10, 55].map((weight, index) => ({
      id: `assessment-${index + 1}`,
      kind: "single" as const,
      category: "assignment" as const,
      dueDate: "",
      name: `Assignment ${index + 1}`,
      scoreAchieved: null,
      status: "ongoing" as const,
      subminimumPercent: null,
      totalPossible: 100,
      weight,
    })),
  };
}

const tableCallbacks = {
  onDeleteAssessment: vi.fn(),
  onRecordGrade: vi.fn(),
  onReorderAssessments: vi.fn(),
  onSaveAssessment: vi.fn(),
  onToggleExperiment: vi.fn(),
  onUpdateCourse: vi.fn(),
};

describe("course weighting UI", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("shows percentage weight labels and a zero bonus", () => {
    render(
      <AssessmentTable
        {...tableCallbacks}
        isExperimenting={false}
        module={makeCourse("percentage")}
      />,
    );

    expect(screen.getAllByText("Weighting").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Weight").length).toBeGreaterThan(0);
    expect(screen.queryByText("155 pts total")).toBeNull();
    expect(
      within(
        screen.getByRole("toolbar", {
          name: "Assessment actions and weighting",
        }),
      ).queryByText(/pts total/),
    ).toBeNull();
    expect(
      within(
        screen.getByRole("toolbar", {
          name: "Assessment actions and weighting",
        }),
      ).queryByRole("button", { name: "Add" }),
    ).toBeNull();
    expect(screen.getAllByText("+0%").length).toBeGreaterThan(0);
  });

  it("shows point labels, the dynamic total, and a decimal bonus", () => {
    render(
      <AssessmentTable
        {...tableCallbacks}
        isExperimenting={false}
        module={makeCourse("points", 2.5)}
      />,
    );

    expect(screen.getAllByText("Weighting").length).toBeGreaterThan(0);
    const desktopWeightHeading = screen.getByText("Weight pts");
    expect(desktopWeightHeading.closest("th")?.className).toContain(
      "whitespace-nowrap",
    );
    expect(desktopWeightHeading.closest("th")?.className).toContain("w-40");
    const weightingTotals = screen.getAllByText("155 pts total");
    expect(weightingTotals.length).toBe(1);
    const mobileInlineTotal = screen.getByText(/· 155 pts/);
    expect(mobileInlineTotal.parentElement?.textContent).toBe(
      "Weight · 155 pts",
    );
    expect(
      within(
        screen.getByRole("toolbar", {
          name: "Assessment actions and weighting",
        }),
      ).queryByText("155 pts total"),
    ).toBeNull();
    expect(screen.getAllByText("+2.5%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "PTS" })[0]!);
    expect(tableCallbacks.onUpdateCourse).toHaveBeenCalledWith("course-1", {
      gradingScale: "points",
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Edit bonus" })[0]!);
    expect(
      screen.getByRole("heading", { name: "Bonus to final grade" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Adds percentage points to your final course grade after weighting.",
      ),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Bonus (%)" }), {
      target: { value: "3.25" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save bonus" }));
    expect(tableCallbacks.onUpdateCourse).toHaveBeenCalledWith("course-1", {
      bonusPoints: 3.25,
    });
  });

  it("saves positive decimals and resolves a blank bonus to zero", () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn();
    const { rerender } = render(
      <BonusPointsDialog
        bonusPoints={0}
        onOpenChange={onOpenChange}
        onSave={onSave}
        open
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Bonus to final grade" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Adds percentage points to your final course grade after weighting.",
      ),
    ).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Bonus (%)" }), {
      target: { value: "2.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save bonus" }));
    expect(onSave).toHaveBeenLastCalledWith(2.5);

    rerender(
      <BonusPointsDialog
        bonusPoints={2.5}
        onOpenChange={onOpenChange}
        onSave={onSave}
        open
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Bonus (%)" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save bonus" }));
    expect(onSave).toHaveBeenLastCalledWith(0);
  });

  it.each([
    ["New Assignment", "Add assignment", "Save assignment"],
    ["New Category", "Add category", "Create category"],
  ])("opens %s in its matching composer mode", (trigger, heading, submit) => {
    render(
      <AssessmentTable
        {...tableCallbacks}
        isExperimenting={false}
        module={makeCourse("percentage")}
      />,
    );

    const footerTrigger = screen
      .getAllByRole("button", { name: trigger })
      .find((button) => button.closest("table"));

    expect(footerTrigger).toBeTruthy();
    expect(footerTrigger?.closest("td")?.className).toContain("lg:p-0");
    fireEvent.click(footerTrigger!);
    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    expect(screen.getByRole("button", { name: submit })).toBeTruthy();
  });

  it("opens the mobile category footer action in grouped mode", () => {
    render(
      <AssessmentTable
        {...tableCallbacks}
        isExperimenting={false}
        module={makeCourse("percentage")}
      />,
    );

    const mobileCategoryAction = screen
      .getAllByRole("button", { name: "New Category" })
      .find((button) => !button.closest("table"));

    expect(mobileCategoryAction).toBeTruthy();
    fireEvent.click(mobileCategoryAction!);
    expect(screen.getByRole("heading", { name: "Add category" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Create category" }),
    ).toBeTruthy();
  });

  it("passes a normalized points-mode ceiling to the course overview", () => {
    const course = makeCourse("points");
    const completedAssessment = course.assessments[0];
    const remainingAssessment = course.assessments[1];

    if (
      completedAssessment?.kind !== "single" ||
      remainingAssessment?.kind !== "single"
    ) {
      throw new Error("Expected single assessment fixtures");
    }

    course.assessments = [
      {
        ...completedAssessment,
        scoreAchieved: 60,
        status: "completed",
      },
      {
        ...remainingAssessment,
        weight: 100,
      },
    ];

    render(
      <CourseMobileOverview module={course} onSaveBandsAction={vi.fn()} />,
    );

    expect(screen.getByTestId("course-ceiling").textContent).toBe("85.8");
  });
});
