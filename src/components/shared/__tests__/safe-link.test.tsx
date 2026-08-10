// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SafeLink } from "@/components/shared/safe-link";

const COOLDOWN_MS = 500;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SafeLink", () => {
  it("renders an anchor pointing at href", () => {
    render(<SafeLink href="/register">Get started</SafeLink>);

    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("forwards the first click to the caller's handler", () => {
    const onClick = vi.fn();
    render(
      <SafeLink href="/register" onClick={onClick}>
        Get started
      </SafeLink>,
    );

    fireEvent.click(screen.getByRole("link"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("swallows a rapid second click so navigation cannot double-fire", () => {
    const onClick = vi.fn();
    render(
      <SafeLink href="/register" onClick={onClick}>
        Get started
      </SafeLink>,
    );
    const link = screen.getByRole("link");

    fireEvent.click(link);
    fireEvent.click(link);
    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents the default navigation on the suppressed click", () => {
    render(<SafeLink href="/register">Get started</SafeLink>);
    const link = screen.getByRole("link");

    fireEvent.click(link);
    const suppressed = fireEvent.click(link);

    // fireEvent returns false when preventDefault() was called.
    expect(suppressed).toBe(false);
  });

  it("accepts clicks again once the cooldown elapses", () => {
    const onClick = vi.fn();
    render(
      <SafeLink href="/register" onClick={onClick}>
        Get started
      </SafeLink>,
    );
    const link = screen.getByRole("link");

    fireEvent.click(link);
    vi.advanceTimersByTime(COOLDOWN_MS);
    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("works without an onClick handler", () => {
    render(<SafeLink href="/register">Get started</SafeLink>);

    expect(() => fireEvent.click(screen.getByRole("link"))).not.toThrow();
  });
});
