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
        completed: false
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
        variant: "destructive"
      });
    }
  });

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
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
            const res = await apiRequest("GET", `/api/courses/${course.id}/units`);
            unitsData[course.id] = await res.json();
          } catch (error) {
            console.error(`Failed to fetch units for course ${course.id}:`, error);
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
  const coursesWithProgress = !isLoading && courses
    ? courses.map(course => {
        // Even if progress data isn't available, include the course
        const courseProgress = progress?.find(p => p.courseId === course.id);
        const courseUnits = allUnits?.[course.id] || [];
        return { ...course, progress: courseProgress, units: courseUnits };
      })
    : [];

  // Apply filters
  const filteredCourses = coursesWithProgress 
    ? coursesWithProgress
        .filter(course => 
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .filter(course => levelFilter === "all" || course.level === levelFilter)
    : [];

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar (shown when toggled) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-primary" onClick={(e) => e.stopPropagation()}>
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
            <h1 className="font-heading text-2xl font-semibold text-neutrals-800 mb-6">My Courses</h1>

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
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-neutrals-200 shadow-sm overflow-hidden">
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
              ) : filteredCourses.length > 0 ? (
                // Course cards
                filteredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-xl border border-neutrals-200 shadow-sm overflow-hidden">
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

                      {course.progress ? (
                        <>
                          <CourseProgressBar
                            completedUnits={Math.floor(((course.progress.percentComplete || 0) / 100) * course.units.length)}
                            totalUnits={course.units.length}
                            percent={course.progress.percentComplete || 0}
                            hasEndAssessment={false}
                            endAssessmentAvailable={false}
                          />
                          <div className="flex items-center justify-between mt-3">
                            {course.progress.completed ? (
                              <span className="px-2 py-1 bg-success bg-opacity-10 text-success text-xs font-medium rounded-md flex items-center">
                                <span className="material-icons text-xs mr-1">check_circle</span>
                                Completed
                              </span>
                            ) : (
                              <Link href={`/courses/${course.id}`}>
                                <a className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 font-medium text-sm py-1 px-3 rounded transition-colors ml-auto">
                                  {course.progress.percentComplete > 0 ? "Continue" : "Start"}
                                </a>
                              </Link>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-neutrals-600 mb-3 line-clamp-2">
                            {course.description || "Learn essential skills and knowledge in this comprehensive course."}
                          </p>
                          <button 
                            onClick={() => handleEnroll(course.id)}
                            className="block w-full bg-neutrals-100 hover:bg-neutrals-200 text-primary font-medium text-sm py-1.5 px-3 rounded text-center transition-colors"
                          >
                            Enroll Now
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="col-span-3 bg-neutrals-50 rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-4xl text-neutrals-400 mb-2">search_off</span>
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-neutrals-600">Try adjusting your search or filter criteria</p>
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