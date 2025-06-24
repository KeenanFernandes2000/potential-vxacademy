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

  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LearningBlock | null>(null);
  const [selectedContent, setSelectedContent] = useState<{
    type: "block" | "assessment";
    id: number;
    data: any;
  } | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(new Set());
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set());

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
  const { data: blocks = [], isLoading: blocksLoading } = useQuery<LearningBlock[]>({
    queryKey: [`/api/units/${activeUnitId}/blocks`],
    enabled: !!activeUnitId,
  });

  // Fetch user progress
  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
  });

  // Fetch user progress for all courses
  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user/progress"],
  });

  // Fetch course prerequisites
  const { data: prerequisites = [] } = useQuery({
    queryKey: [`/api/courses/${courseId}/prerequisites`],
    enabled: !!courseId,
  });

  // Fetch unit assessments
  const { data: unitAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/units/${activeUnitId}/assessments`],
    enabled: !!activeUnitId,
  });

  // Fetch course assessments
  const { data: courseAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments`],
    enabled: !!courseId,
  });

  // Fetch block completions
  const { data: blockCompletions = [] } = useQuery({
    queryKey: ["/api/block-completions"],
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

  // Complete block mutation
  const completeBlockMutation = useMutation({
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
      setSelectedUnit(firstUnit);
    }
  }, [units]);

  useEffect(() => {
    if (blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(blocks[0].id);
      setSelectedBlock(blocks[0]);
    }
  }, [blocks]);

  // Initialize completed assessments and blocks from progress data
  useEffect(() => {
    if (progress && Array.isArray(progress)) {
      const courseProgress = progress.find((p: any) => p.courseId === courseId);
      if (courseProgress && courseProgress.completedAssessments) {
        setCompletedAssessments(new Set(courseProgress.completedAssessments));
      }
    }
  }, [progress, courseId]);

  useEffect(() => {
    if (blockCompletions && Array.isArray(blockCompletions)) {
      const completedBlockIds = blockCompletions.map((completion: any) => completion.blockId);
      setCompletedBlocks(new Set(completedBlockIds));
    }
  }, [blockCompletions]);

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

  // Check if course assessment should be shown at the end
  const showCourseAssessmentAtEnd = useMemo(() => {
    return courseAssessments?.some(assessment => assessment.placement === 'end') || false;
  }, [courseAssessments]);

  // Check if course assessment should be shown at the beginning
  const showCourseAssessmentAtBeginning = useMemo(() => {
    return courseAssessments?.some(assessment => assessment.placement === 'beginning') || false;
  }, [courseAssessments]);


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
                  {/* Course Assessment at Beginning */}
                  {showCourseAssessmentAtBeginning && (
                    <div key="course-assessment-beginning-wrapper" className="mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Course Assessment
                          </CardTitle>
                          <CardDescription>
                            Complete this assessment before proceeding with the course
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {courseAssessments
                            ?.filter(assessment => assessment.placement === 'beginning')
                            .map((assessment) => (
                              <div key={`course-beginning-assessment-${assessment.id}`} className="mb-4">
                                <h4 className="font-medium mb-2">{assessment.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {assessment.description}
                                </p>
                                <Button 
                                  onClick={() => handleStartAssessment(assessment)}
                                  className="w-full"
                                >
                                  Start Assessment
                                </Button>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Units and their content */}
                  {units.map((unit, unitIndex) => {
                    const unitBlocks = blocks.filter(block => block.unitId === unit.id);
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
                                  key={`unit-${unit.id}-beginning-assessment-${assessment.id}`}
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
                                  key={`unit-${unit.id}-end-assessment-${assessment.id}`}
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
                        {selectedBlock.type === 'video' && <Play className="mr-2 h-5 w-5 text-blue-600" />}
                        {selectedBlock.type === 'text' && <FileText className="mr-2 h-5 w-5 text-green-600" />}
                        {selectedBlock.type === 'scorm' && <Monitor className="mr-2 h-5 w-5 text-purple-600" />}
                        {selectedBlock.type === 'interactive' && <Zap className="mr-2 h-5 w-5 text-yellow-600" />}
                        {selectedBlock.title}
                      </CardTitle>
                      {selectedBlock.description && (
                        <CardDescription>{selectedBlock.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedBlock.type === 'text' && (
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedBlock.content || '' }}
                        />
                      )}
                      {selectedBlock.type === 'video' && selectedBlock.videoUrl && (
                        <div className="aspect-video">
                          <iframe
                            src={selectedBlock.videoUrl}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {selectedBlock.type === 'scorm' && (
                        <div className="text-center p-8 bg-purple-50 rounded-lg">
                          <Monitor className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                          <h3 className="text-lg font-medium text-purple-900 mb-2">
                            Interactive Content
                          </h3>
                          <p className="text-purple-700 mb-4">
                            Launch the interactive SCORM content to continue learning
                          </p>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Launch Content
                          </Button>
                        </div>
                      )}
                      <div className="mt-6">
                        <Button
                          onClick={() => blockCompletionMutation.mutate(selectedBlock.id)}
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
                      </div>
                    </CardContent>
                  </Card>
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