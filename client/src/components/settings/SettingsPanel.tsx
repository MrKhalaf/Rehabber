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

// Directly embed the tabs for now
const UserPreferencesTab = () => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-2">User Preferences</h3>
    <p>Reset time, theme, and notifications settings will appear here.</p>
  </div>
);

const ExerciseDisplayTab = () => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-2">Exercise Display</h3>
    <p>Filtering, sorting, and view settings will appear here.</p>
  </div>
);

const TimerSettingsTab = () => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-2">Timer Settings</h3>
    <p>Rest period, sounds, and side strategy settings will appear here.</p>
  </div>
);

const HistorySettingsTab = () => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-2">History Settings</h3>
    <p>Date range and display settings will appear here.</p>
  </div>
);

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