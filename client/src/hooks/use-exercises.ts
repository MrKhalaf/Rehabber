import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Exercise, 
  Category, 
  InsertCategory, 
  InsertExercise, 
  ExerciseLog, 
  InsertExerciseLog
} from '@shared/schema';
import { CategoryWithProgress, ExerciseWithStatus } from '@/types';

// Demo user ID - in a real app would be from auth context
const DEMO_USER_ID = 1;

// Get all categories with progress info
export function useCategories() {
  const queryClient = useQueryClient();
  
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['/api/categories', { userId: DEMO_USER_ID }],
    staleTime: 60000
  });
  
  const exercisesQuery = useQuery<Exercise[]>({
    queryKey: ['/api/exercises', { userId: DEMO_USER_ID }],
    staleTime: 60000
  });
  
  const logsQuery = useQuery<ExerciseLog[]>({
    queryKey: ['/api/exercise-logs', { userId: DEMO_USER_ID }],
    staleTime: 60000
  });
  
  // Create categories with progress information
  const categoriesWithProgress: CategoryWithProgress[] = categoriesQuery.data?.map(category => {
    const categoryExercises = exercisesQuery.data?.filter(
      exercise => exercise.categoryId === category.id
    ) || [];
    
    const exercisesWithStatus: ExerciseWithStatus[] = categoryExercises.map(exercise => {
      // Find the latest log for this exercise
      const latestLog = logsQuery.data
        ?.filter(log => log.exerciseId === exercise.id)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      
      const isToday = latestLog && new Date(latestLog.completedAt).toDateString() === new Date().toDateString();
      
      return {
        ...exercise,
        isComplete: Boolean(isToday),
        completedAt: latestLog?.completedAt || null
      };
    });
    
    const completedCount = exercisesWithStatus.filter(ex => ex.isComplete).length;
    
    return {
      ...category,
      exercises: exercisesWithStatus,
      completedCount
    };
  }) || [];
  
  // Add Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<InsertCategory, 'userId'>) => {
      const response = await apiRequest('POST', '/api/categories', {
        ...newCategory,
        userId: DEMO_USER_ID
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    }
  });
  
  // Add Exercise Mutation
  const addExerciseMutation = useMutation({
    mutationFn: async (newExercise: Omit<InsertExercise, 'userId'>) => {
      const response = await apiRequest('POST', '/api/exercises', {
        ...newExercise,
        userId: DEMO_USER_ID
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
    }
  });
  
  // Log Exercise Completion Mutation
  const logExerciseCompletionMutation = useMutation({
    mutationFn: async (exerciseId: number) => {
      const response = await apiRequest('POST', '/api/exercise-logs', {
        exerciseId,
        userId: DEMO_USER_ID,
        setsCompleted: exercisesQuery.data?.find(e => e.id === exerciseId)?.sets || 0,
        notes: ""
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercise-logs'] });
    }
  });
  
  return {
    categories: categoriesWithProgress,
    exercises: exercisesQuery.data || [],
    isLoading: categoriesQuery.isLoading || exercisesQuery.isLoading || logsQuery.isLoading,
    error: categoriesQuery.error || exercisesQuery.error || logsQuery.error,
    addCategory: addCategoryMutation.mutate,
    addExercise: addExerciseMutation.mutate,
    logExerciseCompletion: logExerciseCompletionMutation.mutate
  };
}

// Get recommended videos
export function useRecommendedVideos() {
  return useQuery({
    queryKey: ['/api/recommended-videos', { userId: DEMO_USER_ID }]
  });
}
