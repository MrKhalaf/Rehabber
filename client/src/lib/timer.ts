type TimerCallback = (timeRemaining: number) => void;
type CompleteCallback = () => void;

/**
 * Timer class for handling exercise timers with pause/resume functionality
 */
export class ExerciseTimer {
  private timerId: number | null = null;
  private startTime: number = 0;
  private remainingTime: number = 0;
  private isPaused: boolean = false;
  private onTick: TimerCallback;
  private onComplete: CompleteCallback;

  /**
   * Creates a new timer
   * @param onTick Callback that fires on each timer tick with remaining time
   * @param onComplete Callback that fires when timer completes
   */
  constructor(onTick: TimerCallback, onComplete: CompleteCallback) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  /**
   * Starts the timer
   * @param duration Duration in seconds
   */
  start(duration: number): void {
    this.stop();
    this.remainingTime = duration;
    this.startTime = Date.now();
    this.isPaused = false;
    
    this.timerId = window.setInterval(() => {
      if (this.isPaused) return;
      
      const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.remainingTime = duration - elapsedTime;
      
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.stop();
        this.onComplete();
      } else {
        this.onTick(this.remainingTime);
      }
    }, 100); // Update more frequently for smoother UI
    
    // Initial tick
    this.onTick(this.remainingTime);
  }

  /**
   * Pauses the timer
   */
  pause(): void {
    if (this.timerId !== null && !this.isPaused) {
      this.isPaused = true;
    }
  }

  /**
   * Resumes the timer
   */
  resume(): void {
    if (this.timerId !== null && this.isPaused) {
      this.isPaused = false;
      this.startTime = Date.now() - ((duration - this.remainingTime) * 1000);
    }
  }

  /**
   * Stops the timer
   */
  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Checks if the timer is running
   */
  isRunning(): boolean {
    return this.timerId !== null;
  }

  /**
   * Checks if the timer is paused
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Gets the remaining time in seconds
   */
  getRemainingTime(): number {
    return this.remainingTime;
  }
}
