// ─────────────────────────────────────────────────
// GIREAPP — Shared Segment Dashboard Component
// Reusable across secondary, tertiary, professional
// ─────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { serverApiClient, ApiError } from '@/lib/api-client';
import { formatNumber, formatProgress } from '@/lib/utils';
import { BookOpen, Trophy, Star, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AcademicLevel, DashboardOverview } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';

interface SegmentConfig {
  level: AcademicLevel;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
}

async function getDashboardData() {
  try {
    const { data } = await serverApiClient<DashboardOverview>(API_PATHS.DASHBOARD.OVERVIEW);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
       redirect('/login');
    }
    // Return empty fallback instead of crashing
    return {
      profile: null,
      totalPoints: 0,
      badgeCount: 0,
      activeCourses: [],
      recentActivity: []
    } as unknown as DashboardOverview;
  }
}

export async function SegmentDashboard({ config }: { config: SegmentConfig }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Enforce segment match — redirect if user is on wrong segment
  if (session.academicLevel !== config.level) {
    redirect('/dashboard');
  }

  const data = await getDashboardData();
  const enrolments = data.activeCourses || [];

  return (
    <div className="space-y-8">
      {/* ── Segment Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={config.badgeBg}>
            {config.level}
          </Badge>
          {session.department && (
            <Badge variant="outline">{session.department}</Badge>
          )}
        </div>
        <h1 className="text-h2 text-foreground">
          Welcome back, {session.email.split('@')[0]}! 👋
        </h1>
        <p className="text-body text-muted-foreground">
          {config.subtitle}
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={BookOpen}
          label="Active Courses"
          value={enrolments.length.toString()}
          color="indigo"
        />
        <StatsCard
          icon={Trophy}
          label="Badges Earned"
          value={data.badgeCount?.toString() || '0'}
          color="coral"
        />
        <StatsCard
          icon={Star}
          label="Total Points"
          value={formatNumber(data.totalPoints || 0)}
          color="amber"
        />
        <StatsCard
          icon={Clock}
          label="Avg Progress"
          value={
            enrolments.length > 0
              ? formatProgress(
                  enrolments.reduce((sum, e) => sum + e.progress, 0) /
                    enrolments.length
                )
              : '0%'
          }
          color="emerald"
        />
      </div>

      {/* ── Active Courses ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-foreground">Your Courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Browse All <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {enrolments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-h4 text-foreground mb-2">No courses yet</h3>
              <p className="text-body-sm text-muted-foreground mb-6 max-w-sm">
                Browse available courses for your department and start your learning journey.
              </p>
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolments.map((course) => {
              const progressPercent = Math.round(course.progress * 100);

              return (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.id}`}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <h3 className="text-h4 text-foreground group-hover:text-primary transition-colors mb-1">
                          {course.title}
                        </h3>
                        <p className="text-body-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-caption text-muted-foreground">
                          <span>
                            {course.moduleCount} modules •{' '}
                            {course.lessonCount} lessons
                          </span>
                          <span className="font-medium">
                            {progressPercent}%
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Stats Card ──

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  color: 'indigo' | 'coral' | 'amber' | 'emerald';
}) {
  const bgMap = {
    indigo:
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    coral:
      'bg-coral-100 dark:bg-coral-900/30 text-coral-500 dark:text-coral-400',
    amber:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    emerald:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div
          className={`w-9 h-9 rounded-lg ${bgMap[color]} flex items-center justify-center mb-3`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-caption text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
