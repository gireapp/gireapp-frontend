import type {
  AcademicLevel,
  AdminCourse,
  ContentType,
  SaveCourseRequest,
} from "@gireapp/shared";

/**
 * The builder's in-memory course. Every module and lesson carries a `key` for
 * React, separate from its database `id`: new rows have no id until saved, and
 * index keys would let a deleted lesson's text reappear in its neighbour.
 */
export type DraftLesson = {
  key: string;
  /** Present once saved; keeping it is what preserves learners' progress. */
  id?: string;
  title: string;
  contentType: ContentType;
  content: string;
  mediaUrl: string | null;
  /** What to show for an attached file: its name, or "Current file". */
  mediaLabel: string | null;
  estimatedMinutes: number;
  /** Learners have completed it, so it can be edited but not removed. */
  hasProgress: boolean;
};

export type DraftModule = {
  key: string;
  id?: string;
  title: string;
  lessons: DraftLesson[];
};

export type CourseDraft = {
  title: string;
  description: string;
  academicLevel: AcademicLevel | "";
  department: string;
  modules: DraftModule[];
};

const DEFAULT_LESSON_MINUTES = 10;
const DEFAULT_LESSON_TYPE: ContentType = "MARKDOWN";
const EXISTING_FILE_LABEL = "Current file";

/*
 * A counter rather than crypto.randomUUID(), which only exists on secure
 * origins and would crash the builder when opened over plain-http LAN.
 */
let nextKey = 0;
function newKey(prefix: string): string {
  nextKey += 1;
  return `${prefix}-${nextKey}`;
}

export function newLesson(): DraftLesson {
  return {
    key: newKey("lesson"),
    title: "",
    contentType: DEFAULT_LESSON_TYPE,
    content: "",
    mediaUrl: null,
    mediaLabel: null,
    estimatedMinutes: DEFAULT_LESSON_MINUTES,
    hasProgress: false,
  };
}

export function newModule(): DraftModule {
  return { key: newKey("module"), title: "", lessons: [newLesson()] };
}

export function emptyCourseDraft(): CourseDraft {
  return {
    title: "",
    description: "",
    academicLevel: "",
    department: "",
    modules: [newModule()],
  };
}

export function draftFromCourse(course: AdminCourse): CourseDraft {
  return {
    title: course.title,
    description: course.description,
    academicLevel: course.academicLevel,
    department: course.department,
    modules: course.modules.map((module) => ({
      key: newKey("module"),
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        key: newKey("lesson"),
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        content: lesson.content ?? "",
        mediaUrl: lesson.mediaUrl,
        mediaLabel: lesson.mediaUrl ? EXISTING_FILE_LABEL : null,
        estimatedMinutes: lesson.estimatedMinutes,
        hasProgress: lesson.hasProgress,
      })),
    })),
  };
}

/** Drops the React-only fields and shapes the draft for the shared schema. */
export function toSaveInput(
  draft: CourseDraft,
  publish: boolean,
): SaveCourseRequest {
  return {
    title: draft.title,
    description: draft.description,
    // An unchosen track is sent as-is so the schema reports "Choose a track"
    // against the field, instead of the builder inventing a default.
    academicLevel: draft.academicLevel as AcademicLevel,
    department: draft.department,
    publish,
    modules: draft.modules.map((module) => ({
      ...(module.id ? { id: module.id } : {}),
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        ...(lesson.id ? { id: lesson.id } : {}),
        title: lesson.title,
        contentType: lesson.contentType,
        content: lesson.content,
        mediaUrl: lesson.mediaUrl,
        estimatedMinutes: lesson.estimatedMinutes,
      })),
    })),
  };
}

export function isCourseDirty(
  current: CourseDraft,
  saved: CourseDraft,
): boolean {
  return (
    JSON.stringify(toSaveInput(current, false)) !==
    JSON.stringify(toSaveInput(saved, false))
  );
}

/** A module whose removal would delete a lesson learners have completed. */
export function moduleHasProgress(module: DraftModule): boolean {
  return module.lessons.some((lesson) => lesson.hasProgress);
}

// ── Reducer ──

export type LessonPatch = Partial<
  Pick<
    DraftLesson,
    | "title"
    | "contentType"
    | "content"
    | "mediaUrl"
    | "mediaLabel"
    | "estimatedMinutes"
  >
>;

export type CourseAction =
  | { type: "setTitle"; value: string }
  | { type: "setDescription"; value: string }
  | { type: "setTrack"; value: AcademicLevel | "" }
  | { type: "setDepartment"; value: string }
  | { type: "addModule" }
  | { type: "removeModule"; module: number }
  | { type: "moveModule"; module: number; by: -1 | 1 }
  | { type: "setModuleTitle"; module: number; value: string }
  | { type: "addLesson"; module: number }
  | { type: "removeLesson"; module: number; lesson: number }
  | { type: "moveLesson"; module: number; lesson: number; by: -1 | 1 }
  | { type: "updateLesson"; module: number; lesson: number; patch: LessonPatch }
  | { type: "reset"; draft: CourseDraft };

function moved<T>(items: T[], from: number, by: -1 | 1): T[] {
  const to = from + by;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

function withModule(
  draft: CourseDraft,
  index: number,
  change: (module: DraftModule) => DraftModule,
): CourseDraft {
  return {
    ...draft,
    modules: draft.modules.map((module, position) =>
      position === index ? change(module) : module,
    ),
  };
}

export function courseReducer(
  draft: CourseDraft,
  action: CourseAction,
): CourseDraft {
  switch (action.type) {
    case "setTitle":
      return { ...draft, title: action.value };
    case "setDescription":
      return { ...draft, description: action.value };
    case "setTrack":
      // Departments are per track, so one from the old track would be invalid.
      return { ...draft, academicLevel: action.value, department: "" };
    case "setDepartment":
      return { ...draft, department: action.value };

    case "addModule":
      return { ...draft, modules: [...draft.modules, newModule()] };
    case "removeModule": {
      const target = draft.modules[action.module];
      // Guarded here as well as in the UI: the server would refuse anyway, and
      // the draft should never hold a state that cannot be saved.
      if (!target || moduleHasProgress(target)) return draft;
      return {
        ...draft,
        modules: draft.modules.filter((_, i) => i !== action.module),
      };
    }
    case "moveModule":
      return {
        ...draft,
        modules: moved(draft.modules, action.module, action.by),
      };
    case "setModuleTitle":
      return withModule(draft, action.module, (module) => ({
        ...module,
        title: action.value,
      }));

    case "addLesson":
      return withModule(draft, action.module, (module) => ({
        ...module,
        lessons: [...module.lessons, newLesson()],
      }));
    case "removeLesson":
      return withModule(draft, action.module, (module) => {
        const lesson = module.lessons[action.lesson];
        if (!lesson || lesson.hasProgress) return module;
        return {
          ...module,
          lessons: module.lessons.filter((_, i) => i !== action.lesson),
        };
      });
    case "moveLesson":
      return withModule(draft, action.module, (module) => ({
        ...module,
        lessons: moved(module.lessons, action.lesson, action.by),
      }));
    case "updateLesson":
      return withModule(draft, action.module, (module) => ({
        ...module,
        lessons: module.lessons.map((lesson, i) =>
          i === action.lesson ? { ...lesson, ...action.patch } : lesson,
        ),
      }));

    case "reset":
      return action.draft;
  }
}
