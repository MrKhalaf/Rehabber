import React, { useMemo } from 'react';
import { useExercises, isExerciseCompletedToday } from '@/hooks/use-exercises';
import { TabBar } from '@/components/TabBar';
import { format, subDays } from 'date-fns';
import { CheckCircle, Circle } from 'lucide-react';

type ExerciseHistoryDay = {
  date: Date;
  formattedDate: string;
  dayLabel: string;
  exercises: {
    id: number;
    name: string;
    completed: boolean;
  }[];
};

export default function History() {
  const { data: exercises, isLoading } = useExercises();
  
  // Create history data for the last 7 days
  const historyDays = useMemo(() => {
    const days: ExerciseHistoryDay[] = [];
    const today = new Date();
    
    if (!exercises || exercises.length === 0) return days;
    
    // Create history for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i);
      const dayNumber = date.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Use actual exercise progress data to determine completion for today only
      // For historical days (before today), we'll show all exercises as incomplete
      // since we don't have historical data yet
      days.push({
        date,
        formattedDate: format(date, 'MMM d'),
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dayNames[dayNumber],
        exercises: exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          // Only today can have completed exercises based on actual data
          completed: i === 0 && isExerciseCompletedToday(ex),
        }))
      });
    }
    
    return days;
  }, [exercises]);
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-light text-dark">
        <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
          <div className="h-full overflow-y-auto px-4 pt-12 pb-4">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">Exercise History</h1>
              <p className="text-gray-500">Your completed workouts</p>
            </header>
            
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 mb-4">
                  <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-5 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-light text-dark">
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
        <div className="h-full overflow-y-auto px-4 pt-12 pb-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Exercise History</h1>
            <p className="text-gray-500">Your completed workouts</p>
          </header>
          
          {historyDays.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No History Yet</h3>
              <p className="text-gray-500">
                Complete your exercises to start building your workout history.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {historyDays.map((day, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="text-primary">{day.dayLabel}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      {day.formattedDate}
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {day.exercises.map(ex => (
                      <div key={ex.id} className="flex items-center">
                        {ex.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 mr-2" />
                        )}
                        <span className={ex.completed ? 'text-gray-800' : 'text-gray-400'}>
                          {ex.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
}