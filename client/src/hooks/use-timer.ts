import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerState = 'inactive' | 'running' | 'paused' | 'completed';

export interface TimerConfig {
  duration: number;
  restDuration?: number;
  sets?: number;
  sides?: boolean;
  onComplete?: () => void;
  onSetComplete?: (set: number) => void;
  onSideChange?: () => void;
}

export interface TimerReturn {
  timeRemaining: number;
  percentRemaining: number;
  currentSet: number;
  totalSets: number;
  currentSide: 'left' | 'right' | null;
  isResting: boolean;
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  nextSet: () => void;
}

export function useTimer({
  duration,
  restDuration = 30,
  sets = 1,
  sides = false,
  onComplete,
  onSetComplete,
  onSideChange
}: TimerConfig): TimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentSide, setCurrentSide] = useState<'left' | 'right' | null>(sides ? 'left' : null);
  const [isResting, setIsResting] = useState(false);
  const [state, setState] = useState<TimerState>('inactive');
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const promptTimeoutRef = useRef<number | null>(null);
  
  // Calculate percentage for progress indicator
  const percentRemaining = (timeRemaining / (isResting ? restDuration : duration)) * 100;
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Also clear any pending prompt timeouts
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
      promptTimeoutRef.current = null;
    }
  }, []);
  
  // Function to prompt user action after a delay (for rest periods)
  const setPromptTimeout = useCallback((callback: () => void, delayMs = 1000) => {
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
    }
    promptTimeoutRef.current = window.setTimeout(() => {
      callback();
      promptTimeoutRef.current = null;
    }, delayMs);
  }, []);
  
  // Function to proceed to next activity (exercise, rest, side, or set)
  const proceedToNext = useCallback(() => {
    if (isResting) {
      // Rest period complete, move to next exercise or side
      setIsResting(false);
      
      if (sides && currentSide === 'left') {
        // Switch to right side for current set
        setCurrentSide('right');
        setTimeRemaining(duration);
        if (onSideChange) onSideChange();
        startTimeRef.current = Date.now();
      } else {
        // Current set is complete (including both sides if applicable)
        if (currentSet < sets) {
          // Move to next set
          setCurrentSet(prev => prev + 1);
          if (sides) setCurrentSide('left');
          setTimeRemaining(duration);
          if (onSetComplete) onSetComplete(currentSet);
          startTimeRef.current = Date.now();
        } else {
          // All sets complete
          setState('completed');
          if (onComplete) onComplete();
          return false; // Don't continue timer
        }
      }
    } else {
      // Exercise period complete, start rest
      setTimeRemaining(restDuration);
      setIsResting(true);
      startTimeRef.current = Date.now();
    }
    return true; // Continue timer
  }, [currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides]);
  
  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    setState('running');
    
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      // Important: Use the current isResting state to determine which duration to use
      const currentDuration = isResting ? restDuration : duration;
      const newTime = currentDuration - elapsedSeconds;
      
      if (newTime <= 0) {
        // Timer reached zero, proceed to next phase automatically
        clearTimer();
        const shouldContinue = proceedToNext();
        
        if (shouldContinue) {
          // Set a slight delay before auto-continuing to the next phase
          // This gives the user a moment to see that the timer has completed
          setPromptTimeout(() => {
            // Start a new timer with the updated isResting state
            startTimeRef.current = Date.now();
            
            timerRef.current = window.setInterval(() => {
              const newElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
              // We need to use the UPDATED isResting state after proceedToNext was called
              const newCurrentDuration = isResting ? restDuration : duration;
              const newTimeRemaining = newCurrentDuration - newElapsedSeconds;
              
              if (newTimeRemaining <= 0) {
                clearTimer();
                const shouldContinueAgain = proceedToNext();
                if (shouldContinueAgain) {
                  startTimer();
                }
              } else {
                setTimeRemaining(newTimeRemaining);
              }
            }, 100);
          }, 500);
        }
      } else {
        setTimeRemaining(newTime);
      }
    }, 100); // Update more frequently for smoother countdown
  }, [clearTimer, duration, isResting, proceedToNext, restDuration, setPromptTimeout]);
  
  // Stop timer when component unmounts
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);
  
  // Start the timer
  const start = useCallback(() => {
    setTimeRemaining(duration);
    setCurrentSet(1);
    setCurrentSide(sides ? 'left' : null);
    setIsResting(false);
    startTimer();
  }, [duration, sides, startTimer]);
  
  // Pause the timer
  const pause = useCallback(() => {
    if (state === 'running') {
      clearTimer();
      pausedTimeRef.current = timeRemaining;
      setState('paused');
    }
  }, [clearTimer, state, timeRemaining]);
  
  // Resume the timer
  const resume = useCallback(() => {
    if (state === 'paused') {
      // Adjust start time to account for already elapsed time
      startTimeRef.current = Date.now() - ((isResting ? restDuration : duration) - pausedTimeRef.current) * 1000;
      setState('running');
      
      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Important: Use the current isResting state to determine which duration to use
        const currentDuration = isResting ? restDuration : duration;
        const newTime = currentDuration - elapsedSeconds;
        
        if (newTime <= 0) {
          clearTimer();
          const shouldContinue = proceedToNext();
          if (shouldContinue) {
            // Using startTimer will properly handle the timer with the updated isResting state
            startTimer();
          }
        } else {
          setTimeRemaining(newTime);
        }
      }, 100);
    }
  }, [clearTimer, duration, isResting, proceedToNext, restDuration, startTimer, state]);
  
  // Reset the timer
  const reset = useCallback(() => {
    clearTimer();
    setTimeRemaining(duration);
    setCurrentSet(1);
    setCurrentSide(sides ? 'left' : null);
    setIsResting(false);
    setState('inactive');
  }, [clearTimer, duration, sides]);
  
  // Skip to next part
  const skip = useCallback(() => {
    if (state !== 'running' && state !== 'paused') return;
    
    clearTimer();
    const shouldContinue = proceedToNext();
    
    if (shouldContinue && state === 'running') {
      // Start the timer with the updated isResting state
      startTimer();
    } else if (shouldContinue && state === 'paused') {
      // If we were paused, stay paused but update the display
      setState('paused');
      // Make sure we're using the UPDATED isResting state after calling proceedToNext
      pausedTimeRef.current = isResting ? restDuration : duration;
    }
  }, [clearTimer, isResting, duration, proceedToNext, restDuration, startTimer, state]);
  
  // Skip to next set directly
  const nextSet = useCallback(() => {
    if (state !== 'running' && state !== 'paused') return;
    
    clearTimer();
    
    // Skip directly to the next set, bypassing rest and side changes
    if (currentSet < sets) {
      setCurrentSet(prev => prev + 1);
      if (sides) setCurrentSide('left');
      setTimeRemaining(duration);
      setIsResting(false);
      if (onSetComplete) onSetComplete(currentSet);
      
      if (state === 'running') {
        startTimer();
      } else {
        // If we were paused, stay paused but update the display
        setState('paused');
        pausedTimeRef.current = duration;
      }
    } else {
      // All sets complete
      setState('completed');
      if (onComplete) onComplete();
    }
  }, [clearTimer, currentSet, duration, onComplete, onSetComplete, sets, sides, startTimer, state]);
  
  return {
    timeRemaining,
    percentRemaining,
    currentSet,
    totalSets: sets,
    currentSide,
    isResting,
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    nextSet
  };
}
