const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/** Whole seconds left until `expiresAt`, never negative. */
export function remainingSeconds(
  expiresAt: string,
  now: number = Date.now(),
): number {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - now) / MS_PER_SECOND),
  );
}

/** "04:07" — the countdown and the time-taken readout. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / SECONDS_PER_MINUTE);
  const seconds = safe % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Spoken time for screen readers and the result: "4 min 7 sec". */
export function describeDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / SECONDS_PER_MINUTE);
  const seconds = safe % SECONDS_PER_MINUTE;
  if (minutes === 0) return `${seconds} sec`;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
}
