// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthPageHeader } from "@/components/shared/auth-page-header";

const BASE = {
  title: "Welcome back",
  subtitle: "Log in to continue your learning journey",
  backLabel: "Go back to landing page",
};

describe("AuthPageHeader", () => {
  it("renders the title as the page heading", () => {
    render(<AuthPageHeader {...BASE} backHref="/" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<AuthPageHeader {...BASE} backHref="/" />);

    expect(
      screen.getByText("Log in to continue your learning journey"),
    ).toBeInTheDocument();
  });

  it("renders a link to the given href when backHref is supplied", () => {
    render(<AuthPageHeader {...BASE} backHref="/login" />);

    const link = screen.getByRole("link", {
      name: "Go back to landing page",
    });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("renders a button instead of a link when onBack is supplied", async () => {
    const onBack = vi.fn();
    render(<AuthPageHeader {...BASE} backLabel="Go back" onBack={onBack} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("gives the back control an accessible name for screen readers", () => {
    render(<AuthPageHeader {...BASE} backHref="/" />);

    expect(
      screen.getByRole("link", { name: "Go back to landing page" }),
    ).toBeInTheDocument();
  });

  it("appends caller classes without dropping the base layout classes", () => {
    const { container } = render(
      <AuthPageHeader {...BASE} backHref="/" className="mb-8" />,
    );
    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass("mb-8");
    expect(wrapper).toHaveClass("inline-flex");
  });
});
