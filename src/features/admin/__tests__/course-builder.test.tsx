// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AdminCourse } from "@gireapp/shared";

const { saveMock, uploadMock, replaceMock, toastMock } = vi.hoisted(() => ({
  saveMock: vi.fn(),
  uploadMock: vi.fn(),
  replaceMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/admin/course-actions", () => ({
  saveCourseAction: saveMock,
  requestLessonUploadAction: uploadMock,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

import { CourseBuilder } from "@/features/admin/course-builder";

function stored(over: Partial<AdminCourse> = {}): AdminCourse {
  return {
    id: "cmcourse0000000000000001",
    title: "Foundations of Physics",
    description: "Motion and forces for secondary students.",
    academicLevel: "SECONDARY",
    department: "Science",
    published: false,
    enrolmentCount: 0,
    updatedAt: "2026-10-05T12:00:00Z",
    modules: [
      {
        id: "module-1",
        title: "Kinematics",
        lessons: [
          {
            id: "lesson-1",
            title: "Velocity",
            contentType: "MARKDOWN",
            content: "# V",
            mediaUrl: null,
            estimatedMinutes: 10,
            hasProgress: false,
          },
        ],
      },
    ],
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  saveMock.mockImplementation(
    async (_id: string | null, input: { publish: boolean }) => ({
      success: true,
      data: stored({ published: input.publish }),
    }),
  );
});

describe("CourseBuilder", () => {
  it("only offers departments from the chosen track", async () => {
    render(<CourseBuilder course={null} />);
    const department = screen.getByLabelText("Department *");
    expect(department).toHaveProperty("disabled", true);

    await userEvent.selectOptions(
      screen.getByLabelText("Learning track *"),
      "TERTIARY",
    );

    const options = within(department)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(options).toEqual(["Choose…", "Undergraduate", "Postgraduate"]);
  });

  it("creates a course, then moves to its own URL so the next save updates it", async () => {
    render(<CourseBuilder course={null} />);
    await userEvent.type(screen.getByLabelText("Course title *"), "Ohm's Law");

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(saveMock).toHaveBeenCalled());
    expect(saveMock.mock.calls[0]?.[0]).toBeNull();
    expect(saveMock.mock.calls[0]?.[1]).toMatchObject({
      title: "Ohm's Law",
      publish: false,
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/admin/courses/cmcourse0000000000000001",
    );
  });

  it("takes ids from the saved course, so a second save does not duplicate new lessons", async () => {
    render(<CourseBuilder course={stored()} />);
    await userEvent.click(screen.getByRole("button", { name: "Add lesson" }));
    saveMock.mockResolvedValueOnce({
      success: true,
      data: stored({
        modules: [
          {
            id: "module-1",
            title: "Kinematics",
            lessons: [
              {
                id: "lesson-1",
                title: "Velocity",
                contentType: "MARKDOWN",
                content: "# V",
                mediaUrl: null,
                estimatedMinutes: 10,
                hasProgress: false,
              },
              {
                id: "lesson-new",
                title: "",
                contentType: "MARKDOWN",
                content: "",
                mediaUrl: null,
                estimatedMinutes: 10,
                hasProgress: false,
              },
            ],
          },
        ],
      }),
    });
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(2));

    const second = saveMock.mock.calls[1]?.[1];
    expect(
      second.modules[0].lessons.map((lesson: { id?: string }) => lesson.id),
    ).toEqual(["lesson-1", "lesson-new"]);
  });

  it("puts publish errors against the lesson they belong to", async () => {
    saveMock.mockResolvedValue({
      success: false,
      error: "Fix the highlighted fields and try again.",
      errors: {
        "modules.0.lessons.0.content": ["Module 1, lesson 1 has no text"],
      },
    });
    render(<CourseBuilder course={stored()} />);

    await userEvent.click(
      screen.getAllByRole("button", {
        name: /Publish course/,
      })[0] as HTMLElement,
    );

    expect(
      await screen.findByText("Module 1, lesson 1 has no text"),
    ).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "1 thing needs fixing",
    );
  });

  it("asks before hiding a published course from enrolled learners", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <CourseBuilder course={stored({ published: true, enrolmentCount: 4 })} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Move to drafts" }),
    );

    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining("4 learners are enrolled"),
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("locks deletion of a lesson learners have completed, and of its module", () => {
    const course = stored();
    course.modules[0]!.lessons[0]!.hasProgress = true;
    render(<CourseBuilder course={course} />);

    expect(
      screen.getByRole("button", { name: "Delete lesson 1" }),
    ).toHaveProperty("disabled", true);
    expect(
      screen.getByRole("button", { name: "Delete module 1" }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByText("In use")).toBeTruthy();
  });
});

describe("LessonEditor uploads", () => {
  it("uploads straight to storage with the signed content type, then keeps only the key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    uploadMock.mockResolvedValue({
      success: true,
      data: {
        uploadUrl: "https://storage.example/put",
        key: "lessons/abc.pdf",
        contentType: "application/pdf",
      },
    });
    render(<CourseBuilder course={stored()} />);
    await userEvent.selectOptions(screen.getByLabelText("Type"), "PDF");

    const file = new File(["%PDF"], "week1.pdf", { type: "" });
    await userEvent.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      file,
    );

    await waitFor(() => expect(screen.getByText("week1.pdf")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example/put",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalled());
    expect(saveMock.mock.calls[0]?.[1].modules[0].lessons[0].mediaUrl).toBe(
      "lessons/abc.pdf",
    );
    vi.unstubAllGlobals();
  });

  it("says so when storage rejects the upload, and keeps the lesson unchanged", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );
    uploadMock.mockResolvedValue({
      success: true,
      data: {
        uploadUrl: "https://storage.example/put",
        key: "lessons/abc.pdf",
        contentType: "application/pdf",
      },
    });
    render(<CourseBuilder course={stored()} />);
    await userEvent.selectOptions(screen.getByLabelText("Type"), "PDF");

    await userEvent.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      new File(["%PDF"], "week1.pdf"),
    );

    expect(
      await screen.findByText("The upload did not finish. Try again."),
    ).toBeTruthy();
    expect(screen.queryByText("week1.pdf")).toBeNull();
    vi.unstubAllGlobals();
  });
});
