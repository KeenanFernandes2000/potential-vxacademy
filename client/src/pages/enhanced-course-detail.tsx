import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import {
  Assessment,
  Course,
  Unit,
  LearningBlock,
  UserProgress,
  User,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Trophy,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  Lock,
  Play,
  FileText,
  Monitor,
  Zap,
  FileQuestion,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Camera,
} from "lucide-react";
import { ComprehensiveAssessment } from "@/components/assessment/ComprehensiveAssessment";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { useBlockAssessmentProgress } from "@/hooks/use-block-assessment-progress";
import { useCourseProgress } from "@/hooks/use-course-progress";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
};

export default function EnhancedCourseDetail() {
  const [match, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : null;

  if (!match || !courseId) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        </div>
      </Layout>
    );
  }

  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LearningBlock | null>(
    null
  );
  const [selectedContent, setSelectedContent] = useState<{
    type: "block" | "assessment";
    id: number;
    data: any;
  } | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null
  );
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(
    new Set()
  );
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(
    new Set()
  );

  // Fetch current user
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch course units
  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: [`/api/courses/${courseId}/units`],
    enabled: !!courseId,
  });

  // Fetch all learning blocks for the course
  const { data: blocks = [], isLoading: blocksLoading } = useQuery<
    LearningBlock[]
  >({
    queryKey: [`/api/courses/${courseId}/blocks`],
    enabled: !!courseId,
  });

  // Fetch user progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<
    UserProgress[]
  >({
    queryKey: ["/api/progress"],
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

  // Fetch user progress for all courses
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress"],
  });

  // Certificate generation mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async (data: { courseId: number; assessmentId: number }) => {
      const res = await apiRequest("POST", `/api/certificates/generate`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      // Show success notification or redirect to achievements
    },
  });

  // Fetch course prerequisites
  const { data: prerequisites = [] } = useQuery<Course[]>({
    queryKey: [`/api/courses/${courseId}/prerequisites`],
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

  // Use unified progress calculation
  const {
    progressData: courseProgressData,
    isBlockCompleted: isBlockCompletedUnified,
    isAssessmentCompleted: isAssessmentCompletedUnified,
    invalidateProgress,
  } = useCourseProgress(courseId, user?.id || null);

  // Use the new per-course-per-user block and assessment progress system
  const {
    blockProgress,
    assessmentProgress,
    isBlockCompleted,
    isAssessmentCompleted,
    markBlockComplete,
    markAssessmentComplete,
    isLoading: isLoadingBlockAssessmentProgress,
  } = useBlockAssessmentProgress(
    user?.id || 0,
    courseId || 0,
    selectedUnit?.id || 0
  );

  // Fetch assessment progress for ALL units in the course to properly show completion status
  const {
    data: allAssessmentProgress = [],
    isLoading: isLoadingAllAssessmentProgress,
  } = useQuery({
    queryKey: [`/api/progress/assessment/all/${courseId}`],
    queryFn: async () => {
      if (!courseId || !units) return [];

      // Fetch assessment progress for all units in the course
      const allProgress = [];
      for (const unit of units) {
        try {
          const res = await apiRequest(
            "GET",
            `/api/progress/assessment/${courseId}/${unit.id}`
          );
          const unitProgress = await res.json();
          allProgress.push(...unitProgress);
        } catch (error) {
          console.error(`Error fetching progress for unit ${unit.id}:`, error);
        }
      }
      return allProgress;
    },
    enabled: !!courseId && !!units && units.length > 0,
  });

  // Enhanced assessment completion check that works across all units
  const isAssessmentCompletedGlobal = (assessmentId: number): boolean => {
    const isCompleted = allAssessmentProgress.some(
      (progress) =>
        progress.assessmentId === assessmentId && progress.isCompleted
    );

    // Debug logging to help identify issues
    if (process.env.NODE_ENV === "development") {
      console.log(`Assessment ${assessmentId} completion check:`, {
        isCompleted,
        allAssessmentProgress: allAssessmentProgress.filter(
          (p) => p.assessmentId === assessmentId
        ),
        totalProgress: allAssessmentProgress.length,
      });
    }

    return isCompleted;
  };

  // Course-specific block progress is handled by useCourseProgress hook

  // Filter beginning assessments from all course assessments
  const beginningAssessments = useMemo(() => {
    if (!allCourseAssessments) return [];
    return allCourseAssessments.filter(
      (assessment) => assessment.placement === "beginning"
    );
  }, [allCourseAssessments]);

  // Filter end assessments from all course assessments
  const endAssessments = useMemo(() => {
    if (!allCourseAssessments) return [];
    return allCourseAssessments.filter(
      (assessment) => assessment.placement === "end"
    );
  }, [allCourseAssessments]);

  // Mutation for completing blocks (using course-specific system)
  const blockCompletionMutation = useMutation({
    mutationFn: async (blockId: number) => {
      // Use the course-specific block completion
      if (selectedUnit) {
        markBlockComplete({ blockId });
      } else {
        throw new Error("No unit selected for block completion");
      }
    },
    onSuccess: (data, blockId) => {
      // Add completed block to local state immediately
      setCompletedBlocks((prev) => new Set(prev).add(blockId));

      // Use unified progress invalidation
      invalidateProgress();
    },
  });

  // Alias for backward compatibility
  const completeBlockMutation = blockCompletionMutation;

  // Check if course is accessible (for sequential courses)
  const isCourseAccessible = () => {
    if (!course || course.courseType === "free") return true;

    if (course.courseType === "sequential" && prerequisites.length > 0) {
      // Check if all prerequisites are completed
      const completedCourseIds =
        userProgress
          ?.filter((p: any) => p.completed)
          .map((p: any) => p.courseId) || [];
      return prerequisites.every((prereq) =>
        completedCourseIds.includes(prereq.id)
      );
    }

    return true;
  };

  // Complete block mutation (consolidated with blockCompletionMutation above)

  // Set initial active unit and block
  useEffect(() => {
    if (units && units.length > 0 && !activeUnitId) {
      const firstUnit = units[0];
      setActiveUnitId(firstUnit.id);
      setSelectedUnit(firstUnit);
    }
  }, [units]);

  useEffect(() => {
    if (blocks && blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(blocks[0].id);
      setSelectedBlock(blocks[0]);
    }
  }, [blocks]);

  // Initialize completed assessments from the new progress system
  useEffect(() => {
    if (allAssessmentProgress && Array.isArray(allAssessmentProgress)) {
      const completedIds = allAssessmentProgress
        .filter((p: any) => p.isCompleted)
        .map((p: any) => p.assessmentId);

      setCompletedAssessments((prev) => {
        const newSet = new Set(completedIds);
        // Only update if the set is actually different
        if (
          prev.size !== newSet.size ||
          Array.from(prev).some((id) => !newSet.has(id))
        ) {
          return newSet;
        }
        return prev;
      });
    }
  }, [allAssessmentProgress]);

  // Course-specific block progress is handled by useCourseProgress hook
  // No need to initialize completedBlocks from legacy data

  const courseProgress =
    progress && Array.isArray(progress)
      ? progress.find((p: any) => p.courseId === courseId)
      : null;

  // Calculate detailed course progress
  const calculateCourseProgress = () => {
    if (!units || !progress)
      return { percent: 0, completedUnits: 0, totalUnits: units?.length || 0 };

    let completedUnits = 0;
    const totalUnits = units.length;

    // Calculate based on actual course progress or use simplified method
    if (courseProgress && courseProgress.percentComplete > 0) {
      const progressPercent = courseProgress.percentComplete;
      completedUnits = Math.floor((progressPercent / 100) * totalUnits);
      return {
        percent: progressPercent,
        completedUnits,
        totalUnits,
      };
    }

    // Fallback calculation
    const percent = Math.round((completedUnits / totalUnits) * 100);
    return { percent, completedUnits, totalUnits };
  };

  const detailedProgress = calculateCourseProgress();

  const checkForAssessments = () => {
    if (unitAssessments.length > 0) {
      // Show unit assessments first
      const assessment = unitAssessments[0];
      if (!completedAssessments.has(assessment.id)) {
        setCurrentAssessment(assessment);
        setShowAssessment(true);
      }
    } else if (endAssessments.length > 0 && detailedProgress.percent >= 80) {
      // Show end assessments if course is mostly complete
      const assessment = endAssessments[0];
      if (!completedAssessments.has(assessment.id)) {
        setCurrentAssessment(assessment);
        setShowAssessment(true);
      }
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedContent({
      type: "assessment",
      id: assessment.id,
      data: assessment,
    });
    setCurrentAssessment(assessment);
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (result: {
    passed: boolean;
    score: number;
    certificateGenerated?: boolean;
    attemptsRemaining: number;
    assessmentId: number;
  }) => {
    const { passed, assessmentId, certificateGenerated } = result;

    if (passed) {
      // Find the assessment to get its unitId and other properties
      const assessment = [...unitAssessments, ...courseAssessments].find(
        (a) => a.id === assessmentId
      );

      // Use the new per-course-per-user assessment completion
      if (assessment?.unitId && courseId) {
        // Call the API directly since we need to specify unitId
        apiRequest("POST", "/api/progress/assessment/complete", {
          courseId,
          unitId: assessment.unitId,
          assessmentId,
        }).catch((error) => {
          console.error("Error marking assessment complete:", error);
        });
      } else if (selectedUnit) {
        // Fallback to the hook method if we have selectedUnit
        markAssessmentComplete({ assessmentId });
      }

      // Add completed assessment to local state immediately (for backward compatibility)
      setCompletedAssessments((prev) => new Set(prev).add(assessmentId));

      // Check if certificate should be generated
      if (assessment?.hasCertificate && !certificateGenerated) {
        generateCertificateMutation.mutate({
          courseId: courseId!,
          assessmentId,
        });
      }
    }

    setShowAssessment(false);
    setCurrentAssessment(null);

    // Use unified progress invalidation
    invalidateProgress();

    if (passed) {
      // Determine next action based on assessment type and placement
      const completedAssessment = [
        ...unitAssessments,
        ...courseAssessments,
      ].find((a) => a.id === assessmentId);

      if (completedAssessment) {
        if (completedAssessment.placement === "beginning") {
          // After beginning assessment, start with first unit/block
          if (units && units.length > 0) {
            const firstUnit = units[0];
            setActiveUnitId(firstUnit.id);
            setSelectedUnit(firstUnit);

            // If unit has blocks, select first block
            if (blocks && blocks.length > 0) {
              const firstBlock = blocks[0];
              setActiveBlockId(firstBlock.id);
              setSelectedBlock(firstBlock);
              setSelectedContent({
                type: "block",
                id: firstBlock.id,
                data: firstBlock,
              });
            }
          }
        } else if (completedAssessment.placement === "end") {
          // After end assessment, show completion state or move to next unit
          if (units && units.length > 0) {
            const currentUnitIndex = units.findIndex(
              (u) => u.id === activeUnitId
            );
            if (currentUnitIndex < units.length - 1) {
              // Move to next unit
              const nextUnit = units[currentUnitIndex + 1];
              setActiveUnitId(nextUnit.id);
              setSelectedUnit(nextUnit);
            }
          }
        } else {
          // Regular unit assessment - continue with current flow
          if (blocks && blocks.length > 0) {
            const currentIndex = blocks.findIndex(
              (b) => b.id === activeBlockId
            );
            if (currentIndex < blocks.length - 1) {
              const nextBlock = blocks[currentIndex + 1];
              setActiveBlockId(nextBlock.id);
              setSelectedBlock(nextBlock);
              setSelectedContent({
                type: "block",
                id: nextBlock.id,
                data: nextBlock,
              });
            }
          }
        }
      }
    }
  };

  const handleCompleteBlock = (blockId: number) => {
    blockCompletionMutation.mutate(blockId);
  };

  // Check if course assessment should be shown at the end
  const showCourseAssessmentAtEnd = useMemo(() => {
    return (
      courseAssessments?.some((assessment) => assessment.placement === "end") ||
      false
    );
  }, [courseAssessments]);

  // Check if course assessment should be shown at the beginning
  const showCourseAssessmentAtBeginning = useMemo(() => {
    return (
      courseAssessments?.some(
        (assessment) => assessment.placement === "beginning"
      ) || false
    );
  }, [courseAssessments]);

  const courseStarted =
    beginningAssessments.length === 0 ||
    beginningAssessments.some((assessment) =>
      completedAssessments.has(assessment.id)
    );

  // Check if all content is complete (excluding final assessment)
  const isAllContentComplete = () => {
    return courseProgressData.percentComplete === 100;
  };

  // Auto-enroll if user accesses course but has no progress record
  useEffect(() => {
    const userCourseProgress = progress?.find((p) => p.courseId === courseId);
    if (
      courseId &&
      course &&
      !isLoadingProgress &&
      progress &&
      !userCourseProgress &&
      !enrollMutation.isPending
    ) {
      console.log("Auto-enrolling user in course", courseId);
      enrollMutation.mutate(courseId);
    }
  }, [courseId, course, isLoadingProgress, progress]);

  // Auto-select initial content when course loads
  useEffect(() => {
    if (!selectedContent && courseAssessments && units && blocks) {
      // Priority 1: Beginning course assessment (if not completed)
      const beginningAssessment = courseAssessments.find(
        (assessment) =>
          assessment.placement === "beginning" &&
          !completedAssessments.has(assessment.id)
      );

      if (beginningAssessment) {
        setSelectedContent({
          type: "assessment",
          id: beginningAssessment.id,
          data: beginningAssessment,
        });
        return;
      }

      // Priority 2: First unit's beginning assessment or first block
      if (units.length > 0) {
        const firstUnit = units[0];
        const firstUnitBlocks = blocks.filter(
          (block) => block.unitId === firstUnit.id
        );
        const firstUnitAssessments = allCourseAssessments.filter(
          (assessment) => assessment.unitId === firstUnit.id
        );

        // Check for beginning unit assessment first
        const beginningUnitAssessment = firstUnitAssessments.find(
          (assessment) =>
            assessment.placement === "beginning" &&
            !completedAssessments.has(assessment.id)
        );

        if (beginningUnitAssessment) {
          setSelectedUnit(firstUnit);
          setSelectedContent({
            type: "assessment",
            id: beginningUnitAssessment.id,
            data: beginningUnitAssessment,
          });
          return;
        }

        // Otherwise select first block
        if (firstUnitBlocks.length > 0) {
          const firstBlock = firstUnitBlocks[0];
          setSelectedUnit(firstUnit);
          setSelectedContent({
            type: "block",
            id: firstBlock.id,
            data: firstBlock,
          });
          setSelectedBlock(firstBlock);
        }
      }
    }
  }, [
    selectedContent,
    courseAssessments,
    units,
    blocks,
    allCourseAssessments,
    completedAssessments,
  ]);

  if (courseLoading || unitsLoading || blocksLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        </div>
      </Layout>
    );
  }

  // Show access restriction for sequential courses
  if (!isCourseAccessible()) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Locked
              </h2>
              <p className="text-gray-600 mb-6">
                This sequential course requires completing the following
                prerequisites:
              </p>
              <div className="space-y-2 mb-6">
                {prerequisites.map((prereq) => (
                  <div
                    key={prereq.id}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>{prereq.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Complete the prerequisite courses to unlock access to this
                course.
              </p>
              <Button
                disabled
                className="bg-gray-400 cursor-not-allowed"
                title="This course is locked. Complete the prerequisite course(s) to unlock."
              >
                <Lock className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 pl-[36px] pr-[36px]">
        {/* Course Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.name}
              </h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>
                    {course.duration ||
                      course.estimatedDuration ||
                      "Self-paced"}
                    {(course.duration || course.estimatedDuration) &&
                      " minutes"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="capitalize">
                    {course.level || course.difficultyLevel || "Beginner"}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:w-80">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <CourseProgressBar
                  completedUnits={courseProgressData.completedItems}
                  totalUnits={courseProgressData.totalItems}
                  percent={courseProgressData.percentComplete}
                  hasEndAssessment={endAssessments.length > 0}
                  endAssessmentAvailable={
                    courseProgressData.percentComplete === 100 &&
                    endAssessments.length > 0
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {/* Course Assessment at Beginning */}
                  {showCourseAssessmentAtBeginning &&
                    courseAssessments
                      ?.filter(
                        (assessment) =>
                          assessment.placement === "beginning" &&
                          assessment.moduleId !== null
                      )
                      .map((assessment) => {
                        const isCompleted = isAssessmentCompletedGlobal(
                          assessment.id
                        );
                        const isSelected =
                          selectedContent?.type === "assessment" &&
                          selectedContent?.id === assessment.id;

                        return (
                          <div
                            key={`course-beginning-assessment-${assessment.id}`}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 ${
                              isSelected
                                ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                                : isCompleted
                                ? "bg-gray-50 text-gray-600"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedContent({
                                type: "assessment",
                                id: assessment.id,
                                data: assessment,
                              });
                              setSelectedBlock(null);
                            }}
                          >
                            <div className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full flex-shrink-0">
                              <FileQuestion className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-medium text-sm block ${
                                  isCompleted ? "line-through" : ""
                                }`}
                              >
                                {assessment.title}
                              </span>
                              <span className="text-xs text-gray-500 block">
                                Course Assessment - Complete before proceeding
                              </span>
                            </div>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}

                  {/* Units and their content */}
                  {units.map((unit, unitIndex) => {
                    const unitBlocks = blocks.filter(
                      (block) => block.unitId === unit.id
                    );
                    const unitSpecificAssessments = allCourseAssessments.filter(
                      (assessment) => assessment.unitId === unit.id
                    );
                    const isUnitExpanded = selectedUnit?.id === unit.id;

                    return (
                      <div
                        key={unit.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {/* Unit Header */}
                        <div
                          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                            isUnitExpanded ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            if (isUnitExpanded) {
                              setSelectedUnit(null);
                            } else {
                              setSelectedUnit(unit);
                              // Auto-select first content item in unit
                              const beginningAssessments =
                                unitSpecificAssessments.filter(
                                  (a) => a.placement === "beginning"
                                );
                              if (beginningAssessments.length > 0) {
                                setSelectedContent({
                                  type: "assessment",
                                  id: beginningAssessments[0].id,
                                  data: beginningAssessments[0],
                                });
                              } else if (unitBlocks.length > 0) {
                                setSelectedContent({
                                  type: "block",
                                  id: unitBlocks[0].id,
                                  data: unitBlocks[0],
                                });
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                              {unitIndex + 1}
                            </span>
                            <span className="font-medium text-gray-900">
                              {unit.name}
                            </span>
                          </div>
                          {isUnitExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </div>

                        {/* Unit Content (when expanded) */}
                        {isUnitExpanded && (
                          <div className="pl-4 space-y-1">
                            {/* Unit assessments at beginning */}
                            {unitSpecificAssessments
                              .filter(
                                (assessment) =>
                                  assessment.placement === "beginning"
                              )
                              .map((assessment) => (
                                <div
                                  key={`unit-${unit.id}-beginning-assessment-${assessment.id}`}
                                  className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                    selectedContent?.type === "assessment" &&
                                    selectedContent?.id === assessment.id
                                      ? "bg-orange-50 text-orange-700"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedContent({
                                      type: "assessment",
                                      id: assessment.id,
                                      data: assessment,
                                    });
                                    setSelectedBlock(null);
                                  }}
                                >
                                  <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                  <span className="text-sm truncate">
                                    {assessment.title}
                                  </span>
                                </div>
                              ))}

                            {/* Learning blocks */}
                            {unitBlocks.map((block) => {
                              const isCompleted = isBlockCompleted(block.id);
                              const isSelected =
                                selectedContent?.type === "block" &&
                                selectedContent?.id === block.id;

                              return (
                                <div
                                  key={`block-${block.id}`}
                                  className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-green-50 text-green-700 border-l-2 border-green-500"
                                      : isCompleted
                                      ? "bg-gray-50 text-gray-600"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedContent({
                                      type: "block",
                                      id: block.id,
                                      data: block,
                                    });
                                    setSelectedBlock(block);
                                  }}
                                >
                                  {block.type === "video" && (
                                    <Play className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  )}
                                  {block.type === "image" && (
                                    <Camera className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                  )}
                                  {block.type === "text" && (
                                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  )}
                                  {block.type === "scorm" && (
                                    <Monitor className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                  )}
                                  {block.type === "interactive" && (
                                    <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-sm truncate ${
                                      isCompleted ? "line-through" : ""
                                    }`}
                                  >
                                    {block.title}
                                  </span>
                                  {isCompleted && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}

                            {/* Unit assessments at end */}
                            {unitSpecificAssessments
                              .filter(
                                (assessment) => assessment.placement === "end"
                              )
                              .map((assessment) => {
                                const isCompleted = isAssessmentCompletedGlobal(
                                  assessment.id
                                );
                                const isSelected =
                                  selectedContent?.type === "assessment" &&
                                  selectedContent?.id === assessment.id;

                                return (
                                  <div
                                    key={`unit-${unit.id}-end-assessment-${assessment.id}`}
                                    className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-orange-50 text-orange-700 border-l-2 border-orange-500"
                                        : isCompleted
                                        ? "bg-gray-50 text-gray-600"
                                        : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => {
                                      if (!isCompleted) {
                                        setSelectedContent({
                                          type: "assessment",
                                          id: assessment.id,
                                          data: assessment,
                                        });
                                        setSelectedBlock(null);
                                      }
                                    }}
                                  >
                                    <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                    <span
                                      className={`text-sm truncate ${
                                        isCompleted ? "line-through" : ""
                                      }`}
                                    >
                                      {assessment.title}
                                    </span>
                                    {isCompleted && (
                                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Course Assessment at End */}
                  {showCourseAssessmentAtEnd && isAllContentComplete() && (
                    <div className="mt-4 p-3 border-t border-gray-200">
                      <div className="text-center">
                        <h4 className="font-medium mb-2 flex items-center justify-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          Final Assessment
                        </h4>
                        {courseAssessments
                          ?.filter(
                            (assessment) =>
                              assessment.placement === "end" &&
                              assessment.moduleId !== null
                          )
                          .map((assessment) => {
                            const isCompleted = isAssessmentCompletedGlobal(
                              assessment.id
                            );
                            return (
                              <Button
                                key={`final-assessment-${assessment.id}`}
                                onClick={() =>
                                  handleStartAssessment(assessment)
                                }
                                disabled={isCompleted}
                                className={`w-full ${
                                  isCompleted
                                    ? "bg-green-600 cursor-not-allowed"
                                    : "bg-yellow-600 hover:bg-yellow-700"
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Assessment Completed
                                  </>
                                ) : (
                                  <>
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Start Final Assessment
                                  </>
                                )}
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Show message when final assessment is not yet available */}
                  {showCourseAssessmentAtEnd && !isAllContentComplete() && (
                    <div className="mt-4 p-3 border-t border-gray-200">
                      <div className="text-center">
                        <h4 className="font-medium mb-2 flex items-center justify-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          Final Assessment Locked
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Complete all course content to unlock the final
                          assessment
                        </p>
                        <div className="text-xs text-gray-400">
                          Progress: {courseProgressData.percentComplete}%
                          Complete
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No assessment message */}
                  {courseId === 2 &&
                    courseAssessments &&
                    courseAssessments.length === 0 &&
                    ""}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {selectedContent ? (
              <div>
                {selectedContent.type === "block" && selectedBlock && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {selectedBlock.type === "video" && (
                          <Play className="mr-2 h-5 w-5 text-blue-600" />
                        )}
                        {selectedBlock.type === "image" && (
                          <Camera className="mr-2 h-5 w-5 text-cyan-500" />
                        )}
                        {selectedBlock.type === "text" && (
                          <FileText className="mr-2 h-5 w-5 text-green-600" />
                        )}
                        {selectedBlock.type === "scorm" && (
                          <Monitor className="mr-2 h-5 w-5 text-purple-600" />
                        )}
                        {selectedBlock.type === "interactive" && (
                          <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                        )}
                        {selectedBlock.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedBlock.type === "text" && (
                        <div
                          className="prose max-w-none [&_br]:block [&_br]:my-1 [&_p]:whitespace-pre-line [&_p:empty]:min-h-[1em] [&_p:empty]:block"
                          dangerouslySetInnerHTML={{
                            __html: selectedBlock.content || "",
                          }}
                        />
                      )}
                      {selectedBlock.type === "video" &&
                        selectedBlock.videoUrl && (
                          <div className="aspect-video">
                            <iframe
                              src={getEmbeddableYouTubeUrl(
                                selectedBlock.videoUrl
                              )}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        )}{
                          selectedBlock.type === "image" && (
                            <div className="">
                              <img
                                src={selectedBlock.imageUrl}
                                className="rounded-lg w-full shadow-md"
                              />
                            </div>
                          )
                        }
                      {selectedBlock.type === "scorm" && (
                        <div className="text-center p-8 bg-purple-50 rounded-lg">
                          <Monitor className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                          <h3 className="text-lg font-medium text-purple-900 mb-2">
                            Interactive Content
                          </h3>
                          <p className="text-purple-700 mb-4">
                            Launch the interactive SCORM content to continue
                            learning
                          </p>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Launch Content
                          </Button>
                        </div>
                      )}
                      <div className="mt-6">
                        {isBlockCompletedUnified(selectedBlock.id) ? (
                          <Button
                            disabled
                            className="bg-green-600 text-white cursor-not-allowed opacity-75"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Block Completed
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              blockCompletionMutation.mutate(selectedBlock.id)
                            }
                            disabled={blockCompletionMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {blockCompletionMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Block
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {selectedContent.type === "assessment" && user && (
                  <div>
                    {isAssessmentCompletedUnified(selectedContent.id) ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Assessment Completed
                          </h3>
                          <p className="text-gray-600">
                            You have successfully completed this assessment.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <ComprehensiveAssessment
                        assessment={selectedContent.data}
                        userId={user.id}
                        courseId={courseId!}
                        unitId={selectedUnit?.id}
                        isCompleted={isAssessmentCompletedUnified(
                          selectedContent.id
                        )}
                        onComplete={(result) =>
                          handleAssessmentComplete({
                            ...result,
                            assessmentId: selectedContent.id,
                          })
                        }
                        onCancel={() => {
                          setShowAssessment(false);
                          setCurrentAssessment(null);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to {course.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Select a unit or assessment from the course content to begin
                    learning.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
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
