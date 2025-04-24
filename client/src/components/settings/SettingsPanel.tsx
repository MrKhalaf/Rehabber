import React from 'react';
import { Settings } from 'lucide-react';
import { 
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';

import UserPreferencesTab from './UserPreferencesTab';
import ExerciseDisplayTab from './ExerciseDisplayTab';
import TimerSettingsTab from './TimerSettingsTab';
import HistorySettingsTab from './HistorySettingsTab';

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className = '' }: SettingsPanelProps) {
  const { settings } = useSettings();
  
  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="sr-only">Settings</span>
          </button>
        </SheetTrigger>
        
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Customize your workout experience
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <Tabs defaultValue="user-preferences">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="user-preferences">User</TabsTrigger>
                <TabsTrigger value="exercise-display">Display</TabsTrigger>
                <TabsTrigger value="timer-settings">Timer</TabsTrigger>
                <TabsTrigger value="history-settings">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="user-preferences">
                <UserPreferencesTab />
              </TabsContent>
              
              <TabsContent value="exercise-display">
                <ExerciseDisplayTab />
              </TabsContent>
              
              <TabsContent value="timer-settings">
                <TimerSettingsTab />
              </TabsContent>
              
              <TabsContent value="history-settings">
                <HistorySettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}