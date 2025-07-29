import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Course, Unit, LearningBlock, Assessment } from "@shared/schema";

interface CourseProgressData {
  percentComplete: number;
  completed: boolean;
  totalItems: number;
  completedItems: number;
  totalBlocks: number;
  completedBlocks: number;
  totalAssessments: number;
  completedAssessments: number;
}

export function useCourseProgress(
  courseId: number | null,
  userId: number | null
) {
  const queryClient = useQueryClient();

  // Fetch course data
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch units for the course
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: [`/api/courses/${courseId}/units`],
    enabled: !!courseId,
  });

  // Fetch all learning blocks for the course
  const { data: blocks = [] } = useQuery<LearningBlock[]>({
    queryKey: [`/api/courses/${courseId}/blocks`],
    enabled: !!courseId,
  });

  // Fetch all assessments for the course
  const { data: allAssessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/courses/${courseId}/assessments`],
    enabled: !!courseId,
  });

  // Fetch course-specific block progress for all units
  const { data: allBlockProgress = [] } = useQuery({
    queryKey: [`/api/progress/block/all/${courseId}`],
    queryFn: async () => {
      if (!courseId || !units) return [];

      const allProgress = [];
      for (const unit of units) {
        try {
          const res = await apiRequest(
            "GET",
            `/api/progress/block/${courseId}/${unit.id}`
          );
          const unitProgress = await res.json();
          allProgress.push(...unitProgress);
        } catch (error) {
          console.error(
            `Error fetching block progress for unit ${unit.id}:`,
            error
          );
        }
      }
      return allProgress;
    },
    enabled: !!courseId && !!units && units.length > 0,
  });

  // Fetch assessment progress for all units in the course
  const { data: allAssessmentProgress = [] } = useQuery({
    queryKey: [`/api/progress/assessment/all/${courseId}`],
    queryFn: async () => {
      if (!courseId || !units) return [];

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

  // Calculate unified progress
  const progressData = useMemo((): CourseProgressData => {
    if (!courseId || !units || !blocks) {
      return {
        percentComplete: 0,
        completed: false,
        totalItems: 0,
        completedItems: 0,
        totalBlocks: 0,
        completedBlocks: 0,
        totalAssessments: 0,
        completedAssessments: 0,
      };
    }

    // Calculate total items (INCLUDE ALL ASSESSMENTS)
    const totalBlocks = blocks.length;
    // Only count assessments that are NOT final (i.e., not placement === "end" or have a unitId)
    const nonFinalAssessments = allAssessments.filter(
      (assessment) => assessment.placement !== "end" || assessment.unitId
    );
    const totalAssessments = nonFinalAssessments.length;
    const totalItems = totalBlocks + totalAssessments;

    if (totalItems === 0) {
      return {
        percentComplete: 100,
        completed: true,
        totalItems: 0,
        completedItems: 0,
        totalBlocks: 0,
        completedBlocks: 0,
        totalAssessments: 0,
        completedAssessments: 0,
      };
    }

    // Calculate completed blocks using course-specific progress
    const completedBlocks = allBlockProgress.filter(
      (progress: any) =>
        progress &&
        progress.blockId &&
        progress.isCompleted === true &&
        blocks.some((block) => block.id === progress.blockId)
    ).length;

    // Calculate completed assessments (excluding final assessments)
    const completedAssessments = allAssessmentProgress.filter(
      (progress: any) => {
        const isCompleted = progress.isCompleted === true;
        const assessment = allAssessments.find(
          (a) => a.id === progress.assessmentId
        );
        // Only count non-final assessments
        return (
          isCompleted &&
          assessment &&
          (assessment.placement !== "end" || assessment.unitId)
        );
      }
    ).length;

    const completedItems = completedBlocks + completedAssessments;
    const percentComplete = Math.round((completedItems / totalItems) * 100);
    const completed = percentComplete === 100;

    return {
      percentComplete,
      completed,
      totalItems,
      completedItems,
      totalBlocks,
      completedBlocks,
      totalAssessments,
      completedAssessments,
    };
  }, [
    courseId,
    units,
    blocks,
    allAssessments,
    allBlockProgress,
    allAssessmentProgress,
  ]);

  // Helper function to check if a block is completed
  const isBlockCompleted = (blockId: number): boolean => {
    return allBlockProgress.some(
      (progress: any) =>
        progress.blockId === blockId && progress.isCompleted === true
    );
  };

  // Helper function to check if an assessment is completed
  const isAssessmentCompleted = (assessmentId: number): boolean => {
    return allAssessmentProgress.some(
      (progress: any) =>
        progress.assessmentId === assessmentId && progress.isCompleted === true
    );
  };

  // Function to invalidate progress data
  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    queryClient.invalidateQueries({
      queryKey: [`/api/progress/block/all/${courseId}`],
    });
    queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
    queryClient.invalidateQueries({
      queryKey: [`/api/progress/assessment/all/${courseId}`],
    });
  };

  return {
    progressData,
    isBlockCompleted,
    isAssessmentCompleted,
    invalidateProgress,
    course,
    units,
    blocks,
    assessments: allAssessments,
  };
}
