import type { Metadata } from 'next';
import { SegmentDashboard } from '@/features/courses/segment-dashboard';

export const metadata: Metadata = {
  title: 'Tertiary Dashboard',
  description: 'Your personalised GIREAPP dashboard for university students.',
};

export default function TertiaryDashboard() {
  return (
    <SegmentDashboard
      config={{
        level: 'TERTIARY',
        title: 'Tertiary Dashboard',
        subtitle: 'Undergraduate & Postgraduate — research, thesis support, and career growth.',
        accentColor: 'coral',
        badgeBg: 'bg-coral-100 text-coral-700 dark:bg-coral-900/30 dark:text-coral-300',
      }}
    />
  );
}
