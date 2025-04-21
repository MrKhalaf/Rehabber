import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerState = 'inactive' | 'running' | 'paused' | 'completed';

/**
 * Defines how to handle exercises with sides
 * - 'alternate': Alternate sides within each set (left, then right)
 * - 'sequential': Complete all sets on one side before switching to the other
 */
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

export function useTimer({
  duration,
  restDuration = 30,
  sets = 1,
  sides = false,
  sideStrategy = 'alternate',
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
      Current side: ${currentSideCopy}
      isResting value: ${isResting}
      Side strategy: ${sideStrategy}`);
    
    if (wasResting) {
      // Coming from rest period, move to exercise period
      setIsResting(false);
      
      if (sides) {
        // Handle sides according to strategy
        if (sideStrategy === 'alternate') {
          // Alternate strategy: switch between left and right for each set
          if (currentSideCopy === 'left') {
            // Switch to right side for current set
            console.log('Switching to right side (alternate strategy)');
            setCurrentSide('right');
            setTimeRemaining(duration); // Use exercise duration
            if (onSideChange) onSideChange();
          } else {
            // We've completed both sides of the current set
            if (currentSetCopy < sets) {
              // Move to next set
              console.log(`Moving to set ${currentSetCopy + 1} (alternate strategy)`);
              setCurrentSet(prev => prev + 1);
              setCurrentSide('left');
              setTimeRemaining(duration); 
              if (onSetComplete) onSetComplete(currentSetCopy);
            } else {
              // All sets and sides complete
              console.log('All sets complete! (alternate strategy)');
              setState('completed');
              if (onComplete) onComplete();
              return false; // Don't continue timer
            }
          }
        } else if (sideStrategy === 'sequential') {
          // Sequential strategy: complete all sets on left side, then all sets on right
          if (currentSideCopy === 'left') {
            if (currentSetCopy < sets) {
              // Move to next set, still on left side
              console.log(`Moving to set ${currentSetCopy + 1} (sequential strategy, left side)`);
              setCurrentSet(prev => prev + 1);
              setCurrentSide('left');
              setTimeRemaining(duration);
              if (onSetComplete) onSetComplete(currentSetCopy);
            } else {
              // All sets on left side complete, switch to right side set 1
              console.log('Switching to right side, set 1 (sequential strategy)');
              setCurrentSet(1);
              setCurrentSide('right');
              setTimeRemaining(duration);
              if (onSideChange) onSideChange();
            }
          } else {
            // Right side
            if (currentSetCopy < sets) {
              // Move to next set on right side
              console.log(`Moving to set ${currentSetCopy + 1} (sequential strategy, right side)`);
              setCurrentSet(prev => prev + 1);
              setTimeRemaining(duration);
              if (onSetComplete) onSetComplete(currentSetCopy);
            } else {
              // All sets on both sides complete
              console.log('All sets complete! (sequential strategy)');
              setState('completed');
              if (onComplete) onComplete();
              return false; // Don't continue timer
            }
          }
        }
      } else {
        // No sides, just handle sets
        if (currentSetCopy < sets) {
          // Move to next set
          console.log(`Moving to set ${currentSetCopy + 1} (no sides)`);
          setCurrentSet(prev => prev + 1);
          setTimeRemaining(duration); // Use exercise duration
          if (onSetComplete) onSetComplete(currentSetCopy);
        } else {
          // All sets complete
          console.log('All sets complete! (no sides)');
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
    // Add a small delay to ensure state updates are processed
    setTimeout(() => {
      console.log(`After state update - isResting is now: ${isResting}`);
    }, 100);
    
    startTimeRef.current = Date.now();
    return true; // Continue timer
  }, [currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides, sideStrategy]);
  
  // A more robust approach that uses closure variables instead of React state for timing logic
  // This avoids stale closure issues with React state updates
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    clearTimer();
    
    // CRITICAL: Capture the current phase state at the moment we're starting the timer
    // This ensures we don't have stale state issues with the isResting value
    const phaseIsRest = isResting;
    const phaseDuration = phaseIsRest ? restDuration : duration;
    const phaseLabel = phaseIsRest ? 'REST' : 'EXERCISE';
    
    console.log(`------------------------------`);
    console.log(`STARTING ${phaseLabel} TIMER`);
    console.log(`Duration: ${phaseDuration} seconds`);
    console.log(`isResting: ${phaseIsRest}`);
    console.log(`Set ${currentSet}/${sets}, Side: ${currentSide || 'none'}`);
    console.log(`------------------------------`);
    
    // Set the start time reference and update timer state
    startTimeRef.current = Date.now();
    setState('running');
    
    // Initialize the time remaining
    setTimeRemaining(phaseDuration);
    
    // Set up the timer interval - use the CAPTURED phase variables in the interval
    timerRef.current = window.setInterval(() => {
      // Calculate elapsed and remaining time based on the FIXED phase duration
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remainingTime = Math.max(0, phaseDuration - elapsedSeconds);
      
      // Update the displayed time
      setTimeRemaining(remainingTime);
      
      // Check if timer has completed
      if (remainingTime <= 0) {
        // Timer reached zero, stop the timer
        clearTimer();
        
        console.log(`${phaseLabel} timer complete!`);
        
        // Process the next phase with a short delay to allow for UI updates
        setPromptTimeout(() => {
          // Move to the next phase using the proceedToNext function
          // which will handle setting the next isResting state appropriately
          const shouldContinue = proceedToNext();
          
          if (shouldContinue) {
            console.log(`Moving to next phase`);
            // Wait for React state to update before starting the next timer
            setTimeout(() => {
              startTimer();
            }, 100);
          }
        }, 300);
      }
    }, 100); // Update frequently for smooth countdown
  }, [clearTimer, currentSet, currentSide, duration, isResting, proceedToNext, restDuration, setPromptTimeout, sets]);
  
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
      // Capture current phase for consistent handling
      const phaseIsRest = isResting;
      const phaseLabel = phaseIsRest ? 'REST' : 'EXERCISE';
      const remainingTime = pausedTimeRef.current;
      
      console.log(`------------------------------`);
      console.log(`RESUMING ${phaseLabel} TIMER`);
      console.log(`Time remaining: ${remainingTime} seconds`);
      console.log(`isResting: ${phaseIsRest}`);
      console.log(`Set ${currentSet}/${sets}, Side: ${currentSide || 'none'}`);
      console.log(`------------------------------`);
      
      // Adjust start time to account for already elapsed time
      startTimeRef.current = Date.now() - ((phaseIsRest ? restDuration : duration) - remainingTime) * 1000;
      setState('running');
      
      // Set up the timer interval - use the CAPTURED phase variables in the interval
      timerRef.current = window.setInterval(() => {
        // Calculate elapsed time based on our adjusted start time
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const currentDuration = phaseIsRest ? restDuration : duration;
        const newTime = Math.max(0, currentDuration - elapsedSeconds);
        
        // Update the displayed time
        setTimeRemaining(newTime);
        
        // Check if timer has completed
        if (newTime <= 0) {
          // Timer reached zero, stop the timer
          clearTimer();
          
          console.log(`${phaseLabel} timer complete after resume!`);
          
          // Process the next phase
          setPromptTimeout(() => {
            const shouldContinue = proceedToNext();
            
            if (shouldContinue) {
              // Wait for React state to update before starting the next timer
              setTimeout(() => {
                startTimer();
              }, 100);
            }
          }, 300);
        }
      }, 100);
    }
  }, [clearTimer, currentSet, currentSide, duration, isResting, proceedToNext, restDuration, setPromptTimeout, sets, startTimer, state]);
  
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
    
    console.log(`------------------------------`);
    console.log(`MANUALLY SKIPPING CURRENT PHASE`);
    console.log(`Current set: ${currentSet}/${sets}`);
    console.log(`Current side: ${currentSide || 'none'}`);
    console.log(`isResting before skip: ${isResting}`);
    console.log(`------------------------------`);
    
    // Process the next phase
    const shouldContinue = proceedToNext();
    
    if (shouldContinue) {
      if (state === 'running') {
        // Wait for React state to update before starting the next timer
        setTimeout(() => {
          console.log(`Starting next phase after skip`);
          console.log(`isResting after skip: ${isResting}`);
          startTimer();
        }, 100);
      } else if (state === 'paused') {
        // If we were paused, stay paused but update the display
        setState('paused');
        
        // Wait for the state update to complete then set the appropriate pause time
        setTimeout(() => {
          console.log(`Pausing on new phase after skip`);
          console.log(`isResting after skip: ${isResting}`);
          pausedTimeRef.current = isResting ? restDuration : duration;
        }, 100);
      }
    }
  }, [clearTimer, currentSet, currentSide, duration, isResting, proceedToNext, restDuration, sets, startTimer, state]);
  
  // Skip to next set directly
  const nextSet = useCallback(() => {
    if (state !== 'running' && state !== 'paused') return;
    
    clearTimer();
    
    console.log(`------------------------------`);
    console.log(`MANUALLY SKIPPING TO NEXT SET`);
    console.log(`Current set: ${currentSet}/${sets} (before skip)`);
    console.log(`Current side: ${currentSide || 'none'}`);
    console.log(`isResting: ${isResting}`);
    console.log(`Side strategy: ${sideStrategy}`);
    console.log(`------------------------------`);
    
    if (sides && sideStrategy === 'sequential') {
      // For sequential strategy with sides, handle specially
      if (currentSide === 'left') {
        if (currentSet < sets) {
          // Move to next set on left side
          setCurrentSet(prev => prev + 1);
          setTimeRemaining(duration);
          setIsResting(false);
          console.log(`Moving to set ${currentSet + 1}/${sets} (still on left side)`);
          
          if (onSetComplete) onSetComplete(currentSet);
        } else {
          // Completed all sets on left side, switch to right side, set 1
          setCurrentSet(1);
          setCurrentSide('right');
          setTimeRemaining(duration);
          setIsResting(false);
          console.log(`All left side sets complete, switching to right side set 1`);
          
          if (onSideChange) onSideChange();
        }
      } else if (currentSide === 'right') {
        if (currentSet < sets) {
          // Move to next set on right side
          setCurrentSet(prev => prev + 1);
          setTimeRemaining(duration);
          setIsResting(false);
          console.log(`Moving to set ${currentSet + 1}/${sets} (still on right side)`);
          
          if (onSetComplete) onSetComplete(currentSet);
        } else {
          // All sets complete on both sides
          console.log(`All sets complete on both sides!`);
          setState('completed');
          if (onComplete) onComplete();
          return; // Exit early
        }
      }
    } else {
      // Standard set skipping logic for alternate strategy or no sides
      if (currentSet < sets) {
        // Update to the next set with consistent state
        setCurrentSet(prev => prev + 1);
        if (sides) setCurrentSide('left');
        setTimeRemaining(duration);
        setIsResting(false);
        
        // Trigger callback if provided
        if (onSetComplete) onSetComplete(currentSet);
        
        console.log(`Moving to set ${currentSet + 1}/${sets} (standard/alternate)`);
      } else {
        // All sets complete
        console.log(`All sets complete!`);
        setState('completed');
        if (onComplete) onComplete();
        return; // Exit early
      }
    }
    
    // Short delay to ensure state updates before proceeding
    setTimeout(() => {
      console.log(`Now on set ${currentSet + 1 <= sets ? currentSet + 1 : currentSet}/${sets}`);
      console.log(`Current side: ${currentSide}`);
      console.log(`isResting reset to: ${isResting}`);
      
      if (state === 'running') {
        console.log(`Starting new set timer`);
        startTimer();
      } else {
        // If we were paused, stay paused but update the display
        console.log(`Pausing on new set`);
        setState('paused');
        pausedTimeRef.current = duration;
      }
    }, 100);
  }, [clearTimer, currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, sets, sides, sideStrategy, startTimer, state]);
  
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
