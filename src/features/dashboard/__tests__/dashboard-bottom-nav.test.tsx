// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardBottomNav } from "@/features/dashboard/dashboard-bottom-nav";

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname: () => pathnameMock() }));

function renderNav(
  pathname: string,
  academicLevel: string | null = "SECONDARY",
) {
  pathnameMock.mockReturnValue(pathname);
  return render(<DashboardBottomNav academicLevel={academicLevel} />);
}

describe("DashboardBottomNav", () => {
  it("shows the destinations that exist", () => {
    renderNav("/dashboard/secondary");

    for (const label of ["Home", "Courses", "Profile"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("leaves out Progress and Mentors until those screens are built", () => {
    renderNav("/dashboard/secondary");

    // The design shows both, but neither page exists; a link to a 404 is
    // worse than no link.
    expect(
      screen.queryByRole("link", { name: "Progress" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Mentors" }),
    ).not.toBeInTheDocument();
  });

  it("uses the short label so the items fit a 375px bar", () => {
    renderNav("/dashboard/secondary");

    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Profile & Settings" }),
    ).not.toBeInTheDocument();
  });

  it("points Home at the learner's own segment", () => {
    renderNav("/dashboard/tertiary", "TERTIARY");

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/dashboard/tertiary",
    );
  });

  it("marks Home current only on the segment root", () => {
    renderNav("/dashboard/secondary");

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("hands current over to a nested route rather than Home", () => {
    renderNav("/dashboard/courses/abc");

    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("is hidden from md up, where the rail takes over", () => {
    const { container } = renderNav("/dashboard/secondary");

    expect(container.querySelector("nav")?.className).toContain("md:hidden");
  });
});
