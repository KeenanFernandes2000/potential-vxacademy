import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course, UserProgress } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { apiRequest } from "@/lib/queryClient";
import { CourseCard } from "@/components/course/CourseCard";

export function ProgressSection() {
  const [activeCourses, setActiveCourses] = useState<
    (Course & { progress?: UserProgress })[]
  >([]);

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<
    UserProgress[]
  >({
    queryKey: ["/api/progress"],
  });

  // Fetch current user for course progress tracking
  const { data: user } = useQuery<{ id: number }>({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    if (courses) {
      // Always try to match courses with their progress data
      const coursesWithProgress = courses.map((course) => {
        const courseProgress = progress?.find((p) => p.courseId === course.id);
        return {
          ...course,
          progress: courseProgress || {
            courseId: course.id,
            percentComplete: 0,
            completed: false,
            lastAccessed: new Date(),
            userId: 0,
            id: 0,
            createdAt: null,
            updatedAt: null,
          },
        };
      });

      // Filter to get courses that have actual progress (real ID > 0)
      const coursesWithRealProgress = coursesWithProgress.filter((course) => {
        const hasRealProgress = course.progress && course.progress.id > 0;
        console.log(
          `Course ${course.name} (ID: ${course.id}): progress ID=${course.progress?.id}, percent=${course.progress?.percentComplete}, hasRealProgress=${hasRealProgress}`
        );
        return hasRealProgress;
      });

      // Sort by progress percentage (highest first) and take top 3
      const topProgressCourses = coursesWithRealProgress
        .sort((a, b) => {
          const progressA = a.progress?.percentComplete || 0;
          const progressB = b.progress?.percentComplete || 0;
          return progressB - progressA; // Sort by highest progress first
        })
        .slice(0, 3); // Take top 3

      setActiveCourses(topProgressCourses);
      console.log("Top progress courses:", topProgressCourses);
      console.log("All progress data:", progress);
    }
  }, [courses, progress]);

  // Fetch units, blocks, and assessments for all active courses
  const { data: allUnitsAndBlocks } = useQuery({
    queryKey: ["/api/courses/units-blocks-assessments"],
    queryFn: async () => {
      if (!activeCourses || activeCourses.length === 0) return {};
      const courseData: Record<
        number,
        { units: any[]; blocks: any[]; assessments: any[] }
      > = {};

      await Promise.all(
        activeCourses.map(async (course) => {
          try {
            // Fetch units
            const unitsRes = await apiRequest(
              "GET",
              `/api/courses/${course.id}/units`
            );
            const units = await unitsRes.json();

            // Fetch all blocks for all units in this course
            const allBlocks: any[] = [];
            await Promise.all(
              units.map(async (unit: any) => {
                try {
                  const blocksRes = await apiRequest(
                    "GET",
                    `/api/units/${unit.id}/blocks`
                  );
                  const blocks = await blocksRes.json();
                  allBlocks.push(...blocks);
                } catch (error) {
                  console.error(
                    `Failed to fetch blocks for unit ${unit.id}:`,
                    error
                  );
                }
              })
            );

            // Fetch all assessments for this course
            const assessmentsRes = await apiRequest(
              "GET",
              `/api/courses/${course.id}/assessments`
            );
            const assessments = await assessmentsRes.json();

            courseData[course.id] = { units, blocks: allBlocks, assessments };
          } catch (error) {
            console.error(
              `Failed to fetch data for course ${course.id}:`,
              error
            );
            courseData[course.id] = { units: [], blocks: [], assessments: [] };
          }
        })
      );
      return courseData;
    },
    enabled: !!activeCourses && activeCourses.length > 0,
  });

  // Fetch course-specific block progress for all active courses
  const { data: allBlockProgress = {} } = useQuery({
    queryKey: ["/api/progress/block/all"],
    queryFn: async () => {
      if (!activeCourses || activeCourses.length === 0) return {};
      const progressData: Record<number, any[]> = {};

      await Promise.all(
        activeCourses.map(async (course) => {
          try {
            const res = await apiRequest(
              "GET",
              `/api/progress/block/all/${course.id}`
            );
            const courseProgress = await res.json();
            progressData[course.id] = courseProgress;
          } catch (error) {
            console.error(
              `Error fetching block progress for course ${course.id}:`,
              error
            );
            progressData[course.id] = [];
          }
        })
      );
      return progressData;
    },
    enabled: !!activeCourses && activeCourses.length > 0,
  });

  // Fetch assessment progress for all active courses
  const { data: allAssessmentProgress = {} } = useQuery({
    queryKey: ["/api/progress/assessment/all"],
    queryFn: async () => {
      if (!activeCourses || activeCourses.length === 0) return {};
      const progressData: Record<number, any[]> = {};

      await Promise.all(
        activeCourses.map(async (course) => {
          try {
            const res = await apiRequest(
              "GET",
              `/api/progress/assessment/all/${course.id}`
            );
            const courseProgress = await res.json();
            progressData[course.id] = courseProgress;
          } catch (error) {
            console.error(
              `Error fetching assessment progress for course ${course.id}:`,
              error
            );
            progressData[course.id] = [];
          }
        })
      );
      return progressData;
    },
    enabled: !!activeCourses && activeCourses.length > 0,
  });

  // Use unified progress calculation for dashboard
  const calculateCourseProgress = (courseId: number) => {
    const courseData = allUnitsAndBlocks?.[courseId];
    if (!courseData || courseData.units.length === 0)
      return { percentComplete: 0 };

    const allBlocks = courseData.blocks;
    const allAssessments = courseData.assessments || [];
    const totalBlocks = allBlocks.length;
    const totalAssessments = allAssessments.length;
    const totalItems = totalBlocks + totalAssessments;

    if (totalItems === 0) return { percentComplete: 100 };

    // Count completed blocks using course-specific progress
    const courseBlockProgress = allBlockProgress[courseId] || [];
    const completedBlocksCount = courseBlockProgress.filter(
      (progress: any) =>
        allBlocks.some((block: any) => block.id === progress.blockId) &&
        progress.isCompleted === true
    ).length;

    // Count completed assessments
    const courseAssessmentProgress = allAssessmentProgress[courseId] || [];
    const completedAssessmentsCount = courseAssessmentProgress.filter(
      (progress: any) => progress.isCompleted === true
    ).length;

    const completedItems = completedBlocksCount + completedAssessmentsCount;
    const percentComplete = Math.round((completedItems / totalItems) * 100);

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
        <h2 className="font-heading text-xl font-semibold text-neutrals-800">
          Your Progress
        </h2>
        <Link
          href="/courses"
          className="text-primary flex items-center text-sm font-medium hover:underline"
        >
          View all courses
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <CourseCard
                key={index}
                course={{} as any}
                formatDuration={formatDuration}
                isLoading
              />
            ))
        ) : activeCourses.length > 0 ? (
          activeCourses.map((course) => {
            const calculatedProgress = calculateCourseProgress(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={{
                  id: course.progress?.id || 0,
                  courseId: course.progress?.courseId || course.id,
                  userId: course.progress?.userId || 0,
                  completed: course.progress?.completed || false,
                  percentComplete: calculatedProgress.percentComplete,
                  lastAccessed: course.progress?.lastAccessed || new Date(),
                  createdAt: course.progress?.createdAt || null,
                  updatedAt: course.progress?.updatedAt || null,
                }}
                units={allUnitsAndBlocks?.[course.id]?.units || []}
                formatDuration={formatDuration}
                userId={user?.id}
              />
            );
          })
        ) : (
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons text-4xl text-neutrals-400 mb-2">
                school
              </span>
              <h3 className="text-lg font-semibold mb-2">
                Start a course to view your progress here
              </h3>
              <p className="text-neutrals-600 mb-4">
                Begin your learning journey by enrolling in a course to track
                your progress.
              </p>
              <Link
                href="/courses"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
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
