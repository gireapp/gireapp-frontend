"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FileUp, Lock, Trash2 } from "lucide-react";
import {
  CONTENT_TYPES,
  isWrittenContentType,
  type ContentType,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { FILTER_CONTROL_CLASSNAME } from "@/features/admin/filter-select";
import { FieldError } from "@/features/admin/quiz-question-card";
import { requestLessonUploadAction } from "@/features/admin/course-actions";
import type {
  CourseAction,
  DraftLesson,
  LessonPatch,
} from "@/features/admin/course-draft";

const TYPE_LABELS: Record<ContentType, string> = {
  MARKDOWN: "Rich text (Markdown)",
  TEXT: "Plain text",
  PDF: "PDF document",
  VIDEO: "Video",
};

/** Mirrors the backend's allowed lesson uploads; the server checks again. */
const ACCEPTED_FILES: Partial<Record<ContentType, string>> = {
  PDF: ".pdf",
  VIDEO: ".mp4,.webm,.mov",
};

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded text-indigo-800 transition-colors hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-transparent";

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "failed"; message: string };

export function LessonEditor({
  lesson,
  moduleIndex,
  lessonIndex,
  lessonCount,
  errors,
  dispatch,
}: {
  lesson: DraftLesson;
  moduleIndex: number;
  lessonIndex: number;
  lessonCount: number;
  errors: Record<string, string[]>;
  dispatch: (action: CourseAction) => void;
}) {
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const at = `modules.${moduleIndex}.lessons.${lessonIndex}`;
  const label = `lesson ${lessonIndex + 1}`;
  const idFor = (field: string) => `${lesson.key}-${field}`;
  const update = (patch: LessonPatch) =>
    dispatch({
      type: "updateLesson",
      module: moduleIndex,
      lesson: lessonIndex,
      patch,
    });

  const written = isWrittenContentType(lesson.contentType);

  // The browser uploads straight to storage on a presigned URL; only the key
  // comes back into the draft, and is saved with the course.
  const uploadFile = async (file: File) => {
    setUpload({ status: "uploading" });
    const ticket = await requestLessonUploadAction(file.name);
    if (!ticket.success || !ticket.data) {
      setUpload({
        status: "failed",
        message: ticket.error ?? "Could not start the upload.",
      });
      return;
    }

    try {
      const response = await fetch(ticket.data.uploadUrl, {
        method: "PUT",
        // Must match the signature exactly, so the server's type is used
        // rather than the browser's guess.
        headers: { "Content-Type": ticket.data.contentType },
        body: file,
      });
      if (!response.ok) throw new Error(`Storage answered ${response.status}`);
    } catch {
      setUpload({
        status: "failed",
        message: "The upload did not finish. Try again.",
      });
      return;
    }

    update({ mediaUrl: ticket.data.key, mediaLabel: file.name });
    setUpload({ status: "idle" });
  };

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-sans text-[14px] font-medium text-indigo-950">
          Lesson {lessonIndex + 1}
        </span>
        <div className="flex items-center gap-1">
          {lesson.hasProgress && (
            <span
              className="mr-1 flex items-center gap-1 font-sans text-[12px] text-indigo-800"
              title="Learners have completed this lesson, so it cannot be removed"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              In use
            </span>
          )}
          <button
            type="button"
            aria-label={`Move ${label} up`}
            disabled={lessonIndex === 0}
            onClick={() =>
              dispatch({
                type: "moveLesson",
                module: moduleIndex,
                lesson: lessonIndex,
                by: -1,
              })
            }
            className={ICON_BUTTON}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Move ${label} down`}
            disabled={lessonIndex === lessonCount - 1}
            onClick={() =>
              dispatch({
                type: "moveLesson",
                module: moduleIndex,
                lesson: lessonIndex,
                by: 1,
              })
            }
            className={ICON_BUTTON}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${label}`}
            disabled={lesson.hasProgress}
            onClick={() =>
              dispatch({
                type: "removeLesson",
                module: moduleIndex,
                lesson: lessonIndex,
              })
            }
            className={ICON_BUTTON}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px_120px]">
        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={idFor("title")}
            className="font-sans text-[13px] text-indigo-950"
          >
            Title
          </label>
          <input
            id={idFor("title")}
            value={lesson.title}
            placeholder="e.g. What is velocity?"
            aria-invalid={errors[`${at}.title`] ? true : undefined}
            onChange={(event) => update({ title: event.target.value })}
            className={cn(
              FILTER_CONTROL_CLASSNAME,
              "h-10 w-full font-normal",
              errors[`${at}.title`] && "border-red-600",
            )}
          />
          <FieldError
            id={idFor("title-error")}
            messages={errors[`${at}.title`]}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={idFor("type")}
            className="font-sans text-[13px] text-indigo-950"
          >
            Type
          </label>
          <select
            id={idFor("type")}
            value={lesson.contentType}
            onChange={(event) =>
              update({ contentType: event.target.value as ContentType })
            }
            className={cn(FILTER_CONTROL_CLASSNAME, "h-10 w-full pr-8")}
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={idFor("minutes")}
            className="font-sans text-[13px] text-indigo-950"
          >
            Minutes
          </label>
          <input
            id={idFor("minutes")}
            type="number"
            min={1}
            max={300}
            value={lesson.estimatedMinutes}
            onChange={(event) =>
              update({ estimatedMinutes: Number(event.target.value) })
            }
            className={cn(FILTER_CONTROL_CLASSNAME, "h-10 w-full font-normal")}
          />
          <FieldError
            id={idFor("minutes-error")}
            messages={errors[`${at}.estimatedMinutes`]}
          />
        </div>
      </div>

      {written ? (
        <div className="flex flex-col gap-1">
          <label
            htmlFor={idFor("content")}
            className="font-sans text-[13px] text-indigo-950"
          >
            {lesson.contentType === "MARKDOWN"
              ? "Content (Markdown: # headings, **bold**, - lists)"
              : "Content"}
          </label>
          <textarea
            id={idFor("content")}
            rows={8}
            value={lesson.content}
            aria-invalid={errors[`${at}.content`] ? true : undefined}
            onChange={(event) => update({ content: event.target.value })}
            className={cn(
              "w-full rounded border border-indigo-800 bg-transparent px-3 py-2 font-mono text-[14px] text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              errors[`${at}.content`] && "border-red-600",
            )}
          />
          <FieldError
            id={idFor("content-error")}
            messages={errors[`${at}.content`]}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[13px] text-indigo-950">File</span>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={cn(
                "flex h-10 cursor-pointer items-center gap-2 rounded border border-indigo-500 px-4 font-sans text-[14px] font-medium text-indigo-950 transition-colors hover:bg-indigo-100",
                upload.status === "uploading" &&
                  "pointer-events-none opacity-60",
              )}
            >
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {upload.status === "uploading"
                ? "Uploading…"
                : lesson.mediaUrl
                  ? "Replace file"
                  : "Upload file"}
              <input
                type="file"
                accept={ACCEPTED_FILES[lesson.contentType]}
                className="sr-only"
                disabled={upload.status === "uploading"}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadFile(file);
                }}
              />
            </label>
            {lesson.mediaLabel && upload.status !== "uploading" && (
              <span className="min-w-0 truncate font-sans text-[14px] text-indigo-800">
                {lesson.mediaLabel}
              </span>
            )}
          </div>
          {upload.status === "failed" && (
            <p role="alert" className="font-sans text-[13px] text-red-600">
              {upload.message}
            </p>
          )}
          <FieldError
            id={idFor("media-error")}
            messages={errors[`${at}.mediaUrl`]}
          />
        </div>
      )}
    </li>
  );
}
