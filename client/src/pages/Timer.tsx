import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExercise, useRecordExerciseProgress } from '@/hooks/use-exercises';
import { useTimer, SideStrategy } from '@/hooks/use-timer';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Timer() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/timer/:id');
  const exerciseId = match ? parseInt(params.id) : null;
  const { data: exercise, isLoading, isError } = useExercise(exerciseId);
  const recordProgress = useRecordExerciseProgress();
  const [sideStrategy, setSideStrategy] = useState<SideStrategy>('sequential');

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
    sideStrategy: sideStrategy,
    onComplete: handleExerciseComplete,
    onSetComplete: (set) => {
      toast({
        title: "Set Completed",
        description: `You've completed set ${set} of ${exercise?.sets || 1}`
      });
    },
    onSideChange: () => {
      toast({
        title: "Switch Sides",
        description: "Now complete the exercise on the right side"
      });
    }
  });

  useEffect(() => {
    if (exercise && timer.state === 'inactive') {
      // Only auto-start for exercises without sides
      // For exercises with sides, user will use the Start button after selecting strategy
      if (!exercise.isPaired) {
        timer.start();
      }
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
    
    const side = timer.currentSide === 'left' ? 'Left Side' : 'Right Side';
    
    // For sequential strategy, show more context about the sides
    if (sideStrategy === 'sequential' && timer.state !== 'inactive') {
      return `${side} (${timer.currentSide === 'left' ? '1st' : '2nd'} phase)`;
    }
    
    return side;
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
          
          {/* Side Strategy Selection - only shown for exercises with sides */}
          {exercise.isPaired && timer.state === 'inactive' && (
            <div className="mt-4 bg-white/10 p-3 rounded-lg">
              <div className="text-sm mb-2 text-white/80">How do you want to perform sides?</div>
              <Select
                value={sideStrategy}
                onValueChange={(value: SideStrategy) => setSideStrategy(value)}
              >
                <SelectTrigger className="bg-white/20 border-none text-white">
                  <SelectValue placeholder="Side Strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alternate">
                    Alternate Sides (L-R-L-R)
                  </SelectItem>
                  <SelectItem value="sequential">
                    All Sets on One Side First (L-L-L, then R-R-R)
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full mt-3 bg-white text-primary hover:bg-white/90"
                onClick={() => timer.start()}
              >
                Start Exercise
              </Button>
            </div>
          )}
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
            className={`flex-1 py-4 h-auto ${timer.isResting ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            onClick={timer.skip}
          >
            {timer.isResting ? 'Skip Rest' : (exercise.type === 'hold' ? 'Complete Hold' : 'Complete Reps')}
          </Button>
        </div>
        
        {/* Next Set Button */}
        <div className="w-full mt-4">
          <Button 
            variant="outline"
            className="w-full py-4 h-auto border-dashed text-gray-600"
            onClick={timer.nextSet}
          >
            {timer.currentSet < timer.totalSets ? 
              `Skip to Set ${timer.currentSet + 1}/${timer.totalSets}` : 
              'Complete All Sets'}
          </Button>
        </div>
      </div>
    </div>
  );
}
