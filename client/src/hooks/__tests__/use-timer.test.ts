import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from '../use-timer';

// Mock the window.setInterval and clearInterval functions
vi.useFakeTimers();

describe('useTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // Helper function to advance timers by a specific amount
  const advanceTimersByTime = (ms: number) => {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  };

  test('should initialize with correct values', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 3, 
        onComplete 
      })
    );

    expect(result.current.timeRemaining).toBe(10);
    expect(result.current.currentSet).toBe(1);
    expect(result.current.totalSets).toBe(3);
    expect(result.current.isResting).toBe(false);
    expect(result.current.state).toBe('inactive');
  });

  test('should start the timer when start is called', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 3 
      })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.state).toBe('running');
    expect(result.current.timeRemaining).toBe(10);
  });

  test('should decrement time remaining as timer runs', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 3 
      })
    );

    act(() => {
      result.current.start();
    });

    // Advance timer by 2 seconds
    advanceTimersByTime(2000);
    
    expect(result.current.timeRemaining).toBeLessThanOrEqual(8);
  });

  test('should transition from exercise to rest phase', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 3, 
        restDuration: 2, 
        sets: 2 
      })
    );

    act(() => {
      result.current.start();
    });

    // Complete exercise phase (3 seconds)
    advanceTimersByTime(3100);
    
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(2);
  });

  test('should move to next set after rest phase', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 3, 
        restDuration: 2, 
        sets: 2 
      })
    );

    act(() => {
      result.current.start();
    });

    // Verify exercise phase starts correctly
    expect(result.current.isResting).toBe(false);
    expect(result.current.currentSet).toBe(1);
    
    // Complete exercise phase (3 seconds)
    advanceTimersByTime(3100);
    
    // Verify we entered rest phase
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(2);
    
    // Complete rest phase (2 seconds)
    advanceTimersByTime(2100);
    
    // Verify we automatically moved to next set
    expect(result.current.isResting).toBe(false);
    expect(result.current.currentSet).toBe(2);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(3);
  });

  test('should call onComplete when all sets are done', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 2, 
        restDuration: 1, 
        sets: 2, 
        onComplete 
      })
    );

    act(() => {
      result.current.start();
    });

    // Complete first set exercise + rest
    advanceTimersByTime(3100);
    
    // Complete second set exercise
    advanceTimersByTime(2100);
    
    expect(result.current.state).toBe('completed');
    expect(onComplete).toHaveBeenCalled();
  });

  test('should handle pausing and resuming correctly', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 2 
      })
    );

    act(() => {
      result.current.start();
    });

    // Run for 2 seconds
    advanceTimersByTime(2000);
    
    act(() => {
      result.current.pause();
    });
    
    expect(result.current.state).toBe('paused');
    
    // Make sure time doesn't change while paused
    const timeWhenPaused = result.current.timeRemaining;
    advanceTimersByTime(1000);
    expect(result.current.timeRemaining).toBe(timeWhenPaused);
    
    act(() => {
      result.current.resume();
    });
    
    expect(result.current.state).toBe('running');
    
    // After resuming and waiting 1 second, time should continue from where it left off
    advanceTimersByTime(1000);
    expect(result.current.timeRemaining).toBeLessThan(timeWhenPaused);
  });

  test('should handle skip functionality correctly', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 2 
      })
    );

    act(() => {
      result.current.start();
    });

    // Skip the current phase (should go to rest)
    act(() => {
      result.current.skip();
    });
    
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(5);
    
    // Skip the rest phase (should go to second set)
    act(() => {
      result.current.skip();
    });
    
    expect(result.current.isResting).toBe(false);
    expect(result.current.currentSet).toBe(2);
  });

  test('should handle nextSet functionality correctly', () => {
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 10, 
        restDuration: 5, 
        sets: 3 
      })
    );

    act(() => {
      result.current.start();
    });

    // Skip directly to set 2
    act(() => {
      result.current.nextSet();
    });
    
    expect(result.current.currentSet).toBe(2);
    expect(result.current.isResting).toBe(false);
    
    // Skip directly to set 3
    act(() => {
      result.current.nextSet();
    });
    
    expect(result.current.currentSet).toBe(3);
    expect(result.current.isResting).toBe(false);
    
    // Skip beyond the last set should complete the timer
    act(() => {
      result.current.nextSet();
    });
    
    expect(result.current.state).toBe('completed');
  });

  test('should handle sides correctly for exercises with sides', () => {
    const onSideChange = jest.fn();
    const { result } = renderHook(() => 
      useTimer({ 
        duration: 3, 
        restDuration: 2, 
        sets: 2, 
        sides: true,
        onSideChange
      })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.currentSide).toBe('left');
    
    // Complete left side
    advanceTimersByTime(3100);
    
    // Should now be in rest phase
    expect(result.current.isResting).toBe(true);
    
    // Complete rest phase
    advanceTimersByTime(2100);
    
    // Should now be on right side, same set
    expect(result.current.currentSet).toBe(1);
    expect(result.current.currentSide).toBe('right');
    expect(onSideChange).toHaveBeenCalled();
  });
});