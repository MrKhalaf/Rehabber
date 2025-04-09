import { useState } from 'react';
import { format } from 'date-fns';
import { useCategories } from '@/hooks/use-exercises';
import { ExerciseCategory } from '@/components/exercise-category';
import { ExerciseTimer } from '@/components/exercise-timer';
import { RecommendedVideos } from '@/components/recommended-videos';
import { Exercise } from '@shared/schema';

export default function ExercisesPage() {
  const { categories, exercises, isLoading, error, logExerciseCompletion } = useCategories();
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  
  // Get the current exercise object if an ID is selected
  const selectedExercise = selectedExerciseId 
    ? exercises.find(ex => ex.id === selectedExerciseId) 
    : null;
  
  const handleStartExercise = (exerciseId: number) => {
    setSelectedExerciseId(exerciseId);
  };
  
  const handleCompleteExercise = () => {
    if (selectedExerciseId) {
      logExerciseCompletion(selectedExerciseId);
      setSelectedExerciseId(null);
    }
  };
  
  const handleCloseExercise = () => {
    setSelectedExerciseId(null);
  };

  if (isLoading) {
    return (
      <section className="mb-8 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-l-4 border-primary-500">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="p-4">
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-500 mb-2">Error Loading Exercises</h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Today's Routine</h2>
        <span className="text-sm text-secondary-500">{format(new Date(), 'MMMM d, yyyy')}</span>
      </div>
      
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-secondary-800 mb-2">No Exercises Yet</h3>
          <p className="text-secondary-600 mb-4">
            Upload your physical therapist notes to get started with your rehabilitation program.
          </p>
        </div>
      ) : (
        <>
          {categories.map((category) => (
            <ExerciseCategory 
              key={category.id} 
              category={category} 
              onStartExercise={handleStartExercise} 
            />
          ))}
        </>
      )}
      
      <RecommendedVideos />
      
      {selectedExercise && (
        <ExerciseTimer 
          exercise={selectedExercise}
          onComplete={handleCompleteExercise}
          onClose={handleCloseExercise}
        />
      )}
    </section>
  );
}
