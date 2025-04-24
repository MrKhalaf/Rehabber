import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  } else {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  }
}

export function calculateProgress(completedExercises: number, totalExercises: number): number {
  if (totalExercises === 0) return 0;
  return Math.round((completedExercises / totalExercises) * 100);
}

// Helper for exercise status
export const ExerciseStatus = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in-progress',
  TODO: 'todo'
} as const;

export type ExerciseStatus = typeof ExerciseStatus[keyof typeof ExerciseStatus];

export function getStatusBadgeClasses(status: ExerciseStatus): string {
  switch(status) {
    case ExerciseStatus.COMPLETED:
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case ExerciseStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case ExerciseStatus.TODO:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  }
}

export function getStatusLabel(status: ExerciseStatus): string {
  switch(status) {
    case ExerciseStatus.COMPLETED:
      return "Completed";
    case ExerciseStatus.IN_PROGRESS:
      return "In Progress";
    case ExerciseStatus.TODO:
      return "To do";
    default:
      return "To do";
  }
}

export function getFormattedExerciseDetails(
  type: string, 
  sets: number, 
  reps?: number | null, 
  holdDuration?: number | null, 
  sides?: boolean | null
): string {
  if (type === 'hold') {
    return `${sets} sets × ${holdDuration || 0} sec hold${sides ? ' (each side)' : ''}`;
  } else if (type === 'rep') {
    return `${sets} sets × ${reps || 0} reps`;
  } else {
    return `${sets} sets`;
  }
}