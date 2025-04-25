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
  
  // For tracking state when in async callbacks
  const stateRef = useRef({
    currentSet,
    currentSide,
    isResting
  });
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = {
      currentSet,
      currentSide,
      isResting
    };
  }, [currentSet, currentSide, isResting]);
  
  // Derived values
  const percentRemaining = (timeRemaining / (isResting ? effectiveRestDuration : duration)) * 100;
  
  // Clear any active timers
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Transition to rest mode
  const transitionToRest = useCallback(() => {
    clearTimer();
    setIsResting(true);
    setTimeRemaining(effectiveRestDuration);
    startTimeRef.current = Date.now();
    setState('running');
    
    timerRef.current = window.setInterval(() => {
      const restElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const restRemaining = Math.max(0, effectiveRestDuration - restElapsed);
      
      setTimeRemaining(restRemaining);
      
      if (restRemaining <= 0) {
        clearTimer();
        
        // Get latest state from ref
        const { currentSet: latestSet, currentSide: latestSide } = stateRef.current;
        
        // Handle set progression after rest period
        if (sides) {
          if (effectiveSideStrategy === 'alternate') {
            // Alternate sides within the set
            if (latestSide === 'left') {
              // Switch to right side for the current set
              setCurrentSide('right');
              setIsResting(false);
              setTimeRemaining(duration);
              if (onSideChange) onSideChange();
              
              // Start exercise timer for right side
              startExercisePhase();
            } else {
              // Completed both sides, go to next set or finish
              if (latestSet < sets) {
                const nextSetNum = latestSet + 1;
                setCurrentSet(nextSetNum);
                setCurrentSide('left');
                setIsResting(false);
                setTimeRemaining(duration);
                if (onSetComplete) onSetComplete(latestSet);
                
                // Start exercise timer for next set
                startExercisePhase();
              } else {
                // All sets complete
                setState('completed');
                if (onComplete) onComplete();
              }
            }
          } else {
            // Sequential - do all sets on one side, then switch
            if (latestSide === 'left') {
              if (latestSet < sets) {
                // Next set on left side
                const nextSetNum = latestSet + 1;
                setCurrentSet(nextSetNum);
                setIsResting(false);
                setTimeRemaining(duration);
                if (onSetComplete) onSetComplete(latestSet);
                
                // Start exercise timer for next set on left side
                startExercisePhase();
              } else {
                // All left sets done, switch to right
                setCurrentSet(1);
                setCurrentSide('right');
                setIsResting(false);
                setTimeRemaining(duration);
                if (onSideChange) onSideChange();
                
                // Start exercise timer for right side
                startExercisePhase();
              }
            } else {
              // Right side
              if (latestSet < sets) {
                // Next set on right side
                const nextSetNum = latestSet + 1;
                setCurrentSet(nextSetNum);
                setIsResting(false);
                setTimeRemaining(duration);
                if (onSetComplete) onSetComplete(latestSet);
                
                // Start exercise timer for next set on right side
                startExercisePhase();
              } else {
                // All sets complete
                setState('completed');
                if (onComplete) onComplete();
              }
            }
          }
        } else {
          // No sides, just sets
          if (latestSet < sets) {
            // Move to next set
            const nextSetNum = latestSet + 1;
            setCurrentSet(nextSetNum);
            setIsResting(false);
            setTimeRemaining(duration);
            if (onSetComplete) onSetComplete(latestSet);
            
            // Start exercise timer for next set
            startExercisePhase();
          } else {
            // All sets complete
            setState('completed');
            if (onComplete) onComplete();
          }
        }
      }
    }, 100);
  }, [clearTimer, duration, effectiveRestDuration, effectiveSideStrategy, onComplete, onSetComplete, onSideChange, sets, sides]);
  
  // Start timer for exercise phase
  const startExercisePhase = useCallback(() => {
    clearTimer();
    setIsResting(false);
    setTimeRemaining(duration);
    startTimeRef.current = Date.now();
    setState('running');
    
    timerRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remainingTime = Math.max(0, duration - elapsedSeconds);
      
      setTimeRemaining(remainingTime);
      
      if (remainingTime <= 0) {
        clearTimer();
        
        // Transition to rest period
        if (effectiveRestDuration > 0) {
          transitionToRest();
        } else {
          // No rest period, go directly to next set/side using same logic as rest completion
          // Get latest state from ref
          const { currentSet: latestSet, currentSide: latestSide } = stateRef.current;
          
          if (sides) {
            // Handle sides logic
            if (effectiveSideStrategy === 'alternate') {
              if (latestSide === 'left') {
                setCurrentSide('right');
                setTimeRemaining(duration);
                if (onSideChange) onSideChange();
                startExercisePhase();
              } else {
                if (latestSet < sets) {
                  const nextSetNum = latestSet + 1;
                  setCurrentSet(nextSetNum);
                  setCurrentSide('left');
                  setTimeRemaining(duration);
                  if (onSetComplete) onSetComplete(latestSet);
                  startExercisePhase();
                } else {
                  setState('completed');
                  if (onComplete) onComplete();
                }
              }
            } else {
              // Sequential strategy
              if (latestSide === 'left') {
                if (latestSet < sets) {
                  const nextSetNum = latestSet + 1;
                  setCurrentSet(nextSetNum);
                  setTimeRemaining(duration);
                  if (onSetComplete) onSetComplete(latestSet);
                  startExercisePhase();
                } else {
                  setCurrentSet(1);
                  setCurrentSide('right');
                  setTimeRemaining(duration);
                  if (onSideChange) onSideChange();
                  startExercisePhase();
                }
              } else {
                if (latestSet < sets) {
                  const nextSetNum = latestSet + 1;
                  setCurrentSet(nextSetNum);
                  setTimeRemaining(duration);
                  if (onSetComplete) onSetComplete(latestSet);
                  startExercisePhase();
                } else {
                  setState('completed');
                  if (onComplete) onComplete();
                }
              }
            }
          } else {
            // No sides, just sets
            if (latestSet < sets) {
              const nextSetNum = latestSet + 1;
              setCurrentSet(nextSetNum);
              setTimeRemaining(duration);
              if (onSetComplete) onSetComplete(latestSet);
              startExercisePhase();
            } else {
              setState('completed');
              if (onComplete) onComplete();
            }
          }
        }
      }
    }, 100);
  }, [clearTimer, duration, effectiveRestDuration, effectiveSideStrategy, onComplete, onSetComplete, onSideChange, sets, sides, transitionToRest]);
  
  // Main start function
  const start = useCallback(() => {
    clearTimer();
    
    setTimeRemaining(duration);
    setCurrentSet(1);
    setCurrentSide(sides ? 'left' : null);
    setIsResting(false);
    setState('running');
    
    startExercisePhase();
  }, [clearTimer, duration, sides, startExercisePhase]);
  
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
      
      if (isResting) {
        timerRef.current = window.setInterval(() => {
          const restElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const restRemaining = Math.max(0, effectiveRestDuration - restElapsed);
          
          setTimeRemaining(restRemaining);
          
          if (restRemaining <= 0) {
            clearTimer();
            transitionToRest(); // This will handle end-of-rest logic
          }
        }, 100);
      } else {
        timerRef.current = window.setInterval(() => {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remainingTime = Math.max(0, duration - elapsedSeconds);
          
          setTimeRemaining(remainingTime);
          
          if (remainingTime <= 0) {
            clearTimer();
            
            if (effectiveRestDuration > 0) {
              transitionToRest();
            } else {
              startExercisePhase(); // Handle no-rest case
            }
          }
        }, 100);
      }
    }
  }, [clearTimer, duration, effectiveRestDuration, isResting, startExercisePhase, state, transitionToRest]);
  
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
      // Skip rest
      const { currentSet: latestSet, currentSide: latestSide } = stateRef.current;
      
      if (sides) {
        if (effectiveSideStrategy === 'alternate') {
          if (latestSide === 'left') {
            // Start right side for this set
            setCurrentSide('right');
            setIsResting(false);
            if (onSideChange) onSideChange();
            startExercisePhase();
          } else {
            // Right side complete, check if more sets
            if (latestSet < sets) {
              setCurrentSet(latestSet + 1);
              setCurrentSide('left');
              setIsResting(false);
              if (onSetComplete) onSetComplete(latestSet);
              startExercisePhase();
            } else {
              setState('completed');
              if (onComplete) onComplete();
            }
          }
        } else {
          // Sequential strategy
          if (latestSide === 'left') {
            if (latestSet < sets) {
              setCurrentSet(latestSet + 1);
              setIsResting(false);
              if (onSetComplete) onSetComplete(latestSet);
              startExercisePhase();
            } else {
              setCurrentSet(1);
              setCurrentSide('right');
              setIsResting(false);
              if (onSideChange) onSideChange();
              startExercisePhase();
            }
          } else {
            if (latestSet < sets) {
              setCurrentSet(latestSet + 1);
              setIsResting(false);
              if (onSetComplete) onSetComplete(latestSet);
              startExercisePhase();
            } else {
              setState('completed');
              if (onComplete) onComplete();
            }
          }
        }
      } else {
        // No sides, just check if more sets
        if (latestSet < sets) {
          setCurrentSet(latestSet + 1);
          setIsResting(false);
          if (onSetComplete) onSetComplete(latestSet);
          startExercisePhase();
        } else {
          setState('completed');
          if (onComplete) onComplete();
        }
      }
    } else {
      // Skip exercise, go to rest
      transitionToRest();
    }
  }, [effectiveSideStrategy, isResting, onComplete, onSetComplete, onSideChange, sets, sides, startExercisePhase, transitionToRest]);
  
  // Force move to next set
  const nextSet = useCallback(() => {
    clearTimer();
    
    const { currentSet: latestSet } = stateRef.current;
    
    if (latestSet < sets) {
      // Call onSetComplete with the current set number before incrementing
      if (onSetComplete) onSetComplete(latestSet);
      
      // Move to the next set
      const nextSetNum = latestSet + 1;
      setCurrentSet(nextSetNum);
      setIsResting(false);
      
      // Start next set
      startExercisePhase();
    } else {
      // All sets are completed
      setState('completed');
      if (onComplete) onComplete();
    }
  }, [clearTimer, onComplete, onSetComplete, sets, startExercisePhase]);
  
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