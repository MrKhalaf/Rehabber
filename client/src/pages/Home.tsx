import React from 'react';
import { useLocation } from 'wouter';
import { ProgressSummary } from '@/components/ProgressSummary';
import { ExerciseCategory } from '@/components/ExerciseCategory';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  
  const handleAddNew = () => {
    setLocation('/add-exercise');
  };

  return (
    <div className="h-screen flex flex-col bg-light text-dark">
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '70px' }}>
        <div className="h-full overflow-y-auto px-4 pt-12 pb-4">
          {/* Header */}
          <header className="mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Today's Recovery</h1>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </header>

          {/* Progress Summary */}
          <ProgressSummary />

          {/* Exercise Categories */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Exercises</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary font-medium flex items-center"
                onClick={handleAddNew}
              >
                <Plus className="h-5 w-5 mr-1" />
                Add New
              </Button>
            </div>

            <ExerciseCategory title="Core Stability" category="Core Stability" />
            <ExerciseCategory title="Lower Body" category="Lower Body" />
            <ExerciseCategory title="Upper Body" category="Upper Body" />
          </section>
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
