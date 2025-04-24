import React from 'react';
import { useLocation } from 'wouter';
import { Exercise } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ExerciseStatus, getFormattedExerciseDetails, getStatusBadgeClasses, getStatusLabel } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  status?: ExerciseStatus;
  className?: string;
}

export function ExerciseCard({ exercise, status = 'todo', className = '' }: ExerciseCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/exercise/${exercise.id}`);
  };

  return (
    <div 
      className={`exercise-card bg-card dark:bg-slate-800 rounded-xl shadow-sm mb-3 p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground dark:text-white">{exercise.name}</h4>
          <p className="text-sm text-muted-foreground dark:text-gray-300">
            {getFormattedExerciseDetails(
              exercise.type, 
              exercise.sets, 
              exercise.reps, 
              exercise.holdDuration, 
              exercise.isPaired
            )}
          </p>
          {exercise.equipmentNeeded && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              Equipment: {exercise.equipmentNeeded}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className={`${getStatusBadgeClasses(status)} text-xs font-medium px-2 py-1 rounded-full mr-2`}
          >
            {getStatusLabel(status)}
          </Badge>
          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
