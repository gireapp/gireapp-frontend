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

/** The lesson the learner is part-way through, or null when nothing is started. */
function findResumeCourse(courses: CourseCard[]): CourseCard | null {
  const started = courses.filter((c) => c.progress > 0 && c.progress < 1);
  const [first] = started.length > 0 ? started : courses;
  return first ?? null;
}

export function DashboardHome({
  name,
  department,
  overview,
}: {
  name: string;
  department: string | null;
  overview: DashboardOverview | null;
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
          <WelcomeCard firstName={firstName} hasStarted={hasStarted} />

          <section className="flex flex-col gap-8">
            <SectionHeader title="Your Progress" href="/dashboard/progress" />
            <ProgressCard
              points={points}
              badges={badges}
              quizzes={quizzes}
              hasStarted={hasStarted}
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
}: {
  firstName: string;
  hasStarted: boolean;
}) {
  return (
    <section className="relative flex min-h-[288px] items-center overflow-hidden rounded-lg bg-indigo-800 px-14 py-10">
      <div className="flex max-w-[360px] flex-col gap-2">
        <p className="font-heading text-[16px] font-bold text-indigo-400">
          {hasStarted ? `Hello again, ${firstName}!` : `Hello, ${firstName}!`}
        </p>
        <h1 className="font-heading text-[28px] font-bold leading-tight text-indigo-50">
          {hasStarted
            ? "Keep going, you’re making progress"
            : "Welcome to GIREAPP"}
        </h1>
        <p className="font-sans text-[16px] text-indigo-200">
          {hasStarted
            ? "Pick up where you left off and keep your streak alive."
            : "Let’s start your learning journey."}
        </p>
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
}: {
  points: number;
  badges: number;
  quizzes: number;
  hasStarted: boolean;
}) {
  const stats = [
    {
      icon: Trophy,
      label: "Learning points",
      value: formatNumber(points),
      hint: hasStarted ? "Keep it up" : "Keep learning",
    },
    {
      icon: Award,
      label: "Badges earned",
      value: formatNumber(badges),
      hint: badges > 0 ? "Nicely done" : "Earn your first badge",
    },
    {
      icon: ClipboardList,
      label: "Quizzes taken",
      value: formatNumber(quizzes),
      hint: quizzes > 0 ? "Keep testing yourself" : "Take your first quiz",
    },
    // Ranking is not in DashboardOverview yet, so it stays in its empty state.
    {
      icon: Sparkles,
      label: "Rank",
      value: "-",
      hint: "Get started to rank",
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
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
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
        <span className="font-sans text-[14px] text-indigo-400">{hint}</span>
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
