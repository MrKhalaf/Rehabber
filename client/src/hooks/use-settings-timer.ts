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
      // Skip rest and go to next exercise/set
      setIsResting(false);
      setTimeRemaining(duration);
      
      // Handle set/side progression like we do at the end of rest
      if (sides) {
        if (effectiveSideStrategy === 'alternate') {
          // Alternate sides within the set
          if (currentSide === 'left') {
            // Switch to right side for current set
            setCurrentSide('right');
            if (onSideChange) onSideChange();
          } else {
            // Completed both sides, go to next set or finish
            if (currentSet < sets) {
              // Next set
              setCurrentSet(prev => prev + 1);
              setCurrentSide('left');
              if (onSetComplete) onSetComplete(currentSet);
            } else {
              // All sets complete
              setState('completed');
              if (onComplete) onComplete();
              return; // Exit early to prevent starting a new timer
            }
          }
        } else {
          // Sequential - do all sets on one side, then switch
          if (currentSide === 'left') {
            if (currentSet < sets) {
              // Next set on left side
              setCurrentSet(prev => prev + 1);
              if (onSetComplete) onSetComplete(currentSet);
            } else {
              // All left sets done, switch to right
              setCurrentSet(1);
              setCurrentSide('right');
              if (onSideChange) onSideChange();
            }
          } else {
            // Right side
            if (currentSet < sets) {
              // Next set on right side
              setCurrentSet(prev => prev + 1);
              if (onSetComplete) onSetComplete(currentSet);
            } else {
              // All sets complete
              setState('completed');
              if (onComplete) onComplete();
              return; // Exit early to prevent starting a new timer
            }
          }
        }
      } else {
        // No sides, just sets
        if (currentSet < sets) {
          // Next set
          setCurrentSet(prev => prev + 1);
          if (onSetComplete) onSetComplete(currentSet);
        } else {
          // All sets complete
          setState('completed');
          if (onComplete) onComplete();
          return; // Exit early to prevent starting a new timer
        }
      }
    } else {
      // Skip exercise and go to rest
      setIsResting(true);
      setTimeRemaining(effectiveRestDuration);
    }
    
    startTimeRef.current = Date.now();
    setState('running');
    
    // Start the appropriate timer based on current state
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const currentDuration = isResting ? effectiveRestDuration : duration;
      const remainingTime = Math.max(0, currentDuration - elapsedSeconds);
      
      setTimeRemaining(remainingTime);
      
      if (remainingTime <= 0) {
        clearTimer();
        // We'll handle this on the next call to skip or in regular timer progression
      }
    }, 100);
  }, [clearTimer, currentSet, currentSide, duration, effectiveRestDuration, 
      effectiveSideStrategy, isResting, onComplete, onSetComplete, onSideChange, sets, sides]);
  
  // Force move to next set
  const nextSet = useCallback(() => {
    clearTimer();
    
    if (currentSet < sets) {
      // Call onSetComplete with the current set number before incrementing
      if (onSetComplete) onSetComplete(currentSet);
      
      // Move to the next set
      setCurrentSet(prev => prev + 1);
      setIsResting(false);
      setTimeRemaining(duration);
      
      // Restart the timer for the next set
      startTimeRef.current = Date.now();
      setState('running');
      
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
                
                // After rest period, determine if we move to next set or complete
                if (currentSet + 1 < sets) {
                  // Auto-move to next set
                  nextSet();
                } else {
                  // Exercise complete
                  setState('completed');
                  if (onComplete) onComplete();
                }
              }
            }, 100);
          } else {
            // No rest period, check if there are more sets
            if (currentSet + 1 < sets) {
              // Auto-move to next set
              nextSet();
            } else {
              // Exercise complete
              setState('completed');
              if (onComplete) onComplete();
            }
          }
        }
      }, 100);
    } else {
      // All sets are completed
      setState('completed');
      if (onComplete) onComplete();
    }
  }, [clearTimer, currentSet, duration, effectiveRestDuration, onComplete, onSetComplete, sets]);
  
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