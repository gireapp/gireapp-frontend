// ─────────────────────────────────────────────────
// GIREAPP — Landing Page
// High-end, polished, modern design (Anti-Slop)
// ─────────────────────────────────────────────────

import Link from 'next/link';
import { GraduationCap, BookOpen, Trophy, Users, ArrowRight, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { SafeLink } from '@/components/shared/safe-link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
        <nav className="container max-w-7xl flex items-center justify-between h-16 px-4 md:px-6 mx-auto">
          <Link href="/" className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-heading font-semibold text-[1.125rem] tracking-tight text-foreground">
              GIREAPP
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              Log in
            </Link>
            <SafeLink
              href="/register"
              id="nav-signup-cta"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-sm active:scale-95"
            >
              Sign Up
            </SafeLink>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-36 md:pb-40 border-b border-border/40">
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
            aria-hidden="true"
          />

          <div className="container max-w-7xl relative px-4 md:px-6 mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm font-medium animate-fade-in backdrop-blur-sm mx-auto hover:bg-muted transition-colors cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="tracking-tight">Enabling Academic Excellence Across Africa</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-foreground animate-fade-in tracking-tight leading-[1.1] md:leading-[1.1]" style={{ animationDelay: '100ms' }}>
                Get It Right,<br className="hidden sm:block" />
                <span className="text-muted-foreground"> The First Time.</span>
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed font-normal"
                style={{ animationDelay: '200ms' }}
              >
                Your path to academic success shouldn't be a guessing game. GIREAPP gives you the exact courses, mentorship, and practice you need to excel at every stage.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in"
                style={{ animationDelay: '300ms' }}
              >
                <SafeLink
                  href="/register"
                  id="hero-signup-cta"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-medium hover:bg-primary/90 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(55,48,163,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] w-full sm:w-auto"
                >
                  Start Learning Free
                </SafeLink>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-card border border-border/60 text-foreground rounded-full text-base font-medium hover:bg-muted/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] w-full sm:w-auto shadow-sm"
                >
                  Explore Features
                  <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Segments Section ── */}
        <section className="py-24 md:py-32 bg-background relative">
          <div className="container max-w-7xl px-4 md:px-6 mx-auto">
            <div className="max-w-3xl space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Your Track, Your Dashboard
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                GIREAPP dynamically adapts your experience based on your academic level. No clutter, just the resources you actually need.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Secondary */}
              <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-8 hover:bg-card/80 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Secondary Education</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Tailored WAEC and JAMB preparation for Science, Business, and Arts students.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Science', 'Business', 'Arts'].map((dept) => (
                    <span
                      key={dept}
                      className="px-3 py-1 bg-background border border-border/40 text-muted-foreground rounded-full text-xs font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tertiary */}
              <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-8 hover:bg-card/80 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-coral-500/10 flex items-center justify-center mb-8 border border-coral-500/20">
                  <GraduationCap className="w-5 h-5 text-coral-600 dark:text-coral-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Tertiary Studies</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Advanced modules for undergrads and postgrads, including thesis support and research methodology.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Undergrad', 'Postgrad'].map((dept) => (
                    <span
                      key={dept}
                      className="px-3 py-1 bg-background border border-border/40 text-muted-foreground rounded-full text-xs font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Professional */}
              <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-8 hover:bg-card/80 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                  <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Professional Skills</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Industry-recognized training for career advancement, optimized with data-saver mode.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Data', 'Management', 'Marketing'].map((dept) => (
                    <span
                      key={dept}
                      className="px-3 py-1 bg-background border border-border/40 text-muted-foreground rounded-full text-xs font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="py-24 md:py-32 border-t border-border/40 bg-muted/20">
          <div className="container max-w-7xl px-4 md:px-6 mx-auto">
            <div className="max-w-3xl space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Everything you need. Nothing you don't.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                A seamless blend of structured curriculum, interactive assessments, and expert guidance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {[
                {
                  icon: BookOpen,
                  title: 'Structured Learning Paths',
                  description: 'Rich markdown lessons, PDFs, and multimedia organized into intuitive modules that track your progression automatically.',
                },
                {
                  icon: Trophy,
                  title: 'Gamified Assessments',
                  description: 'Test your knowledge and earn rank badges as you complete quizzes. Moving from Bronze to Master keeps you motivated.',
                },
                {
                  icon: Users,
                  title: 'Expert Mentorship',
                  description: 'Stuck on a concept? Connect directly with verified academic counselors and industry mentors within the platform.',
                },
                {
                  icon: Shield,
                  title: 'Enterprise-Grade Privacy',
                  description: 'Fully NDPR and POPIA compliant. Your academic records and personal data are encrypted and strictly access-controlled.',
                },
              ].map((feature) => (
                <div 
                  key={feature.title} 
                  className="bg-card border border-border/50 rounded-3xl p-8 hover:shadow-sm transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border/60 flex items-center justify-center shadow-sm">
                      <feature.icon className="w-5 h-5 text-foreground" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-24 md:py-32 border-t border-border/40">
          <div className="container max-w-4xl px-4 md:px-6 mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Ready to accelerate your learning?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of ambitious students across Africa taking control of their academic future today.
            </p>
            <div className="pt-4">
              <SafeLink
                href="/register"
                id="footer-signup-cta"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full text-base font-medium hover:bg-foreground/90 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
              >
                Create your free account
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </SafeLink>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background/50">
        <div className="container max-w-7xl px-4 md:px-6 py-12 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-heading font-semibold text-foreground">GIREAPP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GIREAPP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
