import React, { useMemo } from 'react';
import { useExercisesWithProgress } from '@/hooks/use-exercises';
import { TabBar } from '@/components/TabBar';
import { calculateProgress } from '@/lib/utils';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isToday, startOfDay, addHours } from 'date-fns';

export default function Progress() {
  const { data: exercises, isLoading } = useExercisesWithProgress();
  
  // Calculate completion rate using actual exercise data
  const stats = useMemo(() => {
    if (!exercises || exercises.length === 0) {
      return {
        totalExercises: 0,
        completedToday: 0,
        completionRate: 0,
        streak: 0,
        weeklyProgress: [] as number[]
      };
    }
    
    // Count exercises completed today using the actual completed status
    const completedToday = exercises.filter(exercise => 
      exercise.completed
    ).length;
    
    // Calculate completion rate as a percentage
    const completionRate = calculateProgress(completedToday, exercises.length);
    
    // Create weekly progress data - since we don't have historical data yet,
    // we'll show 0% for previous days
    const today = new Date();
    const lastWeek = subDays(today, 6);
    const days = eachDayOfInterval({ start: lastWeek, end: today });
    
    // Only today has actual data, other days are shown as 0% completed
    const weeklyProgress = days.map(day => 
      isToday(day) ? completionRate : 0
    );
    
    // A streak requires historical data which we don't have yet,
    // so we'll just report 1 if any exercises are completed today, 0 otherwise
    const streak = completedToday > 0 ? 1 : 0;
    
    return {
      totalExercises: exercises.length,
      completedToday,
      completionRate,
      streak,
      weeklyProgress
    };
  }, [exercises]);
  
  // Format day labels for the chart
  const dayLabels = useMemo(() => {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      days.push(format(date, 'EEE'));
    }
    
    return days;
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-light text-dark">
        <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
          <div className="h-full overflow-y-auto px-4 pt-12 pb-4 animate-pulse">
            <header className="mb-6">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </header>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold">Progress Tracking</h1>
            <p className="text-gray-500">Your rehabilitation journey</p>
          </header>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-green-500 mr-1" />
                <h3 className="text-sm text-gray-500">Today</h3>
              </div>
              <p className="text-xl font-semibold">
                {stats.completedToday}/{stats.totalExercises}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <h3 className="text-sm text-gray-500">Completion</h3>
              </div>
              <p className="text-xl font-semibold">{stats.completionRate}%</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center mb-1">
                <Target className="h-4 w-4 text-purple-500 mr-1" />
                <h3 className="text-sm text-gray-500">Weekly Goal</h3>
              </div>
              <p className="text-xl font-semibold">60%</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center mb-1">
                <Award className="h-4 w-4 text-amber-500 mr-1" />
                <h3 className="text-sm text-gray-500">Streak</h3>
              </div>
              <p className="text-xl font-semibold">{stats.streak} days</p>
            </div>
          </div>
          
          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            
            <div className="h-48 flex items-end justify-between space-x-2">
              {stats.weeklyProgress.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-primary rounded-t-md transition-all duration-500 relative group"
                    style={{ height: `${value}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1">
                      {value}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{dayLabels[index]}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Improvement Areas */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Focus Areas</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-700">Core Stability - Need more consistency</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-gray-700">Lower Body - Good progress</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">Upper Body - Excellent adherence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}