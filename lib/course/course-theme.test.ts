import { describe, expect, it } from "vitest";

import {
  courseThemeOptions,
  getCourseTheme,
  getCourseThemeById,
} from "@/lib/course/course-theme";
import type { Course } from "@/lib/course/types";

describe("course-theme", () => {
  it("looks up a theme by id", () => {
    expect(getCourseThemeById("teal")).toMatchObject({
      id: "teal",
      band: "bg-course-teal",
    });
    expect(getCourseThemeById("missing")).toBeNull();
  });

  it("uses the selected accent when present and resolves light/dark variants", () => {
    const course: Course = {
      id: "course-1",
      accent: "teal",
      assessments: [],
      code: "MAT101",
      credits: 16,
      gradeBands: [],
      instructor: "Dr. Maya Patel",
      name: "Calculus I",
    };

    expect(getCourseTheme(course, "light")).toMatchObject({
      id: "teal",
      chartAccentBorder: "border-course-teal",
      chartAccentLine: "border-course-teal-line",
      chartAccentText: "text-course-teal",
      chartAccentTextMuted: "text-course-teal-muted",
      neededAccentText: "text-course-teal",
      tableHeaderAccent: "bg-course-teal-soft text-course-teal",
    });

    expect(getCourseTheme(course, "dark")).toMatchObject({
      id: "teal",
      chartAccentBorder: "border-course-teal-soft",
      chartAccentLine: "border-course-teal-soft",
      chartAccentText: "text-course-teal-soft",
      chartAccentTextMuted: "text-course-teal-soft",
      neededAccentText: "text-course-teal-soft",
      tableHeaderAccent: "bg-course-teal text-course-teal-foreground",
    });
  });

  it("falls back to a deterministic theme when the course accent is unknown", () => {
    const course: Course = {
      id: "abc",
      accent: "missing",
      assessments: [],
      code: "BIO101",
      credits: 12,
      gradeBands: [],
      instructor: "Dr. Rivera",
      name: "Biology",
    };

    const seed = Array.from(course.id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );
    const expectedTheme = courseThemeOptions[seed % courseThemeOptions.length];

    expect(getCourseTheme(course)).toMatchObject({
      id: expectedTheme?.id,
      band: expectedTheme?.band,
    });
  });
});
