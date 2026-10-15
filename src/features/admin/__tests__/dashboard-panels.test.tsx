// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Users } from "lucide-react";
import type {
  AdminActivity,
  AdminGrowthPoint,
  AdminTrackShare,
} from "@gireapp/shared";
import { AdminStatCard } from "@/features/admin/dashboard-cards";
import { GrowthChart } from "@/features/admin/growth-chart";
import { axisLabelIndexes, formatAxisDate } from "@/features/admin/line-chart";
import {
  TrackDistribution,
  exactShares,
} from "@/features/admin/track-distribution";
import { RecentActivity, relativeTime } from "@/features/admin/recent-activity";
import { TopSubjects } from "@/features/admin/top-subjects";
import { CompletionRate } from "@/features/admin/completion-rate";

describe("AdminStatCard", () => {
  it("shows the count and the weekly change", () => {
    render(
      <AdminStatCard
        label="Total Students"
        total={{ value: 2250, addedThisWeek: 143 }}
        icon={Users}
      />,
    );

    expect(screen.getByText("2250")).toBeTruthy();
    expect(screen.getByText("+143 this week")).toBeTruthy();
  });

  it("omits the delta line in a quiet week rather than printing +0", () => {
    render(
      <AdminStatCard
        label="Total Students"
        total={{ value: 2250, addedThisWeek: 0 }}
        icon={Users}
      />,
    );

    expect(screen.queryByText(/this week/)).toBeNull();
  });
});

describe("GrowthChart", () => {
  const points: AdminGrowthPoint[] = [
    { date: "2026-08-01", registered: 4, active: 2 },
    { date: "2026-08-02", registered: 9, active: 6 },
  ];

  it("draws one line per series and names both in the legend", () => {
    const { container } = render(<GrowthChart points={points} />);

    expect(container.querySelectorAll("polyline")).toHaveLength(2);
    expect(screen.getByText("Registered students")).toBeTruthy();
    expect(screen.getByText("Active students")).toBeTruthy();
  });

  it("describes the chart for anyone who cannot see it", () => {
    render(<GrowthChart points={points} />);

    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "peaking at 9",
    );
  });

  it("says so plainly when there is nothing to plot", () => {
    render(<GrowthChart points={[]} />);

    expect(screen.getByText(/no sign-ups or activity/i)).toBeTruthy();
  });
});

