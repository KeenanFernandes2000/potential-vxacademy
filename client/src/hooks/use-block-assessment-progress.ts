import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserBlockProgress, UserAssessmentProgress } from "@shared/schema";

export function useBlockAssessmentProgress(
  userId: number,
  courseId: number,
  unitId: number
) {
  const queryClient = useQueryClient();

  // Fetch block progress for a specific unit in a course
  const {
    data: blockProgress = [],
    isLoading: isLoadingBlocks,
    error: blockError,
  } = useQuery<UserBlockProgress[]>({
    queryKey: [`/api/progress/block/${courseId}/${unitId}`],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/progress/block/${courseId}/${unitId}`
      );
      return res.json();
    },
    enabled: !!userId && !!courseId && !!unitId,
  });

  // Fetch assessment progress for a specific unit in a course
  const {
    data: assessmentProgress = [],
    isLoading: isLoadingAssessments,
    error: assessmentError,
  } = useQuery<UserAssessmentProgress[]>({
    queryKey: [`/api/progress/assessment/${courseId}/${unitId}`],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/progress/assessment/${courseId}/${unitId}`
      );
      return res.json();
    },
    enabled: !!userId && !!courseId && !!unitId,
  });

  // Mark block as complete mutation
  const markBlockCompleteMutation = useMutation({
    mutationFn: async ({ blockId }: { blockId: number }) => {
      const res = await apiRequest("POST", "/api/progress/block/complete", {
        courseId,
        unitId,
        blockId,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch block progress
      queryClient.invalidateQueries({
        queryKey: [`/api/progress/block/${courseId}/${unitId}`],
      });
    },
  });

  // Mark assessment as complete mutation
  const markAssessmentCompleteMutation = useMutation({
    mutationFn: async ({ assessmentId }: { assessmentId: number }) => {
      const res = await apiRequest(
        "POST",
        "/api/progress/assessment/complete",
        {
          courseId,
          unitId,
          assessmentId,
        }
      );
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch assessment progress
      queryClient.invalidateQueries({
        queryKey: [`/api/progress/assessment/${courseId}/${unitId}`],
      });
    },
  });

  // Helper functions to check completion status
  const isBlockCompleted = (blockId: number): boolean => {
    return blockProgress.some(
      (progress) => progress.blockId === blockId && progress.isCompleted
    );
  };

  const isAssessmentCompleted = (assessmentId: number): boolean => {
    return assessmentProgress.some(
      (progress) =>
        progress.assessmentId === assessmentId && progress.isCompleted
    );
  };

  return {
    // Data
    blockProgress,
    assessmentProgress,

    // Loading states
    isLoadingBlocks,
    isLoadingAssessments,
    isLoading: isLoadingBlocks || isLoadingAssessments,

    // Errors
    blockError,
    assessmentError,

    // Mutations
    markBlockComplete: markBlockCompleteMutation.mutate,
    markAssessmentComplete: markAssessmentCompleteMutation.mutate,
    isMarkingBlockComplete: markBlockCompleteMutation.isPending,
    isMarkingAssessmentComplete: markAssessmentCompleteMutation.isPending,

    // Helper functions
    isBlockCompleted,
    isAssessmentCompleted,
  };
}
