import { 
  Category, Exercise, ExerciseLog, RecommendedVideo, PtNote, User
} from "@shared/schema";

export type TabType = 'exercises' | 'progress' | 'notes';
export type NavigationTab = TabType | 'routines' | 'profile';

export interface ExerciseWithStatus extends Exercise {
  isComplete: boolean;
  completedAt?: Date | null;
}

export interface CategoryWithProgress extends Category {
  exercises: ExerciseWithStatus[];
  completedCount: number;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  secondsRemaining: number;
  totalDuration: number;
  currentSet: number;
  totalSets: number;
  currentSide?: 'left' | 'right' | null;
  exerciseType: 'hold' | 'rep' | 'rest';
}

export interface ExerciseTimerProps {
  exercise: Exercise;
  onComplete: () => void;
  onClose: () => void;
}
