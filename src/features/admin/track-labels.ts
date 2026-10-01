import type { AcademicLevel } from "@gireapp/shared";

/**
 * How a track is written in the UI. Deliberately *not* in a `"use client"`
 * module: a server component importing a value from one receives a client
 * reference proxy rather than the object, so every lookup silently misses and
 * falls back to the raw enum ("SECONDARY").
 */
export const TRACK_LABELS: Record<AcademicLevel, string> = {
  SECONDARY: "Secondary",
  TERTIARY: "Tertiary",
  PROFESSIONAL: "Professional",
};

export function trackLabel(academicLevel: AcademicLevel | null): string | null {
  return academicLevel ? (TRACK_LABELS[academicLevel] ?? academicLevel) : null;
}
