'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { enrollInCourseAction } from '@/features/courses/actions';
import { toast } from 'sonner';

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsPending(true);
    const result = await enrollInCourseAction(courseId);
    
    if (result.success) {
      toast.success('Successfully enrolled in course!');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Failed to enroll');
      setIsPending(false);
    }
  };

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={isPending} 
      className="w-full sm:w-auto"
      size="lg"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Enrolling...
        </>
      ) : (
        'Enroll Now to Start Learning'
      )}
    </Button>
  );
}
