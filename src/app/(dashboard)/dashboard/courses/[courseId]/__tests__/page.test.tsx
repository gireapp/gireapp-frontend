import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CourseDetail } from "@gireapp/shared";

const { redirectMock, notFoundMock, getSessionMock, serverApiClientMock } =
  vi.hoisted(() => ({
    redirectMock: vi.fn((url: string) => {
      throw new Error(`redirect:${url}`);
    }),
    notFoundMock: vi.fn(() => {
      throw new Error("notFound");
    }),
    getSessionMock: vi.fn(),
    serverApiClientMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
}));
vi.mock("@/lib/session", () => ({ getSession: getSessionMock }));
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  serverApiClient: serverApiClientMock,
}));

import CourseOverviewPage from "../page";
import { ApiError } from "@/lib/api-client";

const SCIENCE_LEARNER = {
  userId: "learner-1",
  role: "STUDENT",
  academicLevel: "SECONDARY",
  department: "Science",
};

const ARTS_COURSE: CourseDetail = {
  id: "course-1",
  title: "Literature in English",
  description: "",
  academicLevel: "SECONDARY",
  department: "Arts",
  thumbnailUrl: null,
  published: true,
  isEnrolled: true,
  progress: 0.5,
  modules: [],
  quizzes: [],
};

const render = () =>
  CourseOverviewPage({ params: Promise.resolve({ courseId: "course-1" }) });

beforeEach(() => {
  vi.clearAllMocks();
  getSessionMock.mockResolvedValue(SCIENCE_LEARNER);
});

describe("CourseOverviewPage", () => {
  it("opens a course from another department when the backend allows it", async () => {
    // A learner who moved from Arts to Science keeps the Arts course they
    // started; the backend decides, and the page must not bounce them.
    serverApiClientMock.mockResolvedValue({ data: ARTS_COURSE, status: 200 });

    await expect(render()).resolves.toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("shows not found when the backend refuses the course", async () => {
    serverApiClientMock.mockRejectedValue(
      new ApiError("Course not found.", 404),
    );

    await expect(render()).rejects.toThrow("notFound");
  });

  it("sends a signed-out visitor to login", async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(render()).rejects.toThrow("redirect:/login");
  });
});
