import type { Metadata } from 'next';
import { SegmentDashboard } from '@/features/courses/segment-dashboard';

export const metadata: Metadata = {
  title: 'Professional Dashboard',
  description: 'Your personalised GIREAPP dashboard for professional certifications.',
};

export default function ProfessionalDashboard() {
  return (
    <SegmentDashboard
      config={{
        level: 'PROFESSIONAL',
        title: 'Professional Dashboard',
        subtitle: 'Industry certifications & skill-building for working adults and career changers.',
        accentColor: 'emerald',
        badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      }}
    />
  );
}
