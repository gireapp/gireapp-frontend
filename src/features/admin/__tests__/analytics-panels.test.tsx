// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type {
  AdminRegistrationPoint,
  AdminRetentionWeek,
  AdminTopStudent,
} from "@gireapp/shared";
import { RegistrationsChart } from "@/features/admin/registrations-chart";
import { RetentionChart } from "@/features/admin/retention-chart";
import { PassRateChart } from "@/features/admin/pass-rate-chart";
import { TopStudents } from "@/features/admin/top-students";

function point(
  date: string,
  byTrack: Partial<AdminRegistrationPoint["byTrack"]> = {},
): AdminRegistrationPoint {
  return {
    date,
    byTrack: { SECONDARY: 0, TERTIARY: 0, PROFESSIONAL: 0, ...byTrack },
  };
}

describe("RegistrationsChart", () => {
  it("draws one line per track and names all three", () => {
    const { container } = render(
      <RegistrationsChart
        points={[point("2026-09-01", { SECONDARY: 2 }), point("2026-09-02")]}
        weekly={false}
      />,
    );

    expect(container.querySelectorAll("polyline")).toHaveLength(3);
    for (const label of ["Secondary", "Tertiary", "Professional"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it("reports the busiest bucket to assistive tech", () => {
    render(
      <RegistrationsChart
        points={[
          point("2026-09-01", { TERTIARY: 4 }),
          point("2026-09-02", { SECONDARY: 9 }),
        ]}
        weekly={false}
      />,
    );

    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "peaking at 9",
    );
  });

  it("says days or weeks according to the grouping", () => {
    const { rerender } = render(
      <RegistrationsChart points={[point("2026-09-01")]} weekly={false} />,
    );
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "1 days",
    );

    rerender(<RegistrationsChart points={[point("2026-09-01")]} weekly />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "1 weeks",
    );
  });

  it("has an empty state for a period with no sign-ups", () => {
    render(<RegistrationsChart points={[]} weekly={false} />);

    expect(screen.getByText(/no sign-ups in this period/i)).toBeTruthy();
  });
});

describe("RetentionChart", () => {
  const weeks: AdminRetentionWeek[] = [
    { week: 1, eligible: 10, rate: 80 },
    { week: 2, eligible: 10, rate: 50 },
    { week: 3, eligible: 0, rate: null },
    { week: 4, eligible: 0, rate: null },
    { week: 5, eligible: 0, rate: null },
  ];

  it("plots only the weeks that have fully elapsed", () => {
    render(<RetentionChart weeks={weeks} />);

    expect(screen.getByText("Week 1")).toBeTruthy();
    expect(screen.getByText("Week 2")).toBeTruthy();
    // Week 3 is unmeasured — drawing it as 0% would invent a collapse.
    expect(screen.queryByText("Week 3")).toBeNull();
  });

  it("scales the axis to 100% and explains the cohort", () => {
    render(<RetentionChart weeks={weeks} />);

    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText(/10 students who signed up/i)).toBeTruthy();
  });

  it("says so plainly when nobody has been signed up a full week", () => {
    render(
      <RetentionChart
        weeks={weeks.map((week) => ({ ...week, eligible: 0, rate: null }))}
      />,
    );

    expect(screen.getByText(/signed up a full week yet/i)).toBeTruthy();
  });
});

describe("PassRateChart", () => {
  it("sizes each bar by its pass rate and labels the attempts behind it", () => {
    const { container } = render(
      <PassRateChart
        subjects={[
          { subject: "Physics", attempts: 10, passRate: 70 },
          { subject: "Chemistry", attempts: 4, passRate: 25 },
        ]}
      />,
    );

    const bars = container.querySelectorAll<HTMLElement>('[role="img"]');
    expect(bars[0]?.style.height).toBe("70%");
    expect(bars[0]?.getAttribute("aria-label")).toBe(
      "Physics: 70% of 10 attempts passed",
    );
    expect(bars[1]?.style.height).toBe("25%");
  });

  it("has an empty state when nobody sat a quiz in the period", () => {
    render(<PassRateChart subjects={[]} />);

    expect(screen.getByText(/no quiz attempts in this period/i)).toBeTruthy();
  });
});

describe("TopStudents", () => {
  const student: AdminTopStudent = {
    id: "stu-1",
    name: "Joshua Caleb",
    image: null,
    academicLevel: "SECONDARY",
    points: 3420,
    quizzesTaken: 32,
  };

  it("ranks students in the order given", () => {
    render(
      <TopStudents
        students={[
          student,
          { ...student, id: "stu-2", name: "Ojo Johnson", points: 3000 },
        ]}
      />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0] as HTMLElement).getByText("1.")).toBeTruthy();
    expect(within(rows[1] as HTMLElement).getByText("2.")).toBeTruthy();
  });

  it("links a student through to the listing filtered to them", () => {
    render(<TopStudents students={[student]} />);

    expect(
      screen.getByRole("link", { name: /Joshua Caleb/ }).getAttribute("href"),
    ).toBe("/admin/students?search=Joshua%20Caleb");
  });

  it("shows an em dash for a student with no track rather than an empty cell", () => {
    render(<TopStudents students={[{ ...student, academicLevel: null }]} />);

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("has an empty state when the filters match nobody", () => {
    render(<TopStudents students={[]} />);

    expect(screen.getByText(/no students match these filters/i)).toBeTruthy();
  });
});
