import { format } from 'date-fns';
import { Check, Circle, Info } from 'lucide-react';
import { ExerciseWithStatus } from '@/types';
import { Button } from '@/components/ui/button';

interface ExerciseItemProps {
  exercise: ExerciseWithStatus;
  onStart: () => void;
}

export function ExerciseItem({ exercise, onStart }: ExerciseItemProps) {
  const { 
    name, 
    sets, 
    reps, 
    holdDuration, 
    equipment, 
    isComplete, 
    completedAt 
  } = exercise;

  // Format completion time if available
  const formattedTime = completedAt 
    ? format(new Date(completedAt), 'h:mm a') 
    : null;

  // Create description based on exercise parameters
  const getDescription = () => {
    const parts = [];
    
    if (sets) parts.push(`${sets} sets`);
    if (reps) parts.push(`${reps} reps`);
    if (holdDuration) parts.push(`${holdDuration}s hold`);
    
    return parts.join(' × ');
  };

  return (
    <li className="px-4 py-3 hover:bg-secondary-50 transition-colors">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isComplete 
              ? 'bg-green-100 text-green-600' 
              : 'bg-secondary-200 text-secondary-600'
          }`}>
            {isComplete ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-secondary-900">{name}</p>
            {isComplete && formattedTime && (
              <span className="text-xs text-secondary-500">{formattedTime}</span>
            )}
          </div>
          <p className="text-xs text-secondary-500 mt-1">{getDescription()}</p>
          {equipment && (
            <p className="text-xs text-info-500 mt-1 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              {equipment} needed
            </p>
          )}
        </div>
        {!isComplete && (
          <div className="ml-2">
            <Button 
              className="py-1 px-3 rounded-full text-sm font-medium"
              onClick={onStart}
            >
              Start
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
