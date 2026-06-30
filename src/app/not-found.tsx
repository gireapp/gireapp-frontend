// ─────────────────────────────────────────────────
// GIREAPP — Custom 404 Page (M5: FE-SEC-028)
// Friendly not-found with Go Home CTA
// ─────────────────────────────────────────────────

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Illustration */}
        <div className="space-y-1">
          <p className="text-8xl font-bold text-gradient-brand select-none" aria-hidden="true">
            404
          </p>
          <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-indigo-800 to-coral-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground text-base">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
