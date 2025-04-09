import { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseTimer } from '@/lib/timer';
import { Exercise } from '@shared/schema';
import { TimerState } from '@/types';

interface UseTimerProps {
  exercise: Exercise;
  onComplete?: () => void;
}

export function useTimer({ exercise, onComplete }: UseTimerProps) {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    secondsRemaining: 0,
    totalDuration: exercise.holdDuration || 0,
    currentSet: 1,
    totalSets: exercise.sets,
    currentSide: exercise.holdDuration ? 'left' : null,
    exerciseType: exercise.holdDuration ? 'hold' : 'rep'
  });
  
  const timerRef = useRef<ExerciseTimer | null>(null);
  
  // Initialize the timer
  useEffect(() => {
    timerRef.current = new ExerciseTimer(
      (timeRemaining) => {
        setState(prev => ({
          ...prev,
          secondsRemaining: timeRemaining
        }));
      },
      () => {
        // Timer complete - handle set completion
        handleSetComplete();
      }
    );
    
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, []);
  
  // Handle set completion logic
  const handleSetComplete = useCallback(() => {
    setState(prev => {
      // If we need to switch sides
      if (prev.currentSide === 'left') {
        return {
          ...prev,
          currentSide: 'right',
          isActive: false
        };
      }
      
      // If we've completed all sets
      if (prev.currentSet >= prev.totalSets) {
        if (onComplete) {
          onComplete();
        }
        return {
          ...prev,
          isActive: false,
          currentSet: prev.totalSets
        };
      }
      
      // Move to next set
      return {
        ...prev,
        currentSet: prev.currentSet + 1,
        currentSide: prev.currentSide ? 'left' : null,
        isActive: false
      };
    });
  }, [onComplete]);
  
  // Start the timer
  const startTimer = useCallback(() => {
    if (!timerRef.current) return;
    
    const duration = exercise.holdDuration || 10; // Default 10 seconds if no hold duration
    
    timerRef.current.start(duration);
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      secondsRemaining: duration,
      totalDuration: duration
    }));
  }, [exercise.holdDuration]);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (!timerRef.current || !state.isActive) return;
    
    timerRef.current.pause();
    setState(prev => ({
      ...prev,
      isPaused: true
    }));
  }, [state.isActive]);
  
  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (!timerRef.current || !state.isPaused) return;
    
    timerRef.current.resume();
    setState(prev => ({
      ...prev,
      isPaused: false
    }));
  }, [state.isPaused]);
  
  // Skip to next set or side
  const skipToNext = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
    }
    handleSetComplete();
  }, [handleSetComplete]);
  
  // Mark current exercise as complete
  const completeExercise = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
    }
    
    if (onComplete) {
      onComplete();
    }
    
    setState(prev => ({
      ...prev,
      isActive: false,
      currentSet: prev.totalSets
    }));
  }, [onComplete]);
  
  return {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    skipToNext,
    completeExercise
  };
}
