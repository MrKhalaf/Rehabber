import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export type TimerState = 'inactive' | 'running' | 'paused' | 'completed';
export type SideStrategy = 'alternate' | 'sequential';

export interface TimerConfig {
  duration: number;
  restDuration?: number;
  sets?: number;
  sides?: boolean;
  sideStrategy?: SideStrategy;
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

export function useSettingsTimer({
  duration,
  restDuration,
  sets = 1,
  sides = false,
  sideStrategy,
  onComplete,
  onSetComplete,
  onSideChange
}: TimerConfig): TimerReturn {
  // Get default values from settings
  const { settings } = useSettings();
  
  // Use settings as fallbacks for unspecified parameters
  const effectiveRestDuration = restDuration ?? settings.defaultRestPeriod;
  const effectiveSideStrategy = sideStrategy ?? settings.defaultSideStrategy;
  
  // State
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentSide, setCurrentSide] = useState<'left' | 'right' | null>(sides ? 'left' : null);
  const [isResting, setIsResting] = useState(false);
  const [state, setState] = useState<TimerState>('inactive');
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Derived values
  const percentRemaining = (timeRemaining / (isResting ? effectiveRestDuration : duration)) * 100;
  
  // Clear any active timers
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Timer functions
  const start = useCallback(() => {
    clearTimer();
    
    setTimeRemaining(duration);
    setCurrentSet(1);
    setCurrentSide(sides ? 'left' : null);
    setIsResting(false);
    setState('running');
    
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remainingTime = Math.max(0, duration - elapsedSeconds);
      
      setTimeRemaining(remainingTime);
      
      if (remainingTime <= 0) {
        clearTimer();
        
        // If we have rest periods, transition to rest
        if (effectiveRestDuration > 0) {
          setIsResting(true);
          setTimeRemaining(effectiveRestDuration);
          startTimeRef.current = Date.now();
          
          // Start the rest timer
          timerRef.current = window.setInterval(() => {
            const restElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const restRemaining = Math.max(0, effectiveRestDuration - restElapsed);
            
            setTimeRemaining(restRemaining);
            
            if (restRemaining <= 0) {
              clearTimer();
              
              // Handle set/side progression
              if (sides) {
                if (effectiveSideStrategy === 'alternate') {
                  // Alternate sides within the set
                  if (currentSide === 'left') {
                    // Switch to right side for current set
                    setCurrentSide('right');
                    setIsResting(false);
                    setTimeRemaining(duration);
                    if (onSideChange) onSideChange();
                    start();
                  } else {
                    // Completed both sides, go to next set or finish
                    if (currentSet < sets) {
                      // Next set
                      setCurrentSet(prev => prev + 1);
                      setCurrentSide('left');
                      setIsResting(false);
                      setTimeRemaining(duration);
                      if (onSetComplete) onSetComplete(currentSet);
                      start();
                    } else {
                      // All sets complete
                      setState('completed');
                      if (onComplete) onComplete();
                    }
                  }
                } else {
                  // Sequential - do all sets on one side, then switch
                  if (currentSide === 'left') {
                    if (currentSet < sets) {
                      // Next set on left side
                      setCurrentSet(prev => prev + 1);
                      setIsResting(false);
                      setTimeRemaining(duration);
                      if (onSetComplete) onSetComplete(currentSet);
                      start();
                    } else {
                      // All left sets done, switch to right
                      setCurrentSet(1);
                      setCurrentSide('right');
                      setIsResting(false);
                      setTimeRemaining(duration);
                      if (onSideChange) onSideChange();
                      start();
                    }
                  } else {
                    // Right side
                    if (currentSet < sets) {
                      // Next set on right side
                      setCurrentSet(prev => prev + 1);
                      setIsResting(false);
                      setTimeRemaining(duration);
                      if (onSetComplete) onSetComplete(currentSet);
                      start();
                    } else {
                      // All sets complete
                      setState('completed');
                      if (onComplete) onComplete();
                    }
                  }
                }
              } else {
                // No sides, just sets
                if (currentSet < sets) {
                  // Next set
                  setCurrentSet(prev => prev + 1);
                  setIsResting(false);
                  setTimeRemaining(duration);
                  if (onSetComplete) onSetComplete(currentSet);
                  start();
                } else {
                  // All sets complete
                  setState('completed');
                  if (onComplete) onComplete();
                }
              }
            }
          }, 100);
        } else {
          // No rest period, go directly to next set/side
          // (Logic would be similar to above but without the rest phase)
          setState('completed');
          if (onComplete) onComplete();
        }
      }
    }, 100);
  }, [
    clearTimer, currentSet, currentSide, duration, 
    effectiveRestDuration, effectiveSideStrategy, 
    onComplete, onSetComplete, onSideChange, sets, sides
  ]);
  
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
      const pausedTime = pausedTimeRef.current;
      setState('running');
      
      // Start from where we left off
      startTimeRef.current = Date.now() - ((isResting ? effectiveRestDuration : duration) - pausedTime) * 1000;
      
      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentDuration = isResting ? effectiveRestDuration : duration;
        const newTime = Math.max(0, currentDuration - elapsedSeconds);
        
        setTimeRemaining(newTime);
        
        if (newTime <= 0) {
          clearTimer();
          // Would continue with the same progression logic as in start()
        }
      }, 100);
    }
  }, [clearTimer, duration, effectiveRestDuration, isResting, state]);
  
  // Reset the timer
  const reset = useCallback(() => {
    clearTimer();
    setTimeRemaining(duration);
    setCurrentSet(1);
    setCurrentSide(sides ? 'left' : null);
    setIsResting(false);
    setState('inactive');
  }, [clearTimer, duration, sides]);
  
  // Skip current phase (exercise or rest)
  const skip = useCallback(() => {
    clearTimer();
    
    if (isResting) {
      // Skip rest and go to next exercise
      setIsResting(false);
      setTimeRemaining(duration);
      // Would apply the same progression logic as in the rest completion
    } else {
      // Skip exercise and go to rest
      setIsResting(true);
      setTimeRemaining(effectiveRestDuration);
    }
    
    startTimeRef.current = Date.now();
    start();
  }, [clearTimer, duration, effectiveRestDuration, isResting, start]);
  
  // Force move to next set
  const nextSet = useCallback(() => {
    clearTimer();
    
    if (currentSet < sets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(false);
      setTimeRemaining(duration);
      if (onSetComplete) onSetComplete(currentSet);
    } else {
      setState('completed');
      if (onComplete) onComplete();
    }
  }, [clearTimer, currentSet, duration, onComplete, onSetComplete, sets]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);
  
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