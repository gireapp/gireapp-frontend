import EducationCard, {
  Features,
  educationLevels,
} from "@/components/landing-page/EducationCard";

import Image from "next/image";
import Link from "next/link";
import { SafeLink } from "@/components/shared/safe-link";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-indigo-800 border-b border-border/40">
        <nav className="flex items-center justify-between px-4 py-6 mx-auto max-w-7xl md:px-6">
          <Image
            src="/logo-white.svg"
            alt="GIREAPP Logo"
            width={136}
            height={32}
            className="w-[106px] h-[28px] md:w-[136px] md:h-[32px]"
          />

          <div className="flex items-center gap-4 font-inter">
            <Link
              href="/login"
              className="text-base font-normal transition-colors text-indigo-50 hover:text-white"
            >
              Login
            </Link>
            <SafeLink
              href="/register"
              id="nav-signup-cta"
              className="flex gap-1 items-center justify-center bg-orange-500 text-white rounded-lg font-normal text-base py-1 px-2.5"
            >
              Sign up
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.5 12H5"
                  stroke="#EEF2FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
                  stroke="#EEF2FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SafeLink>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* ── Hero Section ── */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b md:pt-36 md:pb-40 border-border/40">
          {/* Background image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/landing-page/Hero-banner-image.png"
              alt="Hero background image"
              fill
              priority
              className="object-cover bg-indigo-50"
            />
          </div>
          <div className="container relative px-4 mx-auto text-center max-w-7xl md:px-6">
            <div className="max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-indigo-200 border border-border/50 text-indigo-800 text-sm md:text-base font-normal md:font-medium animate-fade-in backdrop-blur-sm mx-auto hover:bg-indigo-50 transition-colors cursor-default w-[22rem] md:w-[30rem] h-12 font-plus-jakarta-sans">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
                <span>Enabling Academic Excellence Across Africa</span>
              </div>

              {/* Headline */}
              <h1
                className="mt-16 md:mt-24 text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-indigo-800 animate-fade-in tracking-tight leading-[1.1] md:leading-[1.1] font-plus-jakarta-sans"
                style={{ animationDelay: "100ms" }}
              >
                Get It <span className="text-orange-500">Right</span>,
                <br />
                The First Time.
              </h1>

              {/* Subheadline */}
              <p
                className="max-w-4xl mx-auto mt-6 text-base font-normal leading-tight text-indigo-500 md:text-xl animate-fade-in md:leading-relaxed font-inter"
                style={{ animationDelay: "200ms" }}
              >
                Your path to academic success shouldn't be a guessing game.
                GIREAPP gives you the exact courses, mentorship, and practice
                you need to excel at every stage.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col items-center justify-center gap-4 pt-4 mt-10 sm:flex-row animate-fade-in font-inter"
                style={{ animationDelay: "300ms" }}
              >
                <SafeLink
                  href="/register"
                  id="hero-signup-cta"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 text-white rounded-lg text-base font-normal hover:bg-orange-500/90 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(55,48,163,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] w-60"
                >
                  Start Learning - Free
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.5 12H5"
                      stroke="#EEF2FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
                      stroke="#EEF2FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </SafeLink>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-indigo-800 text-indigo-800 rounded-lg text-base font-normal hover:bg-indigo-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] w-60 shadow-sm"
                >
                  Explore Features
                </Link>
              </div>

              <p className="px-4 mt-16 text-sm text-indigo-400 text-normal md:px-0 font-inter">
                Trusted by 500+ students across Nigeria, Ghana and South Africa
              </p>
            </div>
          </div>
        </section>

        {/* ── Segments Section ── */}
        <section className="relative py-16 bg-indigo-800">
          <div className="container max-w-[1376px] px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center mb-10 space-y-4 text-center md:mb-16">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-indigo-50 font-plus-jakarta-sans">
                Your <span className="text-orange-500">Track</span>, <br /> Your
                Dashboard
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-indigo-400 md:text-lg font-inter">
                GIREAPP instantly tailors your experience based on your academic
                level. No noise, no irrelevant content-just what you need to
                succeed.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {educationLevels.map((level) => (
                <EducationCard key={level.title} {...level} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="py-24 md:py-32 bg-indigo-50">
          <div className="container px-4 mx-auto max-w-7xl md:px-6">
            <div className="flex flex-col items-center mb-10 space-y-4 text-center md:mb-16">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-indigo-800 font-plus-jakarta-sans">
                Everything you need to <br />{" "}
                <span className="text-orange-500">Excel</span>
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-indigo-400 md:text-lg font-inter">
                From structured lessons to gamified assessments and real
                mentorship - GIREAPP is your complete academic companion.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
              {Features.map((level) => (
                <EducationCard key={level.title} {...level} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="relative pt-16 md:pt-32">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/landing-page/Bottom-banner-image.png"
              alt="Hero background image"
              fill
              priority
              className="object-cover bg-indigo-800"
            />
          </div>
          <div className="container max-w-4xl px-4 mx-auto space-y-4 text-center md:px-6 md:space-y-8">
            <h2 className="px-20 text-3xl font-bold tracking-tight md:text-5xl text-indigo-50 md:px-0 font-plus-jakarta-sans">
              Ready to get it <span className="text-orange-500">right?</span>
            </h2>
            <p className="max-w-2xl px-2 mx-auto text-lg leading-tight text-indigo-400 md:text-xl md:px-0 md:leading-relaxed font-inter">
              Join thousands of Students across Africa who are taking control of
              their academic future.
            </p>
            <div className="pt-10 md:pt-14">
              <SafeLink
                href="/register"
                id="hero-signup-cta"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 text-white rounded-lg text-base font-normal hover:bg-orange-500/90 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(55,48,163,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] w-60 font-plus-jakarta-sans"
              >
                Create Free Account
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.5 12H5"
                    stroke="#EEF2FF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
                    stroke="#EEF2FF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </SafeLink>
            </div>
          </div>

          <div className="flex justify-center px-4 pb-2 mt-16 md:px-10 md:pb-4 md:justify-end md:mt-24">
            <p className="text-[10px] md:text-sm text-indigo-200 font-inter">
              ©️ {new Date().getFullYear()} GIREAPP. All rights reserved.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
