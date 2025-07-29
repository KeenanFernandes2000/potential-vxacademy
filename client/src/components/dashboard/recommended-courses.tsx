import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CourseCard } from "@/components/course/CourseCard";

export function RecommendedCourses() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress } = useQuery<any[]>({
    queryKey: ["/api/progress"],
    initialData: [], // Provide empty array as initial data
  });

  // Fetch units, blocks, and assessments for progress calculation
  const { data: allUnitsAndBlocks } = useQuery({
    queryKey: ["/api/courses/units-blocks-assessments"],
    queryFn: async () => {
      if (!courses || courses.length === 0) return {};
      const courseData: Record<
        number,
        { units: any[]; blocks: any[]; assessments: any[] }
      > = {};

      await Promise.all(
        courses.map(async (course) => {
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
    enabled: !!courses && courses.length > 0,
  });

  // Fetch course-specific block progress
  const { data: allBlockProgress = {} } = useQuery({
    queryKey: ["/api/progress/block/all"],
    queryFn: async () => {
      if (!courses || courses.length === 0) return {};
      const progressData: Record<number, any[]> = {};

      await Promise.all(
        courses.map(async (course) => {
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
    enabled: !!courses && courses.length > 0,
  });

  // Fetch assessment progress
  const { data: allAssessmentProgress = {} } = useQuery({
    queryKey: ["/api/progress/assessment/all"],
    queryFn: async () => {
      if (!courses || courses.length === 0) return {};
      const progressData: Record<number, any[]> = {};

      await Promise.all(
        courses.map(async (course) => {
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
    enabled: !!courses && courses.length > 0,
  });

  // Calculate course progress
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

  // Create enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {
        enrollmentSource: "manual",
      });
      return res.json();
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Enrolled Successfully",
        description: "Starting your course now...",
      });

      setTimeout(() => {
        window.location.href = `/courses/${courseId}`;
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  // Get enrolled course IDs
  const enrolledCourseIds = progress
    ? progress.map((p: any) => p.courseId)
    : [];

  // Get enrolled courses with their progress
  const enrolledCourses = courses
    ? courses
        .filter((course) => enrolledCourseIds.includes(course.id))
        .map((course) => ({
          ...course,
          progress: calculateCourseProgress(course.id),
        }))
    : [];

  // Group enrolled courses by module and calculate module progress
  const moduleProgress: Record<
    number,
    { totalProgress: number; courseCount: number }
  > = {};

  enrolledCourses.forEach((course) => {
    const moduleId = course.moduleId;
    if (!moduleProgress[moduleId]) {
      moduleProgress[moduleId] = { totalProgress: 0, courseCount: 0 };
    }
    moduleProgress[moduleId].totalProgress += course.progress.percentComplete;
    moduleProgress[moduleId].courseCount += 1;
  });

  // Find the module with the highest average progress
  const prioritizedModuleId = Object.entries(moduleProgress).sort(
    ([, a], [, b]) => {
      const avgProgressA = a.totalProgress / a.courseCount;
      const avgProgressB = b.totalProgress / b.courseCount;
      return avgProgressB - avgProgressA;
    }
  )[0]?.[0];

  // Get recommended courses from the prioritized module
  const recommendedCourses = courses
    ? courses
        .filter(
          (course) =>
            // If no enrolled courses, show any course not enrolled
            // Otherwise, same module as prioritized module
            (prioritizedModuleId
              ? course.moduleId === Number(prioritizedModuleId)
              : true) &&
            // Not already enrolled
            !enrolledCourseIds.includes(course.id)
        )
        .slice(0, 5) // Take top 5
    : [];

  const handleEnroll = (courseId: number) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in or register to enroll in a course",
        variant: "destructive",
      });

      // Redirect to auth page after a short delay
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
      return;
    }

    // Enroll in the course
    enrollMutation.mutate(courseId);
  };

  // Helper to format duration (minutes to h m)
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-neutrals-800">
          Recommended For You
        </h2>
        <div className="flex space-x-2">
          <button className="p-1.5 rounded-full text-neutrals-600 hover:bg-neutrals-200 transition-colors">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="p-1.5 rounded-full text-neutrals-600 hover:bg-neutrals-200 transition-colors">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(5)
            .fill(0)
            .map((_, index) => (
              <CourseCard
                key={index}
                course={{} as any}
                formatDuration={formatDuration}
                isLoading
              />
            ))
        ) : recommendedCourses.length > 0 ? (
          // Course cards
          recommendedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={undefined}
              units={allUnitsAndBlocks?.[course.id]?.units || []}
              onEnroll={handleEnroll}
              formatDuration={formatDuration}
              userId={user?.id}
            />
          ))
        ) : (
          // Empty state
          <div className="col-span-full bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons text-4xl text-neutrals-400 mb-2">
                check_circle
              </span>
              <h3 className="text-lg font-semibold mb-2">
                {enrolledCourses.length > 0
                  ? "No more courses in this module"
                  : "No courses available"}
              </h3>
              <p className="text-neutrals-600">
                {enrolledCourses.length > 0
                  ? "You've enrolled in all available courses from this module. Check back later for new content."
                  : "Start your learning journey by enrolling in a course to get personalized recommendations."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
