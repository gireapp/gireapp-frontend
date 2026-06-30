import type { Metadata } from 'next';
import { SegmentDashboard } from '@/features/courses/segment-dashboard';

export const metadata: Metadata = {
  title: 'Secondary Dashboard',
  description: 'Your personalised GIREAPP dashboard for secondary school students.',
};

export default function SecondaryDashboard() {
  return (
    <SegmentDashboard
      config={{
        level: 'SECONDARY',
        title: 'Secondary Dashboard',
        subtitle: 'Science, Business & Arts — WAEC and JAMB preparation at your fingertips.',
        accentColor: 'indigo',
        badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      }}
    />
  );
}
