'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { completeLessonAction } from '@/features/courses/actions';
import { toast } from 'sonner';

interface CompleteLessonButtonProps {
  courseId: string;
  lessonId: string;
  nextLessonUrl?: string;
  isCompleted: boolean;
}

export function CompleteLessonButton({
  courseId,
  lessonId,
  nextLessonUrl,
  isCompleted,
}: CompleteLessonButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsPending(true);
    const result = await completeLessonAction(courseId, lessonId);

    if (result.success) {
      toast.success('Lesson completed!');
      if (nextLessonUrl) {
        router.push(nextLessonUrl);
      } else {
        router.push(`/dashboard/courses/${courseId}`);
      }
      router.refresh();
    } else {
      toast.error(result.error ?? 'Failed to complete lesson');
      setIsPending(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex gap-4 items-center">
        <Button variant="outline" disabled className="text-success border-success/30 bg-success/5">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed
        </Button>
        {nextLessonUrl && (
          <Button onClick={() => router.push(nextLessonUrl)}>
            Next Lesson
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Completing...
        </>
      ) : (
        'Mark as Complete'
      )}
    </Button>
  );
}
