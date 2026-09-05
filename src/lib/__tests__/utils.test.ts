import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cn,
  formatNumber,
  formatRelativeTime,
  formatTimer,
  formatProgress,
  getInitials,
  truncate,
  estimateReadingTime,
  isSlowConnection,
  tempId,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves conflicting tailwind classes in favour of the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, null, undefined, "")).toBe("px-2");
  });
});

describe("formatNumber", () => {
  it("inserts thousands separators", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("leaves values below 1000 unchanged", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("handles negative numbers", () => {
    expect(formatNumber(-1234)).toBe("-1,234");
  });
});

describe("formatRelativeTime", () => {
  const NOW = new Date("2026-08-07T12:00:00.000Z");

  afterEach(() => {
    vi.useRealTimers();
  });

  function at(offsetMs: number): string {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    return formatRelativeTime(new Date(NOW.getTime() - offsetMs));
  }

  it("reports sub-minute gaps as 'just now'", () => {
    expect(at(0)).toBe("just now");
    expect(at(59_000)).toBe("just now");
  });

  it("reports minutes below an hour", () => {
    expect(at(60_000)).toBe("1m ago");
    expect(at(59 * 60_000)).toBe("59m ago");
  });

  it("reports hours below a day", () => {
    expect(at(60 * 60_000)).toBe("1h ago");
    expect(at(23 * 60 * 60_000)).toBe("23h ago");
  });

  it("reports days below a week", () => {
    expect(at(24 * 60 * 60_000)).toBe("1d ago");
    expect(at(6 * 24 * 60 * 60_000)).toBe("6d ago");
  });

  it("falls back to an absolute date at a week or older", () => {
    expect(at(7 * 24 * 60 * 60_000)).toBe("Jul 31");
  });
});

describe("formatTimer", () => {
  it("pads minutes and seconds to two digits", () => {
    expect(formatTimer(0)).toBe("00:00");
    expect(formatTimer(5)).toBe("00:05");
    expect(formatTimer(65)).toBe("01:05");
  });

  it("does not roll minutes over into hours", () => {
    expect(formatTimer(3600)).toBe("60:00");
  });
});

describe("formatProgress", () => {
  it("renders a 0-1 float as a percentage", () => {
    expect(formatProgress(0)).toBe("0%");
    expect(formatProgress(0.5)).toBe("50%");
    expect(formatProgress(1)).toBe("100%");
  });

  it("rounds to the nearest whole percent", () => {
    expect(formatProgress(0.333)).toBe("33%");
    expect(formatProgress(0.336)).toBe("34%");
  });
});

describe("getInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(getInitials("Tobi Ojo")).toBe("TO");
    expect(getInitials("Ada Grace Obi")).toBe("AG");
  });

  it("handles a single word", () => {
    expect(getInitials("Tobi")).toBe("T");
  });

  it("uppercases the result", () => {
    expect(getInitials("tobi ojo")).toBe("TO");
  });

  it("returns '?' for missing names", () => {
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials(null)).toBe("?");
    expect(getInitials("")).toBe("?");
  });
});

describe("truncate", () => {
  it("leaves text at or below the limit untouched", () => {
    expect(truncate("hello", 5)).toBe("hello");
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("clips longer text to exactly maxLength including the ellipsis", () => {
    const result = truncate("abcdefghij", 8);
    expect(result).toBe("abcde...");
    expect(result).toHaveLength(8);
  });
});

describe("estimateReadingTime", () => {
  it("returns at least one minute for short content", () => {
    expect(estimateReadingTime("")).toBe(1);
    expect(estimateReadingTime("a few words here")).toBe(1);
  });

  it("rounds up to the next minute at 200 words per minute", () => {
    expect(estimateReadingTime("word ".repeat(200).trim())).toBe(1);
    expect(estimateReadingTime("word ".repeat(201).trim())).toBe(2);
    expect(estimateReadingTime("word ".repeat(400).trim())).toBe(2);
  });
});

describe("isSlowConnection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when navigator is unavailable (server-side)", () => {
    expect(isSlowConnection()).toBe(false);
  });

  it("returns false when the connection API is unsupported", () => {
    vi.stubGlobal("navigator", {});
    expect(isSlowConnection()).toBe(false);
  });

  it("detects an explicit data-saver preference", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });
    expect(isSlowConnection()).toBe(true);
  });

  it("detects 2g-class connections", () => {
    vi.stubGlobal("navigator", { connection: { effectiveType: "2g" } });
    expect(isSlowConnection()).toBe(true);

    vi.stubGlobal("navigator", { connection: { effectiveType: "slow-2g" } });
    expect(isSlowConnection()).toBe(true);
  });

  it("treats fast connections as not slow", () => {
    vi.stubGlobal("navigator", {
      connection: { effectiveType: "4g", saveData: false },
    });
    expect(isSlowConnection()).toBe(false);
  });
});

describe("tempId", () => {
  it("is prefixed so temp keys are recognisable", () => {
    expect(tempId()).toMatch(/^temp_\d+_[a-z0-9]+$/);
  });

  it("produces distinct ids on successive calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => tempId()));
    expect(ids.size).toBe(50);
  });
});
