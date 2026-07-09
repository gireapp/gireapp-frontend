// ─────────────────────────────────────────────────
// GIREAPP — Course Overview Page (M3)
// Shows course details, module accordion, and enrolment
// ─────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { serverApiClient, ApiError } from '@/lib/api-client';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EnrollButton } from '@/features/courses/enroll-button';
import { API_PATHS } from '@gireapp/shared';
import type { CourseDetail } from '@gireapp/shared';

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  try {
    const { data: course } = await serverApiClient<CourseDetail>(API_PATHS.COURSES.DETAIL(courseId));
    return { title: `${course?.title ?? 'Course'} | GIREAPP` };
  } catch (error) {
    return { title: 'Course | GIREAPP' };
  }
}

async function getCourse(courseId: string) {
  try {
    const { data } = await serverApiClient<CourseDetail>(API_PATHS.COURSES.DETAIL(courseId));
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
       redirect('/login');
    }
    if (error instanceof ApiError && error.status === 404) {
       notFound();
    }
    throw error;
  }
}

export default async function CourseOverviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const course = await getCourse(courseId);

  if (!course || !course.published) notFound();

  // Validate segment match
  if (course.academicLevel !== session.academicLevel || course.department !== session.department) {
    redirect('/dashboard/courses');
  }

  const isEnrolled = course.isEnrolled;
  const enrolmentProgress = isEnrolled ? Math.round(course.progress * 100) : 0;
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.estimatedMinutes, 0),
    0
  );

  // Find next lesson to continue
  let nextLessonUrl = null;
  if (isEnrolled) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.isCompleted) {
          nextLessonUrl = `/dashboard/courses/${course.id}/lessons/${lesson.id}`;
          break;
        }
      }
      if (nextLessonUrl) break;
    }
    // If all completed, point to first lesson
    if (!nextLessonUrl && course.modules[0]?.lessons[0]) {
      nextLessonUrl = `/dashboard/courses/${course.id}/lessons/${course.modules[0].lessons[0].id}`;
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Back Navigation ── */}
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Link>

      {/* ── Course Header ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.academicLevel}</Badge>
              <Badge variant="outline">{course.department}</Badge>
            </div>
            <h1 className="text-h2 text-foreground">{course.title}</h1>
            <p className="text-body text-muted-foreground text-lg">
              {course.description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 py-4 border-y border-border">
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <BookOpen className="w-4 h-4 text-primary" />
              {totalModules} Modules
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <PlayCircle className="w-4 h-4 text-coral-500" />
              {totalLessons} Lessons
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Clock className="w-4 h-4 text-emerald-500" />
              ~{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m Total Time
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-primary/20 shadow-lg">
            <div className="aspect-video w-full bg-muted relative rounded-t-lg overflow-hidden">
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-brand">
                  <BookOpen className="w-16 h-16 text-white/50" />
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Course Progress</span>
                    <span className="text-primary">{enrolmentProgress}%</span>
                  </div>
                  <Progress value={enrolmentProgress} className="h-2.5" />
                  
                  {nextLessonUrl ? (
                    <Button asChild className="w-full" size="lg">
                      <Link href={nextLessonUrl}>
                        {enrolmentProgress === 0 ? 'Start Course' : 'Continue Learning'}
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      No lessons available
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Enroll in this course to track your progress and earn points.
                  </p>
                  <EnrollButton courseId={course.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Curriculum / Modules Accordion ── */}
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-h3 text-foreground">Course Curriculum</h2>
        
        {course.modules.length === 0 ? (
          <p className="text-muted-foreground italic">Modules are being added to this course.</p>
        ) : (
          <Accordion type="multiple" defaultValue={[course.modules[0]?.id]} className="w-full space-y-4">
            {course.modules.map((module, index) => {
              const completedLessons = module.lessons.filter((l) => l.isCompleted).length;
              
              return (
                <AccordionItem key={module.id} value={module.id} className="bg-card border border-border rounded-xl px-2">
                  <AccordionTrigger className="hover:no-underline py-4 px-4">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base">
                            {module.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-normal mt-0.5">
                            {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                      {isEnrolled && (
                        <div className="text-sm font-medium text-muted-foreground">
                          {completedLessons} / {module.lessons.length}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2 mt-2">
                      {module.lessons.map((lesson, lIndex) => {
                        const isCompleted = isEnrolled && lesson.isCompleted;
                        const lessonUrl = isEnrolled ? `/dashboard/courses/${course.id}/lessons/${lesson.id}` : '#';
                        
                        return (
                          <div 
                            key={lesson.id} 
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                              )}
                              <div>
                                <span className="font-medium text-sm text-foreground">
                                  {lIndex + 1}. {lesson.title}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {lesson.contentType}
                                  </Badge>
                                  <span>{lesson.estimatedMinutes} mins</span>
                                </div>
                              </div>
                            </div>
                            
                            {isEnrolled && (
                              <Button variant="ghost" size="sm" asChild className="shrink-0 hidden sm:flex">
                                <Link href={lessonUrl}>
                                  {isCompleted ? 'Review' : 'Start'}
                                </Link>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                      {module.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground italic px-2">No lessons added yet.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
