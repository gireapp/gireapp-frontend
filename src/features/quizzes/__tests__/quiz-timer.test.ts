import { describe, it, expect } from "vitest";
import {
  describeDuration,
  formatClock,
  remainingSeconds,
} from "@/features/quizzes/quiz-timer";

describe("remainingSeconds", () => {
  const expiresAt = "2026-10-05T12:30:00.000Z";
  const at = (iso: string) => new Date(iso).getTime();

  it("counts whole seconds left, rounding a part-second up", () => {
    expect(remainingSeconds(expiresAt, at("2026-10-05T12:29:58.500Z"))).toBe(2);
  });

  it("never goes negative once time is up", () => {
    expect(remainingSeconds(expiresAt, at("2026-10-05T12:31:00.000Z"))).toBe(0);
  });
});

describe("formatClock", () => {
  it.each([
    [0, "00:00"],
    [7, "00:07"],
    [247, "04:07"],
    [1800, "30:00"],
    [-5, "00:00"],
  ])("shows %i seconds as %s", (seconds, clock) => {
    expect(formatClock(seconds)).toBe(clock);
  });
});

describe("describeDuration", () => {
  it.each([
    [42, "42 sec"],
    [60, "1 min"],
    [247, "4 min 7 sec"],
  ])("reads %i seconds as %s", (seconds, spoken) => {
    expect(describeDuration(seconds)).toBe(spoken);
  });
});
