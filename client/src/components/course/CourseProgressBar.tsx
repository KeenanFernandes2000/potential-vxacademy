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
  endAssessmentAvailable = false 
}: CourseProgressBarProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Course Progress</span>
        <span className="text-sm text-gray-500">
          {completedUnits}/{totalUnits} units • {percent}% complete
        </span>
      </div>
      <Progress value={percent} className="h-3" />
      
      {/* Progress details */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3" />
          <span>Units: {completedUnits}/{totalUnits}</span>
        </div>
        {hasEndAssessment && (
          <div className="flex items-center gap-1">
            {endAssessmentAvailable ? (
              <>
                <Award className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Final Assessment Available</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">Complete course to unlock assessment</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};