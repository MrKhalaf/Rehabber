import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Exercise, ExerciseProgress, InsertExercise, InsertExerciseProgress } from "@shared/schema";
import { ExerciseStatus } from "@/lib/utils";

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });
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
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${variables.exerciseId}`] });
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

// Helper function to determine exercise status based on progress
export function determineExerciseStatus(
  exercise: Exercise,
  progressData?: ExerciseProgress[]
): ExerciseStatus {
  if (!progressData || progressData.length === 0) {
    return ExerciseStatus.TODO;
  }
  
  // Get today's progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayProgress = progressData.filter(p => {
    const completedDate = new Date(p.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
  
  if (todayProgress.length === 0) {
    return ExerciseStatus.TODO;
  }
  
  // Calculate total sets completed today
  const totalSetsCompleted = todayProgress.reduce(
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
