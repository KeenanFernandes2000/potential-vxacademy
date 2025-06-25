import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssessmentTimerProps {
  timeLimit: number; // in minutes
  onTimeExpired: () => void;
  isActive: boolean;
}

export function AssessmentTimer({ timeLimit, onTimeExpired, isActive }: AssessmentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isActive || isExpired) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isExpired, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeClass = () => {
    if (timeRemaining <= 300) return "text-red-600"; // Last 5 minutes
    if (timeRemaining <= 600) return "text-yellow-600"; // Last 10 minutes
    return "text-green-600";
  };

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-4 z-50 mb-4">
      <Card className="shadow-lg border-2 border-blue-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Time Remaining:</span>
            </div>
            <div className={`text-2xl font-bold ${getTimeClass()}`}>
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
    </div>
  );
}