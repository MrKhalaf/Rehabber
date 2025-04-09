import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExercise } from '@/hooks/use-exercises';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function ExerciseDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/exercise/:id');
  const exerciseId = match ? parseInt(params.id) : null;
  const { data: exercise, isLoading, isError } = useExercise(exerciseId);

  const handleBack = () => {
    setLocation('/');
  };

  const handleStartExercise = () => {
    if (exercise) {
      setLocation(`/timer/${exercise.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-4">The exercise you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={handleBack}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-light text-dark">
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="bg-primary text-white p-4 pt-12 relative">
            <button 
              className="absolute top-12 left-4 p-1 rounded-full bg-white/20"
              onClick={handleBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center mt-2">
              <h1 className="text-xl font-bold">{exercise.name}</h1>
              <p className="text-white/80 mt-1">{exercise.category}</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6">
            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Instructions</h2>
              <ol className="list-decimal pl-4 space-y-3 text-gray-700">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Parameters */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Parameters</h2>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-gray-500 text-sm">Sets</p>
                    <p className="text-2xl font-semibold">{exercise.sets}</p>
                  </div>
                  {exercise.type === 'hold' ? (
                    <div>
                      <p className="text-gray-500 text-sm">Hold</p>
                      <p className="text-2xl font-semibold">{formatDuration(exercise.holdDuration)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 text-sm">Reps</p>
                      <p className="text-2xl font-semibold">{exercise.reps}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 text-sm">Rest</p>
                    <p className="text-2xl font-semibold">{formatDuration(exercise.restTime)}</p>
                  </div>
                  {exercise.isPaired && (
                    <div>
                      <p className="text-gray-500 text-sm">Sides</p>
                      <p className="text-2xl font-semibold">Both</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Reference (placeholder) */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Reference Video</h2>
              <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
                <Play className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">Video provided by your physical therapist</p>
            </div>

            {/* Start Workout Button */}
            <div className="mt-6">
              <Button 
                className="w-full py-4 h-auto text-base"
                onClick={handleStartExercise}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Exercise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
