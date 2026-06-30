// ─────────────────────────────────────────────────
// GIREAPP — Root Layout
// Server Component with font loading, providers,
// metadata, and theme support
// ─────────────────────────────────────────────────

import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { CookieConsent } from '@/components/shared/cookie-consent';
import './globals.css';

// ── Fonts ──

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// ── Metadata (SEO) ──

export const metadata: Metadata = {
  title: {
    default: 'GIREAPP — Get It Right Edu App',
    template: '%s | GIREAPP',
  },
  description:
    'Enabling Academic Excellence Across Africa. Personalised learning dashboards for Secondary, Tertiary, and Professional students with gamified assessments and mentorship.',
  keywords: [
    'education',
    'e-learning',
    'Africa',
    'LMS',
    'academic excellence',
    'GIREAPP',
    'online courses',
    'student portal',
    'gamification',
    'mentorship',
  ],
  authors: [{ name: 'GIREAPP Team' }],
  creator: 'GIREAPP',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'GIREAPP',
    title: 'GIREAPP — Enabling Academic Excellence Across Africa',
    description:
      'Personalised learning paths with departmentalised dashboards, gamified assessments, and integrated mentorship.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GIREAPP — Get It Right Edu App',
    description: 'Enabling Academic Excellence Across Africa',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3730A3' },
    { media: '(prefers-color-scheme: dark)', color: '#1E1B4B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ── Root Layout ──

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content — WCAG 2.4.1 */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
          >
            Skip to main content
          </a>

          {children}

          {/* Global components */}
          <CookieConsent />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 5000,
              className: 'font-sans',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
