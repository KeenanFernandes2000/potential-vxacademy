import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Assessment, Question } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, AlertTriangle, Clock, Award, CheckCircle } from "lucide-react";

interface ComprehensiveAssessmentProps {
  assessment: Assessment;
  userId: number;
  onComplete: (result: {
    passed: boolean;
    score: number;
    certificateGenerated?: boolean;
    attemptsRemaining: number;
  }) => void;
  onCancel: () => void;
}

export function ComprehensiveAssessment({ 
  assessment, 
  userId, 
  onComplete, 
  onCancel 
}: ComprehensiveAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    assessment?.hasTimeLimit && assessment?.timeLimit ? assessment.timeLimit * 60 : 0
  );
  const [timeExpired, setTimeExpired] = useState(false);

  // Fetch questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/assessments/${assessment.id}/questions`],
    enabled: !!assessment.id,
  });

  // Fetch previous attempts
  const { data: attempts = [], isLoading: isLoadingAttempts } = useQuery<any[]>({
    queryKey: [`/api/assessments/${assessment.id}/attempts/${userId}`],
    enabled: !!assessment.id && !!userId,
  });

  // Timer effect
  useEffect(() => {
    if (!assessmentStarted || !assessment.hasTimeLimit || timeExpired || isSubmitting) return;

    if (timeRemaining <= 0) {
      setTimeExpired(true);
      handleSubmitAssessment();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [assessmentStarted, timeRemaining, timeExpired, isSubmitting]);

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Making API request to submit assessment:", data);
      const res = await apiRequest("POST", `/api/assessments/${assessment.id}/submit`, data);
      const result = await res.json();
      console.log("Assessment submission response:", result);
      return result;
    },
    onSuccess: (result) => {
      console.log("Assessment submission successful:", result);
      setIsSubmitting(false);
      onComplete({
        passed: result.passed,
        score: result.score,
        certificateGenerated: result.certificateGenerated,
        attemptsRemaining: result.attemptsRemaining
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/assessments/${assessment.id}/attempts/${userId}`] 
      });
      queryClient.invalidateQueries({ queryKey: [`/api/user/progress`] });

      if (result.certificateGenerated) {
        queryClient.invalidateQueries({ queryKey: [`/api/user/certificates`] });
      }
    },
    onError: (error) => {
      console.error("Assessment submission error:", error);
      setIsSubmitting(false);
    }
  });

  const attemptsUsed = attempts.length;
  const attemptsRemaining = Math.max(0, assessment.maxRetakes - attemptsUsed);
  const canTakeAssessment = attemptsRemaining > 0;
  const hasPassed = attempts.some(attempt => attempt.passed);
  const lastAttempt = attempts[attempts.length - 1];

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAssessment = () => {
    if (!questions) return;

    console.log("Submitting assessment...", {
      questionsLength: questions.length,
      selectedAnswersCount: Object.keys(selectedAnswers).length,
      selectedAnswers,
      assessmentId: assessment.id
    });

    // Log each question and its answer for debugging
    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id.toString()];
      console.log(`Question ${question.id}:`, {
        questionText: question.questionText,
        questionType: question.questionType,
        userAnswer,
        correctAnswer: question.correctAnswer,
        hasAnswer: userAnswer !== undefined,
        options: question.options
      });
    });

    // Calculate score on client side before submitting
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id.toString()];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    console.log("Calculated score:", score, "Correct answers:", correctAnswers, "Total questions:", totalQuestions);

    setIsSubmitting(true);
    submitAssessmentMutation.mutate({
      answers: selectedAnswers,
      score,
      timeExpired,
      startedAt: new Date().toISOString()
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeWarning = () => {
    if (timeRemaining <= 300) return "text-red-600"; // Last 5 minutes
    if (timeRemaining <= 600) return "text-yellow-600"; // Last 10 minutes
    return "text-green-600";
  };

  if (isLoadingQuestions || isLoadingAttempts) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading assessment...
        </CardContent>
      </Card>
    );
  }

  // Check if user has already passed this assessment
  if (hasPassed) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Assessment Completed
          </h3>
          <p className="text-gray-600 mb-4">
            You have successfully passed this assessment with a score of{" "}
            {attempts.find(a => a.passed)?.score}%.
          </p>
          {assessment.hasCertificate && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Award className="h-5 w-5" />
                <span className="font-medium">Certificate Earned!</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Check your Achievements page to view your certificate.
              </p>
            </div>
          )}
          <Button 
            onClick={onCancel} 
            variant="outline"
            disabled
            className="cursor-not-allowed opacity-75"
          >
            Completed
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No attempts remaining
  if (!canTakeAssessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Assessment Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-700">
              You have used all your allowed attempts ({assessment.maxRetakes}) for this assessment.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 mb-4">
            <p><strong>Attempts used:</strong> {attemptsUsed} / {assessment.maxRetakes}</p>
            {attempts.length > 0 && (
              <p><strong>Best score:</strong> {Math.max(...attempts.map(a => a.score))}%</p>
            )}
          </div>

          <Button onClick={onCancel}>
            Back to Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Assessment start screen
  if (!assessmentStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-blue-600" />
            {assessment.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.description && (
            <p className="text-gray-600">{assessment.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Assessment Details:</h4>
              <p><strong>Questions:</strong> {questions?.length || 0}</p>
              {assessment.isGraded && assessment.passingScore && (
                <p><strong>Passing Score:</strong> {assessment.passingScore}%</p>
              )}
              <p><strong>XP Points:</strong> {assessment.xpPoints}</p>
              {assessment.hasCertificate && (
                <div className="flex items-center text-green-600">
                  <Award className="mr-1 h-4 w-4" />
                  <span>Certificate awarded upon passing</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Attempt Information:</h4>
              <p><strong>Attempts used:</strong> {attemptsUsed} / {assessment.maxRetakes}</p>
              <p><strong>Attempts remaining:</strong> {attemptsRemaining}</p>
              {assessment.hasTimeLimit && assessment.timeLimit && (
                <div className="flex items-center text-orange-600">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Time limit: {assessment.timeLimit} minutes</span>
                </div>
              )}
            </div>
          </div>

          {attempts.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                Previous attempts: {attempts.map(a => `${a.score}%`).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button onClick={handleStartAssessment} className="bg-blue-600 hover:bg-blue-700">
              Start Assessment
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              No questions found for this assessment.
            </AlertDescription>
          </Alert>
          <Button onClick={onCancel} className="mt-4">
            Back to Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="space-y-4">
      {/* Timer */}
      {assessment.hasTimeLimit && assessment.timeLimit && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Time Remaining:</span>
              </div>
              <div className={`text-2xl font-bold ${getTimeWarning()}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {timeRemaining <= 300 && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Warning: Less than 5 minutes remaining!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.questionType === "mcq" && currentQuestion.options && (
            <RadioGroup
              value={selectedAnswers[currentQuestion.id.toString()] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id.toString(), value)}
              className="space-y-3"
            >
              {(() => {
                let options = currentQuestion.options;

                // Handle different option formats
                if (typeof options === 'string') {
                  try {
                    options = JSON.parse(options);
                  } catch {
                    options = [options];
                  }
                }

                if (!Array.isArray(options)) {
                  return <div className="text-red-600">No options available</div>;
                }

                return options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {String(option)}
                    </Label>
                  </div>
                ));
              })()}
            </RadioGroup>
          )}

          {currentQuestion.questionType === "true_false" && (
            <RadioGroup
              value={selectedAnswers[currentQuestion.id.toString()] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id.toString(), value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="true" id="option-true" />
                <Label htmlFor="option-true" className="cursor-pointer flex-1">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="false" id="option-false" />
                <Label htmlFor="option-false" className="cursor-pointer flex-1">
                  False
                </Label>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={!allAnswered || isSubmitting || timeExpired}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </div>

          {!allAnswered && currentQuestionIndex === questions.length - 1 && (
            <Alert className="mt-3 border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-700">
                Please answer all questions before submitting.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}