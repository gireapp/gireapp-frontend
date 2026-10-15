// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { replaceMock, searchParamsRef } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsRef.current,
}));

import { StudentFilters } from "@/features/admin/student-filters";

const COURSES = [
  {
    id: "course-1",
    title: "Data Analytics",
    academicLevel: "PROFESSIONAL" as const,
  },
];

function replacedParams(): URLSearchParams {
  const call = replaceMock.mock.calls.at(-1);
  if (!call) throw new Error("router.replace was not called");
  return new URLSearchParams(String(call[0]).split("?")[1]);
}

beforeEach(() => {
  vi.clearAllMocks();
  searchParamsRef.current = new URLSearchParams();
});

describe("StudentFilters", () => {
  it("submits a trimmed search term", async () => {
    render(<StudentFilters courses={COURSES} />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search students/i }),
      "  Favor  {Enter}",
    );

    await waitFor(() => expect(replacedParams().get("search")).toBe("Favor"));
  });

  it("returns to the first page whenever a filter changes", async () => {
    searchParamsRef.current = new URLSearchParams("page=7");
    render(<StudentFilters courses={COURSES} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "ACTIVE",
    );

    await waitFor(() => expect(replacedParams().has("page")).toBe(false));
  });

  it("drops a filter from the URL when it is set back to All", async () => {
    searchParamsRef.current = new URLSearchParams("status=ACTIVE");
    render(<StudentFilters courses={COURSES} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "",
    );

    await waitFor(() => expect(replacedParams().has("status")).toBe(false));
  });

  it("keeps the other filters in place while one changes", async () => {
    searchParamsRef.current = new URLSearchParams("search=Favor");
    render(<StudentFilters courses={COURSES} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Track" }),
      "TERTIARY",
    );

    await waitFor(() => expect(replacedParams().get("search")).toBe("Favor"));
    expect(replacedParams().get("academicLevel")).toBe("TERTIARY");
  });

  it("omits the course filter entirely when there are no courses to pick", () => {
    render(<StudentFilters courses={[]} />);

    expect(screen.queryByRole("combobox", { name: "Course" })).toBeNull();
    expect(screen.getByRole("combobox", { name: "Track" })).toBeTruthy();
  });

  it("shows the filters already applied in the URL", () => {
    searchParamsRef.current = new URLSearchParams(
      "status=PENDING&search=Favor",
    );
    render(<StudentFilters courses={COURSES} />);

    expect(screen.getByRole("combobox", { name: "Status" })).toHaveProperty(
      "value",
      "PENDING",
    );
    expect(
      screen.getByRole("searchbox", { name: /search students/i }),
    ).toHaveProperty("value", "Favor");
  });
});
