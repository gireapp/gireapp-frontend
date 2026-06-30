// ─────────────────────────────────────────────────
// GIREAPP — Global Loading Skeleton
// Shown during route transitions
// ─────────────────────────────────────────────────

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo pulse */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-primary/20 animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/40 animate-ping" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
