// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { AnalyticsQuery } from "@gireapp/shared";
import userEvent from "@testing-library/user-event";

const { replaceMock, searchParamsRef } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsRef.current,
}));

import { AnalyticsFilters } from "@/features/admin/analytics-filters";

const COURSES = [{ id: "course-1", title: "Data Analytics" }];

/** What the page resolved and actually queried with. */
const DEFAULTS: AnalyticsQuery = { rangeDays: 30, groupBy: "DAILY" };

function replacedParams(): URLSearchParams {
  const call = replaceMock.mock.calls.at(-1);
  if (!call) throw new Error("router.replace was not called");
  return new URLSearchParams(String(call[0]).split("?")[1] ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
  searchParamsRef.current = new URLSearchParams();
});

describe("AnalyticsFilters", () => {
  it("defaults to the 30-day range and daily grouping", () => {
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    expect(screen.getByRole("combobox", { name: "Date range" })).toHaveProperty(
      "value",
      "30",
    );
    expect(screen.getByRole("combobox", { name: "Group by" })).toHaveProperty(
      "value",
      "DAILY",
    );
  });

  it("offers only the ranges the shared schema accepts", () => {
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    const options = screen.getByRole("combobox", { name: "Date range" });
    expect(
      [...(options as HTMLSelectElement).options].map((o) => o.value),
    ).toEqual(["7", "30", "90"]);
  });

  it("puts a chosen range in the URL", async () => {
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Date range" }),
      "90",
    );

    await waitFor(() => expect(replacedParams().get("rangeDays")).toBe("90"));
  });

  it("keeps the other filters when one changes", async () => {
    searchParamsRef.current = new URLSearchParams(
      "rangeDays=7&academicLevel=TERTIARY",
    );
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Group by" }),
      "WEEKLY",
    );

    await waitFor(() => expect(replacedParams().get("groupBy")).toBe("WEEKLY"));
    expect(replacedParams().get("rangeDays")).toBe("7");
    expect(replacedParams().get("academicLevel")).toBe("TERTIARY");
  });

  it("drops a filter set back to All", async () => {
    searchParamsRef.current = new URLSearchParams("academicLevel=TERTIARY");
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Track" }),
      "",
    );

    await waitFor(() =>
      expect(replacedParams().has("academicLevel")).toBe(false),
    );
  });

  it("hides Clear filters until something is filtered", () => {
    const { rerender } = render(
      <AnalyticsFilters courses={COURSES} selected={DEFAULTS} />,
    );
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();

    searchParamsRef.current = new URLSearchParams("academicLevel=TERTIARY");
    rerender(
      <AnalyticsFilters
        courses={COURSES}
        selected={{ ...DEFAULTS, academicLevel: "TERTIARY" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
  });

  it("clears every filter at once", async () => {
    searchParamsRef.current = new URLSearchParams(
      "rangeDays=90&academicLevel=TERTIARY&courseId=course-1&groupBy=WEEKLY",
    );
    render(
      <AnalyticsFilters
        courses={COURSES}
        selected={{
          rangeDays: 90,
          groupBy: "WEEKLY",
          academicLevel: "TERTIARY",
          courseId: "course-1",
        }}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/admin/analytics"),
    );
  });

  it("omits the course filter when there are no courses to pick", () => {
    render(<AnalyticsFilters courses={[]} selected={DEFAULTS} />);

    expect(screen.queryByRole("combobox", { name: "Course" })).toBeNull();
    expect(screen.getByRole("combobox", { name: "Track" })).toBeTruthy();
  });

  it("shows the range the page actually used, not an unusable one from the URL", () => {
    // rangeDays=999 is rejected server-side and falls back to 30. Reading the
    // raw URL here left the select on its first option (7), disagreeing with
    // the data on screen.
    searchParamsRef.current = new URLSearchParams("rangeDays=999");
    render(<AnalyticsFilters courses={COURSES} selected={DEFAULTS} />);

    expect(screen.getByRole("combobox", { name: "Date range" })).toHaveProperty(
      "value",
      "30",
    );
  });
});
