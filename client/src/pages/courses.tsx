import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Course, UserProgress } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "@/components/course/CourseCard";

export default function Courses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", "/api/progress", {
        courseId,
        percentComplete: 0,
        completed: false,
      });
      return res.json();
    },
    onSuccess: (data, courseId) => {
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

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<
    UserProgress[]
  >({
    queryKey: ["/api/progress"],
  });

  // Fetch current user for course progress tracking
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Fetch units for all courses to get actual unit counts
  const { data: allUnits } = useQuery({
    queryKey: ["/api/courses/units"],
    queryFn: async () => {
      if (!courses) return {};
      const unitsData: Record<number, any[]> = {};
      await Promise.all(
        courses.map(async (course) => {
          try {
            const res = await apiRequest(
              "GET",
              `/api/courses/${course.id}/units`
            );
            unitsData[course.id] = await res.json();
          } catch (error) {
            console.error(
              `Failed to fetch units for course ${course.id}:`,
              error
            );
            unitsData[course.id] = [];
          }
        })
      );
      return unitsData;
    },
    enabled: !!courses && courses.length > 0,
  });

  // Format minutes into hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isLoading = isLoadingCourses || isLoadingProgress;

  // Combine courses with progress data and units
  const coursesWithProgress =
    !isLoading && courses
      ? courses.map((course) => {
          // Even if progress data isn't available, include the course
          const courseProgress = progress?.find(
            (p) => p.courseId === course.id
          );
          const courseUnits = allUnits?.[course.id] || [];
          return { ...course, progress: courseProgress, units: courseUnits };
        })
      : [];

  // Apply filters
  const filteredCourses = coursesWithProgress
    ? coursesWithProgress
        .filter(
          (course) =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description &&
              course.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        )
        .filter(
          (course) => levelFilter === "all" || course.level === levelFilter
        )
    : [];

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-64 bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop sidebar (always visible on md+) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-neutrals-100 p-4 pb-16 md:pb-4">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h1 className="font-heading text-2xl font-semibold text-neutrals-800 mb-6">
              My Courses
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <CourseCard
                      key={index}
                      course={{} as any}
                      formatDuration={formatDuration}
                      isLoading
                    />
                  ))
              ) : filteredCourses.length > 0 ? (
                // Course cards
                filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={course.progress}
                    units={course.units}
                    onEnroll={handleEnroll}
                    formatDuration={formatDuration}
                    userId={user?.id}
                  />
                ))
              ) : (
                // Empty state
                <div className="col-span-3 bg-neutrals-50 rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-4xl text-neutrals-400 mb-2">
                      search_off
                    </span>
                    <h3 className="text-lg font-semibold mb-2">
                      No courses found
                    </h3>
                    <p className="text-neutrals-600">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
