import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course, UserProgress } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { apiRequest } from "@/lib/queryClient";

export function ProgressSection() {
  const [activeCourses, setActiveCourses] = useState<(Course & { progress?: UserProgress })[]>([]);

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  useEffect(() => {
    if (courses) {
      // Always try to match courses with their progress data
      const coursesWithProgress = courses.map(course => {
        const courseProgress = progress?.find(p => p.courseId === course.id);
        return { 
          ...course, 
          progress: courseProgress || {
            courseId: course.id,
            percentComplete: 0,
            completed: false,
            lastAccessed: new Date(),
            userId: 0,
            id: 0,
            createdAt: null
          }
        };
      });

      // Filter to get courses that have actual progress or recently accessed courses
      const activeCoursesFiltered = coursesWithProgress
        .filter(course => {
          // Include if has actual progress record (real ID > 0) OR if it has any progress percentage
          const hasRealProgress = course.progress && course.progress.id > 0;
          console.log(`Course ${course.name} (ID: ${course.id}): progress ID=${course.progress?.id}, percent=${course.progress?.percentComplete}, hasRealProgress=${hasRealProgress}`);
          return hasRealProgress;
        })
        .sort((a, b) => {
          // Sort by last accessed time, most recent first
          const timeA = a.progress?.lastAccessed ? new Date(a.progress.lastAccessed).getTime() : 0;
          const timeB = b.progress?.lastAccessed ? new Date(b.progress.lastAccessed).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 3); // Take top 3

      // If no courses have progress, show the first 3 available courses with mock progress
      if (activeCoursesFiltered.length === 0) {
        console.log("No progress data found, showing first 3 courses", courses);
        const firstThreeCourses = courses.slice(0, 3).map(course => ({
          ...course,
          progress: {
            courseId: course.id,
            percentComplete: 0,
            completed: false,
            lastAccessed: new Date(),
            userId: 0,
            id: 0,
            createdAt: null
          }
        }));
        setActiveCourses(firstThreeCourses);
      } else {
        setActiveCourses(activeCoursesFiltered);
      }

      console.log("Active courses:", activeCoursesFiltered);
      console.log("All progress data:", progress);
    }
  }, [courses, progress]);

  // Fetch units and blocks for all active courses
  const { data: allUnitsAndBlocks } = useQuery({
    queryKey: ["/api/courses/units-blocks"],
    queryFn: async () => {
      if (!activeCourses || activeCourses.length === 0) return {};
      const courseData: Record<number, { units: any[], blocks: any[] }> = {};
      
      await Promise.all(
        activeCourses.map(async (course) => {
          try {
            // Fetch units
            const unitsRes = await apiRequest("GET", `/api/courses/${course.id}/units`);
            const units = await unitsRes.json();
            
            // Fetch all blocks for all units in this course
            const allBlocks: any[] = [];
            await Promise.all(
              units.map(async (unit: any) => {
                try {
                  const blocksRes = await apiRequest("GET", `/api/units/${unit.id}/blocks`);
                  const blocks = await blocksRes.json();
                  allBlocks.push(...blocks);
                } catch (error) {
                  console.error(`Failed to fetch blocks for unit ${unit.id}:`, error);
                }
              })
            );
            
            courseData[course.id] = { units, blocks: allBlocks };
          } catch (error) {
            console.error(`Failed to fetch data for course ${course.id}:`, error);
            courseData[course.id] = { units: [], blocks: [] };
          }
        })
      );
      return courseData;
    },
    enabled: !!activeCourses && activeCourses.length > 0,
  });

  // Fetch block completions
  const { data: blockCompletions = [] } = useQuery({
    queryKey: ["/api/block-completions"],
  });

  // Calculate actual progress for each course like in course detail page
  const calculateCourseProgress = (courseId: number) => {
    const courseData = allUnitsAndBlocks?.[courseId];
    if (!courseData || courseData.units.length === 0) return { percentComplete: 0 };

    const allBlocks = courseData.blocks;
    const totalBlocks = allBlocks.length;

    if (totalBlocks === 0) return { percentComplete: 100 };

    // Count completed blocks - match exactly how course detail page does it
    const completedBlocksCount = blockCompletions.filter((completion: any) => 
      allBlocks.some((block: any) => block.id === completion.blockId) && completion.completed === true
    ).length;

    const percentComplete = Math.round((completedBlocksCount / totalBlocks) * 100);
    console.log(`Dashboard Course ${courseId} calculated progress: ${completedBlocksCount}/${totalBlocks} blocks = ${percentComplete}%`);
    console.log(`Dashboard Course ${courseId} block IDs:`, allBlocks.map((b: any) => b.id));
    console.log(`Dashboard Course ${courseId} completed block IDs:`, blockCompletions.filter(c => c.completed).map((c: any) => c.blockId));
    
    return { percentComplete };
  };

  const isLoading = isLoadingCourses || isLoadingProgress;

  // Format minutes into hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-neutrals-800">Your Progress</h2>
        <Link href="/courses" className="text-primary flex items-center text-sm font-medium hover:underline">
          View all courses
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ))
        ) : activeCourses.length > 0 ? (
          // Course cards
          activeCourses.map(course => (
            <Link key={course.id} href={`/courses/${course.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden block hover:shadow-md transition-shadow">
              <div className="h-32 bg-neutrals-300 relative">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-light text-white">
                    <span className="material-icons text-4xl">school</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs font-medium text-primary">
                  <span className="material-icons text-xs mr-1 align-middle">schedule</span>
                  <span>{formatDuration(course.duration || 0)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-xs text-neutrals-600 mb-2">
                  <span className="material-icons text-xs mr-1">category</span>
                  <span>{course.level}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
                <CourseProgressBar
                  completedUnits={Math.floor(((calculateCourseProgress(course.id).percentComplete || 0) / 100) * (allUnitsAndBlocks?.[course.id]?.units.length || 1))}
                  totalUnits={allUnitsAndBlocks?.[course.id]?.units.length || 1}
                  percent={calculateCourseProgress(course.id).percentComplete || 0}
                  hasEndAssessment={false}
                  endAssessmentAvailable={false}
                />
                <div className="flex items-center justify-end mt-2">
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Continue
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // Empty state
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons text-4xl text-neutrals-400 mb-2">school</span>
              <h3 className="text-lg font-semibold mb-2">No courses in progress</h3>
              <p className="text-neutrals-600 mb-4">Start your learning journey by enrolling in a course.</p>
              <Link href="/courses" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                <span className="material-icons mr-2">search</span>
                <span>Browse Courses</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}