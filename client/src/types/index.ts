import { 
  Exercise, User
} from "@shared/schema";

export type TabType = 'exercises' | 'progress' | 'history';
export type NavigationTab = 'exercises' | 'progress' | 'history' | 'routines' | 'profile';

export enum ExerciseStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export interface ExerciseWithStatus extends Exercise {
  isComplete: boolean;
  completedAt?: Date | null;
}

export interface Category {
  id: string;
  name: string;
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
