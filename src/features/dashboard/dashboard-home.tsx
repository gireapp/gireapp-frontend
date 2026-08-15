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
import type {
  DashboardOverview,
  DashboardStats,
  CourseCard,
  NextQuiz,
} from "@gireapp/shared";
import { formatNumber } from "@/lib/utils";
import { DashboardTopbar } from "@/features/dashboard/dashboard-topbar";

const CARD_CLASSNAME = "rounded-lg bg-indigo-100";
const SECTION_TITLE_CLASSNAME =
  "font-heading text-[20px] font-bold text-indigo-950";
const VIEW_ALL_CLASSNAME =
  "font-sans text-[16px] text-indigo-400 hover:underline";
/** The guidance CTA stays 32px tall at every width (Figma 263×32), unlike
 *  the hero and resume buttons which grow to 48px on desktop. */
const COMPACT_BUTTON_CLASSNAME =
  "inline-flex h-8 items-center justify-center gap-1 rounded-lg px-3 font-sans text-[12px] text-indigo-50 transition-colors md:text-[14px]";

/** Mobile buttons are 160×32 in the design; desktop 316×48. */
const PRIMARY_BUTTON_CLASSNAME =
  "inline-flex h-8 items-center justify-center gap-1 rounded-lg px-3 font-sans text-[12px] text-indigo-50 transition-colors md:h-12 md:text-[14px]";

/**
 * The two figures the design shows that the backend still cannot supply:
 * a weekly goal has no model, and badges are awarded on score thresholds rather
 * than a quiz count. Both stay optional so the UI degrades cleanly without them.
 */
