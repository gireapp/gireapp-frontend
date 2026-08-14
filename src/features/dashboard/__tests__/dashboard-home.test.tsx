// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type {
  DashboardOverview,
  DashboardStats,
  CourseCard,
  SessionUser,
} from "@gireapp/shared";
import { DashboardHome } from "@/features/dashboard/dashboard-home";

const profile: SessionUser = {
  id: "user-1",
  name: "Tobi Ade",
  email: "tobi@example.com",
  role: "STUDENT",
  academicLevel: "SECONDARY",
  department: "Science",
  moodTheme: "calm",
  points: 1250,
  image: null,
  isOnboardingComplete: true,
  isMinor: false,
  guardianConsentStatus: "not_required",
};

const physics: CourseCard = {
  id: "course-physics",
  title: "Electromagnetism",
  description: "Physics . Lesson 9",
  thumbnailUrl: null,
  moduleCount: 3,
  lessonCount: 12,
  progress: 0.8,
  estimatedMinutes: 240,
};

const emptyStats: DashboardStats = {
  quizzesTaken: 0,
  averageScore: null,
  weeklyPoints: 0,
  rankPercentile: null,
};

function overview(patch: Partial<DashboardOverview> = {}): DashboardOverview {
  return {
    profile,
    totalPoints: 1250,
    badgeCount: 8,
    activeCourses: [physics],
    recentActivity: [
      {
        id: "a1",
        type: "quiz_passed",
        title: "Physics Quiz 8",
        timestamp: "2026-08-01T10:00:00.000Z",
      },
    ],
    stats: emptyStats,
    nextQuiz: null,
    ...patch,
  };
}

function renderHome(props: Partial<Parameters<typeof DashboardHome>[0]> = {}) {
  return render(
    <DashboardHome
      name="Tobi Ade"
      department="Science"
      overview={null}
      {...props}
    />,
  );
}

describe("DashboardHome — new learner", () => {
  it("welcomes the user and invites them to start", () => {
    renderHome();

    expect(screen.getByText("Hello, Tobi!")).toBeInTheDocument();
    expect(screen.getByText("Welcome to GIREAPP")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Get started/ }),
    ).toBeInTheDocument();
  });

  it("shows the empty resume card", () => {
    renderHome();

    expect(screen.getByText("Start Learning")).toBeInTheDocument();
    expect(screen.getByText("Ready to begin?")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore Subjects" }),
    ).toBeInTheDocument();
  });

  it("zeroes the stats and leaves rank unset", () => {
    renderHome();

    expect(screen.getByText("Take your first quiz")).toBeInTheDocument();
    expect(screen.getByText("Earn your first badge")).toBeInTheDocument();
    expect(screen.getByText("Get started to rank")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("omits the weekly goal bar and Up Next section", () => {
    renderHome();

    expect(screen.queryByText("Weekly goal")).not.toBeInTheDocument();
    expect(screen.queryByText("Up Next")).not.toBeInTheDocument();
  });
});

describe("DashboardHome — returning learner", () => {
  const extras = { weeklyGoalProgress: 0.4, quizzesToNextBadge: 2 };

  const activeStats: DashboardStats = {
    quizzesTaken: 18,
    averageScore: 80,
    weeklyPoints: 240,
    rankPercentile: 10,
  };

  const nextQuiz = {
    id: "quiz-9",
    courseId: "course-physics",
    title: "Physics: Quiz 9",
    dueDate: "05/07/2026",
  };

  it("greets the user above the card and switches the headline", () => {
    renderHome({ overview: overview() });

    expect(screen.getByText("Hello again, Tobi!")).toBeInTheDocument();
    expect(
      screen.getByText("Let’s continue your learning journey"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Keep going, you’re making progress."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Welcome to GIREAPP")).not.toBeInTheDocument();
  });

  it("offers to continue rather than start", () => {
    renderHome({ overview: overview() });

    expect(
      screen.getByRole("link", { name: /Continue learning/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Continue Learning")).toBeInTheDocument();
    // The resumed course also appears in Recommended Subjects, as in the design.
    expect(screen.getAllByText("Electromagnetism").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Continue" })).toBeInTheDocument();
  });

  it("renders the lesson progress bar from course progress", () => {
    renderHome({ overview: overview() });

    const bar = screen.getByRole("progressbar", {
      name: /Electromagnetism progress/,
    });
    expect(bar).toHaveAttribute("aria-valuenow", "80");
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("renders the weekly goal bar when the backend supplies it", () => {
    renderHome({ overview: overview(), extras });

    const bar = screen.getByRole("progressbar", { name: "Weekly goal" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("40% completed")).toBeInTheDocument();
  });

  it("shows the enriched stat hints", () => {
    renderHome({ overview: overview({ stats: activeStats }), extras });

    expect(screen.getByText("+240 this week")).toBeInTheDocument();
    expect(screen.getByText("Next badge: 2 quizzes")).toBeInTheDocument();
    expect(screen.getByText("80% average score")).toBeInTheDocument();
    expect(screen.getByText("Top 10%")).toBeInTheDocument();
    expect(screen.getByText("in your track")).toBeInTheDocument();
  });

  it("counts quizzes from stats rather than the truncated activity list", () => {
    renderHome({ overview: overview({ stats: activeStats }) });

    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("shows Up Next only when a quiz is scheduled", () => {
    renderHome({ overview: overview({ nextQuiz }) });

    expect(screen.getByText("Up Next")).toBeInTheDocument();
    expect(screen.getByText("Physics: Quiz 9")).toBeInTheDocument();
    expect(screen.getByText("Due date: 05/07/2026")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start quiz" }),
    ).toBeInTheDocument();
  });

  it("falls back to neutral hints when the extra figures are absent", () => {
    renderHome({ overview: overview() });

    expect(screen.queryByText("+240 this week")).not.toBeInTheDocument();
    expect(screen.getByText("Keep it up")).toBeInTheDocument();
    expect(screen.getByText("Get started to rank")).toBeInTheDocument();
  });
});

describe("DashboardHome — M3 acceptance criteria", () => {
  /** Counts also appear in the subject list, so assertions scope to this card. */
  const resumeCard = () =>
    screen.getByText("Continue Learning").closest("section") as HTMLElement;

  it("shows total points in the header (FE-DASH-007)", () => {
    renderHome({ overview: overview({ totalPoints: 1250 }) });

    // The figure also appears in the Learning points tile, so scope to the
    // header pill via its screen-reader label.
    const pill = screen.getByText("learning points").parentElement;
    expect(within(pill as HTMLElement).getByText("1,250")).toBeInTheDocument();
  });

  it("shows module and lesson counts on the active course card (FE-DASH-008)", () => {
    renderHome({ overview: overview() });

    const card = resumeCard();
    expect(within(card).getByText(/3 modules/)).toBeInTheDocument();
    expect(within(card).getByText(/12 lessons/)).toBeInTheDocument();
  });

  it("singularises a one-module, one-lesson course", () => {
    const single = { ...physics, moduleCount: 1, lessonCount: 1 };
    renderHome({ overview: overview({ activeCourses: [single] }) });

    const card = resumeCard();
    expect(within(card).getByText(/1 module\b/)).toBeInTheDocument();
    expect(within(card).getByText(/1 lesson\b/)).toBeInTheDocument();
  });

  it("offers a Browse Courses route out of the empty state (FE-DASH-008)", () => {
    renderHome({ overview: overview({ activeCourses: [] }) });

    const cta = screen.getByRole("link", { name: "Browse Courses" });
    expect(cta).toHaveAttribute("href", "/dashboard/courses");
  });
});
