// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { StudentListItem } from "@gireapp/shared";
import { StudentsTable } from "@/features/admin/students-table";

function buildStudent(
  overrides: Partial<StudentListItem> = {},
): StudentListItem {
  return {
    id: "stu-1",
    name: "Afolabi Hassan",
    email: "afolabi@example.com",
    image: null,
    academicLevel: "PROFESSIONAL",
    status: "ACTIVE",
    course: { id: "course-1", title: "Data Analytics" },
    progress: 89,
    ...overrides,
  };
}

describe("StudentsTable", () => {
  it("renders a row per student under the designed headings", () => {
    render(<StudentsTable students={[buildStudent()]} />);

    const table = screen.getByRole("table");
    for (const heading of [
      "Student",
      "Course",
      "Track",
      "Progress",
      "Status",
    ]) {
      expect(
        within(table).getByRole("columnheader", { name: heading }),
      ).toBeTruthy();
    }
    expect(within(table).getByText("Data Analytics")).toBeTruthy();
  });

  it("shows the academic level as the track label the design uses", () => {
    render(
      <StudentsTable
        students={[buildStudent({ academicLevel: "SECONDARY" })]}
      />,
    );

    expect(
      within(screen.getByRole("table")).getByText("Secondary"),
    ).toBeTruthy();
  });

  it("reports progress to assistive tech as well as on screen", () => {
    render(<StudentsTable students={[buildStudent()]} />);

    const [bar] = screen.getAllByRole("progressbar");
    expect(bar?.getAttribute("aria-valuenow")).toBe("89");
  });

  it("omits course and progress rather than inventing a zero when there is no enrolment", () => {
    render(
      <StudentsTable
        students={[buildStudent({ course: null, progress: null })]}
      />,
    );

    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(within(screen.getByRole("table")).queryByText("0%")).toBeNull();
  });

  it("joins track and course into the mobile card subtitle", () => {
    render(<StudentsTable students={[buildStudent()]} />);

    expect(screen.getByText("Professional · Data Analytics")).toBeTruthy();
  });

  it("drops the missing half of the mobile subtitle instead of leaving a stray separator", () => {
    render(
      <StudentsTable
        students={[buildStudent({ course: null, progress: null })]}
      />,
    );

    const card = screen.getByRole("listitem");
    expect(within(card).getByText("Professional")).toBeTruthy();
    expect(within(card).queryByText(/·/)).toBeNull();
  });

  it("falls back to an initial when a student has no photo", () => {
    render(<StudentsTable students={[buildStudent()]} />);

    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });
});
