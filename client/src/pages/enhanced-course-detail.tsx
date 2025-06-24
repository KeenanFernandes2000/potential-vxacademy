import { useState, useEffect } from "react";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ChevronRight
} from "lucide-react";
import { ComprehensiveAssessment } from "@/components/assessment/ComprehensiveAssessment";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { LearningBlockRenderer } from "@/components/learning-blocks/LearningBlockRenderer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default function EnhancedCourseDetail() {
  const [match, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : null;
  
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LearningBlock | null>(null);
  const [selectedContent, setSelectedContent] = useState<{
    type: "block" | "assessment";
    id: number;
    data: any;
  } | null>(null);

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

  // Fetch learning blocks for active unit
  const { data: blocks = [] } = useQuery<LearningBlock[]>({
    queryKey: [`/api/units/${activeUnitId}/blocks`],
    enabled: !!activeUnitId,
  });

  // Fetch beginning assessments (placement = "beginning")
  const { data: beginningAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments`, { placement: "beginning" }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}/assessments?placement=beginning`);
      return res.json();
    },
    enabled: !!courseId,
  });

  // Fetch end assessments (placement = "end")
  const { data: endAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments`, { placement: "end" }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}/assessments?placement=end`);
      return res.json();
    },
    enabled: !!courseId,
  });

  // Mutation for completing blocks
  const blockCompletionMutation = useMutation({
    mutationFn: async (blockId: number) => {
      const res = await apiRequest("POST", `/api/blocks/${blockId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      // Refresh progress data
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/blocks`] });
    },
  });

  // Check if course is accessible (for sequential courses)
  const isCourseAccessible = () => {
    if (!course || course.courseType === "free") return true;
    
    if (course.courseType === "sequential" && prerequisites.length > 0) {
      // Check if all prerequisites are completed
      const completedCourseIds = userProgress?.filter((p: any) => p.completed).map((p: any) => p.courseId) || [];
      return prerequisites.every(prereq => completedCourseIds.includes(prereq.id));
    }
    
    return true;
  };
    mutationFn: async (blockId: number) => {
      const res = await apiRequest("POST", `/api/blocks/${blockId}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      // Move to next block or show assessment
      if (blocks) {
        const currentIndex = blocks.findIndex(b => b.id === activeBlockId);
        if (currentIndex < blocks.length - 1) {
          setActiveBlockId(blocks[currentIndex + 1].id);
        } else {
          // Show unit assessments or end assessments
          checkForAssessments();
        }
      }
    },
  });

  // Set initial active unit and block
  useEffect(() => {
    if (units.length > 0 && !activeUnitId) {
      const firstUnit = units[0];
      setActiveUnitId(firstUnit.id);
    }
  }, [units, activeUnitId]);

  useEffect(() => {
    if (blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(blocks[0].id);
    }
  }, [blocks, activeBlockId]);

  const courseProgress = progress && Array.isArray(progress)
    ? progress.find((p: any) => p.courseId === courseId)
    : null;

  // Calculate detailed course progress
  const calculateCourseProgress = () => {
    if (!units || !progress) return { percent: 0, completedUnits: 0, totalUnits: units?.length || 0 };

    let completedUnits = 0;
    const totalUnits = units.length;

    // Calculate based on actual course progress or use simplified method
    if (courseProgress && courseProgress.percentComplete > 0) {
      const progressPercent = courseProgress.percentComplete;
      completedUnits = Math.floor((progressPercent / 100) * totalUnits);
      return { 
        percent: progressPercent, 
        completedUnits, 
        totalUnits 
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
    setCurrentAssessment(assessment);
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (assessmentId: number) => {
    setCompletedAssessments(prev => new Set(prev).add(assessmentId));
    setShowAssessment(false);
    setCurrentAssessment(null);
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
  };

  const handleCompleteBlock = (blockId: number) => {
    completeBlockMutation.mutate(blockId);
  };

  // Check if course is accessible (for sequential courses)
  const isCourseAccessible = () => {
    if (!course || course.courseType === "free") return true;
    
    if (course.courseType === "sequential" && prerequisites.length > 0) {
      // Check if all prerequisites are completed
      const completedCourseIds = progress?.filter((p: any) => p.completed).map((p: any) => p.courseId) || [];
      return prerequisites.every(prereq => completedCourseIds.includes(prereq.id));
    }
    
    return true;
  };

  const courseStarted = beginningAssessments.length === 0 || 
    beginningAssessments.some(assessment => completedAssessments.has(assessment.id));

  const isAllContentComplete = () => {
    return detailedProgress.percent >= 80;
  };

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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Locked</h2>
              <p className="text-gray-600 mb-6">
                This sequential course requires completing the following prerequisites:
              </p>
              <div className="space-y-2 mb-6">
                {prerequisites.map(prereq => (
                  <div key={prereq.id} className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    <span>{prereq.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Complete the prerequisite courses to unlock access to this course.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
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
                    {course.duration || course.estimatedDuration || "Self-paced"}
                    {(course.duration || course.estimatedDuration) && " minutes"}
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
              <CourseProgressBar
                units={units}
                userProgress={userProgress}
                unitAssessments={unitAssessments}
                courseAssessments={courseAssessments}
                blockCompletions={blockCompletions}
              />
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
                  {/* Course-level assessments at the beginning */}
                  {courseAssessments
                    .filter(assessment => assessment.placement === "beginning")
                    .map((assessment) => (
                      <div
                        key={`course-assessment-${assessment.id}`}
                        className={`flex items-center gap-3 p-3 border-l-4 cursor-pointer transition-colors ${
                          selectedContent?.type === "assessment" && selectedContent?.id === assessment.id
                            ? "bg-blue-50 border-l-blue-500"
                            : "hover:bg-gray-50 border-l-transparent"
                        }`}
                        onClick={() => {
                          setSelectedContent({ type: "assessment", id: assessment.id, data: assessment });
                          setSelectedUnit(null);
                          setSelectedBlock(null);
                        }}
                      >
                        <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {assessment.title}
                        </span>
                      </div>
                    ))}

                  {/* Units and their content */}
                  {units.map((unit, unitIndex) => {
                    const unitBlocks = learningBlocks.filter(block => block.unitId === unit.id);
                    const unitSpecificAssessments = unitAssessments.filter(assessment => assessment.unitId === unit.id);
                    const isUnitExpanded = selectedUnit?.id === unit.id;

                    return (
                      <div key={unit.id} className="border-b border-gray-100 last:border-b-0">
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
                              const beginningAssessments = unitSpecificAssessments.filter(a => a.placement === "beginning");
                              if (beginningAssessments.length > 0) {
                                setSelectedContent({ type: "assessment", id: beginningAssessments[0].id, data: beginningAssessments[0] });
                              } else if (unitBlocks.length > 0) {
                                setSelectedContent({ type: "block", id: unitBlocks[0].id, data: unitBlocks[0] });
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                              {unitIndex + 1}
                            </span>
                            <span className="font-medium text-gray-900">{unit.name}</span>
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
                              .filter(assessment => assessment.placement === "beginning")
                              .map((assessment) => (
                                <div
                                  key={`unit-assessment-${assessment.id}`}
                                  className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                    selectedContent?.type === "assessment" && selectedContent?.id === assessment.id
                                      ? "bg-orange-50 text-orange-700"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedContent({ type: "assessment", id: assessment.id, data: assessment });
                                    setSelectedBlock(null);
                                  }}
                                >
                                  <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                  <span className="text-sm truncate">{assessment.title}</span>
                                </div>
                              ))}

                            {/* Learning blocks */}
                            {unitBlocks.map((block) => (
                              <div
                                key={`block-${block.id}`}
                                className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                  selectedContent?.type === "block" && selectedContent?.id === block.id
                                    ? "bg-green-50 text-green-700"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                  setSelectedContent({ type: "block", id: block.id, data: block });
                                  setSelectedBlock(block);
                                }}
                              >
                                {block.type === "video" && <Play className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                                {block.type === "text" && <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />}
                                {block.type === "scorm" && <Monitor className="h-4 w-4 text-purple-600 flex-shrink-0" />}
                                {block.type === "interactive" && <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />}
                                <span className="text-sm truncate">{block.title}</span>
                                {blockCompletions.some(completion => completion.blockId === block.id) && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                                )}
                              </div>
                            ))}

                            {/* Unit assessments at end */}
                            {unitSpecificAssessments
                              .filter(assessment => assessment.placement === "end")
                              .map((assessment) => (
                                <div
                                  key={`unit-assessment-end-${assessment.id}`}
                                  className={`flex items-center gap-3 p-2 ml-2 cursor-pointer transition-colors ${
                                    selectedContent?.type === "assessment" && selectedContent?.id === assessment.id
                                      ? "bg-orange-50 text-orange-700"
                                      : "hover:bg-gray-50"
                                  }`}
                                  onClick={() => {
                                    setSelectedContent({ type: "assessment", id: assessment.id, data: assessment });
                                    setSelectedBlock(null);
                                  }}
                                >
                                  <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                  <span className="text-sm truncate">{assessment.title}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Course-level assessments at the end */}
                  {courseAssessments
                    .filter(assessment => assessment.placement === "end")
                    .map((assessment) => (
                      <div
                        key={`course-assessment-end-${assessment.id}`}
                        className={`flex items-center gap-3 p-3 border-l-4 cursor-pointer transition-colors ${
                          selectedContent?.type === "assessment" && selectedContent?.id === assessment.id
                            ? "bg-blue-50 border-l-blue-500"
                            : "hover:bg-gray-50 border-l-transparent"
                        }`}
                        onClick={() => {
                          setSelectedContent({ type: "assessment", id: assessment.id, data: assessment });
                          setSelectedUnit(null);
                          setSelectedBlock(null);
                        }}
                      >
                        <FileQuestion className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {assessment.title}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {selectedContent ? (
              <div>
                {selectedContent.type === "block" && selectedBlock && (
                  <LearningBlockRenderer
                    block={selectedBlock}
                    onComplete={() => {
                      // Handle block completion
                      blockCompletionMutation.mutate(selectedBlock.id);
                    }}
                  />
                )}
                {selectedContent.type === "assessment" && (
                  <ComprehensiveAssessment
                    assessment={selectedContent.data}
                    onComplete={() => {
                      // Refresh data after assessment completion
                      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
                      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/assessments`] });
                    }}
                  />
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
                    Select a unit or assessment from the course content to begin learning.
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
                    
                    {/* Course metadata */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      {course.showDuration && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{course.duration} min</span>
                        </div>
                      )}
                      {course.showLevel && (
                        <div className="flex items-center">
                          <Award className="mr-1 h-4 w-4" />
                          <span className="capitalize">{course.level}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-4 w-4" />
                        <span className="capitalize">{course.courseType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {course.description && (
                  <p className="text-gray-700 leading-relaxed mb-4">{course.description}</p>
                )}
                
                {/* Enhanced Course Progress */}
                <CourseProgressBar
                  completedUnits={detailedProgress.completedUnits}
                  totalUnits={detailedProgress.totalUnits}
                  percent={detailedProgress.percent}
                  hasEndAssessment={endAssessments.length > 0}
                  endAssessmentAvailable={detailedProgress.percent >= 80}
                />
              </div>

              {/* Start Assessment - Placed at top when placement = "beginning" */}
              {beginningAssessments.length > 0 && !courseStarted && (
                <div className="mb-6">
                  <Alert className="mb-4 border-blue-200 bg-blue-50">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      This course requires completing an initial assessment before you can access the content.
                    </AlertDescription>
                  </Alert>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-blue-600" />
                        Initial Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {beginningAssessments.map((assessment) => (
                        <div key={assessment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{assessment.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                {assessment.hasTimeLimit && (
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {assessment.timeLimit} min
                                  </span>
                                )}
                                {assessment.hasCertificate && (
                                  <span className="flex items-center text-green-600">
                                    <Award className="mr-1 h-3 w-3" />
                                    Certificate Available
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleStartAssessment(assessment)}
                              disabled={completedAssessments.has(assessment.id)}
                              className={
                                completedAssessments.has(assessment.id)
                                  ? "bg-green-600"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }
                            >
                              {completedAssessments.has(assessment.id) ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Completed
                                </>
                              ) : (
                                "Start Assessment"
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Course Content */}
              <div className="space-y-6">
                {courseStarted ? (
                  <>
                    {/* Learning Blocks */}
                    {blocks.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Learning Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {blocks.map((block) => (
                            <div key={block.id} className="mb-6 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{block.title}</h3>
                                <Button
                                  onClick={() => handleCompleteBlock(block.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  Complete
                                </Button>
                              </div>
                              {block.content && (
                                <div className="prose max-w-none">
                                  <p>{block.content}</p>
                                </div>
                              )}
                              {block.type === "video" && block.mediaUrl && (
                                <div className="mt-4">
                                  <video controls className="w-full rounded-lg">
                                    <source src={block.mediaUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Unit Assessments */}
                    {unitAssessments.length > 0 && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Trophy className="mr-2 h-5 w-5 text-blue-600" />
                            Unit Assessments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {unitAssessments.map((assessment) => (
                            <div key={assessment.id} className="p-4 border rounded-lg mb-4 border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{assessment.title}</h3>
                                  {assessment.description && (
                                    <p className="text-gray-600 mt-1">{assessment.description}</p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span>XP: {assessment.xpPoints}</span>
                                    {assessment.hasTimeLimit && (
                                      <span className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {assessment.timeLimit} min
                                      </span>
                                    )}
                                    {assessment.hasCertificate && (
                                      <span className="flex items-center text-green-600">
                                        <Award className="mr-1 h-3 w-3" />
                                        Certificate
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleStartAssessment(assessment)}
                                  disabled={completedAssessments.has(assessment.id)}
                                  className={
                                    completedAssessments.has(assessment.id)
                                      ? "bg-green-600"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }
                                >
                                  {completedAssessments.has(assessment.id) ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Completed
                                    </>
                                  ) : (
                                    "Start Assessment"
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Initial Assessment</h3>
                      <p className="text-gray-600">
                        You need to complete the initial assessment to access the course content.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Final Assessment Section - Placed at bottom when placement = "end" */}
                {endAssessments.length > 0 && courseStarted && (
                  <div className="mt-8 border-t pt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Trophy className="mr-2 h-5 w-5 text-green-600" />
                          Final Quiz
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {endAssessments.map((assessment) => (
                          <div key={assessment.id} className="p-4 border rounded-lg mb-4 border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{assessment.title}</h3>
                                {assessment.description && (
                                  <p className="text-gray-600 mt-1">{assessment.description}</p>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>XP: {assessment.xpPoints}</span>
                                  {assessment.hasTimeLimit && (
                                    <span className="flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
                                      {assessment.timeLimit} min
                                    </span>
                                  )}
                                  {assessment.hasCertificate && (
                                    <span className="flex items-center text-green-600">
                                      <Award className="mr-1 h-3 w-3" />
                                      Certificate Available
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleStartAssessment(assessment)}
                                disabled={completedAssessments.has(assessment.id) || detailedProgress.percent < 80}
                                className={
                                  completedAssessments.has(assessment.id)
                                    ? "bg-green-600"
                                    : detailedProgress.percent < 80
                                    ? "bg-gray-400"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }
                              >
                                {completedAssessments.has(assessment.id) ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Completed
                                  </>
                                ) : detailedProgress.percent < 80 ? (
                                  "Complete Course First"
                                ) : (
                                  "Take Assessment"
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {units.map((unit, index) => (
                      <button
                        key={unit.id}
                        onClick={() => setActiveUnitId(unit.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeUnitId === unit.id
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">
                              {index + 1}. {unit.name}
                            </span>
                            {unit.showDuration && (
                              <div className="text-xs text-gray-500 mt-1">
                                {unit.duration} min
                              </div>
                            )}
                          </div>
                          {activeUnitId === unit.id && (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Assessment Dialog */}
        <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentAssessment?.title}</DialogTitle>
            </DialogHeader>
            {currentAssessment && (
              <ComprehensiveAssessment
                assessmentId={currentAssessment.id}
                onComplete={() => handleAssessmentComplete(currentAssessment.id)}
                onCancel={() => setShowAssessment(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}