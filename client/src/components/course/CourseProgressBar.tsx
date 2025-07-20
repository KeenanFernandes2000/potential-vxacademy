import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Award } from "lucide-react";

interface CourseProgressBarProps {
  completedUnits: number;
  totalUnits: number;
  percent: number;
  hasEndAssessment?: boolean;
  endAssessmentAvailable?: boolean;
}

export const CourseProgressBar = ({
  completedUnits,
  totalUnits,
  percent,
  hasEndAssessment = false,
  endAssessmentAvailable = false,
}: CourseProgressBarProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Course Progress
        </span>
        <span className="text-sm text-gray-500">{percent}% Complete</span>
      </div>
      <Progress value={percent} className="h-3 mb-2" />
    </div>
  );
};
