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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trophy, CheckCircle, Clock, Award, AlertTriangle, Lock } from "lucide-react";
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
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(new Set());

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

  // Fetch unit assessments
  const { data: unitAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/units/${activeUnitId}/assessments`],
    enabled: !!activeUnitId,
  });

  // Fetch current user
  const { data: currentUser } = useQuery<any>({
    queryKey: [`/api/user`],
  });

  // Fetch user progress
  const { data: progress } = useQuery<any>({
    queryKey: [`/api/progress`],
  });

  // Fetch course prerequisites
  const { data: prerequisites = [] } = useQuery<Course[]>({
    queryKey: [`/api/courses/${courseId}/prerequisites`],
    enabled: !!courseId,
  });

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

  if (courseLoading || unitsLoading) {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Course Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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