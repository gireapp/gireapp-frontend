"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CircleCheck,
  CircleX,
  Crop,
  FileImage,
  ImageIcon,
  Lightbulb,
  Loader2,
  Minimize2,
  Ratio,
  ShieldCheck,
  Sun,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import {
  requestAvatarUploadAction,
  saveAvatarAction,
} from "@/features/settings/actions";

/**
 * Mirrors the limits the backend enforces on `/api/auth/avatar-upload-url`.
 * Checking here too is a courtesy — it saves a round trip and lets the screen
 * name the problem — never the thing being relied on.
 */
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_BYTES = 5 * 1024 * 1024;

type PhotoError = { title: string; detail: string };

type Guidance = { Icon: LucideIcon; label: string; value?: string };

const FILE_SPECS: Guidance[] = [
  { Icon: ImageIcon, label: "Supported formats", value: "JPG, PNG" },
  { Icon: FileImage, label: "Maximum file size", value: "5MB" },
  { Icon: Ratio, label: "Recommended ratio", value: "1:1 (Square)" },
];

const HOW_TO_FIX: Guidance[] = [
  { Icon: ImageIcon, label: "Select a photo with less resolution" },
  { Icon: Crop, label: "Crop your photo" },
  { Icon: Minimize2, label: "Compress your image and try again" },
];

const PHOTO_TIPS: Guidance[] = [
  { Icon: UserRound, label: "Show your face clearly" },
  { Icon: ShieldCheck, label: "Keep it professional" },
  { Icon: Sun, label: "Use a recent photo" },
];

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

function describeRejection(file: File): PhotoError | null {
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
    return {
      title: "Unsupported format",
      detail: "Choose a JPG or PNG photo",
    };
  }
  if (file.size > MAX_BYTES) {
    return { title: "File too large", detail: "Maximum size is 5MB" };
  }
  return null;
}

