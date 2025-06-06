import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer, TimerConfig } from '../use-timer';
import React from 'react';

// We need to manually mock React's act function
const act = (callback: () => void) => {
  callback();
  return Promise.resolve();
};

// Mock the window.setInterval and clearInterval functions
vi.useFakeTimers();

describe('useTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to advance timers by a specific amount
  const advanceTimersByTime = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  test('should initialize with correct values', () => {
    const onComplete = vi.fn();
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

  test('should transition from exercise to rest phase', async () => {
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
    
    // Add a small wait to let React state updates propagate in the test environment
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(2);
  });

  test('should move to next set after rest phase', async () => {
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
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify we entered rest phase
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(2);
    
    // Complete rest phase (2 seconds)
    advanceTimersByTime(2100);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify we automatically moved to next set
    expect(result.current.isResting).toBe(false);
    expect(result.current.currentSet).toBe(2);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(3);
  });

  test('should call onComplete when all sets are done', async () => {
    const onComplete = vi.fn();
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

    // Complete first set exercise
    advanceTimersByTime(2100);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Complete rest phase
    advanceTimersByTime(1100);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Complete second set exercise
    advanceTimersByTime(2100);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    expect(result.current.state).toBe('completed');
    expect(onComplete).toHaveBeenCalled();
  });

  test('should handle pausing and resuming correctly', async () => {
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
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.state).toBe('paused');
    
    // Make sure time doesn't change while paused
    const timeWhenPaused = result.current.timeRemaining;
    advanceTimersByTime(1000);
    expect(result.current.timeRemaining).toBe(timeWhenPaused);
    
    act(() => {
      result.current.resume();
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.state).toBe('running');
    
    // After resuming and waiting 1 second, time should continue from where it left off
    advanceTimersByTime(1000);
    expect(result.current.timeRemaining).toBeLessThan(timeWhenPaused);
  });

  test('should handle skip functionality correctly', async () => {
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
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    expect(result.current.isResting).toBe(true);
    expect(result.current.timeRemaining).toBeLessThanOrEqual(5);
    
    // Skip the rest phase (should go to second set)
    act(() => {
      result.current.skip();
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    expect(result.current.isResting).toBe(false);
    expect(result.current.currentSet).toBe(2);
  });

  test('should handle nextSet functionality correctly', async () => {
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
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.currentSet).toBe(2);
    expect(result.current.isResting).toBe(false);
    
    // Skip directly to set 3
    act(() => {
      result.current.nextSet();
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.currentSet).toBe(3);
    expect(result.current.isResting).toBe(false);
    
    // Skip beyond the last set should complete the timer
    act(() => {
      result.current.nextSet();
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.state).toBe('completed');
  });

  test('should handle sides correctly for exercises with sides', async () => {
    const onSideChange = vi.fn();
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
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Should now be in rest phase
    expect(result.current.isResting).toBe(true);
    
    // Complete rest phase
    advanceTimersByTime(2100);
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Should now be on right side, same set
    expect(result.current.currentSet).toBe(1);
    expect(result.current.currentSide).toBe('right');
    expect(onSideChange).toHaveBeenCalled();
  });
});