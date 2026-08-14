// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton";

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const SLOW_LOAD_MS = 8000;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => vi.useRealTimers());

describe("DashboardSkeleton", () => {
  it("announces itself as busy while loading", () => {
    render(<DashboardSkeleton />);

    expect(screen.getByLabelText("Loading dashboard")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("pulses on the 1.5s cycle rather than Tailwind's 2s default", () => {
    const { container } = render(<DashboardSkeleton />);

    expect(
      container.querySelectorAll(".animate-pulse-skeleton").length,
    ).toBeGreaterThan(0);
  });

  it("keeps showing the skeleton just before the timeout", () => {
    render(<DashboardSkeleton />);

    act(() => {
      vi.advanceTimersByTime(SLOW_LOAD_MS - 100);
    });

    expect(screen.getByLabelText("Loading dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load")).not.toBeInTheDocument();
  });

  it("offers a retry once the load passes 8 seconds", () => {
    render(<DashboardSkeleton />);

    act(() => {
      vi.advanceTimersByTime(SLOW_LOAD_MS);
    });

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Loading dashboard"),
    ).not.toBeInTheDocument();
  });

  it("re-fetches the route when retry is pressed", () => {
    render(<DashboardSkeleton />);

    act(() => {
      vi.advanceTimersByTime(SLOW_LOAD_MS);
    });
    act(() => {
      screen.getByRole("button", { name: "Retry" }).click();
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
