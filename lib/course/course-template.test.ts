import { describe, expect, it } from "vitest";

import {
  instantiateCourseFromTemplate,
  buildCourseTemplatePayload,
} from "@/lib/course/course-template";
import {
  ASSESSMENT_KIND_GROUP,
  ASSESSMENT_KIND_SINGLE,
  ASSESSMENT_STATUS_ONGOING,
  GROUPED_ASSESSMENT_CATEGORY,
  SINGLE_ASSESSMENT_CATEGORY,
} from "@/lib/assessments/types";
import type { Course, CourseTemplatePayload } from "@/lib/course/types";

describe("course-template", () => {
  const payload: CourseTemplatePayload = {
    accent: "teal",
    assessments: [
      {
        kind: ASSESSMENT_KIND_SINGLE,
        category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
        dueDate: "2026-04-10",
        name: "Quiz 1",
        subminimumPercent: 40,
        totalPossible: 100,
        weight: 20,
      },
      {
        kind: ASSESSMENT_KIND_GROUP,
        category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
        dropLowest: 1,
        dueDate: "2026-04-24",
        items: [
          { label: "Tutorial 1", totalPossible: 10 },
          { label: "Tutorial 2", totalPossible: 10 },
        ],
        name: "Tutorials",
        weight: 30,
      },
    ],
    code: "MAT101",
    credits: 16,
    gradeBands: [
      { label: "A", threshold: 80 },
      { label: "B", threshold: 70 },
    ],
    instructor: "Dr. Maya Patel",
    name: "Calculus I",
  };

  it("instantiates a fresh course from a template payload", () => {
    const course = instantiateCourseFromTemplate(payload);

    expect(course.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(course.code).toBe("MAT101");
    expect(course.gradeBands).toHaveLength(2);
    expect(course.gradeBands[0]?.id).toBeDefined();

    expect(course.assessments[0]).toMatchObject({
      kind: ASSESSMENT_KIND_SINGLE,
      status: ASSESSMENT_STATUS_ONGOING,
      scoreAchieved: null,
      category: SINGLE_ASSESSMENT_CATEGORY.ASSIGNMENT,
      subminimumPercent: 40,
    });

    expect(course.assessments[1]).toMatchObject({
      kind: ASSESSMENT_KIND_GROUP,
      status: ASSESSMENT_STATUS_ONGOING,
      category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
      dropLowest: 1,
    });

    const grouped = course.assessments[1];
    if (grouped?.kind !== ASSESSMENT_KIND_GROUP) {
      throw new Error("Expected grouped assessment");
    }

    expect(grouped.items).toEqual([
      expect.objectContaining({
        label: "Tutorial 1",
        scoreAchieved: null,
        totalPossible: 10,
      }),
      expect.objectContaining({
        label: "Tutorial 2",
        scoreAchieved: null,
        totalPossible: 10,
      }),
    ]);
  });

  it("normalizes zero and missing subminimum values to null", () => {
    const course = instantiateCourseFromTemplate({
      ...payload,
      assessments: [
        {
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.QUIZ,
          dueDate: "2026-04-11",
          name: "Quiz 2",
          subminimumPercent: 0,
          totalPossible: 50,
          weight: 10,
        },
        {
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.EXAM,
          dueDate: "2026-05-11",
          name: "Exam",
          totalPossible: 100,
          weight: 40,
        },
      ],
    });

    expect(course.assessments[0]).toMatchObject({
      subminimumPercent: null,
    });
    expect(course.assessments[1]).toMatchObject({
      subminimumPercent: null,
    });
  });

  it("normalizes course data when building a share payload", () => {
    const course: Course = {
      id: "course-1",
      accent: "teal",
      assessments: [
        {
          id: "a1",
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.QUIZ,
          dueDate: "2026-04-10",
          name: "Quiz 1",
          scoreAchieved: 83,
          status: ASSESSMENT_STATUS_ONGOING,
          subminimumPercent: null,
          totalPossible: 100,
          weight: 15,
        },
      ],
      code: "CSC101",
      credits: 12,
      gradeBands: [{ id: "band-1", label: "A", threshold: 80 }],
      instructor: "Prof. Chen",
      name: "Intro to CS",
    };

    expect(buildCourseTemplatePayload(course)).toEqual({
      accent: "teal",
      assessments: [
        {
          kind: ASSESSMENT_KIND_SINGLE,
          category: SINGLE_ASSESSMENT_CATEGORY.QUIZ,
          dueDate: "2026-04-10",
          name: "Quiz 1",
          subminimumPercent: null,
          totalPossible: 100,
          weight: 15,
        },
      ],
      code: "CSC101",
      credits: 12,
      gradeBands: [{ label: "A", threshold: 80 }],
      instructor: "Prof. Chen",
      name: "Intro to CS",
    });
  });

  it("normalizes grouped assessments to the tutorials category in share payloads", () => {
    const groupedCourse: Course = {
      id: "course-2",
      accent: "blue",
      assessments: [
        {
          id: "group-1",
          kind: ASSESSMENT_KIND_GROUP,
          category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
          dueDate: "2026-04-24",
          dropLowest: 1,
          items: [
            {
              id: "item-1",
              label: "Tutorial 1",
              scoreAchieved: 9,
              totalPossible: 10,
            },
          ],
          name: "Tutorials",
          status: ASSESSMENT_STATUS_ONGOING,
          weight: 20,
        },
      ],
      code: "PHY101",
      credits: 16,
      gradeBands: [{ id: "band-1", label: "A", threshold: 80 }],
      instructor: "Dr. Lee",
      name: "Physics",
    };

    expect(buildCourseTemplatePayload(groupedCourse)).toEqual({
      accent: "blue",
      assessments: [
        {
          kind: ASSESSMENT_KIND_GROUP,
          category: GROUPED_ASSESSMENT_CATEGORY.TUTORIALS,
          dropLowest: 1,
          dueDate: "2026-04-24",
          items: [{ label: "Tutorial 1", totalPossible: 10 }],
          name: "Tutorials",
          weight: 20,
        },
      ],
      code: "PHY101",
      credits: 16,
      gradeBands: [{ label: "A", threshold: 80 }],
      instructor: "Dr. Lee",
      name: "Physics",
    });
  });
});
