import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserUnitProgress } from "@shared/schema";

export function useUnitProgress(userId: number, courseId: number) {
  const queryClient = useQueryClient();

  // Fetch unit progress for a specific course
  const { data: unitProgress = [], isLoading, error } = useQuery<UserUnitProgress[]>({
    queryKey: [`/api/progress/${userId}/${courseId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/progress/${userId}/${courseId}`);
      return res.json();
    },
    enabled: !!userId && !!courseId,
  });

  // Mark unit as complete mutation
  const markUnitCompleteMutation = useMutation({
    mutationFn: async ({ courseId, unitId }: { courseId: number; unitId: number }) => {
      const res = await apiRequest("POST", "/api/progress/complete", {
        courseId,
        unitId,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch unit progress
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}/${courseId}`] });
      // Also invalidate course progress
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  // Helper function to check if a unit is completed
  const isUnitCompleted = (unitId: number): boolean => {
    return unitProgress.some(progress => progress.unitId === unitId && progress.isCompleted);
  };

  // Helper function to get completion data for a unit
  const getUnitCompletionData = (unitId: number): UserUnitProgress | undefined => {
    return unitProgress.find(progress => progress.unitId === unitId);
  };

  return {
    unitProgress,
    isLoading,
    error,
    markUnitComplete: markUnitCompleteMutation.mutate,
    isUnitCompleted,
    getUnitCompletionData,
    isMarkingComplete: markUnitCompleteMutation.isPending,
  };
} 