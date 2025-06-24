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
import { Loader2, Trophy, CheckCircle, Clock, Award, AlertTriangle } from "lucide-react";
import { ComprehensiveAssessment } from "@/components/assessment/ComprehensiveAssessment";

export default function EnhancedCourseDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [match, params] = useRoute("/courses/:id");
  const courseId = match ? parseInt(params.id) : 0;
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [courseStarted, setCourseStarted] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(new Set());
  const [certificatesEarned, setCertificatesEarned] = useState<number[]>([]);

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

  // Fetch learning blocks for the active unit
  const { data: blocks, isLoading: isLoadingBlocks } = useQuery<LearningBlock[]>({
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

  // Set first unit and block as active when data loads
  useEffect(() => {
    if (units && units.length > 0 && !activeUnitId) {
      setActiveUnitId(units[0].id);
    }
  }, [units, activeUnitId]);

  useEffect(() => {
    if (blocks && blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(blocks[0].id);
    }
  }, [blocks, activeBlockId]);

  // Check for beginning assessments when course starts
  useEffect(() => {
    if (beginningAssessments.length > 0 && !courseStarted) {
      const incompleteBeginningAssessment = beginningAssessments.find(
        assessment => !Array.from(completedAssessments).includes(assessment.id)
      );
      if (incompleteBeginningAssessment) {
        setActiveAssessment(incompleteBeginningAssessment);
        setAssessmentDialogOpen(true);
      }
    }
  }, [beginningAssessments, courseStarted, completedAssessments]);

  const checkForAssessments = () => {
    // Check for unit assessments first
    if (unitAssessments.length > 0) {
      const incompleteUnitAssessment = unitAssessments.find(
        assessment => !Array.from(completedAssessments).includes(assessment.id)
      );
      if (incompleteUnitAssessment) {
        setActiveAssessment(incompleteUnitAssessment);
        setAssessmentDialogOpen(true);
        return;
      }
    }

    // Check for end assessments if all content is complete
    if (isAllContentComplete() && endAssessments.length > 0) {
      const incompleteEndAssessment = endAssessments.find(
        assessment => !Array.from(completedAssessments).includes(assessment.id)
      );
      if (incompleteEndAssessment) {
        setActiveAssessment(incompleteEndAssessment);
        setAssessmentDialogOpen(true);
      }
    }
  };

  const isAllContentComplete = () => {
    // Check if all units and blocks are completed
    return units?.every(unit => {
      // This would need to check actual completion status from progress data
      return true; // Simplified for now
    });
  };

  const handleAssessmentComplete = (result: {
    passed: boolean;
    score: number;
    certificateGenerated?: boolean;
    attemptsRemaining: number;
  }) => {
    if (activeAssessment) {
      setCompletedAssessments(prev => new Set([...Array.from(prev), activeAssessment.id]));
      
      if (result.certificateGenerated) {
        setCertificatesEarned(prev => [...prev, activeAssessment.id]);
      }

      setAssessmentDialogOpen(false);
      setActiveAssessment(null);

      // Mark course as started if it was a beginning assessment
      if (activeAssessment.placement === "beginning") {
        setCourseStarted(true);
      }

      // Show success message
      if (result.passed) {
        // Could show a toast notification here
        console.log(`Assessment passed with score: ${result.score}%`);
        if (result.certificateGenerated) {
          console.log("Certificate generated!");
        }
      }
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setAssessmentDialogOpen(true);
  };

  const handleCompleteBlock = (blockId: number) => {
    completeBlockMutation.mutate(blockId);
  };

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

  if (isLoadingCourse || isLoadingUnits) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} />
          <main className="flex-1 lg:ml-64">
            <div className="container mx-auto py-8 px-4">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </main>
        </div>
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto py-8 px-4">
            {course && (
              <>
                {/* Course Header Section - Restored from original design */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.name}</h1>
                  
                  {/* Course metadata row */}
                  <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedDuration || "2h 30m"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{course.difficultyLevel || "Beginner"}</span>
                    </div>
                  </div>
                  
                  {/* Course description */}
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Units Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Course Units</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {units && units.map((unit) => (
                          <div
                            key={unit.id}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                              activeUnitId === unit.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={() => setActiveUnitId(unit.id)}
                          >
                            <div className="font-medium">{unit.name}</div>
                            {unit.description && (
                              <div className="text-sm text-gray-500 mt-1">{unit.description}</div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    {courseStarted || beginningAssessments.length === 0 ? (
                      <>
                        {/* Learning Blocks */}
                        {blocks && blocks.length > 0 && (
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle>Learning Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {blocks.map((block) => (
                                <div
                                  key={block.id}
                                  className={`p-4 border rounded-lg mb-4 ${
                                    activeBlockId === block.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="font-semibold">{block.title}</h3>
                                      {block.description && (
                                        <p className="text-gray-600 mt-1">{block.description}</p>
                                      )}
                                      <div className="text-sm text-gray-500 mt-2">
                                        Type: {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {activeBlockId === block.id && (
                                        <Button
                                          onClick={() => handleCompleteBlock(block.id)}
                                          disabled={completeBlockMutation.isPending}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          {completeBlockMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4" />
                                          )}
                                          Complete
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Block Content */}
                                  {activeBlockId === block.id && (
                                    <div className="mt-4 p-4 bg-white rounded border">
                                      {block.content && (
                                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                                      )}
                                      {block.type === "video" && block.videoUrl && (
                                        <video controls className="w-full">
                                          <source src={block.videoUrl} type="video/mp4" />
                                          Your browser does not support the video tag.
                                        </video>
                                      )}
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
                                <div
                                  key={assessment.id}
                                  className="p-4 border rounded-lg mb-4 border-gray-200"
                                >
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

                        {/* End Assessments - Moved to bottom and enhanced */}
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
                  </div>
                </div>

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
                          <div
                            key={assessment.id}
                            className="p-4 border rounded-lg mb-4 border-gray-200"
                          >
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
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
                                        completedAssessments.has(assessment.id)
                                          ? "bg-green-600"
                                          : "bg-green-600 hover:bg-green-700"
                                      }
                                    >
                                      {completedAssessments.has(assessment.id) ? (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Completed
                                        </>
                                      ) : (
                                        "Start Final Assessment"
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
                        <CardContent className="p-8 text-center">
                          <Trophy className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Assessment Required</h3>
                          <p className="text-gray-600 mb-4">
                            Please complete the required assessment to access course content.
                          </p>
                          {beginningAssessments.length > 0 && (
                            <Button
                              onClick={() => handleStartAssessment(beginningAssessments[0])}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Assessment
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Assessment Dialog */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment</DialogTitle>
          </DialogHeader>
          {activeAssessment && currentUser && (
            <ComprehensiveAssessment
              assessment={activeAssessment}
              userId={currentUser.id}
              onComplete={handleAssessmentComplete}
              onCancel={() => {
                setAssessmentDialogOpen(false);
                setActiveAssessment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}