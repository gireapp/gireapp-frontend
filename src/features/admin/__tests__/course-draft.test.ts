import { describe, it, expect } from "vitest";
import { saveCourseSchema, type AdminCourse } from "@gireapp/shared";
import {
  courseReducer,
  draftFromCourse,
  emptyCourseDraft,
  isCourseDirty,
  newLesson,
  toSaveInput,
  type CourseDraft,
} from "@/features/admin/course-draft";

const STORED: AdminCourse = {
  id: "course-1",
  title: "Foundations of Physics",
  description: "Motion and forces.",
  academicLevel: "SECONDARY",
  department: "Science",
  published: true,
  enrolmentCount: 3,
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
          hasProgress: true,
        },
        {
          id: "lesson-2",
          title: "Notes",
          contentType: "PDF",
          content: null,
          mediaUrl: "/sample-lesson.pdf",
          estimatedMinutes: 12,
          hasProgress: false,
        },
      ],
    },
  ],
};

function titles(draft: CourseDraft) {
  return draft.modules.map((module) =>
    module.lessons.map((lesson) => lesson.title),
  );
}

describe("emptyCourseDraft", () => {
  it("starts with one module holding one lesson", () => {
    const draft = emptyCourseDraft();

    expect(draft.modules).toHaveLength(1);
    expect(draft.modules[0]?.lessons).toHaveLength(1);
  });

  it("reports a missing track in words rather than as a raw enum error", () => {
    const result = saveCourseSchema.safeParse(
      toSaveInput(emptyCourseDraft(), false),
    );

    expect(result.success).toBe(false);
    const messages = result.success
      ? []
      : result.error.issues.map((issue) => issue.message);
    expect(messages).toContain("Choose a track");
  });
});

describe("courseReducer", () => {
  it("clears the department when the track changes, since departments are per track", () => {
    let draft = draftFromCourse(STORED);
    draft = courseReducer(draft, { type: "setTrack", value: "TERTIARY" });

    expect(draft.department).toBe("");
  });

  it("will not remove a lesson learners have completed", () => {
    const draft = draftFromCourse(STORED);

    expect(
      titles(
        courseReducer(draft, { type: "removeLesson", module: 0, lesson: 0 }),
      ),
    ).toEqual([["Velocity", "Notes"]]);
  });

  it("will not remove a module holding such a lesson", () => {
    const draft = draftFromCourse(STORED);

    expect(courseReducer(draft, { type: "removeModule", module: 0 })).toBe(
      draft,
    );
  });

  it("removes a lesson nobody has completed", () => {
    const draft = courseReducer(draftFromCourse(STORED), {
      type: "removeLesson",
      module: 0,
      lesson: 1,
    });

    expect(titles(draft)).toEqual([["Velocity"]]);
  });

  it("moves lessons and modules, and ignores a move past either end", () => {
    let draft = draftFromCourse(STORED);
    draft = courseReducer(draft, {
      type: "moveLesson",
      module: 0,
      lesson: 1,
      by: -1,
    });
    expect(titles(draft)).toEqual([["Notes", "Velocity"]]);

    draft = courseReducer(draft, { type: "addModule" });
    draft = courseReducer(draft, {
      type: "setModuleTitle",
      module: 1,
      value: "Forces",
    });
    draft = courseReducer(draft, { type: "moveModule", module: 1, by: -1 });
    expect(draft.modules.map((module) => module.title)).toEqual([
      "Forces",
      "Kinematics",
    ]);

    expect(
      courseReducer(draft, { type: "moveModule", module: 0, by: -1 }),
    ).toEqual(draft);
  });

  it("patches one lesson without touching its neighbours", () => {
    const draft = courseReducer(draftFromCourse(STORED), {
      type: "updateLesson",
      module: 0,
      lesson: 1,
      patch: { mediaUrl: "lessons/abc.pdf", mediaLabel: "week1.pdf" },
    });

    expect(draft.modules[0]?.lessons[1]).toMatchObject({
      mediaUrl: "lessons/abc.pdf",
      mediaLabel: "week1.pdf",
    });
    expect(draft.modules[0]?.lessons[0]?.title).toBe("Velocity");
  });
});

describe("toSaveInput", () => {
  it("sends ids for existing rows and none for new ones, so progress is kept", () => {
    let draft = draftFromCourse(STORED);
    draft = courseReducer(draft, { type: "addLesson", module: 0 });
    const input = toSaveInput(draft, true);

    expect(input.modules[0]?.id).toBe("module-1");
    expect(input.modules[0]?.lessons.map((lesson) => lesson.id)).toEqual([
      "lesson-1",
      "lesson-2",
      undefined,
    ]);
  });

  it("drops the React-only fields", () => {
    const text = JSON.stringify(toSaveInput(draftFromCourse(STORED), true));

    expect(text).not.toContain('"key"');
    expect(text).not.toContain("hasProgress");
    expect(text).not.toContain("mediaLabel");
  });

  it("round-trips a stored course — the seeded static PDF link included", () => {
    const input = toSaveInput(draftFromCourse(STORED), true);

    expect(input.modules[0]?.lessons[1]?.mediaUrl).toBe("/sample-lesson.pdf");
    expect(saveCourseSchema.safeParse(input).success).toBe(true);
  });
});

describe("isCourseDirty", () => {
  it("ignores React keys, so a fresh load is not dirty", () => {
    expect(
      isCourseDirty(draftFromCourse(STORED), draftFromCourse(STORED)),
    ).toBe(false);
  });

  it("notices an added lesson", () => {
    const saved = draftFromCourse(STORED);
    const edited = courseReducer(saved, { type: "addLesson", module: 0 });

    expect(isCourseDirty(edited, saved)).toBe(true);
  });
});

describe("newLesson", () => {
  it("defaults to a 10-minute rich-text lesson", () => {
    expect(newLesson()).toMatchObject({
      contentType: "MARKDOWN",
      estimatedMinutes: 10,
      hasProgress: false,
    });
  });
});
