import { describe, expect, it } from "vitest";

import {
  createSemester,
  getSuggestedSemesters,
} from "@/lib/course/semester-utils";

describe("semester-utils", () => {
  it("creates a semester with shared courses and modules arrays", () => {
    const semester = createSemester({
      name: "Semester 1 2026",
      periodLabel: "January to June",
    });

    expect(semester.name).toBe("Semester 1 2026");
    expect(semester.periodLabel).toBe("January to June");
    expect(semester.courses).toEqual([]);
    expect(semester.modules).toBe(semester.courses);
    expect(semester.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("builds the suggested semester list for the provided year", () => {
    expect(getSuggestedSemesters(new Date("2027-03-01"))).toEqual([
      {
        name: "Spring 2027",
        periodLabel: "January to May",
      },
      {
        name: "Fall 2027",
        periodLabel: "August to December",
      },
      {
        name: "Semester 1 2027",
        periodLabel: "January to June",
      },
      {
        name: "Semester 2 2027",
        periodLabel: "July to November",
      },
    ]);
  });
});
