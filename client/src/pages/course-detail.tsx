import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Course, Unit, LearningBlock, Assessment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trophy,
  AlertCircle,
  Clock,
  Award,
  CheckCircle,
} from "lucide-react";
import { ComprehensiveAssessment } from "@/components/assessment/ComprehensiveAssessment";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CourseDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [match, params] = useRoute("/courses/:id");
  const courseId = match ? parseInt(params.id) : 0;
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    null
  );
  const [courseStarted, setCourseStarted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch course units
  const { data: units, isLoading: isLoadingUnits } = useQuery<Unit[]>({
    queryKey: [`/api/courses/${courseId}/units`],
    enabled: !!courseId,
  });

  // Fetch all learning blocks for the course
  const { data: blocks, isLoading: isLoadingBlocks } = useQuery<
    LearningBlock[]
  >({
    queryKey: [`/api/courses/${courseId}/blocks`],
    enabled: !!courseId,
  });

  // Fetch beginning assessments for the course
  const {
    data: beginningAssessments,
    isLoading: isLoadingBeginningAssessments,
  } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments?placement=beginning`],
    enabled: !!courseId,
  });

  // Fetch end assessments for the course
  const { data: endAssessments, isLoading: isLoadingEndAssessments } = useQuery<
    Assessment[]
  >({
    queryKey: [`/api/courses/${courseId}/assessments?placement=end`],
    enabled: !!courseId,
  });

  // Fetch all course assessments (both course-level and unit-level)
  const { data: allCourseAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments`],
    enabled: !!courseId,
  });

  // Filter unit assessments from all course assessments based on active unit
  const unitAssessments = useMemo(() => {
    if (!activeUnitId || !allCourseAssessments) return [];
    return allCourseAssessments.filter(
      (assessment) => assessment.unitId === activeUnitId
    );
  }, [activeUnitId, allCourseAssessments]);

  // Filter course-level assessments (those without unitId)
  const courseAssessments = useMemo(() => {
    if (!allCourseAssessments) return [];
    return allCourseAssessments.filter((assessment) => !assessment.unitId);
  }, [allCourseAssessments]);

  // Fetch user progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<any>({
    queryKey: [`/api/progress`],
  });

  // Enrollment mutation for when user hasn't enrolled yet
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", "/api/progress", {
        courseId,
        percentComplete: 0,
        completed: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Fetch current user for assessment flow
  const { data: currentUser } = useQuery<any>({
    queryKey: [`/api/user`],
  });

  // Complete block mutation
  const completeBlockMutation = useMutation({
    mutationFn: async (blockId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/blocks/${blockId}/complete`,
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Progress update mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({
      courseId,
      percentComplete,
      completed,
    }: {
      courseId: number;
      percentComplete: number;
      completed: boolean;
    }) => {
      const res = await apiRequest("POST", `/api/progress`, {
        courseId,
        percentComplete,
        completed,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Set first unit as active and handle direct unit navigation
  useEffect(() => {
    if (units && units.length > 0) {
      // If no unit is selected, set the first one
      if (!activeUnitId) {
        setActiveUnitId(units[0].id);
      }

      // Check if the active unit exists in the units array
      const unitExists = units.some((unit) => unit.id === activeUnitId);
      if (!unitExists && activeUnitId) {
        setActiveUnitId(units[0].id);
      }
    }
  }, [units, activeUnitId]);

  // Set first block as active when blocks load
  useEffect(() => {
    if (blocks && blocks.length > 0 && !activeBlockId && activeUnitId) {
      // Find the first block for the active unit
      const activeUnitBlocks = blocks.filter(
        (block) => block.unitId === activeUnitId
      );
      if (activeUnitBlocks.length > 0) {
        setActiveBlockId(activeUnitBlocks[0].id);
      }
    }
  }, [blocks, activeBlockId, activeUnitId]);

  // Calculate course progress
  const courseProgress =
    progress && Array.isArray(progress)
      ? progress.find((p: any) => p.courseId === courseId)
      : null;

  // Auto-enroll if user accesses course but has no progress record
  useEffect(() => {
    if (
      courseId &&
      course &&
      !isLoadingProgress &&
      progress &&
      Array.isArray(progress) &&
      !courseProgress &&
      !enrollMutation.isPending
    ) {
      console.log("Auto-enrolling user in course", courseId);
      enrollMutation.mutate(courseId);
    }
  }, [
    courseId,
    course,
    progress,
    courseProgress,
    isLoadingProgress,
    enrollMutation,
  ]);

  // Certificate generation mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", `/api/certificates/generate`, {
        courseId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      // After successfully generating a certificate, navigate to achievements page
      window.location.href = "/achievements";
    },
  });

  // Function to generate a certificate
  const generateCertificate = (courseId: number) => {
    generateCertificateMutation.mutate(courseId);
  };

  // Handle block completion
  const handleCompleteBlock = (blockId: number) => {
    completeBlockMutation.mutate(blockId);

    // Find and set the next block as active within the current unit
    if (blocks && activeUnitId) {
      const activeUnitBlocks = blocks.filter(
        (block) => block.unitId === activeUnitId
      );
      const currentIndex = activeUnitBlocks.findIndex((b) => b.id === blockId);
      if (currentIndex < activeUnitBlocks.length - 1) {
        setActiveBlockId(activeUnitBlocks[currentIndex + 1].id);
      } else if (unitAssessments && unitAssessments.length > 0) {
        // If no more blocks in this unit, open assessment if available
        setActiveAssessment(unitAssessments[0]);
        setAssessmentDialogOpen(true);
      }
    }

    // Update course progress
    if (course && blocks) {
      // Simple calculation: percentage of blocks completed across all units
      const percentComplete = Math.round(
        ((currentIndex + 1) / blocks.length) * 100
      );
      updateProgressMutation.mutate({
        courseId: course.id,
        percentComplete,
        completed: false,
      });
    }
  };

  // Handle starting an assessment
  const handleStartAssessment = (assessmentId: number) => {
    const assessment = unitAssessments?.find((a) => a.id === assessmentId);
    if (assessment) {
      setActiveAssessment(assessment);
      setAssessmentDialogOpen(true);
    }
  };

  // Calculate current block index within the active unit
  const activeUnitBlocks =
    blocks && activeUnitId
      ? blocks.filter((block) => block.unitId === activeUnitId)
      : [];
  const currentIndex =
    activeUnitBlocks && activeBlockId
      ? activeUnitBlocks.findIndex((b) => b.id === activeBlockId)
      : 0;

  // Format minutes into hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
  };

  // Loading state
  const isLoading =
    isLoadingCourse ||
    isLoadingUnits ||
    isLoadingBeginningAssessments ||
    isLoadingEndAssessments;

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
          {isLoading ? (
            // Loading state
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Skeleton className="h-96 md:col-span-1" />
                <Skeleton className="h-96 md:col-span-3" />
              </div>
            </div>
          ) : course ? (
            <div>
              {/* Course Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-neutrals-800">
                      {course.name}
                    </h1>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center text-sm text-neutrals-600">
                        <span className="material-icons text-sm mr-1">
                          schedule
                        </span>
                        <span>{formatDuration(course.duration || 0)}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutrals-600">
                        <span className="material-icons text-sm mr-1">
                          category
                        </span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {courseProgress && (
                      <div className="flex items-center">
                        <span className="text-sm text-neutrals-600 mr-2">
                          Progress: {courseProgress.percentComplete}%
                        </span>
                        <Progress
                          value={courseProgress.percentComplete}
                          className="w-32 h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-neutrals-600">
                  {course.description ||
                    "This course will help you develop essential skills to become an exceptional Abu Dhabi ambassador."}
                </p>
              </div>

              {/* Course Content */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Units Navigation - Enhanced Design */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <span className="material-icons text-primary">
                        menu_book
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-gray-800">
                      Course Content
                    </h2>
                  </div>
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="unit-0"
                    className="space-y-3"
                  >
                    {units &&
                      units.map((unit, index) => (
                        <AccordionItem
                          key={unit.id}
                          value={`unit-${index}`}
                          className="border border-gray-200 rounded-xl bg-white shadow-sm"
                        >
                          <AccordionTrigger
                            className={`${
                              activeUnitId === unit.id
                                ? "text-primary font-semibold bg-primary/5"
                                : "text-gray-700"
                            } px-4 py-3 text-sm hover:bg-gray-50 rounded-xl transition-all duration-200`}
                            onClick={() => {
                              setActiveUnitId(unit.id);
                              // Clear active block so the first one in this unit will be selected
                              setActiveBlockId(null);
                            }}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <span className="text-primary text-xs font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-left">{unit.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-4 pb-3 space-y-2">
                              {isLoadingBlocks ? (
                                <Skeleton className="h-20 w-full" />
                              ) : (
                                <>
                                  {blocks &&
                                    blocks
                                      .filter(
                                        (block) => block.unitId === unit.id
                                      )
                                      .map((block) => (
                                        <div
                                          key={block.id}
                                          className={`px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                            activeBlockId === block.id
                                              ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 hover:border-gray-300"
                                          }`}
                                          onClick={() =>
                                            setActiveBlockId(block.id)
                                          }
                                        >
                                          <div className="flex items-center">
                                            <div
                                              className={`p-1.5 rounded-md mr-3 ${
                                                activeBlockId === block.id
                                                  ? "bg-primary/20"
                                                  : "bg-white"
                                              }`}
                                            >
                                              {block.type === "video" && (
                                                <span className="material-icons text-sm">
                                                  videocam
                                                </span>
                                              )}
                                              {block.type === "text" && (
                                                <span className="material-icons text-sm">
                                                  article
                                                </span>
                                              )}
                                              {block.type === "interactive" && (
                                                <span className="material-icons text-sm">
                                                  quiz
                                                </span>
                                              )}
                                              {block.type === "image" && (
                                                <span className="material-icons text-sm">
                                                  image
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex-1">
                                              <span className="text-sm font-medium line-clamp-1">
                                                {block.title}
                                              </span>
                                              <div className="flex items-center mt-1">
                                                <span className="material-icons text-xs text-gray-500 mr-1">
                                                  schedule
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {block.xpPoints} XP
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                  {/* Check if we have assessments and show them */}
                                  {(() => {
                                    const unitSpecificAssessments =
                                      allCourseAssessments.filter(
                                        (assessment) =>
                                          assessment.unitId === unit.id
                                      );
                                    return (
                                      unitSpecificAssessments.length > 0 && (
                                        <>
                                          {/* If there are no assessments for this unit, don't render anything */}
                                          {unitAssessments.length === 0 &&
                                            unit.id === 8 && (
                                              <div
                                                className="px-3 py-2 rounded-md cursor-pointer hover:bg-neutrals-100 flex items-center mt-2"
                                                onClick={() => {
                                                  // Navigate to the specific assessment for Unit 4
                                                  handleStartAssessment(3); // Using the known assessment ID
                                                }}
                                              >
                                                <span className="material-icons text-sm mr-2 text-warning">
                                                  quiz
                                                </span>
                                                <span className="text-sm font-medium">
                                                  Final Assessment
                                                </span>
                                              </div>
                                            )}

                                          {/* Map through available assessments */}
                                          {unitSpecificAssessments.map(
                                            (assessment) => (
                                              <div
                                                key={assessment.id}
                                                className="px-3 py-2 rounded-md cursor-pointer hover:bg-neutrals-100 flex items-center mt-2"
                                                onClick={() =>
                                                  handleStartAssessment(
                                                    assessment.id
                                                  )
                                                }
                                              >
                                                <span className="material-icons text-sm mr-2 text-warning">
                                                  quiz
                                                </span>
                                                <span className="text-sm font-medium">
                                                  {assessment.title}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </>
                                      )
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>

                {/* Learning Content - Enhanced Design */}
                <div className="lg:col-span-3">
                  {isLoadingBlocks ? (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          Loading content...
                        </p>
                      </div>
                    </div>
                  ) : !blocks || blocks.length === 0 ? (
                    // Handle units with no learning blocks (like Unit 4 with only assessments)
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-8">
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <span className="material-icons text-3xl text-white">
                            assignment
                          </span>
                        </div>
                        <h2 className="font-heading text-3xl font-bold mb-4 text-gray-800">
                          Assessment Unit
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                          This unit contains an assessment to test your
                          knowledge and skills.
                        </p>
                        {assessments && assessments.length > 0 && (
                          <Button
                            size="lg"
                            onClick={() =>
                              handleStartAssessment(assessments[0].id)
                            }
                            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                          >
                            <span className="material-icons mr-3">quiz</span>
                            Start Assessment
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : !activeBlockId ? (
                    // If no block is selected but blocks exist, select the first one
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          Loading content...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      {blocks.map((block) => (
                        <div
                          key={block.id}
                          className={activeBlockId === block.id ? "" : "hidden"}
                        >
                          {/* Enhanced Header */}
                          <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h2 className="font-heading text-2xl font-bold mb-3 text-gray-800">
                                  {block.title}
                                </h2>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                                      <span className="material-icons text-primary text-sm">
                                        {block.type === "video"
                                          ? "videocam"
                                          : block.type === "text"
                                          ? "article"
                                          : block.type === "image"
                                          ? "image"
                                          : "quiz"}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                      {block.type.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="flex items-center bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-1.5 rounded-full">
                                    <span className="material-icons text-sm mr-1">
                                      stars
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {block.xpPoints} XP
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-6">
                            {block.type === "video" && block.videoUrl && (
                              <div className="mb-8">
                                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                                  <iframe
                                    className="w-full h-full"
                                    src={getEmbeddableYouTubeUrl(
                                      block.videoUrl
                                    )}
                                    title={block.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            )}

                            {block.type !== "line-break" &&
                              block.type === "text" &&
                              block.content && (
                                <div className="mb-8">
                                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div
                                      className="prose prose-lg max-w-none text-gray-700 leading-relaxed [&_br]:block [&_br]:my-1 [&_p]:whitespace-pre-line [&_p:empty]:min-h-[1em] [&_p:empty]:block"
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                            {block.type === "interactive" && (
                              <div className="mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                    {block.interactiveData ? (
                                      <InteractiveContentRenderer
                                        interactiveData={block.interactiveData}
                                      />
                                    ) : (
                                      <div className="p-8 text-center text-gray-500">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <span className="material-icons text-gray-400">
                                            interactive
                                          </span>
                                        </div>
                                        <p className="font-medium">
                                          No interactive content available
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === "image" && block.imageUrl && (
                              <div className="mb-8">
                                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                  <div className="rounded-xl overflow-hidden">
                                    <img
                                      src={block.imageUrl}
                                      alt={block.title}
                                      className="w-full h-auto object-contain max-h-96 mx-auto"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Navigation Controls */}
                          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 mb-8">
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (currentIndex > 0) {
                                  setActiveBlockId(
                                    activeUnitBlocks[currentIndex - 1].id
                                  );
                                }
                              }}
                              disabled={currentIndex === 0}
                            >
                              <span className="material-icons mr-2">
                                arrow_back
                              </span>
                              Previous
                            </Button>

                            {currentIndex < activeUnitBlocks.length - 1 ? (
                              <Button
                                onClick={() => {
                                  handleCompleteBlock(block.id);
                                }}
                                disabled={completeBlockMutation.isPending}
                              >
                                {completeBlockMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Mark as Complete
                                    <span className="material-icons ml-2">
                                      arrow_forward
                                    </span>
                                  </>
                                )}
                              </Button>
                            ) : assessments && assessments.length > 0 ? (
                              <Button
                                onClick={() =>
                                  handleStartAssessment(assessments[0].id)
                                }
                                disabled={completeBlockMutation.isPending}
                              >
                                {completeBlockMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Take Assessment
                                    <span className="material-icons ml-2">
                                      quiz
                                    </span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  // First mark the current block as complete
                                  handleCompleteBlock(block.id);

                                  // Find the next unit to navigate to
                                  if (units && activeUnitId) {
                                    const currentUnitIndex = units.findIndex(
                                      (u) => u.id === activeUnitId
                                    );

                                    // If there's a next unit, navigate to it
                                    if (currentUnitIndex < units.length - 1) {
                                      const nextUnit =
                                        units[currentUnitIndex + 1];

                                      // Set the next unit as active after a short delay to allow the completion to process
                                      setTimeout(() => {
                                        setActiveUnitId(nextUnit.id);
                                        setActiveBlockId(null); // Reset block so the first one in the new unit is selected
                                      }, 500);
                                    }
                                  }
                                }}
                                disabled={completeBlockMutation.isPending}
                              >
                                {completeBlockMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Complete Unit & Continue
                                    <span className="material-icons ml-2">
                                      check_circle
                                    </span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center h-64">
              <span className="material-icons text-4xl text-neutrals-400 mb-2">
                error_outline
              </span>
              <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
              <p className="text-neutrals-600">
                The course you're looking for could not be found or may have
                been removed.
              </p>
              <Button className="mt-4" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          )}
        </main>

        <MobileNav />
      </div>

      {/* Assessment Dialog */}
      <Dialog
        open={assessmentDialogOpen}
        onOpenChange={setAssessmentDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {activeAssessment ? (
            <ComprehensiveAssessment
              assessment={activeAssessment}
              userId={currentUser?.id}
              onComplete={(result) => {
                // Handle assessment completion
                console.log("Assessment completed:", result);
                setAssessmentDialogOpen(false);
                setActiveAssessment(null);

                // Refresh progress
                queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
              }}
              onCancel={() => {
                setAssessmentDialogOpen(false);
                setActiveAssessment(null);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-icons text-4xl text-neutrals-400 mb-2">
                error_outline
              </span>
              <h2 className="text-xl font-semibold mb-2">
                Assessment Not Found
              </h2>
              <p className="text-neutrals-600">
                The assessment could not be loaded.
              </p>
              <Button
                className="mt-4"
                onClick={() => setAssessmentDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to format content with some basic HTML
function formatContent(content: string): string {
  // Add basic protection against XSS attacks
  // In a real application, you would use a proper sanitization library
  content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Convert markdown-like syntax to HTML
  content = content
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold my-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /```([^`]+)```/g,
      '<pre class="bg-neutrals-50 p-3 rounded my-4 overflow-auto"><code>$1</code></pre>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-neutrals-50 px-1 py-0.5 rounded">$1</code>'
    )
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full">'
    )
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(
      /^\> (.*$)/gm,
      '<blockquote class="border-l-4 border-neutrals-300 pl-4 py-1 my-4 italic">$1</blockquote>'
    )
    .replace(/---/g, '<hr class="my-4 border-t border-neutrals-200">')
    // Convert line breaks to paragraphs
    .split(/\n\n+/)
    .map((p) => `<p class="mb-4">${p}</p>`)
    .join("");

  return content;
}

// Helper function to convert YouTube URLs to embeddable format
function getEmbeddableYouTubeUrl(url: string): string {
  if (!url) return url;

  try {
    // If it's already an embed URL, return as is
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    let videoId = "";

    // Handle youtube.com/watch?v= format
    if (url.includes("youtube.com/watch?v=")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    }
    // Handle youtu.be/ format
    else if (url.includes("youtu.be/")) {
      const pathParts = url.split("youtu.be/")[1];
      videoId = pathParts ? pathParts.split("?")[0].split("&")[0] : "";
    }
    // Handle youtube.com/v/ format
    else if (url.includes("youtube.com/v/")) {
      const pathParts = url.split("youtube.com/v/")[1];
      videoId = pathParts ? pathParts.split("?")[0].split("&")[0] : "";
    }
    // Handle m.youtube.com format
    else if (url.includes("m.youtube.com/watch?v=")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    }

    // If we found a video ID, create embed URL
    if (videoId && videoId.length === 11) {
      // YouTube video IDs are always 11 characters
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // If it's not a YouTube URL or we couldn't parse it, return original
    return url;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return url;
  }
}

interface InteractiveContentRendererProps {
  interactiveData: string | object;
}

// A specialized component to render interactive content based on type
function InteractiveContentRenderer({
  interactiveData,
}: InteractiveContentRendererProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [gameAnswers, setGameAnswers] = useState<Record<number, number>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [gameSubmitted, setGameSubmitted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    total: number;
    feedback: Record<string, string>;
  }>({ score: 0, total: 0, feedback: {} });

  // Parse the interactiveData if it's a string
  const parsedData =
    typeof interactiveData === "string"
      ? (() => {
          try {
            return JSON.parse(interactiveData);
          } catch (e) {
            console.log("Error parsing interactive data:", e);
            return null;
          }
        })()
      : interactiveData;

  console.log("Interactive data:", parsedData);

  if (!parsedData) {
    return (
      <div className="p-4 text-center text-neutrals-500">
        Invalid interactive content format
      </div>
    );
  }

  const handleCheckboxChange = (index: number, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [index]: checked }));
  };

  const handleGameAnswerChange = (
    questionIndex: number,
    answerIndex: number
  ) => {
    setGameAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitGame = () => {
    setGameSubmitted(true);
  };

  // Render content based on type
  if (parsedData.type === "checklist") {
    const allChecked =
      parsedData.steps &&
      Array.isArray(parsedData.steps) &&
      parsedData.steps.length > 0 &&
      parsedData.steps.every((_: any, i: number) => checkedItems[i]);

    return (
      <div className="p-6">
        <h3 className="text-lg font-bold mb-3">
          {parsedData.title || "Checklist"}
        </h3>
        <div className="space-y-3 mb-6">
          {parsedData.steps &&
            Array.isArray(parsedData.steps) &&
            parsedData.steps.map((step: string, i: number) => (
              <div key={i} className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id={`step-${i}`}
                  checked={checkedItems[i] || false}
                  onChange={(e) => handleCheckboxChange(i, e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor={`step-${i}`} className="text-base">
                  {step}
                </label>
              </div>
            ))}
        </div>

        {allChecked && (
          <div className="bg-green-50 text-green-800 border border-green-300 p-4 rounded-md flex items-center">
            <span className="material-icons mr-2">check_circle</span>
            <span>All items completed! You are ready to proceed.</span>
          </div>
        )}
      </div>
    );
  }

  if (parsedData.type === "game") {
    return (
      <div className="p-6">
        <h3 className="text-lg font-bold mb-3">
          {parsedData.title || "Interactive Game"}
        </h3>

        <div className="space-y-6 mb-6">
          {parsedData.questions &&
            Array.isArray(parsedData.questions) &&
            parsedData.questions.map((q: any, questionIndex: number) => (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Question {questionIndex + 1}: {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={gameAnswers[questionIndex]?.toString() || ""}
                    onValueChange={(value) =>
                      handleGameAnswerChange(questionIndex, parseInt(value))
                    }
                    disabled={gameSubmitted}
                  >
                    {q.options &&
                      Array.isArray(q.options) &&
                      q.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`flex items-center space-x-2 mb-2 ${
                            gameSubmitted && optIndex === q.answer
                              ? "text-green-600"
                              : gameSubmitted &&
                                gameAnswers[questionIndex] === optIndex &&
                                optIndex !== q.answer
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          <RadioGroupItem
                            value={optIndex.toString()}
                            id={`q${questionIndex}-opt${optIndex}`}
                          />
                          <Label
                            htmlFor={`q${questionIndex}-opt${optIndex}`}
                            className={`cursor-pointer flex-1 p-2 hover:bg-neutrals-50 rounded-md ${
                              gameSubmitted && optIndex === q.answer
                                ? "text-green-600 font-medium"
                                : gameSubmitted &&
                                  gameAnswers[questionIndex] === optIndex &&
                                  optIndex !== q.answer
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {option}
                            {gameSubmitted && optIndex === q.answer && (
                              <span className="ml-2 text-green-600 text-sm">
                                (Correct)
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
        </div>

        {!gameSubmitted && (
          <Button
            onClick={handleSubmitGame}
            disabled={
              Object.keys(gameAnswers).length !==
              (parsedData.questions?.length || 0)
            }
          >
            Submit Answers
          </Button>
        )}

        {gameSubmitted && (
          <Button
            variant="outline"
            onClick={() => {
              setGameSubmitted(false);
              setGameAnswers({});
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Handle quiz type content
  if (parsedData.title && parsedData.questions) {
    return (
      <div className="p-4">
        <h3 className="font-bold text-lg mb-4">{parsedData.title}</h3>
        <div className="space-y-6">
          {parsedData.questions.map((question: any, index: number) => (
            <div
              key={question.id || index}
              className="border border-neutrals-200 rounded-lg p-4"
            >
              <h4 className="font-medium mb-3">{question.question}</h4>

              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-3">
                  {question.options.map((option: any, optionIndex: number) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        id={`q-${question.id || index}-opt-${optionIndex}`}
                        name={`question-${question.id || index}`}
                        value={optionIndex}
                        disabled={quizSubmitted}
                        checked={
                          selectedAnswers[question.id || index] ===
                          optionIndex.toString()
                        }
                        onChange={() =>
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [question.id || index]: optionIndex.toString(),
                          })
                        }
                        className="h-4 w-4 text-primary border-neutrals-300 focus:ring-primary"
                      />
                      <label
                        htmlFor={`q-${question.id || index}-opt-${optionIndex}`}
                        className="text-sm"
                      >
                        {option.label
                          ? `${option.label}. ${option.text}`
                          : option.text}
                      </label>
                      {quizSubmitted && option.correct && (
                        <span className="text-green-600 ml-2">✓</span>
                      )}
                    </div>
                  ))}
                  {quizSubmitted &&
                    quizResults.feedback[question.id || index] && (
                      <div
                        className={`mt-2 p-2 rounded text-sm ${
                          selectedAnswers[question.id || index] ===
                          question.options
                            .findIndex((o: any) => o.correct)
                            .toString()
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {quizResults.feedback[question.id || index]}
                      </div>
                    )}
                </div>
              )}

              {question.type === "likert_scale" && question.scale && (
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    {Object.entries(question.scale.labels || {}).map(
                      ([value, label]) => (
                        <div key={value} className="text-center text-xs">
                          <div>{value}</div>
                          <div>{label}</div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex justify-between space-x-2">
                    {Array.from(
                      { length: question.scale.max - question.scale.min + 1 },
                      (_, i) => i + question.scale.min
                    ).map((value) => (
                      <div key={value} className="flex-1 flex justify-center">
                        <input
                          type="radio"
                          id={`q-${question.id || index}-val-${value}`}
                          name={`question-${question.id || index}`}
                          value={value}
                          disabled={quizSubmitted}
                          checked={
                            selectedAnswers[question.id || index] ===
                            value.toString()
                          }
                          onChange={() =>
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [question.id || index]: value.toString(),
                            })
                          }
                          className="h-4 w-4 text-primary border-neutrals-300 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          {!quizSubmitted ? (
            <Button
              onClick={() => {
                setQuizSubmitted(true);

                // Calculate results
                let score = 0;
                const feedback: Record<string, string> = {};

                parsedData.questions.forEach((question: any, index: number) => {
                  const qId = question.id || index;

                  if (question.type === "multiple_choice") {
                    const correctIndex = question.options.findIndex(
                      (opt: any) => opt.correct
                    );
                    if (
                      correctIndex !== -1 &&
                      selectedAnswers[qId] === correctIndex.toString()
                    ) {
                      score++;
                      feedback[qId] = question.feedback?.correct || "Correct!";
                    } else {
                      feedback[qId] =
                        question.feedback?.incorrect || "Incorrect";
                    }
                  }
                });

                setQuizResults({
                  score,
                  total: parsedData.questions.filter(
                    (q: any) => q.type === "multiple_choice"
                  ).length,
                  feedback,
                });
              }}
            >
              Submit
            </Button>
          ) : (
            <div className="text-center p-4 bg-neutrals-50 rounded-lg w-full">
              <h3 className="font-semibold text-lg">Quiz Results</h3>
              {quizResults.total > 0 ? (
                <div className="mt-2">
                  <p>
                    You scored {quizResults.score} out of {quizResults.total}
                  </p>
                  <div className="mt-2">
                    <Progress
                      value={(quizResults.score / quizResults.total) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ) : (
                <p>Thank you for completing the questionnaire!</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For unknown types, render the JSON
  return (
    <div className="p-4">
      <h3 className="font-bold mb-3">Interactive Content</h3>
      <div className="bg-neutrals-50 p-3 rounded text-sm overflow-auto max-h-80">
        <pre className="text-xs">{JSON.stringify(parsedData, null, 2)}</pre>
      </div>
    </div>
  );
}
