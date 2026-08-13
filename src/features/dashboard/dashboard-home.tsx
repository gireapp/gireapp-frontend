import Link from "next/link";
import {
  BookOpen,
  Award,
  ClipboardList,
  Trophy,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { DashboardOverview, CourseCard } from "@gireapp/shared";
import { formatNumber } from "@/lib/utils";
import { DashboardTopbar } from "@/features/dashboard/dashboard-topbar";

const CARD_CLASSNAME = "rounded-lg bg-indigo-100";
const SECTION_TITLE_CLASSNAME =
  "font-heading text-[20px] font-bold text-indigo-950";
const VIEW_ALL_CLASSNAME =
  "font-sans text-[16px] text-indigo-400 hover:underline";
const PRIMARY_BUTTON_CLASSNAME =
  "inline-flex h-12 items-center justify-center gap-1 rounded-lg px-3 font-sans text-[14px] text-indigo-50 transition-colors";

/**
 * Figures the design shows that `DashboardOverview` does not carry yet. Each is
 * optional so the UI renders correctly today and needs only a wider mapping —
 * not a rewrite — once the backend supplies them.
 */
export type DashboardExtras = {
  /** Points earned this week, for the "+240 this week" stat hint. */
  weeklyPoints?: number;
  /** 0–1 share of the weekly goal met, for the hero progress bar. */
  weeklyGoalProgress?: number;
  /** Mean quiz score as a percentage. */
  averageScore?: number;
  /** Pre-formatted standing, e.g. "Top 10%". */
  rank?: string;
  /** Quizzes remaining before the next badge unlocks. */
  quizzesToNextBadge?: number;
  nextQuiz?: { id: string; title: string; dueDate: string | null };
};

function findResumeCourse(courses: CourseCard[]): CourseCard | null {
  const started = courses.filter((c) => c.progress > 0 && c.progress < 1);
  const [first] = started.length > 0 ? started : courses;
  return first ?? null;
}

export function DashboardHome({
  name,
  department,
  overview,
  extras = {},
}: {
  name: string;
  department: string | null;
  overview: DashboardOverview | null;
  extras?: DashboardExtras;
}) {
  const firstName = name.trim().split(" ")[0] ?? name;
  const courses = overview?.activeCourses ?? [];
  const resume = findResumeCourse(courses);
  const points = overview?.totalPoints ?? 0;
  const badges = overview?.badgeCount ?? 0;
  const quizzes =
    overview?.recentActivity.filter((a) => a.type.startsWith("quiz_")).length ??
    0;

  const hasStarted = points > 0 || badges > 0 || resume !== null;

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-[57px]">
      <DashboardTopbar name={name} department={department} />

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Returning learners get the greeting above the card; new ones get it
              inside, where the card carries the whole welcome. */}
          {hasStarted && (
            <div className="flex flex-col gap-1">
              <p className="font-heading text-[16px] font-bold text-indigo-950">
                Hello again, {firstName}!
              </p>
              <p className="font-sans text-[16px] text-indigo-400">
                Let’s continue your learning journey
              </p>
            </div>
          )}

          <WelcomeCard
            firstName={firstName}
            hasStarted={hasStarted}
            weeklyGoalProgress={extras.weeklyGoalProgress}
          />

          <section className="flex flex-col gap-8">
            <SectionHeader title="Your Progress" href="/dashboard/progress" />
            <ProgressCard
              points={points}
              badges={badges}
              quizzes={quizzes}
              hasStarted={hasStarted}
              extras={extras}
            />
          </section>

          <NeedGuidanceCard />
        </div>

        <div className="flex flex-col gap-8 xl:w-[443px] xl:shrink-0">
          <ResumeCard resume={resume} />

          <section className="flex flex-col gap-8">
            <SectionHeader
              title="Recommended Subjects"
              href="/dashboard/courses"
            />
            <RecommendedSubjects courses={courses} />
          </section>

          {extras.nextQuiz && (
            <section className="flex flex-col gap-6">
              <h2 className={SECTION_TITLE_CLASSNAME}>Up Next</h2>
              <UpNextCard quiz={extras.nextQuiz} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className={SECTION_TITLE_CLASSNAME}>{title}</h2>
      <Link href={href} className={VIEW_ALL_CLASSNAME}>
        View All
      </Link>
    </div>
  );
}

function WelcomeCard({
  firstName,
  hasStarted,
  weeklyGoalProgress,
}: {
  firstName: string;
  hasStarted: boolean;
  weeklyGoalProgress?: number;
}) {
  const weeklyPercent =
    weeklyGoalProgress === undefined
      ? null
      : Math.round(weeklyGoalProgress * 100);

  return (
    <section className="relative flex min-h-[288px] items-center overflow-hidden rounded-lg bg-indigo-800 px-14 py-10">
      <div className="flex w-full max-w-[360px] flex-col gap-2">
        {!hasStarted && (
          <p className="font-heading text-[16px] font-bold text-indigo-400">
            Hello, {firstName}!
          </p>
        )}

        <h1 className="font-heading text-[28px] font-bold leading-tight text-indigo-50">
          {hasStarted
            ? "Keep going, you’re making progress."
            : "Welcome to GIREAPP"}
        </h1>

        {!hasStarted && (
          <p className="font-sans text-[16px] text-indigo-200">
            Let’s start your learning journey.
          </p>
        )}

        {weeklyPercent !== null && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-sans text-[12px] text-indigo-200">
                Weekly goal
              </span>
              <span className="font-sans text-[12px] text-indigo-200">
                {weeklyPercent}% completed
              </span>
            </div>
            <div
              className="h-0.5 w-full rounded-full bg-indigo-100"
              role="progressbar"
              aria-valuenow={weeklyPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Weekly goal"
            >
              <div
                className="h-full rounded-full bg-coral-500"
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </div>
        )}

        <Link
          href="/dashboard/courses"
          className={`${PRIMARY_BUTTON_CLASSNAME} mt-6 w-full max-w-[316px] bg-coral-500 hover:bg-coral-600`}
        >
          {hasStarted ? "Continue learning" : "Get started"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <Sparkles
        className="absolute -right-6 bottom-0 hidden h-[269px] w-[257px] text-indigo-700 lg:block"
        aria-hidden="true"
      />
    </section>
  );
}

function ResumeCard({ resume }: { resume: CourseCard | null }) {
  const percent = resume ? Math.round(resume.progress * 100) : null;

  return (
    <section
      className={`${CARD_CLASSNAME} flex min-h-[288px] flex-col gap-3 p-14 pt-10`}
    >
      <div className="flex items-center gap-1">
        <BookOpen className="h-8 w-8 text-indigo-950" aria-hidden="true" />
        <h2 className={SECTION_TITLE_CLASSNAME}>
          {resume ? "Continue Learning" : "Start Learning"}
        </h2>
      </div>

      <p className="font-heading text-[16px] font-bold text-indigo-950">
        {resume ? resume.title : "Ready to begin?"}
      </p>
      <p className="font-sans text-[16px] text-indigo-400">
        {resume
          ? resume.description
          : "Start your first lesson and it will appear here"}
      </p>

      {percent !== null && (
        <div className="flex items-center gap-3">
          <div
            className="h-0.5 flex-1 rounded-full bg-indigo-400"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${resume?.title ?? "Course"} progress`}
          >
            <div
              className="h-full rounded-full bg-indigo-800"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-sans text-[16px] text-indigo-400">
            {percent}%
          </span>
        </div>
      )}

      <Link
        href={resume ? `/dashboard/courses/${resume.id}` : "/dashboard/courses"}
        className={`${PRIMARY_BUTTON_CLASSNAME} mt-auto w-full max-w-[205px] bg-indigo-800 hover:bg-indigo-900`}
      >
        {resume ? "Continue" : "Explore Subjects"}
      </Link>
    </section>
  );
}

function ProgressCard({
  points,
  badges,
  quizzes,
  hasStarted,
  extras,
}: {
  points: number;
  badges: number;
  quizzes: number;
  hasStarted: boolean;
  extras: DashboardExtras;
}) {
  const stats = [
    {
      icon: Trophy,
      label: "Learning points",
      value: formatNumber(points),
      hint:
        extras.weeklyPoints !== undefined
          ? `+${formatNumber(extras.weeklyPoints)} this week`
          : hasStarted
            ? "Keep it up"
            : "Keep learning",
      positive: extras.weeklyPoints !== undefined,
    },
    {
      icon: Award,
      label: "Badges earned",
      value: formatNumber(badges),
      hint:
        extras.quizzesToNextBadge !== undefined
          ? `Next badge: ${extras.quizzesToNextBadge} quizzes`
          : badges > 0
            ? "Keep collecting"
            : "Earn your first badge",
      positive: false,
    },
    {
      icon: ClipboardList,
      label: "Quizzes taken",
      value: formatNumber(quizzes),
      hint:
        extras.averageScore !== undefined
          ? `${extras.averageScore}% average score`
          : quizzes > 0
            ? "Keep testing yourself"
            : "Take your first quiz",
      positive: extras.averageScore !== undefined,
    },
    {
      icon: Sparkles,
      label: "Rank",
      value: extras.rank ?? "-",
      hint: extras.rank ? "in your track" : "Get started to rank",
      positive: false,
    },
  ];

  return (
    <div
      className={`${CARD_CLASSNAME} grid grid-cols-1 gap-6 px-6 py-3 sm:grid-cols-2`}
    >
      {stats.map((stat) => (
        <StatTile key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  positive,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  positive: boolean;
}) {
  return (
    <div className="flex min-h-[120px] items-center gap-8 rounded-lg bg-indigo-50 px-6 py-2">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-200">
        <Icon
          className="h-[30px] w-[30px] text-indigo-800"
          aria-hidden="true"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="font-heading text-[16px] font-medium text-indigo-800">
          {label}
        </span>
        <span className="font-sans text-[16px] text-indigo-950">{value}</span>
        <span
          className={`font-sans text-[14px] ${
            positive ? "text-green-500" : "text-indigo-400"
          }`}
        >
          {hint}
        </span>
      </span>
    </div>
  );
}

function RecommendedSubjects({ courses }: { courses: CourseCard[] }) {
  if (courses.length === 0) {
    return (
      <div
        className={`${CARD_CLASSNAME} flex min-h-[392px] items-center justify-center p-8`}
      >
        <p className="max-w-[280px] text-center font-sans text-[14px] text-indigo-400">
          Subjects picked for you will appear here once your department is set
          up.
        </p>
      </div>
    );
  }

  return (
    <ul className={`${CARD_CLASSNAME} flex min-h-[392px] flex-col gap-2 p-2`}>
      {courses.slice(0, 4).map((course) => (
        <li
          key={course.id}
          className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-200">
            <BookOpen className="h-6 w-6 text-indigo-800" aria-hidden="true" />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-heading text-[16px] font-medium text-indigo-950">
              {course.title}
            </span>
            <span className="truncate font-sans text-[12px] text-indigo-400">
              {course.description}
            </span>
            <span className="font-sans text-[10px] text-indigo-800">
              {course.lessonCount} lessons
            </span>
          </span>

          <Link
            href={`/dashboard/courses/${course.id}`}
            className="shrink-0 rounded-lg border border-indigo-800/50 px-3 py-2 font-sans text-[12px] text-indigo-800 transition-colors hover:bg-indigo-100"
          >
            Explore
          </Link>
        </li>
      ))}
    </ul>
  );
}

function UpNextCard({
  quiz,
}: {
  quiz: NonNullable<DashboardExtras["nextQuiz"]>;
}) {
  return (
    <div className={`${CARD_CLASSNAME} flex items-center gap-2 p-2`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-200">
        <ClipboardList className="h-6 w-6 text-indigo-800" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-sans text-[14px] text-indigo-400">Next quiz</span>
        <span className="truncate font-heading text-[16px] font-medium text-indigo-950">
          {quiz.title}
        </span>
        {quiz.dueDate && (
          <span className="font-sans text-[12px] text-indigo-800">
            Due date: {quiz.dueDate}
          </span>
        )}
      </span>

      <Link
        href={`/dashboard/quizzes/${quiz.id}`}
        className="shrink-0 rounded-lg border border-indigo-800/50 px-3 py-2 font-sans text-[12px] text-indigo-800 transition-colors hover:bg-indigo-100"
      >
        Start quiz
      </Link>
    </div>
  );
}

function NeedGuidanceCard() {
  return (
    <section className="flex min-h-[156px] items-center gap-6 rounded-lg bg-indigo-200 px-14 py-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[16px] font-bold text-indigo-950">
          Need guidance?
        </h2>
        <p className="max-w-[308px] font-sans text-[14px] text-indigo-800">
          Connect with a mentor who can help you stay focused and overcome
          challenges
        </p>
        <Link
          href="/dashboard/mentors"
          className={`${PRIMARY_BUTTON_CLASSNAME} mt-2 w-full max-w-[263px] bg-indigo-800 hover:bg-indigo-900`}
        >
          Find a mentor
        </Link>
      </div>
    </section>
  );
}
