import { Link } from "wouter";
import { Course, UserProgress } from "@shared/schema";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCardProps {
  course: Course;
  progress?: UserProgress;
  units?: any[];
  onEnroll?: (courseId: number) => void;
  formatDuration: (minutes: number) => string;
  isLoading?: boolean;
}

export function CourseCard({
  course,
  progress,
  units = [],
  onEnroll,
  formatDuration,
  isLoading,
}: CourseCardProps) {
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
        <h3 className="text-lg font-semibold mb-2">{course.name}</h3>

        {progress ? (
          <>
            <CourseProgressBar
              completedUnits={Math.floor(
                ((progress.percentComplete || 0) / 100) * units.length
              )}
              totalUnits={units.length}
              percent={progress.percentComplete || 0}
              hasEndAssessment={false}
              endAssessmentAvailable={false}
            />
            <div className="flex items-center justify-between mt-3">
              {progress.completed ? (
                <Link href={`/courses/${course.id}`}>
                  <a className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors ml-auto">
                    <span className="material-icons text-xs mr-1">
                      check_circle
                    </span>
                    Completed
                  </a>
                </Link>
              ) : (
                <Link href={`/courses/${course.id}`}>
                  <a className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors ml-auto">
                    {progress.percentComplete > 0 ? "Continue" : "Start"}
                  </a>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-neutrals-600 mb-3 line-clamp-2">
              {course.description ||
                "Learn essential skills and knowledge in this comprehensive course."}
            </p>
            <button
              onClick={() => onEnroll && onEnroll(course.id)}
              className="block w-full bg-neutrals-100 hover:bg-neutrals-200 text-primary font-medium text-sm py-1.5 px-3 rounded text-center transition-colors"
            >
              Enroll Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
