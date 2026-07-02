// ─────────────────────────────────────────────────
// GIREAPP — Auth Layout
// Shared layout for login, register, verify, etc.
// ─────────────────────────────────────────────────

import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      {/* ── Global Background Image ── */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/signup-bg-image.svg" 
          alt="Background" 
          fill 
          priority
          className="object-cover object-center" 
        />
      </div>

      {/* ── Left: Brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col relative bg-indigo-800/85 text-white">
        <div className="relative z-10 px-8 py-12 xl:p-12 flex flex-col h-full">
          <Link href="/" className="mt-12 mb-auto inline-block">
            <Image 
              src="/logo-white.svg" 
              alt="GIREAPP" 
              width={212} 
              height={56} 
              priority 
              className="w-auto h-12 lg:h-14" 
            />
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-[460px] mb-24">
            <h2 className="text-[56px] leading-[1.1] font-heading font-bold mb-8">
              <span className="text-white">Get It </span>
              <span className="text-coral-500">Right,<br /></span>
              <span className="text-white">The First Time.</span>
            </h2>
            <p className="text-[20px] text-white font-normal mb-12">
              Your path to academic success shouldn’t be a guessing game. GIREAPP gives you the exact courses, mentorship and practice you need to excel at every stage.
            </p>
            <div className="flex flex-row items-center gap-4 lg:gap-5 text-indigo-200 text-[15px] font-sans font-normal">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-coral-500 shrink-0" aria-hidden="true" />
                Gamified learning
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
                Mentorship access
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" aria-hidden="true" />
                NDPR compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Auth form ── */}
      <div className="flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-12 bg-white/85">
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
