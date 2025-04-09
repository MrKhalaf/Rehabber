import React from 'react';
import { useExercises } from '@/hooks/use-exercises';
import { calculateProgress } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProgressSummaryProps {
  className?: string;
}

export function ProgressSummary({ className }: ProgressSummaryProps) {
  const { data: exercises, isLoading } = useExercises();

  // Placeholder for completed exercises count
  // In a real app, you'd track completion status in a separate state or query
  const completedCount = 3;
  const totalCount = exercises ? exercises.length : 0;
  const progressPercentage = calculateProgress(completedCount, totalCount);

  return (
    <div className={`bg-white rounded-xl shadow-sm mb-6 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Progress</h2>
        <Badge variant="outline" className="text-gray-500">
          {isLoading ? 'Loading...' : `${completedCount}/${totalCount} exercises`}
        </Badge>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
