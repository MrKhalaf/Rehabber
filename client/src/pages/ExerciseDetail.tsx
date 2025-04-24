import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExercise, useExerciseProgress, isExerciseCompletedToday } from '@/hooks/use-exercises';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Play, Edit, CheckCircle2 } from 'lucide-react';
import { ExerciseStatus, formatDuration, getStatusBadgeClasses, getStatusLabel } from '@/lib/utils';

export default function ExerciseDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/exercise/:id');
  const exerciseId = match ? parseInt(params.id) : null;
  const { data: exercise, isLoading, isError } = useExercise(exerciseId);
  const { data: progressData } = useExerciseProgress(exerciseId);
  
  // Check if exercise is completed for today
  const isCompletedToday = exercise && progressData ? isExerciseCompletedToday(exercise, progressData) : false;

  const handleBack = () => {
    setLocation('/');
  };

  const handleStartExercise = () => {
    if (exercise) {
      setLocation(`/timer/${exercise.id}`);
    }
  };
  
  const handleEditExercise = () => {
    if (exercise) {
      setLocation(`/edit-exercise/${exercise.id}`);
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
    <div className="h-screen flex flex-col bg-background dark:bg-slate-900 text-foreground dark:text-white">
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 pt-12 relative">
            <button 
              className="absolute top-12 left-4 p-1 rounded-full bg-white/20 hover:bg-white/30"
              onClick={handleBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center mt-2">
              <h1 className="text-xl font-bold">{exercise.name}</h1>
              <p className="text-primary-foreground/90 mt-1">{exercise.category}</p>
              
              {/* Completion status badge */}
              <div className="mt-3">
                <Badge 
                  variant="outline" 
                  className={`${getStatusBadgeClasses(isCompletedToday ? ExerciseStatus.COMPLETED : ExerciseStatus.TODO)} 
                             text-sm font-medium px-3 py-1 rounded-full`}
                >
                  {isCompletedToday ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completed Today
                    </>
                  ) : (
                    'Not Completed Today'
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6">
            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-foreground dark:text-white">Instructions</h2>
              <ol className="list-decimal pl-4 space-y-3 text-gray-700 dark:text-gray-300">
                {exercise.instructions?.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                )) || (
                  <li>No instructions available.</li>
                )}
              </ol>
            </div>

            {/* Parameters */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-foreground dark:text-white">Parameters</h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Sets</p>
                    <p className="text-2xl font-semibold text-foreground dark:text-white">{exercise.sets}</p>
                  </div>
                  {exercise.type === 'hold' ? (
                    <div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">Hold</p>
                      <p className="text-2xl font-semibold text-foreground dark:text-white">{formatDuration(exercise.holdDuration || 0)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">Reps</p>
                      <p className="text-2xl font-semibold text-foreground dark:text-white">{exercise.reps || 0}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Rest</p>
                    <p className="text-2xl font-semibold text-foreground dark:text-white">{formatDuration(exercise.restTime || 0)}</p>
                  </div>
                  {exercise.isPaired && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">Sides</p>
                      <p className="text-2xl font-semibold text-foreground dark:text-white">Both</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Reference (placeholder) */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-foreground dark:text-white">Reference Video</h2>
              <div className="bg-gray-200 dark:bg-slate-700 rounded-xl aspect-video flex items-center justify-center">
                <Play className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Video provided by your physical therapist</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button 
                className={`w-full py-4 h-auto text-base ${
                  isCompletedToday ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                onClick={handleStartExercise}
              >
                {isCompletedToday ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Repeat Exercise
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Exercise
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full py-3 h-auto text-base"
                onClick={handleEditExercise}
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Exercise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