export type DashboardExtras = {
  /** 0–1 share of the weekly goal met, for the hero progress bar. */
  weeklyGoalProgress?: number;
  /** Quizzes remaining before the next badge unlocks. */
  quizzesToNextBadge?: number;
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
  const recommended = overview?.recommendedCourses ?? [];
  const stats = overview?.stats ?? null;
  const nextQuiz = overview?.nextQuiz ?? null;

  const hasStarted = points > 0 || badges > 0 || resume !== null;

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-8">
      <DashboardTopbar name={name} department={department} points={points} />

      {/* Mobile stacks welcome → progress → resume → recommended → guidance,
          which interleaves the two desktop columns. `display: contents` drops
          the column wrappers below xl so `order` can sequence every card in one
          flow, then restores them as real columns at xl. One DOM, both layouts,
          and the reading order always matches what is on screen. */}
      <div className="flex flex-col gap-6 xl:flex-row xl:gap-6">
        <div className="contents xl:flex xl:min-w-0 xl:flex-1 xl:flex-col xl:gap-8">
          {/* Returning learners get the greeting above the card; new ones get it
              inside, where the card carries the whole welcome. */}
          {hasStarted && (
            <div className="order-1 flex flex-col gap-1 xl:order-none">
              <p className="font-heading text-[16px] font-bold text-indigo-950">
                Hello again, {firstName}!
              </p>
              <p className="font-sans text-[16px] text-indigo-400">
                Let’s continue your learning journey
              </p>
            </div>
          )}

          <WelcomeCard
            className="order-2 xl:order-none"
            firstName={firstName}
            hasStarted={hasStarted}
            weeklyGoalProgress={extras.weeklyGoalProgress}
          />

          <section className="order-3 flex flex-col gap-4 xl:order-none xl:gap-8">
            <SectionHeader title="Your Progress" href="/dashboard/progress" />
            <ProgressCard
              points={points}
              badges={badges}
              stats={stats}
              hasStarted={hasStarted}
              extras={extras}
            />
          </section>

          <NeedGuidanceCard className="order-7 xl:order-none" />
        </div>

        <div className="contents xl:flex xl:w-[443px] xl:shrink-0 xl:flex-col xl:gap-8">
          <ResumeCard className="order-4 xl:order-none" resume={resume} />

          <section className="order-5 flex flex-col gap-4 xl:order-none xl:gap-6">
            <SectionHeader
              title="Recommended Subjects"
              href="/dashboard/courses"
            />
            <RecommendedSubjects courses={recommended} />
          </section>

          {nextQuiz && (
            <section className="order-6 flex flex-col gap-4 xl:order-none xl:gap-6">
              <h2 className={SECTION_TITLE_CLASSNAME}>Up Next</h2>
              <UpNextCard quiz={nextQuiz} />
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
  className,
  firstName,
  hasStarted,
  weeklyGoalProgress,
}: {
  className?: string;
  firstName: string;
  hasStarted: boolean;
  weeklyGoalProgress?: number;
}) {
  const weeklyPercent =
    weeklyGoalProgress === undefined
      ? null
      : Math.round(weeklyGoalProgress * 100);

  return (
    <section
      className={`relative flex min-h-[188px] items-center overflow-hidden rounded-lg bg-indigo-800 px-7 py-6 md:min-h-[288px] md:px-14 md:py-10 ${className ?? ""}`}
    >
      <div className="relative z-10 flex w-full flex-col gap-2 md:max-w-[360px]">
        {!hasStarted && (
          <p className="font-heading text-[16px] font-bold text-indigo-400">
            Hello, {firstName}!
          </p>
        )}

        <h1 className="max-w-[215px] font-heading text-[20px] font-bold leading-tight text-indigo-50 md:max-w-none md:text-[28px]">
          {hasStarted
            ? "Keep going, you’re making progress."
            : "Welcome to GIREAPP"}
        </h1>

        {!hasStarted && (
          <p className="max-w-[195px] font-sans text-[14px] text-indigo-200 md:max-w-none md:text-[16px]">
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
          className={`${PRIMARY_BUTTON_CLASSNAME} mt-4 w-full max-w-[160px] bg-coral-500 hover:bg-coral-600 md:mt-6 md:max-w-[316px]`}
        >
          {hasStarted ? "Continue learning" : "Get started"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <Sparkles
        className="pointer-events-none absolute bottom-0 -right-4 z-0 h-[150px] w-[140px] text-indigo-700 md:-right-6 md:h-[269px] md:w-[257px]"
        aria-hidden="true"
      />
    </section>
  );
}

function ResumeCard({
  className,
  resume,
}: {
  className?: string;
  resume: CourseCard | null;
}) {
  const percent = resume ? Math.round(resume.progress * 100) : null;

  return (
    <section
      className={`${CARD_CLASSNAME} relative flex min-h-[184px] flex-col gap-2 overflow-hidden p-7 md:min-h-[288px] md:gap-3 md:p-14 md:pt-10 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1">
        <BookOpen
          className="h-6 w-6 text-indigo-950 md:h-8 md:w-8"
          aria-hidden="true"
        />
        <h2 className={SECTION_TITLE_CLASSNAME}>
          {resume ? "Continue Learning" : "Start Learning"}
        </h2>
      </div>

      <p className="font-heading text-[16px] font-bold text-indigo-950">
        {resume ? resume.title : "Ready to begin?"}
      </p>
      <p className="max-w-[240px] font-sans text-[14px] text-indigo-400 md:max-w-none md:text-[16px]">
        {resume
          ? resume.description
          : "Start your first lesson and it will appear here"}
      </p>

      {resume && (
        <p className="font-sans text-[12px] text-indigo-800">
          {resume.moduleCount} {resume.moduleCount === 1 ? "module" : "modules"}
          {" · "}
          {resume.lessonCount} {resume.lessonCount === 1 ? "lesson" : "lessons"}
        </p>
      )}

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
        className={`${PRIMARY_BUTTON_CLASSNAME} mt-auto w-full max-w-[160px] bg-indigo-800 hover:bg-indigo-900 md:max-w-[205px]`}
      >
        {resume ? "Continue" : "Explore Subjects"}
      </Link>
    </section>
  );
}

function ProgressCard({
  points,
  badges,
  stats,
  hasStarted,
  extras,
}: {
  points: number;
  badges: number;
  stats: DashboardStats | null;
  hasStarted: boolean;
  extras: DashboardExtras;
}) {
  const quizzes = stats?.quizzesTaken ?? 0;
  const weeklyPoints = stats?.weeklyPoints ?? 0;
  const averageScore = stats?.averageScore ?? null;
  const rankPercentile = stats?.rankPercentile ?? null;

  const tiles = [
    {
      icon: Trophy,
      label: "Learning points",
      value: formatNumber(points),
      hint:
        weeklyPoints > 0
          ? `+${formatNumber(weeklyPoints)} this week`
          : hasStarted
            ? "Keep it up"
            : "Keep learning",
      positive: weeklyPoints > 0,
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
        averageScore !== null
          ? `${averageScore}% average score`
          : quizzes > 0
            ? "Keep testing yourself"
            : "Take your first quiz",
      positive: averageScore !== null,
    },
    {
      icon: Sparkles,
      label: "Rank",
      value: rankPercentile !== null ? `Top ${rankPercentile}%` : "-",
      hint: rankPercentile !== null ? "in your track" : "Get started to rank",
      positive: false,
    },
  ];

  return (
    // Figma's 92px column gap assumes the left column at its full 676px, which
    // only happens once the viewport is wide enough for `max-w-[1143px]`. Below
    // that the gap would eat the tiles, so it waits for 2xl.
    <div
      className={`${CARD_CLASSNAME} grid grid-cols-2 gap-2 p-2 md:gap-x-6 md:gap-y-6 md:px-6 md:py-3 2xl:gap-x-[92px]`}
    >
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
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
    <div className="flex min-h-[92px] items-center gap-2 rounded-lg bg-indigo-50 px-2 py-2 md:min-h-[120px] md:gap-8 md:px-6">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-200 md:h-12 md:w-12">
        <Icon
          className="h-5 w-5 text-indigo-800 md:h-[30px] md:w-[30px]"
          aria-hidden="true"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-1 md:gap-2">
        <span className="whitespace-nowrap font-heading text-[13px] font-medium text-indigo-800 md:whitespace-normal md:text-[16px]">
          {label}
        </span>
        <span className="font-sans text-[13px] text-indigo-950 md:text-[16px]">
          {value}
        </span>
        <span
          className={`font-sans text-[11px] leading-tight md:text-[14px] ${
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
        className={`${CARD_CLASSNAME} flex min-h-[200px] items-center justify-center p-8 md:min-h-[392px]`}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-[280px] text-center font-sans text-[14px] text-indigo-400">
            Subjects picked for you will appear here once your department is set
            up.
          </p>
          <Link
            href="/dashboard/courses"
            className={`${COMPACT_BUTTON_CLASSNAME} bg-indigo-800 px-6 hover:bg-indigo-900`}
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul
      className={`${CARD_CLASSNAME} flex min-h-[200px] flex-col gap-2 p-2 md:min-h-[392px]`}
    >
      {/* Figma row: 427×120, 8px inline / 16px block padding, 40px icon. */}
      {courses.slice(0, 4).map((course) => (
        <li
          key={course.id}
          className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3 md:min-h-[120px] md:gap-3 md:px-2 md:py-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-200">
            <BookOpen className="h-6 w-6 text-indigo-800" aria-hidden="true" />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-3">
            <span className="truncate font-heading text-[16px] font-medium text-indigo-950">
              {course.title}
            </span>
            <span className="truncate font-sans text-[12px] text-indigo-400">
              {course.description}
            </span>
            <span className="font-sans text-[10px] text-indigo-800">
              {course.lessonCount}{" "}
              {course.lessonCount === 1 ? "lesson" : "lessons"}
            </span>
          </span>

          <Link
            href={`/dashboard/courses/${course.id}`}
            className="flex h-8 w-[85px] shrink-0 items-center justify-center rounded-lg border border-indigo-800/50 font-sans text-[12px] text-indigo-800 transition-colors hover:bg-indigo-100"
          >
            Explore
          </Link>
        </li>
      ))}
    </ul>
  );
}

function UpNextCard({ quiz }: { quiz: NextQuiz }) {
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

function NeedGuidanceCard({ className }: { className?: string }) {
  return (
    <section
      className={`flex min-h-[185px] items-center gap-6 rounded-lg bg-indigo-200 px-7 py-6 md:min-h-[156px] md:px-14 md:py-4 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[16px] font-bold text-indigo-950">
          Need guidance?
        </h2>
        <p className="max-w-[190px] font-sans text-[14px] text-indigo-800 md:max-w-[308px]">
          Connect with a mentor who can help you stay focused and overcome
          challenges
        </p>
        <Link
          href="/dashboard/mentors"
          className={`${COMPACT_BUTTON_CLASSNAME} mt-2 w-full max-w-[160px] bg-coral-500 hover:bg-coral-600 md:max-w-[263px]`}
        >
          Find a mentor
        </Link>
      </div>
    </section>
  );
}
