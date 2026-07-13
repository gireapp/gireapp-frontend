// ─────────────────────────────────────────────────
// GIREAPP — Lesson Player Page (M3)
// Renders markdown content and tracks completion
// ─────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LayoutList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CompleteLessonButton } from '@/features/courses/complete-lesson-button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }) {
  await params;
  return { title: `Lesson | GIREAPP` }; // Simplified since we'd need another API call to get just the title
}

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const { courseId, lessonId } = await params;

  // Retrieve token for fetch request
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const response = await fetch(`${API_URL}/api/courses/${courseId}/lessons/${lessonId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    // Cache to prevent double hop latency, revalidate every hour or tag based
    next: { revalidate: 3600 } 
  });

  if (response.status === 401) redirect('/login');
  if (response.status === 403) redirect(`/dashboard/courses/${courseId}`);
  if (response.status === 404) notFound();

  const { data } = await response.json();
  
  if (!data || !data.lesson) {
    notFound();
  }

  const currentLesson = data.lesson;
  const nextLessonUrl = data.nextLessonId ? `/dashboard/courses/${courseId}/lessons/${data.nextLessonId}` : undefined;
  const prevLessonUrl = data.prevLessonId ? `/dashboard/courses/${courseId}/lessons/${data.prevLessonId}` : undefined;
  const currentModule = data.module;
  const isCompleted = data.isCompleted;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* ── Top Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutList className="w-4 h-4 mr-2" />
          Course Overview
        </Link>
        <div className="flex items-center gap-2">
          {prevLessonUrl && (
            <Link
              href={prevLessonUrl}
              className="px-3 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
            >
              Previous
            </Link>
          )}
          {nextLessonUrl && (
            <Link
              href={nextLessonUrl}
              className="px-3 py-1.5 text-sm font-medium bg-muted text-foreground rounded hover:bg-muted/80 transition-colors inline-flex items-center gap-1"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Lesson Header ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{currentModule?.title}</p>
        <h1 className="text-h2 text-foreground">{currentLesson.title}</h1>
        <p className="text-sm text-muted-foreground">Estimated time: {currentLesson.estimatedMinutes} mins</p>
      </div>

      {/* ── Lesson Content ── */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
        {currentLesson.contentType === 'MARKDOWN' ? (
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentLesson.content}
            </ReactMarkdown>
          </div>
        ) : currentLesson.contentType === 'PDF' && currentLesson.mediaUrl ? (
          <div className="aspect-[4/3] w-full border border-border rounded overflow-hidden">
            <iframe
              src={`${currentLesson.mediaUrl}#toolbar=0`}
              className="w-full h-full"
              title={currentLesson.title}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground italic">
            This lesson type is not supported yet or missing content.
          </div>
        )}
      </div>

      {/* ── Bottom Actions ── */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <CompleteLessonButton
          courseId={courseId}
          lessonId={lessonId}
          nextLessonUrl={nextLessonUrl}
          isCompleted={isCompleted}
        />
        <div className="text-sm text-muted-foreground">
          {data.currentIndex + 1} of {data.allLessonsCount} Lessons
        </div>
      </div>
    </div>
  );
}
