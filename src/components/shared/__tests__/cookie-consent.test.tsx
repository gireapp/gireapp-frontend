// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { CookieConsent } from "@/components/shared/cookie-consent";

const CONSENT_KEY = "gireapp_cookie_consent";
const REVEAL_DELAY_MS = 1000;

/** The banner is deliberately delayed; drive that timer rather than racing it. */
function revealBanner() {
  act(() => {
    vi.advanceTimersByTime(REVEAL_DELAY_MS);
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CookieConsent", () => {
  it("stays hidden until the reveal delay elapses", () => {
    render(<CookieConsent />);

    expect(screen.queryByText("We value your privacy")).not.toBeInTheDocument();
  });

  it("prompts a visitor who has not decided yet", () => {
    render(<CookieConsent />);
    revealBanner();

    expect(screen.getByText("We value your privacy")).toBeInTheDocument();
  });

  it("names NDPR and POPIA in the disclosure", () => {
    render(<CookieConsent />);
    revealBanner();

    expect(screen.getByText(/NDPR and POPIA guidelines/i)).toBeInTheDocument();
  });

  it.each(["accepted", "declined"])(
    "never appears when consent is already %s",
    (decision) => {
      localStorage.setItem(CONSENT_KEY, decision);
      render(<CookieConsent />);
      revealBanner();

      expect(
        screen.queryByText("We value your privacy"),
      ).not.toBeInTheDocument();
    },
  );

  it("records acceptance and dismisses the banner", () => {
    render(<CookieConsent />);
    revealBanner();

    fireEvent.click(screen.getByRole("button", { name: "Accept Cookies" }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(screen.queryByText("We value your privacy")).not.toBeInTheDocument();
  });

  it("records a decline and dismisses the banner", () => {
    render(<CookieConsent />);
    revealBanner();

    fireEvent.click(screen.getByRole("button", { name: "Decline All" }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe("declined");
    expect(screen.queryByText("We value your privacy")).not.toBeInTheDocument();
  });

  it("treats closing the banner as declining, never as consent", () => {
    render(<CookieConsent />);
    revealBanner();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe("declined");
  });
});
