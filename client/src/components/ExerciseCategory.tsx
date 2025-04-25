import React from 'react';
import { useExercisesByCategory, useExerciseProgress, determineExerciseStatus } from '@/hooks/use-exercises';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseStatus } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface ExerciseCategoryProps {
  title: string;
  category: string;
  className?: string;
}

export function ExerciseCategory({ title, category, className }: ExerciseCategoryProps) {
  const { data: exercises, isLoading: exercisesLoading, isError } = useExercisesByCategory(category);

  // Prefetch progress data for all exercises in this category
  const exerciseIds = React.useMemo(() => {
    return exercises?.map(ex => ex.id) || [];
  }, [exercises]);

  // Create a batch query for all exercise progress in this category
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: [`/api/exercises/category/${category}/progress`],
    enabled: exerciseIds.length > 0 && !exercisesLoading,
    queryFn: async () => {
      const progressByExerciseId: Record<number, any[]> = {};
      
      // Only fetch if we have exercises
      if (exerciseIds.length > 0) {
        const promises = exerciseIds.map(async (id) => {
          try {
            const response = await fetch(`/api/progress/${id}`);
            const data = await response.json();
            progressByExerciseId[id] = data;
          } catch (error) {
            console.error(`Error fetching progress for exercise ${id}:`, error);
            progressByExerciseId[id] = [];
          }
        });
        
        await Promise.all(promises);
      }
      
      return progressByExerciseId;
    }
  });

  const isLoading = exercisesLoading || progressLoading;

  if (isLoading) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="text-md font-medium text-gray-700 mb-3">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (isError || !exercises || exercises.length === 0) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center text-gray-500 dark:text-gray-400">
          No exercises found for this category
        </div>
      </div>
    );
  }

  // Get exercise status based on progress data
  const getStatus = (exercise: any): ExerciseStatus => {
    const exerciseProgress = progressData ? progressData[exercise.id] || [] : [];
    return determineExerciseStatus(exercise, exerciseProgress);
  };

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      
      {exercises.map((exercise) => (
        <ExerciseCard 
          key={exercise.id} 
          exercise={exercise} 
          status={getStatus(exercise)}
        />
      ))}
    </div>
  );
}
