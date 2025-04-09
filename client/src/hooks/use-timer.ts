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
  
  // Calculate percentage for progress indicator
  const percentRemaining = (timeRemaining / (isResting ? restDuration : duration)) * 100;
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    setState('running');
    
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTime = (isResting ? restDuration : duration) - elapsedSeconds;
      
      if (newTime <= 0) {
        clearTimer();
        
        if (isResting) {
          // Rest period complete, move to next exercise or side
          setIsResting(false);
          
          if (sides && currentSide === 'left') {
            // Switch to right side
            setCurrentSide('right');
            setTimeRemaining(duration);
            if (onSideChange) onSideChange();
            startTimer();
          } else {
            // Set is complete
            if (currentSet < sets) {
              // Move to next set
              setCurrentSet(prev => prev + 1);
              if (sides) setCurrentSide('left');
              setTimeRemaining(duration);
              if (onSetComplete) onSetComplete(currentSet);
              startTimer();
            } else {
              // All sets complete
              setState('completed');
              if (onComplete) onComplete();
            }
          }
        } else {
          // Exercise period complete, start rest
          setTimeRemaining(restDuration);
          setIsResting(true);
          startTimer();
        }
      } else {
        setTimeRemaining(newTime);
      }
    }, 100); // Update more frequently for smoother countdown
  }, [clearTimer, currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides]);
  
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
      startTimeRef.current = Date.now() - ((isResting ? restDuration : duration) - pausedTimeRef.current) * 1000;
      startTimer();
    }
  }, [duration, isResting, restDuration, startTimer, state]);
  
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
    if (state !== 'running') return;
    
    clearTimer();
    
    if (isResting) {
      // Skip rest period
      setIsResting(false);
      
      if (sides && currentSide === 'left') {
        // Switch to right side
        setCurrentSide('right');
        setTimeRemaining(duration);
        if (onSideChange) onSideChange();
        startTimer();
      } else {
        // Move to next set
        if (currentSet < sets) {
          setCurrentSet(prev => prev + 1);
          if (sides) setCurrentSide('left');
          setTimeRemaining(duration);
          if (onSetComplete) onSetComplete(currentSet);
          startTimer();
        } else {
          // All sets complete
          setState('completed');
          if (onComplete) onComplete();
        }
      }
    } else {
      // Skip exercise period, start rest
      setTimeRemaining(restDuration);
      setIsResting(true);
      startTimer();
    }
  }, [clearTimer, currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides, startTimer, state]);
  
  // Skip to next set directly
  const nextSet = useCallback(() => {
    if (state !== 'running' && state !== 'paused') return;
    
    clearTimer();
    
    if (currentSet < sets) {
      setCurrentSet(prev => prev + 1);
      if (sides) setCurrentSide('left');
      setTimeRemaining(duration);
      setIsResting(false);
      if (onSetComplete) onSetComplete(currentSet);
      startTimer();
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
