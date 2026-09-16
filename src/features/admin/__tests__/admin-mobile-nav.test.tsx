// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/students" }));
vi.mock("@/features/auth/actions", () => ({ logoutAction: vi.fn() }));

import { AdminMobileNav } from "@/features/admin/admin-mobile-nav";

const STAFF = { name: "System Admin", roleLabel: "Super Admin", image: null };

describe("AdminMobileNav", () => {
  it("keeps the menu closed until it is asked for", () => {
    render(<AdminMobileNav staff={STAFF} />);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
  });

  it("opens a drawer with every admin destination and Logout", async () => {
    render(<AdminMobileNav staff={STAFF} />);

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");

    for (const label of [
      "Home",
      "Courses",
      "Students",
      "Mentors",
      "Analytics",
      "Quiz Builder",
      "Settings",
    ]) {
      expect(within(drawer).getByRole("link", { name: label })).toBeTruthy();
    }
    expect(within(drawer).getByRole("button", { name: "Logout" })).toBeTruthy();
    expect(within(drawer).getByText("System Admin")).toBeTruthy();
  });

  it("marks the current section so the reader knows where they are", async () => {
    render(<AdminMobileNav staff={STAFF} />);

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");

    expect(
      within(drawer)
        .getByRole("link", { name: "Students" })
        .getAttribute("aria-current"),
    ).toBe("page");
  });

  it("closes itself when a link is followed", async () => {
    render(<AdminMobileNav staff={STAFF} />);

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");
    await userEvent.click(
      within(drawer).getByRole("link", { name: "Courses" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes on Escape", async () => {
    render(<AdminMobileNav staff={STAFF} />);

    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