describe("TrackDistribution", () => {
  const shares: AdminTrackShare[] = [
    { academicLevel: "SECONDARY", count: 50, percentage: 50 },
    { academicLevel: "TERTIARY", count: 30, percentage: 30 },
    { academicLevel: "PROFESSIONAL", count: 20, percentage: 20 },
  ];

  it("puts the headcount in the middle of the ring", () => {
    render(<TrackDistribution shares={shares} />);

    expect(screen.getByText("100")).toBeTruthy();
    // Only tracked learners can appear in the ring, so it must not claim to
    // be the platform total shown in the tile above.
    expect(screen.getByText("on a track")).toBeTruthy();
    expect(screen.queryByText("Total Students")).toBeNull();
  });

  it("draws an arc per track and lists each percentage", () => {
    const { container } = render(<TrackDistribution shares={shares} />);

    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("falls back to a message when nobody has picked a track", () => {
    render(<TrackDistribution shares={[]} />);

    expect(screen.getByText(/no students have picked a track/i)).toBeTruthy();
  });
});

describe("exactShares", () => {
  it("sizes arcs from counts so rounded percentages can never leave a hole", () => {
    // 10/10/8 rounds to 36/36/29 — which sums to 101, not 100.
    const arcs = exactShares([
      { academicLevel: "PROFESSIONAL", count: 10, percentage: 36 },
      { academicLevel: "SECONDARY", count: 10, percentage: 36 },
      { academicLevel: "TERTIARY", count: 8, percentage: 29 },
    ]);

    expect(arcs.reduce((sum, arc) => sum + arc, 0)).toBeCloseTo(100, 10);
  });

  it("is all zeroes rather than NaN when every count is zero", () => {
    expect(
      exactShares([{ academicLevel: "SECONDARY", count: 0, percentage: 0 }]),
    ).toEqual([0]);
  });
});

describe("growth chart axis", () => {
  it("labels every week and always the final day", () => {
    expect(axisLabelIndexes(30)).toEqual([0, 7, 14, 21, 28, 29]);
  });

  it("does not repeat the final day when it already falls on a week", () => {
    expect(axisLabelIndexes(8)).toEqual([0, 7]);
  });

  it("has no labels for an empty series", () => {
    expect(axisLabelIndexes(0)).toEqual([]);
  });

  it("formats the backend's UTC calendar day without shifting it a day", () => {
    expect(formatAxisDate("2026-06-30")).toBe("30 Jun");
  });
});

describe("GrowthChart on a narrow screen", () => {
  it("gives the plot a minimum width so it scrolls instead of squashing", () => {
    const points = Array.from({ length: 30 }, (_, index) => ({
      date: `2026-08-${String(index + 1).padStart(2, "0")}`,
      registered: index,
      active: 0,
    }));
    const { container } = render(<GrowthChart points={points} />);

    const plot = container.querySelector<HTMLElement>("[style*='min-width']");
    expect(plot?.style.minWidth).toBe("720px");
  });

  it("keeps the legend outside the scrolling area so it stays visible", () => {
    const { container } = render(
      <GrowthChart
        points={[{ date: "2026-08-01", registered: 1, active: 1 }]}
      />,
    );

    const scroller = container.querySelector(".overflow-x-auto");
    expect(scroller?.textContent).not.toContain("Registered students");
    expect(screen.getByText("Registered students")).toBeTruthy();
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-08-30T12:00:00Z");

  it.each([
    ["2026-08-30T11:59:30Z", "just now"],
    ["2026-08-30T11:58:00Z", "2 mins ago"],
    ["2026-08-30T11:00:00Z", "1 hour ago"],
    ["2026-08-28T12:00:00Z", "2 days ago"],
  ])("renders %s as %s", (at, expected) => {
    expect(relativeTime(at, now)).toBe(expected);
  });
});

describe("RecentActivity", () => {
  const activity: AdminActivity[] = [
    {
      id: "student-1",
      type: "STUDENT_REGISTERED",
      detail: "Ola Aina joined the Tertiary track",
      at: new Date().toISOString(),
    },
  ];

  it("labels an entry by its kind and keeps the detail line", () => {
    render(<RecentActivity activity={activity} />);

    expect(screen.getByText("New student registered")).toBeTruthy();
    expect(screen.getByText("Ola Aina joined the Tertiary track")).toBeTruthy();
  });

  it("marks the timestamp up as a machine-readable time", () => {
    const { container } = render(<RecentActivity activity={activity} />);

    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(
      activity[0]?.at,
    );
  });

  it("has an empty state for a brand-new platform", () => {
    render(<RecentActivity activity={[]} />);

    expect(screen.getByText(/nothing has happened/i)).toBeTruthy();
  });
});

describe("TopSubjects", () => {
  it("scales every bar against the busiest subject", () => {
    const { container } = render(
      <TopSubjects
        subjects={[
          { subject: "Data Analytics", enrolments: 120 },
          { subject: "Physics", enrolments: 60 },
        ]}
      />,
    );

    const bars = container.querySelectorAll("span.bg-indigo-800");
    expect((bars[0] as HTMLElement | undefined)?.style.width).toBe("100%");
    expect((bars[1] as HTMLElement | undefined)?.style.width).toBe("50%");
  });

  it("renders each subject beside its count", () => {
    render(
      <TopSubjects subjects={[{ subject: "Physics", enrolments: 100 }]} />,
    );

    const row = screen.getByRole("listitem");
    expect(within(row).getByText("Physics")).toBeTruthy();
    expect(within(row).getByText("100")).toBeTruthy();
  });

  it("says there is nothing to rank when no one has enrolled", () => {
    render(<TopSubjects subjects={[]} />);

    expect(screen.getByText(/no enrolments to rank/i)).toBeTruthy();
  });
});

describe("CompletionRate", () => {
  it("prints the rate and describes the arc", () => {
    render(<CompletionRate rate={68} />);

    expect(screen.getByText("68%")).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "68% of enrolments completed",
    );
  });

  it("draws no progress arc at 0%, so a round cap cannot paint a stray dot", () => {
    const { container } = render(<CompletionRate rate={0} />);

    // Only the background track remains.
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("distinguishes no enrolments at all from a rate of zero", () => {
    render(<CompletionRate rate={null} />);

    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.getByText(/no one has enrolled/i)).toBeTruthy();
  });
});