/** Figma separates stacked guidance rows with an inset hairline. */
function GuidanceCard({ rows }: { rows: Guidance[] }) {
  return (
    <ul className="flex flex-col rounded-[10px] border border-indigo-200 px-3 py-3 [&>*+*]:mt-2 [&>*+*]:border-t [&>*+*]:border-indigo-500/40 [&>*+*]:pt-2">
      {rows.map(({ Icon, label, value }) => (
        <li key={label} className="flex items-center gap-4 px-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100">
            <Icon
              className="h-3 w-3 text-indigo-800"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          <span className="flex flex-col">
            <span className="font-sans text-[12px] text-indigo-950">
              {label}
            </span>
            {value && (
              <span className="font-sans text-[10px] text-indigo-400">
                {value}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function GuidanceSection({ title, rows }: { title: string; rows: Guidance[] }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="pl-3 font-sans text-[14px] text-indigo-950">{title}</h2>
      <GuidanceCard rows={rows} />
    </section>
  );
}

/** The soft indigo card Figma uses for advisory copy. */
function NoteCard({
  Icon,
  title,
  body,
}: {
  Icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[10px] bg-indigo-100 p-3">
      <Icon
        className="h-5 w-5 shrink-0 text-indigo-800"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="font-sans text-[14px] text-indigo-950">{title}</p>
        <p className="font-sans text-[10px] text-indigo-950">{body}</p>
      </div>
    </div>
  );
}

export function ChangePhotoForm({
  name,
  currentImage,
}: {
  name: string;
  currentImage: string | null;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<PhotoError | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // An object URL holds the picked file in memory until it is released.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isSaved = savedImage !== null;
  const shownImage = previewUrl ?? savedImage ?? currentImage;

  function choose(picked: File | undefined) {
    if (!picked) return;
    setSavedImage(null);
    const rejection = describeRejection(picked);
    if (rejection) {
      setError(rejection);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setFile(picked);
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setSavedImage(null);
    setError(null);
    fileInput.current?.click();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaved) {
      reset();
      return;
    }
    if (!file) {
      setError({
        title: "No photo chosen",
        detail: "Pick a JPG or PNG to continue",
      });
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const presigned = await requestAvatarUploadAction(file.name, file.size);
      if (!presigned.success || !presigned.data) {
        setError({
          title: "Upload failed",
          detail: presigned.error ?? "Please try again",
        });
        return;
      }

      // Straight to storage — the file never passes through either server.
      const upload = await fetch(presigned.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!upload.ok) {
        setError({
          title: "Upload failed",
          detail: "Your photo could not be sent. Please try again",
        });
        return;
      }

      const saved = await saveAvatarAction(presigned.data.key);
      if (!saved.success) {
        setError({
          title: "Upload failed",
          detail: saved.error ?? "Please try again",
        });
        return;
      }

      setSavedImage(saved.data?.image ?? previewUrl);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-14 md:gap-24">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16">
        <div className="flex flex-col items-center gap-8 md:w-[467px]">
          <div className="relative">
            <span className="flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-200 font-heading text-[48px] font-bold text-indigo-800">
              {shownImage ? (
                /* Signed storage URLs and object URLs are both arbitrary hosts, so
                 next/image would need every one allow-listed up front. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(name)
              )}
            </span>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="Choose a profile photo"
              className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-800 text-indigo-50 transition-colors hover:bg-indigo-900"
            >
              <Camera
                className="h-5 w-5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            className="sr-only"
            onChange={(event) => choose(event.target.files?.[0])}
          />

          {!isSaved && !error && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                choose(event.dataTransfer.files?.[0]);
              }}
              className={`flex w-[280px] flex-col items-center gap-2 rounded-[10px] border p-4 transition-colors ${
                isDragging
                  ? "border-indigo-500 bg-indigo-200"
                  : "border-indigo-200 bg-indigo-100"
              }`}
            >
              <Upload
                className="h-6 w-6 text-indigo-800"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-heading text-[16px] font-bold text-indigo-950">
                {file ? file.name : "Tap to change photo"}
              </span>
              <span className="font-sans text-[12px] text-indigo-400">
                or drag and drop
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6 md:w-[343px]">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-4 rounded-[10px] border border-red-500 p-3"
            >
              <CircleX
                className="h-6 w-6 shrink-0 fill-red-500 text-indigo-50"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="font-sans text-[12px] text-red-500">
                {error.title}
                <br />
                {error.detail}
              </p>
            </div>
          ) : (
            isSaved && (
              <NoteCard
                Icon={UserRound}
                title="Your profile is you"
                body="Use a clear photo to help others recognize and connect with you"
              />
            )
          )}

          {error ? (
            <GuidanceSection title="How to fix this" rows={HOW_TO_FIX} />
          ) : isSaved ? (
            <GuidanceSection title="Photo tips" rows={PHOTO_TIPS} />
          ) : (
            <GuidanceCard rows={FILE_SPECS} />
          )}

          {error && (
            <NoteCard
              Icon={Lightbulb}
              title="Tip"
              body="A clear front-facing photo works best for your profile"
            />
          )}

          {isSaved && (
            <div
              role="status"
              className="flex items-center gap-4 rounded-[10px] border border-green-500 p-3"
            >
              <CircleCheck
                className="h-6 w-6 shrink-0 fill-green-500 text-indigo-50"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="flex-1 font-sans text-[12px] text-green-500">
                Profile photo updated successfully!
                <br />
                Your changes have been saved
              </p>
              <button
                type="button"
                onClick={() => setSavedImage(null)}
                aria-label="Dismiss confirmation"
                className="text-indigo-400 transition-colors hover:text-indigo-800"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className={
          isSaved
            ? "flex h-10 w-full items-center justify-center rounded-[10px] font-heading text-[16px] font-bold text-indigo-500 transition-colors hover:bg-indigo-100 md:mx-auto md:h-12 md:w-[443px]"
            : "flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-coral-500 font-heading text-[16px] font-bold text-indigo-50 transition-colors hover:bg-coral-600 disabled:bg-indigo-200 disabled:hover:bg-indigo-200 md:mx-auto md:h-12 md:w-[443px]"
        }
      >
        {isSaving && (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        {isSaved ? "Change photo" : isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
