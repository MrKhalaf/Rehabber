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
    // IMPORTANT: We need to capture current state before making changes
    // since the updates might not be immediately reflected
    const wasResting = isResting;
    const currentSideCopy = currentSide;
    const currentSetCopy = currentSet;
    
    console.log(`Timer state transition:
      From: ${wasResting ? 'Rest' : 'Exercise'} period
      Current set: ${currentSetCopy}/${sets}
      Current side: ${currentSideCopy}`);
    
    if (wasResting) {
      // Coming from rest period, move to exercise period
      setIsResting(false);
      
      if (sides && currentSideCopy === 'left') {
        // Switch to right side for current set
        console.log('Switching to right side');
        setCurrentSide('right');
        setTimeRemaining(duration); // Use exercise duration
        if (onSideChange) onSideChange();
      } else {
        // Current set is complete (including both sides if applicable)
        if (currentSetCopy < sets) {
          // Move to next set
          console.log(`Moving to set ${currentSetCopy + 1}`);
          setCurrentSet(prev => prev + 1);
          if (sides) setCurrentSide('left');
          setTimeRemaining(duration); // Use exercise duration
          if (onSetComplete) onSetComplete(currentSetCopy);
        } else {
          // All sets complete
          console.log('All sets complete!');
          setState('completed');
          if (onComplete) onComplete();
          return false; // Don't continue timer
        }
      }
    } else {
      // Coming from exercise period, move to rest period
      console.log('Moving to rest period');
      setTimeRemaining(restDuration); // Use rest duration
      setIsResting(true);
    }
    
    // Always update the start time for the next phase
    startTimeRef.current = Date.now();
    return true; // Continue timer
  }, [currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides]);
  
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    clearTimer();
    
    // Set the start time reference and update state
    startTimeRef.current = Date.now();
    setState('running');
    
    console.log(`Starting timer: ${isResting ? 'REST' : 'EXERCISE'} phase`);
    console.log(`Duration: ${isResting ? restDuration : duration} seconds`);
    
    // Set up the timer interval
    timerRef.current = window.setInterval(() => {
      // Calculate elapsed time and remaining time
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // CRITICAL: Capture the current isResting state to determine which duration to use
      // This ensures we're consistent within this timer tick
      const isRestingNow = isResting;
      const currentDuration = isRestingNow ? restDuration : duration;
      const newTime = Math.max(0, currentDuration - elapsedSeconds);
      
      if (newTime <= 0) {
        // Timer reached zero, stop the current timer
        clearTimer();
        console.log(`Timer complete for ${isRestingNow ? 'REST' : 'EXERCISE'} phase`);
        
        // Move to the next phase (exercise -> rest, rest -> exercise, or complete)
        const shouldContinue = proceedToNext();
        
        if (shouldContinue) {
          // Add a short delay before starting the next phase
          // This gives the user time to see that the current phase is complete
          setPromptTimeout(() => {
            // Start the next phase timer
            console.log('Starting next phase timer');
            startTimer();
          }, 500);
        }
      } else {
        // Update the displayed time
        setTimeRemaining(newTime);
      }
    }, 100); // Update frequently for smooth countdown
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
      console.log(`Resuming timer: ${isResting ? 'REST' : 'EXERCISE'} phase`);
      console.log(`Time remaining: ${pausedTimeRef.current} seconds`);
      
      // Adjust start time to account for already elapsed time
      const currentDuration = isResting ? restDuration : duration;
      startTimeRef.current = Date.now() - (currentDuration - pausedTimeRef.current) * 1000;
      setState('running');
      
      // Instead of duplicating timer logic here, just call startTimer
      // But first set timeRemaining to pick up from where we left off
      setTimeRemaining(pausedTimeRef.current);
      
      // Use the main timer implementation
      timerRef.current = window.setInterval(() => {
        // Calculate elapsed time and remaining time
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // CRITICAL: Capture the current isResting state to determine which duration to use
        const isRestingNow = isResting;
        const currentDuration = isRestingNow ? restDuration : duration;
        const newTime = Math.max(0, currentDuration - elapsedSeconds);
        
        if (newTime <= 0) {
          // Timer reached zero
          clearTimer();
          console.log(`Timer complete for ${isRestingNow ? 'REST' : 'EXERCISE'} phase`);
          
          // Move to next phase
          const shouldContinue = proceedToNext();
          if (shouldContinue) {
            setPromptTimeout(() => {
              console.log('Starting next phase timer after resume');
              startTimer();
            }, 500);
          }
        } else {
          setTimeRemaining(newTime);
        }
      }, 100);
    }
  }, [clearTimer, duration, isResting, proceedToNext, restDuration, setPromptTimeout, startTimer, state]);
  
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
