import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

const SEGMENT_MAP: Record<string, string> = {
  SECONDARY: '/dashboard/secondary',
  TERTIARY: '/dashboard/tertiary',
  PROFESSIONAL: '/dashboard/professional',
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const segment = session.academicLevel;
  const target = segment ? SEGMENT_MAP[segment] : null;

  if (target) {
    redirect(target);
  }

  redirect('/onboarding');
}
