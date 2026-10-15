import { POINTS, BADGE_THRESHOLDS } from "@gireapp/shared";

export type HelpTopic = {
  title: string;
  entries: { question: string; answer: string }[];
};

/**
 * Answers are drawn from what the app actually does, and the numbers from the
 * shared constants rather than retyped — a help page that quietly goes out of
 * date is worse than none.
 */
export const HELP_TOPICS: HelpTopic[] = [
  {
    title: "Getting started",
    entries: [
      {
        question: "How do I change my learning track?",
        answer:
          "Open Profile & Settings, then Learning Preferences. Your track and department decide which courses you are shown and how your dashboard is organised, so changing it changes both.",
      },
      {
        question: "Why was I asked for a guardian's email?",
        answer:
          "Accounts for learners under 18 need a guardian's confirmation under Nigeria's NDPA 2023 and equivalent laws elsewhere. Your studying is never blocked while that is pending — only Mentorship waits for the guardian to confirm.",
      },
    ],
  },
  {
    title: "Courses and lessons",
    entries: [
      {
        question: "Why can I not see a course a friend has?",
        answer:
          "Courses are matched to your academic level and department. If a friend is on a different track, their courses will not appear on your dashboard.",
      },
      {
        question: "Where do I pick up where I left off?",
        answer:
          "Your dashboard shows the lesson you were last working through. Continuing from there also keeps your progress bar moving.",
      },
    ],
  },
  {
    title: "Quizzes, points and badges",
    entries: [
      {
        question: "How are learning points awarded?",
        answer: `Passing a quiz earns ${POINTS.QUIZ_PASS} points. Attempting one and not passing still earns ${POINTS.QUIZ_FAIL}, because sitting the quiz is worth something on its own.`,
      },
      {
        question: "How do I earn a badge?",
        answer: `Badges follow your score: ${BADGE_THRESHOLDS.BRONZE.minScore}% earns ${BADGE_THRESHOLDS.BRONZE.label}, ${BADGE_THRESHOLDS.SILVER.minScore}% earns ${BADGE_THRESHOLDS.SILVER.label}, ${BADGE_THRESHOLDS.GOLD.minScore}% earns ${BADGE_THRESHOLDS.GOLD.label}, and ${BADGE_THRESHOLDS.CURRENT_MASTER.minScore}% earns ${BADGE_THRESHOLDS.CURRENT_MASTER.label}.`,
      },
    ],
  },
  {
    title: "Your account",
    entries: [
      {
        question: "Why was I signed out after changing my password?",
        answer:
          "Changing your password ends every session on the account, including the one you changed it from. If somebody else had been signed in as you, that is where it stops.",
      },
      {
        question: "I changed my email but nothing happened.",
        answer:
          "A new address only takes effect once you open the link we send to it. Until then you keep signing in with your current address, so a typo can never lock you out.",
      },
      {
        question: "What photo can I upload?",
        answer:
          "A JPG or PNG up to 5MB. A square photo works best, since it is shown in a circle across the app.",
      },
    ],
  },
];
