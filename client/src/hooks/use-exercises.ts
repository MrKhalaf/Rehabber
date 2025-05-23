import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Exercise, ExerciseProgress, InsertExercise, InsertExerciseProgress } from "@shared/schema";
import { ExerciseStatus } from "@/lib/utils";
import { useMemo } from "react";

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });
}

/**
 * Custom hook to load exercises with their completion status
 */
export function useExercisesWithProgress() {
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  
  // Create a series of queries for each exercise's progress
  const exerciseIds = useMemo(() => {
    return exercises?.map(ex => ex.id) || [];
  }, [exercises]);
  
  // Get progress data for each exercise
  const progressQueries = useQuery({
    queryKey: ['/api/exercises', 'progress'],
    enabled: exerciseIds.length > 0 && !isExercisesLoading,
    queryFn: async () => {
      // Make parallel requests for all exercises' progress
      const progressData: Record<number, ExerciseProgress[]> = {};
      
      // Only fetch if we have exercises
      if (exerciseIds.length > 0) {
        const promises = exerciseIds.map(async (id) => {
          try {
            const response = await fetch(`/api/progress/${id}`);
            const data = await response.json();
            progressData[id] = data;
          } catch (error) {
            console.error(`Error fetching progress for exercise ${id}:`, error);
            progressData[id] = [];
          }
        });
        
        await Promise.all(promises);
      }
      
      return progressData;
    }
  });
  
  // Combine exercises with their status based on progress
  const exercisesWithStatus = useMemo(() => {
    if (!exercises) return [];
    
    return exercises.map(exercise => {
      const progress = progressQueries.data?.[exercise.id] || [];
      const status = determineExerciseStatus(exercise, progress);
      
      return {
        ...exercise,
        status,
        completed: status === 'completed'
      };
    });
  }, [exercises, progressQueries.data]);
  
  return {
    data: exercisesWithStatus,
    isLoading: isExercisesLoading || progressQueries.isLoading
  };
}

export function useExercisesByCategory(category: string) {
  return useQuery<Exercise[]>({
    queryKey: [`/api/exercises/category/${category}`],
  });
}

export function useExercise(id: number | null) {
  return useQuery<Exercise>({
    queryKey: [`/api/exercises/${id}`],
    enabled: id !== null,
  });
}

export function useExerciseProgress(exerciseId: number | null) {
  return useQuery<ExerciseProgress[]>({
    queryKey: [`/api/progress/${exerciseId}`],
    enabled: exerciseId !== null,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newExercise: InsertExercise) => {
      const response = await apiRequest('POST', '/api/exercises', newExercise);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExercise> }) => {
      const response = await apiRequest('PATCH', `/api/exercises/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${variables.id}`] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/exercises/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
    },
  });
}

export function useRecordExerciseProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progress: InsertExerciseProgress) => {
      const response = await apiRequest('POST', '/api/progress', progress);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific exercise progress
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${variables.exerciseId}`] });
      
      // Invalidate the combined progress data used in useExercisesWithProgress
      queryClient.invalidateQueries({ queryKey: ['/api/exercises', 'progress'] });
      
      // Also invalidate exercises lists - this forces UI to update
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      queryClient.invalidateQueries({ queryKey: ['/api/exercises/category'] });
    },
  });
}

export function useParsePTNotes() {
  return useMutation({
    mutationFn: async (plainText: string) => {
      const response = await apiRequest('POST', '/api/parse-pt-notes', { plainText });
      return response.json();
    },
  });
}

/**
 * Get the current exercise day's start timestamp (4 AM)
 * Exercise days reset at 4 AM rather than midnight
 */
export function getCurrentExerciseDayStart(): Date {
  const now = new Date();
  const today = new Date(now);
  today.setHours(4, 0, 0, 0); // Set to 4 AM
  
  // If current time is before 4 AM, use previous day's 4 AM
  if (now.getHours() < 4) {
    today.setDate(today.getDate() - 1);
  }
  
  return today;
}

/**
 * Get exercise progress for the current exercise day
 */
export function getExerciseDayProgress(progressData: ExerciseProgress[]): ExerciseProgress[] {
  const exerciseDayStart = getCurrentExerciseDayStart();
  const tomorrow = new Date(exerciseDayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return progressData.filter(p => {
    const completedDate = new Date(p.completedAt);
    return completedDate >= exerciseDayStart && completedDate < tomorrow;
  });
}

/**
 * Determine if an exercise is completed for today
 */
export function isExerciseCompletedToday(exercise: Exercise, progressData?: ExerciseProgress[]): boolean {
  if (!progressData || progressData.length === 0) {
    return false;
  }
  
  // Get current exercise day's progress
  const exerciseDayProgress = getExerciseDayProgress(progressData);
  
  // Calculate total sets completed today
  const totalSetsCompleted = exerciseDayProgress.reduce(
    (sum, progress) => sum + progress.completedSets,
    0
  );
  
  return totalSetsCompleted >= exercise.sets;
}

// Helper function to determine exercise status based on progress
export function determineExerciseStatus(
  exercise: Exercise,
  progressData?: ExerciseProgress[]
): ExerciseStatus {
  if (!progressData || progressData.length === 0) {
    return ExerciseStatus.TODO;
  }
  
  // Get current exercise day's progress
  const exerciseDayProgress = getExerciseDayProgress(progressData);
  
  if (exerciseDayProgress.length === 0) {
    return ExerciseStatus.TODO;
  }
  
  // Calculate total sets completed today
  const totalSetsCompleted = exerciseDayProgress.reduce(
    (sum, progress) => sum + progress.completedSets,
    0
  );
  
  if (totalSetsCompleted >= exercise.sets) {
    return ExerciseStatus.COMPLETED;
  } else if (totalSetsCompleted > 0) {
    return ExerciseStatus.IN_PROGRESS;
  } else {
    return ExerciseStatus.TODO;
  }
}
