import React from 'react';
import { useLocation } from 'wouter';
import { ProgressSummary } from '@/components/ProgressSummary';
import { ExerciseCategory } from '@/components/ExerciseCategory';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Header } from '@/components/header';

export default function Home() {
  const [, setLocation] = useLocation();
  
  const handleAddNew = () => {
    setLocation('/add-exercise');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header title="Today's Recovery" />
      
      <main className="flex-1 overflow-auto p-4 pb-20">
        {/* Progress Summary */}
        <ProgressSummary />

        {/* Exercise Categories */}
        <section className="mt-6">
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
      </main>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
