import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Pause, Play, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/use-timer';
import { ExerciseTimerProps } from '@/types';

export function ExerciseTimer({ exercise, onComplete, onClose }: ExerciseTimerProps) {
  const { 
    state, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    skipToNext, 
    completeExercise 
  } = useTimer({ exercise, onComplete });
  
  useEffect(() => {
    // Auto-start the timer if it's a hold exercise
    if (exercise.holdDuration && !state.isActive && !state.isPaused) {
      startTimer();
    }
  }, [exercise, state.isActive, state.isPaused, startTimer]);
  
  // Calculate progress percentage for the circle
  const progressPercentage = state.secondsRemaining / state.totalDuration;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (progressPercentage * circumference);
  
  // Get display text based on exercise type and current state
  const getInstructionText = () => {
    if (exercise.holdDuration) {
      const sideText = state.currentSide ? ` - ${state.currentSide === 'left' ? 'Left' : 'Right'} Side` : '';
      return `Hold for ${exercise.holdDuration} seconds${sideText}`;
    } else if (exercise.reps) {
      return `${exercise.reps} repetitions`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-white z-20 flex flex-col">
      <header className="px-4 py-3 flex justify-between items-center border-b border-secondary-200">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-secondary-500 hover:bg-secondary-100"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-secondary-800">{exercise.name}</h2>
        <div className="w-8"></div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <p className="text-xl font-medium mb-2">Set {state.currentSet} of {state.totalSets}</p>
          <p className="text-sm text-secondary-500">{getInstructionText()}</p>
        </div>
        
        <div className="w-64 h-64 rounded-full bg-primary-100 flex items-center justify-center mb-8 relative">
          <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="5" />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#3B82F6" 
              strokeWidth="5" 
              strokeDasharray={circumference} 
              strokeDashoffset={dashOffset} 
              transform="rotate(-90 50 50)" 
            />
          </svg>
          <span className="text-5xl font-bold text-primary-700">
            {state.secondsRemaining}
          </span>
        </div>
        
        <div className="flex gap-4 mb-6">
          <Button 
            variant="outline"
            className="py-3 px-6 bg-secondary-200 hover:bg-secondary-300 text-secondary-800 rounded-xl text-base font-medium"
            onClick={state.isPaused ? resumeTimer : pauseTimer}
          >
            {state.isPaused ? (
              <><Play className="h-4 w-4 mr-2" /> Resume</>
            ) : (
              <><Pause className="h-4 w-4 mr-2" /> Pause</>
            )}
          </Button>
          <Button 
            className="py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-base font-medium"
            onClick={completeExercise}
          >
            <Check className="h-4 w-4 mr-2" /> Complete
          </Button>
        </div>
        
        {exercise.techniqueTip && (
          <div className="w-full max-w-sm">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex">
                <div className="flex-shrink-0 text-blue-500">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Technique Tip</h3>
                  <p className="text-sm text-blue-700 mt-1">{exercise.techniqueTip}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="px-4 py-3 border-t border-secondary-200">
        <div className="flex justify-between items-center">
          <button 
            className="text-secondary-500 font-medium" 
            onClick={() => {
              // Handle previous exercise logic
              // In a real app, this would go to the previous exercise
            }}
          >
            <ChevronLeft className="h-4 w-4 inline mr-1" /> Previous
          </button>
          <div className="flex space-x-2">
            {[...Array(state.totalSets)].map((_, i) => (
              <span 
                key={i} 
                className={`h-2 w-2 rounded-full ${
                  i + 1 === state.currentSet ? 'bg-primary-500' : 'bg-secondary-300'
                }`} 
              />
            ))}
          </div>
          <button 
            className="text-primary-600 font-medium" 
            onClick={skipToNext}
          >
            Next <ChevronRight className="h-4 w-4 inline ml-1" />
          </button>
        </div>
      </footer>
    </div>
  );
}
