// ─────────────────────────────────────────────────
// GIREAPP — Course Listing Page (M3)
// Shows available courses for the user's segment/department
// ─────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serverApiClient, ApiError } from '@/lib/api-client';
import { API_PATHS } from '@gireapp/shared';
import type { CourseDetail } from '@gireapp/shared';

export const metadata = {
  title: 'Browse Courses | GIREAPP',
};

async function getCourses() {
  try {
    const { data } = await serverApiClient<CourseDetail[]>(API_PATHS.COURSES.LIST);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
       redirect('/login');
    }
    return [];
  }
}

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const { academicLevel, department } = session;

  // If onboarding is incomplete, redirect
  if (!academicLevel || !department) redirect('/onboarding');

  const courses = await getCourses();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h1 className="text-h2 text-foreground">Available Courses</h1>
        <p className="text-body text-muted-foreground">
          Courses tailored for {academicLevel.toLowerCase()} students in {department}.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-h4 text-foreground mb-2">No courses available yet</h3>
            <p className="text-body-sm text-muted-foreground max-w-sm">
              We are working hard to bring you the best content. Check back soon for new courses in {department}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = course.isEnrolled;
            const progress = isEnrolled ? Math.round(course.progress * 100) : 0;
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            
            return (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="group block">
                <Card className="h-full overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  {/* Thumbnail Placeholder */}
                  <div className="aspect-video w-full bg-muted relative">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-coral-500/10">
                        <BookOpen className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                    {isEnrolled && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-5 flex flex-col justify-between h-[calc(100%-auto)]">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs font-medium">
                          {course.department}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {totalLessons} lessons
                        </span>
                      </div>
                      
                      <h3 className="text-h4 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-body-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {isEnrolled ? 'Continue Course' : 'View Details'}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      {isEnrolled && progress === 100 && (
                        <Badge variant="success" className="text-xs">Completed</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
