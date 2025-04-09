import { CategoryWithProgress } from '@/types';
import { ExerciseItem } from './exercise-item';

interface ExerciseCategoryProps {
  category: CategoryWithProgress;
  onStartExercise: (exerciseId: number) => void;
}

export function ExerciseCategory({ category, onStartExercise }: ExerciseCategoryProps) {
  const { name, exercises, completedCount } = category;
  const totalExercises = exercises.length;
  
  const getStatusBadge = () => {
    const percentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
    
    if (percentage === 100) {
      return (
        <span className="text-xs font-medium text-primary-700 bg-primary-100 py-1 px-2 rounded-full">
          {completedCount}/{totalExercises} complete
        </span>
      );
    } else if (percentage > 0) {
      return (
        <span className="text-xs font-medium text-warning bg-yellow-100 py-1 px-2 rounded-full">
          {completedCount}/{totalExercises} complete
        </span>
      );
    } else {
      return (
        <span className="text-xs font-medium text-secondary-600 bg-secondary-100 py-1 px-2 rounded-full">
          0/{totalExercises} complete
        </span>
      );
    }
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-primary-50 px-4 py-3 border-l-4 border-primary-500">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-primary-800">{name}</h3>
          {getStatusBadge()}
        </div>
      </div>
      
      <ul className="divide-y divide-secondary-100">
        {exercises.map((exercise) => (
          <ExerciseItem 
            key={exercise.id} 
            exercise={exercise} 
            onStart={() => onStartExercise(exercise.id)} 
          />
        ))}
      </ul>
    </div>
  );
}
