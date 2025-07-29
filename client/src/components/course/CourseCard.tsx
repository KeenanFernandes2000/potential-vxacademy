import { Link } from "wouter";
import { Course, UserProgress, Assessment } from "@shared/schema";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
  progress?: UserProgress;
  units?: any[];
  onEnroll?: (courseId: number) => void;
  formatDuration: (minutes: number) => string;
  isLoading?: boolean;
  userId?: number;
}

export function CourseCard({
  course,
  progress,
  units = [],
  onEnroll,
  formatDuration,
  isLoading,
  userId,
}: CourseCardProps) {
  // Use unified progress calculation for accurate course-specific progress
  const { progressData: courseProgressData } = useCourseProgress(
    course.id,
    userId || null
  );

  // Fetch user enrollments
  const { data: userEnrollments = [], isLoading: isLoadingEnrollments } =
    useQuery<{ courseId: number }[]>({
      queryKey: ["/api/user/enrollments"],
      enabled: !!userId,
    });

  // Check if user is enrolled in this course
  const isEnrolled = userEnrollments.some(
    (enrollment: any) => enrollment.courseId === course.id
  );

  // Fetch course assessments to determine if there are end assessments
  const { data: courseAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${course.id}/assessments`],
    enabled: !!course.id,
  });

  // Check if course has end assessments
  const hasEndAssessment = courseAssessments.some(
    (assessment: Assessment) => assessment.placement === "end"
  );

  // Determine if end assessment is available (progress >= 80%)
  const endAssessmentAvailable =
    courseProgressData.percentComplete >= 80 && hasEndAssessment;

  const { toast } = useToast();

  // Course enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {
        enrollmentSource: "manual",
      });
      return res.json();
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course!",
      });
      // Navigate to course after successful enrollment
      window.location.href = `/courses/${courseId}`;
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutrals-200 shadow-sm overflow-hidden">
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
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutrals-200 shadow-sm overflow-hidden">
      <div className="h-32 bg-neutrals-300 relative">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-light text-white">
            <span className="material-icons text-4xl">school</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs font-medium text-primary">
          <span className="material-icons text-xs mr-1 align-middle">
            schedule
          </span>
          <span>{formatDuration(course.duration || 0)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-xs text-neutrals-600 mb-2">
          <span className="material-icons text-xs mr-1">category</span>
          <span>{course.level}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 truncate">{course.name}</h3>
        <div className="text-md text-gray-500 line-clamp-2 h-12">
          {course.description}
        </div>
        {/* Show progress if user has started the course */}
        {courseProgressData.totalItems > 0 ? (
          <>
            <CourseProgressBar
              completedUnits={courseProgressData.completedItems}
              totalUnits={courseProgressData.totalItems}
              percent={courseProgressData.percentComplete}
              hasEndAssessment={hasEndAssessment}
              endAssessmentAvailable={endAssessmentAvailable}
            />
            <div className="flex items-center justify-between mt-3">
              {courseProgressData.percentComplete >= 100 ? (
                <Link href={`/courses/${course.id}`}>
                  <a className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors ml-auto align-middle">
                    <span className="material-icons text-xs mr-1 align-middle">
                      check_circle
                    </span>
                    Completed
                  </a>
                </Link>
              ) : (
                <div className="flex items-center justify-between w-full">
                  {isEnrolled ? (
                    <Link href={`/courses/${course.id}`}>
                      <a className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors">
                        Continue
                      </a>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={
                        enrollMutation.isPending || isLoadingEnrollments
                      }
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrollMutation.isPending ? "Enrolling..." : "Start"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => handleEnroll(course.id)}
              disabled={enrollMutation.isPending || isLoadingEnrollments}
              className="block w-full bg-neutrals-100 hover:bg-neutrals-200 text-primary font-medium text-sm py-1.5 px-3 rounded text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollMutation.isPending
                ? "Enrolling..."
                : isEnrolled
                ? "Continue"
                : "Enroll Now"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
