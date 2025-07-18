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
import { Trophy, AlertTriangle, Clock, Award } from "lucide-react";
import { AssessmentTimer } from "./AssessmentTimer";

interface AssessmentFlowProps {
  assessment: Assessment;
  userId: number;
  onComplete: (
    passed: boolean,
    score: number,
    certificateGenerated?: boolean
  ) => void;
  onCancel: () => void;
}

export function AssessmentFlow({
  assessment,
  userId,
  onComplete,
  onCancel,
}: AssessmentFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  // Fetch questions for the assessment
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<
    Question[]
  >({
    queryKey: [`/api/assessments/${assessment.id}/questions`],
    enabled: !!assessment.id,
  });

  // Fetch user's previous attempts
  const { data: attempts, isLoading: isLoadingAttempts } = useQuery<any[]>({
    queryKey: [`/api/assessments/${assessment.id}/attempts/${userId}`],
    enabled: !!assessment.id && !!userId,
  });

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "POST",
        `/api/assessments/${assessment.id}/submit`,
        data
      );
      return res.json();
    },
    onSuccess: (result) => {
      setIsSubmitting(false);
      onComplete(result.passed, result.score, result.certificateGenerated);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [`/api/assessments/${assessment.id}/attempts/${userId}`],
      });
      queryClient.invalidateQueries({ queryKey: [`/api/user/progress`] });

      if (result.certificateGenerated) {
        queryClient.invalidateQueries({ queryKey: [`/api/user/certificates`] });
      }
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const attemptsUsed = attempts?.length || 0;
  const attemptsRemaining = Math.max(0, assessment.maxRetakes - attemptsUsed);
  const canTakeAssessment = attemptsRemaining > 0;

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = () => {
    if (
      timeExpired ||
      Object.keys(selectedAnswers).length === questions?.length
    ) {
      setIsSubmitting(true);

      submitAssessmentMutation.mutate({
        answers: selectedAnswers,
        timeExpired,
        startedAt: new Date().toISOString(),
      });
    }
  };

  const handleTimeExpired = () => {
    setTimeExpired(true);
    // Auto-submit when time expires with current answers
    setIsSubmitting(true);
    submitAssessmentMutation.mutate({
      answers: selectedAnswers,
      timeExpired: true,
      startedAt: new Date().toISOString(),
    });
  };

  if (isLoadingQuestions || isLoadingAttempts) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading assessment...</div>
        </CardContent>
      </Card>
    );
  }

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
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              You have used all your allowed attempts ({assessment.maxRetakes})
              for this assessment.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Attempts used:</strong> {attemptsUsed} /{" "}
              {assessment.maxRetakes}
            </p>
            {attempts && attempts.length > 0 && (
              <p>
                <strong>Best score:</strong>{" "}
                {Math.max(...attempts.map((a) => a.score))}%
              </p>
            )}
          </div>
          <Button onClick={onCancel} className="mt-4">
            Back to Course
          </Button>
        </CardContent>
      </Card>
    );
  }

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
              <p>
                <strong>Questions:</strong> {questions?.length || 0}
              </p>
              {assessment.isGraded && assessment.passingScore && (
                <p>
                  <strong>Passing Score:</strong> {assessment.passingScore}%
                </p>
              )}
              <p>
                <strong>XP Points:</strong> {assessment.xpPoints}
              </p>
              {assessment.hasCertificate && (
                <div className="flex items-center text-green-600">
                  <Award className="mr-1 h-4 w-4" />
                  <span>Certificate awarded upon passing</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Attempt Information:</h4>
              <p>
                <strong>Attempts used:</strong> {attemptsUsed} /{" "}
                {assessment.maxRetakes}
              </p>
              <p>
                <strong>Attempts remaining:</strong> {attemptsRemaining}
              </p>
              {assessment.hasTimeLimit && assessment.timeLimit && (
                <div className="flex items-center text-orange-600">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Time limit: {assessment.timeLimit} minutes</span>
                </div>
              )}
            </div>
          </div>

          {attempts && attempts.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                Previous attempts:{" "}
                {attempts.map((a) => `${a.score}%`).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleStartAssessment}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
      {/* Timer (if time limit is set) */}
      {assessment.hasTimeLimit && assessment.timeLimit && (
        <AssessmentTimer
          timeLimit={assessment.timeLimit}
          onTimeExpired={handleTimeExpired}
          isActive={!timeExpired && !isSubmitting}
        />
      )}

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
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
          {currentQuestion.questionType === "mcq" &&
            currentQuestion.options !== null && (
              <RadioGroup
                value={selectedAnswers[currentQuestion.id.toString()] || ""}
                onValueChange={(value) =>
                  handleAnswerSelect(currentQuestion.id.toString(), value)
                }
                className="space-y-3"
              >
                {(() => {
                  let options = currentQuestion.options as any;

                  // Handle different option formats
                  if (typeof options === "string") {
                    try {
                      options = JSON.parse(options);
                    } catch {
                      options = [options];
                    }
                  }

                  if (!Array.isArray(options)) {
                    return (
                      <div className="text-red-600">No options available</div>
                    );
                  }

                  return options.map((option: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="cursor-pointer flex-1"
                      >
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
              onValueChange={(value) =>
                handleAnswerSelect(currentQuestion.id.toString(), value)
              }
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
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>Next</Button>
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
