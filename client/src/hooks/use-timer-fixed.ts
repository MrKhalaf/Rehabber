import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Custom hook for handling exercise timer with sets, sides, and rest periods
 */
export function useTimer({
  duration,
  restDuration = 10,
  sets = 4,
  sides = false,
  sideStrategy = 'sequential',
  onComplete,
  onSetComplete,
  onSideChange,
}: TimerConfig): TimerReturn {
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentSide, setCurrentSide] = useState<'left' | 'right' | null>(sides ? 'left' : null);
  const [isResting, setIsResting] = useState(false);
  const [state, setState] = useState<TimerState>('inactive');

  // References for timing logic
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const promptTimeoutRef = useRef<number | null>(null);

  // Use a single reference to track all critical state to avoid React state timing issues
  const timerStateRef = useRef<{
    phase: 'rest' | 'exercise';
    set: number;
    side: 'left' | 'right' | null;
  }>({
    phase: 'exercise',
    set: 1,
    side: sides ? 'left' : null
  });

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
    // We need to use the most up-to-date values - those in our references
    const currentPhase = timerStateRef.current.phase; 
    const wasResting = currentPhase === 'rest';
    // Take values directly from our reference instead of React state
    const currentSideCopy = timerStateRef.current.side;
    const currentSetCopy = timerStateRef.current.set;
    
    console.log(`----- TIMER STATE TRANSITION -----`);
    console.log(`From: ${wasResting ? 'Rest' : 'Exercise'} period`);
    console.log(`Current set: ${currentSetCopy}/${sets}`);
    console.log(`Current side: ${currentSideCopy}`);
    console.log(`Current phase value: ${currentPhase}`);
    console.log(`Side strategy: ${sideStrategy}`);
    console.log(`Moving to: ${wasResting ? 'Exercise' : 'Rest'} period`);
    console.log(`----------------------------------`);
    
    // If we were doing a rest period, now start the next exercise period
    if (wasResting) {
      // Coming from rest period, move to the next exercise period
      // Move to next set or side as needed
      if (sides) {
        // Handle sides according to strategy
        if (sideStrategy === 'alternate') {
          // Alternate strategy: switch between left and right for each set
          if (currentSideCopy === 'left') {
            // Switch to right side for current set
            console.log('Switching to right side (alternate strategy)');
            setCurrentSide('right');
            timerStateRef.current.side = 'right';
            // Reset to exercise phase when switching sides in alternate strategy too
            timerStateRef.current.phase = 'exercise';
            console.log(`Phase set to: ${timerStateRef.current.phase} for right side`);
            if (onSideChange) onSideChange();
          } else {
            // We've completed both sides of the current set
            if (currentSetCopy < sets) {
              // Move to next set
              console.log(`Moving to set ${currentSetCopy + 1} (alternate strategy)`);
              const nextSet = currentSetCopy + 1;
              setCurrentSet(nextSet);
              timerStateRef.current.set = nextSet;
              setCurrentSide('left');
              timerStateRef.current.side = 'left';
              // Reset to exercise phase when moving to the next set
              timerStateRef.current.phase = 'exercise';
              console.log(`Phase set to: ${timerStateRef.current.phase} for next set`);
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
              // IMPORTANT: Track set changes in ref FIRST, then state
              const nextSet = currentSetCopy + 1;
              timerStateRef.current.set = nextSet; // Update ref first
              setCurrentSet(nextSet); // Then update state
              console.log(`DEBUG: Left side - Current set was ${currentSetCopy}, now setting to ${nextSet}`);
              // Reset to exercise phase when moving to next set on left side
              timerStateRef.current.phase = 'exercise';
              console.log(`Phase set to: ${timerStateRef.current.phase} for next set on left side`);
              if (onSetComplete) onSetComplete(currentSetCopy);
            } else {
              // All sets on left side complete, switch to right side set 1
              console.log('Switching to right side, set 1 (sequential strategy)');
              timerStateRef.current.set = 1;
              setCurrentSet(1);
              setCurrentSide('right');
              timerStateRef.current.side = 'right';
              // Make sure we reset to exercise phase when switching sides
              timerStateRef.current.phase = 'exercise';
              if (onSideChange) onSideChange();
            }
          } else {
            // Right side
            if (currentSetCopy < sets) {
              // Move to next set on right side
              console.log(`Moving to set ${currentSetCopy + 1} (sequential strategy, right side)`);
              const nextSet = currentSetCopy + 1;
              timerStateRef.current.set = nextSet;
              setCurrentSet(nextSet);
              // Reset to exercise phase when moving to next set on right side
              timerStateRef.current.phase = 'exercise';
              console.log(`Phase set to: ${timerStateRef.current.phase} for next set on right side`);
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
          const nextSet = currentSetCopy + 1;
          timerStateRef.current.set = nextSet;
          setCurrentSet(nextSet);
          // Reset to exercise phase when moving to the next set (no sides)
          timerStateRef.current.phase = 'exercise';
          console.log(`Phase set to: ${timerStateRef.current.phase} for next set (no sides)`);
          if (onSetComplete) onSetComplete(currentSetCopy);
        } else {
          // All sets complete
          console.log('All sets complete! (no sides)');
          setState('completed');
          if (onComplete) onComplete();
          return false; // Don't continue timer
        }
      }
      
      // Always switch from rest to exercise mode
      timerStateRef.current.phase = 'exercise';
      setIsResting(false);
      setTimeRemaining(duration);
      console.log('Setting to EXERCISE mode after rest completion');
      
    } else {
      // Coming from exercise period, move to rest period
      console.log('Moving to rest period');
      setTimeRemaining(restDuration); // Use rest duration
      timerStateRef.current.phase = 'rest';
      setIsResting(true);
      console.log('Setting to REST mode after exercise completion');
    }
    
    // Always update the start time for the next phase
    startTimeRef.current = Date.now();
    
    // Important - need to return true to continue
    return true;
  }, [currentSet, currentSide, duration, isResting, onComplete, onSetComplete, onSideChange, restDuration, sets, sides, sideStrategy]);
  
  const startTimer = useCallback(() => {
    // Clear any existing timers first
    clearTimer();
    
    // CRITICAL: The issue is with React state updates not being immediately reflected
    // We'll use our direct reference to determine the current phase
    console.log(`------------------------------`);
    console.log(`STATE CHECK BEFORE TIMER START`);
    console.log(`isResting state value: ${isResting}`);
    console.log(`timerStateRef phase value: ${timerStateRef.current.phase}`);
    console.log(`timerStateRef set: ${timerStateRef.current.set}, side: ${timerStateRef.current.side}`);
    console.log(`currentSet: ${currentSet}, currentSide: ${currentSide}`);
    console.log(`------------------------------`);
    
    // FORCED SYNCHRONIZATION: Make React state match our reference values
    // This is critical to ensure the UI shows the correct values
    if (currentSet !== timerStateRef.current.set) {
      console.log(`FORCING SET UPDATE: ${currentSet} -> ${timerStateRef.current.set}`);
      setCurrentSet(timerStateRef.current.set);
    }
    if (currentSide !== timerStateRef.current.side) {
      console.log(`FORCING SIDE UPDATE: ${currentSide} -> ${timerStateRef.current.side}`);
      setCurrentSide(timerStateRef.current.side);
    }
    
    // Use our reference instead of React state to determine the phase
    // This ensures consistency regardless of React's state update timing
    const phaseIsRest = timerStateRef.current.phase === 'rest';
    // Also update the React state to match our reference
    setIsResting(phaseIsRest);
    
    const phaseDuration = phaseIsRest ? restDuration : duration;
    const phaseLabel = phaseIsRest ? 'REST' : 'EXERCISE';
    
    console.log(`------------------------------`);
    console.log(`STARTING ${phaseLabel} TIMER`);
    console.log(`Duration: ${phaseDuration} seconds`);
    console.log(`isResting: ${phaseIsRest}`);
    console.log(`Set ${timerStateRef.current.set}/${sets}, Side: ${timerStateRef.current.side || 'none'}`);
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
    // Reset all our references to the beginning state
    timerStateRef.current = {
      phase: 'exercise',
      set: 1,
      side: sides ? 'left' : null
    };
    console.log(`References initialized - Set: ${timerStateRef.current.set}, Side: ${timerStateRef.current.side}, Phase: ${timerStateRef.current.phase}`);
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
      
      // FORCED SYNCHRONIZATION: Make React state match our reference values
      if (currentSet !== timerStateRef.current.set) {
        console.log(`FORCING SET UPDATE ON RESUME: ${currentSet} -> ${timerStateRef.current.set}`);
        setCurrentSet(timerStateRef.current.set);
      }
      if (currentSide !== timerStateRef.current.side) {
        console.log(`FORCING SIDE UPDATE ON RESUME: ${currentSide} -> ${timerStateRef.current.side}`);
        setCurrentSide(timerStateRef.current.side);
      }
      
      console.log(`Set ${timerStateRef.current.set}/${sets}, Side: ${timerStateRef.current.side || 'none'}`);
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
    timerStateRef.current.phase = 'exercise';
    timerStateRef.current.set = 1;
    timerStateRef.current.side = sides ? 'left' : null;
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
    
    // If user is skipping a rest period, move directly to the next exercise phase
    // This ensures proper sequence: hold → rest → hold → rest
    const wasResting = isResting;
    
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
          const nextSet = currentSet + 1;
          setCurrentSet(nextSet);
          timerStateRef.current.set = nextSet;
          setTimeRemaining(duration);
          setIsResting(false);
          timerStateRef.current.phase = 'exercise';
          console.log(`Moving to set ${nextSet}/${sets} (still on left side)`);
          
          if (onSetComplete) onSetComplete(currentSet);
        } else {
          // Completed all sets on left side, switch to right side, set 1
          setCurrentSet(1);
          timerStateRef.current.set = 1;
          setCurrentSide('right');
          timerStateRef.current.side = 'right';
          setTimeRemaining(duration);
          setIsResting(false);
          timerStateRef.current.phase = 'exercise';
          console.log(`All left side sets complete, switching to right side set 1`);
          
          if (onSideChange) onSideChange();
        }
      } else if (currentSide === 'right') {
        if (currentSet < sets) {
          // Move to next set on right side
          const nextSet = currentSet + 1;
          setCurrentSet(nextSet);
          timerStateRef.current.set = nextSet;
          setTimeRemaining(duration);
          setIsResting(false);
          timerStateRef.current.phase = 'exercise';
          console.log(`Moving to set ${nextSet}/${sets} (still on right side)`);
          
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
        const nextSet = currentSet + 1;
        setCurrentSet(nextSet);
        timerStateRef.current.set = nextSet;
        if (sides) {
          setCurrentSide('left');
          timerStateRef.current.side = 'left';
        }
        setTimeRemaining(duration);
        setIsResting(false);
        timerStateRef.current.phase = 'exercise';
        
        // Trigger callback if provided
        if (onSetComplete) onSetComplete(currentSet);
        
        console.log(`Moving to set ${nextSet}/${sets} (standard/alternate)`);
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
      console.log(`Now on set ${currentSet}/${sets}`);
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