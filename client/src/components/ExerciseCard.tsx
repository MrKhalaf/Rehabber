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
      className={`exercise-card bg-white rounded-xl shadow-sm mb-3 p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{exercise.name}</h4>
          <p className="text-sm text-gray-500">
            {getFormattedExerciseDetails(
              exercise.type, 
              exercise.sets, 
              exercise.reps, 
              exercise.holdDuration, 
              exercise.isPaired
            )}
          </p>
          {exercise.equipmentNeeded && (
            <p className="text-xs text-amber-500 mt-1">
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
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
