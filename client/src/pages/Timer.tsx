import React, { useEffect, useRef, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExercise, useRecordExerciseProgress } from '@/hooks/use-exercises';
import { useSettingsTimer, SideStrategy } from '@/hooks/use-settings-timer'; // Use the settings-aware timer
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
  
  // Track current set and side locally
  const [displaySet, setDisplaySet] = useState(1);
  const [displaySide, setDisplaySide] = useState<'left' | 'right' | null>(null);
  const [isRestingNow, setIsRestingNow] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<any>(null);

  const handleExerciseComplete = () => {
    if (exercise) {
      // Get current exercise day's start time (4 AM)
      const now = new Date();
      
      // Record that all sets were completed
      const progressData = {
        exerciseId: exercise.id,
        completedSets: exercise.sets,
        completedAt: now,
        notes: ''
      };
      
      console.log('Recording progress:', progressData);
      
      recordProgress.mutate(progressData, {
        onSuccess: () => {
          // Update our completed state
          setIsCompleted(true);
          
          toast({
            title: "Exercise Completed!",
            description: `Great job completing all sets of ${exercise.name}`,
          });
        },
        onError: (error) => {
          console.error('Failed to record progress:', error);
          toast({
            title: "Error",
            description: "Failed to save your progress. Please try again.",
            variant: "destructive"
          });
        }
      });
    }
  };
  
  // Create the timer with settings awareness
  const timer = useSettingsTimer({
    duration: exercise?.type === 'hold' ? (exercise.holdDuration || 10) : 3, // Default to 3 seconds for rep exercises
    restDuration: exercise?.restTime || 30,
    sets: exercise?.sets || 1,
    sides: exercise?.isPaired || false,
    sideStrategy: sideStrategy,
    onComplete: handleExerciseComplete,
    onSetComplete: (set: number) => {
      console.log(`Set ${set} completed callback fired`);
      // Update our local value rather than using timer.currentSet
      setDisplaySet(set + 1);
      toast({
        title: "Set Completed",
        description: `You've completed set ${set} of ${exercise?.sets || 1}`
      });
    },
    onSideChange: () => {
      console.log(`Side change callback fired`);
      // Update our local value rather than using timer.currentSide
      setDisplaySide('right');
      setDisplaySet(1); // Reset set count for right side
      toast({
        title: "Switch Sides",
        description: "Now complete the exercise on the right side"
      });
    }
  });
  
  // Store timer ref for access in callbacks
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);
  
  // Keep our display values in sync with the timer
  useEffect(() => {
    if (timer.currentSet !== displaySet) {
      setDisplaySet(timer.currentSet);
    }
    if (timer.currentSide !== displaySide) {
      setDisplaySide(timer.currentSide);
    }
    setIsRestingNow(timer.isResting);
  }, [timer.currentSet, timer.currentSide, timer.isResting]);

  // Start timer when exercise loads (if no sides)
  useEffect(() => {
    if (exercise && timer.state === 'inactive') {
      if (exercise.isPaired) {
        // Initialize display side for exercises with sides
        setDisplaySide('left');
      } else {
        // Auto-start for exercises without sides
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
    
    const side = displaySide === 'left' ? 'Left Side' : 'Right Side';
    
    // For sequential strategy, show more context about the sides
    if (sideStrategy === 'sequential' && timer.state !== 'inactive') {
      return `${side} (${displaySide === 'left' ? '1st' : '2nd'} phase)`;
    }
    
    return side;
  };

  const getActionText = () => {
    if (isRestingNow) return 'Rest';
    if (exercise.type === 'hold') return 'Hold Position';
    return 'Perform Reps';
  };

  const getActionSubtext = () => {
    if (isRestingNow) return 'Prepare for next set';
    if (exercise.type === 'hold') return 'Maintain proper form';
    return `Complete ${exercise.reps} repetitions`;
  };

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-slate-900 text-foreground dark:text-white">
      <div className="bg-primary text-primary-foreground p-4 pt-12 relative">
        <button 
          className="absolute top-12 left-4 p-1 rounded-full bg-white/20 hover:bg-white/30"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-center mt-2">
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <p className="text-primary-foreground/90 mt-1">
            {getSideLabel()} • Set {displaySet} of {timer.totalSets}
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
                onClick={() => {
                  setDisplaySet(1);
                  setDisplaySide('left');
                  timer.start();
                }}
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
          {isCompleted || timer.state === 'completed' ? (
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white">
                  <div className="text-center">
                    <span className="text-6xl font-bold">✓</span>
                    <p className="mt-2 text-lg">Completed!</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <h2 className="text-xl font-semibold text-foreground dark:text-white">Exercise Complete</h2>
                <p className="text-muted-foreground dark:text-gray-300 mt-1">Great job! You finished all sets.</p>
              </div>
            </div>
          ) : (
            <>
              <CircularProgress
                value={timer.percentRemaining}
                size={256}
                strokeWidth={10}
                className={`mb-4 ${isRestingNow ? 'text-green-500' : 'text-blue-500'}`}
              >
                <span className="text-6xl font-bold text-foreground dark:text-white">
                  {formatTime(timer.timeRemaining)}
                </span>
                <span className="text-muted-foreground dark:text-gray-300 mt-2 font-medium">
                  {isRestingNow ? 'REST PERIOD' : 'EXERCISE PERIOD'}
                </span>
              </CircularProgress>
              
              <div className="text-center mt-4">
                <h2 className="text-xl font-semibold text-foreground dark:text-white">{getActionText()}</h2>
                <p className="text-muted-foreground dark:text-gray-300 mt-1">{getActionSubtext()}</p>
              </div>
            </>
          )}
        </div>

        {/* Exercise Progress */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground dark:text-gray-300 font-medium">Sets progress</span>
            <span className="font-semibold text-foreground dark:text-white">{displaySet}/{timer.totalSets}</span>
          </div>
          <div className="w-full flex space-x-2">
            {Array.from({ length: timer.totalSets }).map((_, i) => (
              <div 
                key={i}
                className={`h-2.5 flex-1 rounded-full ${
                  i < displaySet - 1 || 
                  (i === displaySet - 1 && isRestingNow) ? 
                  'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer Controls */}
        {isCompleted || timer.state === 'completed' ? (
          /* Show "Next Exercise" button when exercise is completed */
          <div className="w-full mt-4">
            <Button 
              className="w-full py-6 h-auto bg-green-600 hover:bg-green-700 text-white text-lg"
              onClick={() => {
                // Go to the next exercise if available
                // For now, just go back to exercise list
                setLocation('/');
              }}
            >
              Next Exercise
            </Button>
          </div>
        ) : (
          /* Show normal exercise controls when not completed */
          <>
            <div className="w-full flex space-x-4 mt-8">
              {timer.state === 'running' ? (
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 h-auto"
                  onClick={() => {
                    timer.pause();
                  }}
                >
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 h-auto"
                  onClick={() => {
                    timer.resume();
                  }}
                >
                  Resume
                </Button>
              )}
              
              <Button 
                className="flex-1 py-4 h-auto bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  // Complete all sets and finish the exercise
                  handleExerciseComplete();
                  timer.reset();
                  setIsCompleted(true);
                }}
              >
                Finish
              </Button>
            </div>
            
            {/* Show Skip buttons while exercise or rest is ongoing */}
            {timer.state === 'running' && (
              <div className="w-full mt-4">
                <Button 
                  className={`w-full py-4 h-auto ${isRestingNow ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => {
                    timer.skip();
                  }}
                >
                  {isRestingNow ? 'Skip Rest' : (exercise.type === 'hold' ? 'Complete Hold' : 'Complete Reps')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
