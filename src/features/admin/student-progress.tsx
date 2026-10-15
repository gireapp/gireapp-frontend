/**
 * Figma "Frame 114" — the percentage above a 4px track. Rendered only when the
 * student has an enrolment; a bar at 0% would read as "no progress" rather than
 * "not enrolled".
 */
export function StudentProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-[164px]">
      <p className="font-sans text-[14px] text-indigo-950">{progress}%</p>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
        className="mt-1 h-1 w-full overflow-hidden rounded bg-indigo-200"
      >
        <div
          className="h-full rounded bg-indigo-800"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
