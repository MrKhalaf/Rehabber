import React from 'react';
import { useExercisesByCategory, determineExerciseStatus } from '@/hooks/use-exercises';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseStatus } from '@/lib/utils';

interface ExerciseCategoryProps {
  title: string;
  category: string;
  className?: string;
}

export function ExerciseCategory({ title, category, className }: ExerciseCategoryProps) {
  const { data: exercises, isLoading, isError } = useExercisesByCategory(category);

  if (isLoading) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="text-md font-medium text-gray-700 mb-3">{title}</h3>
        <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (isError || !exercises || exercises.length === 0) {
    return (
      <div className={`mb-6 ${className}`}>
        <h3 className="text-md font-medium text-gray-700 mb-3">{title}</h3>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
          No exercises found for this category
        </div>
      </div>
    );
  }

  // Get exercise status based on progress data from the database
  const getStatus = (exercise: any): ExerciseStatus => {
    return determineExerciseStatus(exercise);
  };

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-md font-medium text-gray-700 mb-3">{title}</h3>
      
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
