import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { serverApiClient, ApiError } from '@/lib/api-client';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Award, ClipboardList, Medal, BookOpen, Atom, FlaskConical, Sigma, type LucideIcon } from 'lucide-react';
import type { AcademicLevel, DashboardOverview } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';

interface SegmentConfig {
  level: AcademicLevel;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
}

const RECOMMENDED_SUBJECTS: { name: string; description: string; icon: LucideIcon }[] = [
  { name: 'Physics', description: 'Electromagnetism and more', icon: Atom },
  { name: 'Chemistry', description: 'Chemical bonding and more', icon: FlaskConical },
  { name: 'Mathematics', description: 'Algebra equation and more', icon: Sigma },
];

async function getDashboardData() {
  try {
    const { data } = await serverApiClient<DashboardOverview>(API_PATHS.DASHBOARD.OVERVIEW);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      redirect('/login');
    }
    return {
      profile: null,
      totalPoints: 0,
      badgeCount: 0,
      activeCourses: [],
      recentActivity: [],
    } as unknown as DashboardOverview;
  }
}

export async function SegmentDashboard({ config }: { config: SegmentConfig }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.academicLevel !== config.level) redirect('/dashboard');

  const data = await getDashboardData();
  const enrolments = data.activeCourses || [];
  const firstCourse = enrolments[0];

  const firstName = data.profile?.name?.trim().split(' ')[0] || session.email.split('@')[0];
  const points = data.totalPoints || 0;
  const quizzesTaken = (data.recentActivity || []).filter(
    (a) => a.type === 'quiz_passed' || a.type === 'quiz_failed'
  ).length;
  const isReturning = points > 0 || enrolments.length > 0;

  return (
    <div className="mx-auto w-full max-w-md space-y-8 pb-8">
      <section className="relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 to-indigo-700 p-5">
        <div className="relative z-10 max-w-[62%] space-y-1">
          <p className="text-[14px] text-indigo-200">Hello, {firstName}!</p>
          <h1 className="font-heading text-[20px] font-bold leading-tight text-white">
            {isReturning ? 'Welcome back' : 'Welcome to GIREAPP'}
          </h1>
          <p className="text-[13px] text-indigo-100">
            {isReturning ? 'Ready to continue?' : 'Let’s start your learning journey.'}
          </p>
          <Link
            href={isReturning && firstCourse ? `/dashboard/courses/${firstCourse.id}` : '/dashboard/courses'}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-coral-500 px-5 font-heading text-[14px] font-bold text-white transition-colors hover:bg-coral-600"
          >
            {isReturning ? 'Continue learning' : 'Get started'}
          </Link>
        </div>
        <Image
          src="/dashboard-hero.svg"
          alt=""
          aria-hidden
          width={598}
          height={626}
          className="pointer-events-none absolute bottom-0 right-0 h-[95%] w-auto max-w-[46%] select-none object-contain object-bottom"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Your Progress" href="/dashboard/courses" />
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Star} label="Learning points" value={formatNumber(points)} caption="Keep learning" />
          <StatCard icon={Award} label="Badges earned" value={(data.badgeCount || 0).toString()} caption="Earn your first badge" />
          <StatCard icon={ClipboardList} label="Quizzes taken" value={quizzesTaken.toString()} caption="Take your first quiz" />
          <StatCard icon={Medal} label="Rank" value="-" caption="Get started to rank" />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-indigo-100 p-5">
        <div className="mb-3 flex items-center gap-2 text-indigo-950">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          <span className="font-heading text-[15px] font-bold">Continue Learning</span>
        </div>
        <p className="font-heading text-[14px] font-bold text-indigo-950">
          {firstCourse ? 'Pick up where you left off' : 'Ready to begin?'}
        </p>
        <p className="mt-1 max-w-[70%] text-[13px] text-indigo-400">
          {firstCourse ? firstCourse.title : 'Start your first lesson and it will appear here'}
        </p>
        <Link
          href={firstCourse ? `/dashboard/courses/${firstCourse.id}` : '/dashboard/courses'}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-indigo-800 px-5 font-heading text-[14px] font-bold text-white transition-colors hover:bg-indigo-900"
        >
          {firstCourse ? 'Resume' : 'Explore Subjects'}
        </Link>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Recommended Subjects" href="/dashboard/courses" />
        <div className="space-y-3">
          {RECOMMENDED_SUBJECTS.map((subject) => (
            <SubjectRow key={subject.name} {...subject} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-white p-5">
        <p className="font-heading text-[15px] font-bold text-indigo-950">Need guidance?</p>
        <p className="mt-1 max-w-[62%] text-[13px] text-indigo-400">
          Connect with a mentor who can help you stay focused and overcome challenges
        </p>
        <Link
          href="/dashboard/mentors"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-coral-500 px-5 font-heading text-[14px] font-bold text-white transition-colors hover:bg-coral-600"
        >
          Find a mentor
        </Link>
      </section>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-[16px] font-bold text-indigo-950">{title}</h2>
      <Link href={href} className="text-[13px] font-medium text-indigo-500 hover:underline">
        View All
      </Link>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-indigo-100 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-[13px] font-bold leading-tight text-indigo-950">{label}</p>
        <p className="font-heading text-[18px] font-bold leading-tight text-indigo-950">{value}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-indigo-400">{caption}</p>
      </div>
    </div>
  );
}

function SubjectRow({ name, description, icon: Icon }: { name: string; description: string; icon: LucideIcon }) {
  return (
    <Link
      href="/dashboard/courses"
      className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 transition-colors hover:border-indigo-200"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-800 text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-bold leading-tight text-indigo-950">{name}</p>
        <p className="truncate text-[12px] text-indigo-400">{description}</p>
      </div>
      <span className="shrink-0 rounded-lg border border-indigo-300 px-3 py-1.5 text-[13px] font-medium text-indigo-800">
        Explore
      </span>
    </Link>
  );
}
