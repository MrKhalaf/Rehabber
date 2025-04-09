import React, { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExercise, useRecordExerciseProgress } from '@/hooks/use-exercises';
import { useTimer } from '@/hooks/use-timer';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Timer() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/timer/:id');
  const exerciseId = match ? parseInt(params.id) : null;
  const { data: exercise, isLoading, isError } = useExercise(exerciseId);
  const recordProgress = useRecordExerciseProgress();

  const handleExerciseComplete = () => {
    if (exercise) {
      // Record that all sets were completed
      recordProgress.mutate({
        exerciseId: exercise.id,
        completedSets: exercise.sets,
        completedAt: new Date(),
        notes: ''
      });
      
      toast({
        title: "Exercise Completed!",
        description: `Great job completing all sets of ${exercise.name}`,
      });
    }
  };

  const timer = useTimer({
    duration: exercise?.type === 'hold' ? (exercise.holdDuration || 10) : 3, // Default to 3 seconds for rep exercises
    restDuration: exercise?.restTime || 30,
    sets: exercise?.sets || 1,
    sides: exercise?.isPaired || false,
    onComplete: handleExerciseComplete,
    onSetComplete: (set) => {
      toast({
        title: "Set Completed",
        description: `You've completed set ${set}`,
      });
    },
    onSideChange: () => {
      toast({
        description: "Switch sides now",
      });
    }
  });

  useEffect(() => {
    if (exercise && timer.state === 'inactive') {
      timer.start();
    }
  }, [exercise, timer]);

  const handleBack = () => {
    setLocation(`/exercise/${exerciseId}`);
  };

  if (isLoading || isError || !exercise) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Button onClick={() => setLocation('/')}>Return to Home</Button>
      </div>
    );
  }

  const getSideLabel = () => {
    if (!exercise.isPaired) return '';
    return timer.currentSide === 'left' ? 'Left Side' : 'Right Side';
  };

  const getActionText = () => {
    if (timer.isResting) return 'Rest';
    if (exercise.type === 'hold') return 'Hold Position';
    return 'Perform Reps';
  };

  const getActionSubtext = () => {
    if (timer.isResting) return 'Prepare for next set';
    if (exercise.type === 'hold') return 'Maintain proper form';
    return `Complete ${exercise.reps} repetitions`;
  };

  return (
    <div className="h-screen flex flex-col bg-light text-dark">
      <div className="bg-primary text-white p-4 pt-12 relative">
        <button 
          className="absolute top-12 left-4 p-1 rounded-full bg-white/20"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-center mt-2">
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <p className="text-white/80 mt-1">
            {getSideLabel()} • Set {timer.currentSet} of {timer.totalSets}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between h-[calc(100%-160px)] p-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center mt-8">
          <CircularProgress
            value={timer.percentRemaining}
            size={256}
            strokeWidth={10}
            className="mb-4"
          >
            <span className="text-6xl font-bold">
              {formatTime(timer.timeRemaining)}
            </span>
            <span className="text-gray-600 mt-2">seconds remaining</span>
          </CircularProgress>
          
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{getActionText()}</h2>
            <p className="text-gray-600 mt-1">{getActionSubtext()}</p>
          </div>
        </div>

        {/* Exercise Progress */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Sets progress</span>
            <span className="font-medium">{timer.currentSet}/{timer.totalSets}</span>
          </div>
          <div className="w-full flex space-x-2">
            {Array.from({ length: timer.totalSets }).map((_, i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < timer.currentSet - 1 || 
                  (i === timer.currentSet - 1 && timer.isResting) ? 
                  'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="w-full flex space-x-4 mt-8">
          {timer.state === 'running' ? (
            <Button 
              variant="outline" 
              className="flex-1 py-4 h-auto"
              onClick={timer.pause}
            >
              Pause
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1 py-4 h-auto"
              onClick={timer.resume}
            >
              Resume
            </Button>
          )}
          <Button 
            className="flex-1 py-4 h-auto"
            onClick={timer.nextSet}
          >
            Next Set
          </Button>
        </div>
      </div>
    </div>
  );
}
