import React, { useMemo } from 'react';
import { useExercises, isExerciseCompletedToday } from '@/hooks/use-exercises';
import { calculateProgress } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProgressSummaryProps {
  className?: string;
}

export function ProgressSummary({ className }: ProgressSummaryProps) {
  const { data: exercises, isLoading } = useExercises();

  // Calculate completed exercises using our isExerciseCompletedToday function
  const completedCount = useMemo(() => {
    if (!exercises) return 0;
    
    // Count exercises that are completed today
    return exercises.filter(exercise => {
      return isExerciseCompletedToday(exercise);
    }).length;
  }, [exercises]);
  
  const totalCount = exercises ? exercises.length : 0;
  const progressPercentage = calculateProgress(completedCount, totalCount);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-6 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-foreground dark:text-white">Progress</h2>
        <Badge variant="outline" className="text-gray-500 dark:text-gray-300 dark:border-gray-600">
          {isLoading ? 'Loading...' : `${completedCount}/${totalCount} exercises`}
        </Badge>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
