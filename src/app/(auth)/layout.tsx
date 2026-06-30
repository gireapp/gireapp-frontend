// ─────────────────────────────────────────────────
// GIREAPP — Auth Layout
// Shared layout for login, register, verify, etc.
// ─────────────────────────────────────────────────

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-hero text-white p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <span className="font-heading font-bold text-2xl">GIREAPP</span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-display text-white leading-tight">
            Get It Right,<br />
            <span className="text-coral-400">The First Time.</span>
          </h2>
          <p className="text-lg text-indigo-200 max-w-md">
            Personalised learning paths for Secondary, Tertiary, and Professional 
            students across Africa. Your journey to academic excellence starts here.
          </p>
          <div className="flex items-center gap-4 text-sm text-indigo-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Gamified learning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-coral-400" aria-hidden="true" />
              Mentorship access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
              NDPR compliant
            </span>
          </div>
        </div>

        <p className="text-sm text-indigo-400">
          © {new Date().getFullYear()} GIREAPP — Enabling Academic Excellence Across Africa
        </p>
      </div>

      {/* ── Right: Auth form ── */}
      <div className="flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">GIREAPP</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
