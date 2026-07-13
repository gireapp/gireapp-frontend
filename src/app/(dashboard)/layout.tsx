// ─────────────────────────────────────────────────
// GIREAPP — Dashboard Layout (M2: Segment Routing)
// Routes users to their segment dashboard
// ─────────────────────────────────────────────────

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DashboardSidebar } from '@/features/courses/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.isOnboardingComplete) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        user={{
          name: session.email,
          department: session.department,
          academicLevel: session.academicLevel,
        }}
      />

      <main
        id="main-content"
        className="lg:pl-64 pb-20 lg:pb-0 min-h-screen"
      >
        <div className="container max-w-6xl px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
