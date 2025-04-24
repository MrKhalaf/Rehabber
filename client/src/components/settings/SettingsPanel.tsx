import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';

// Create the settings tab components
const UserPreferencesTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Reset Time</h3>
        <p className="text-sm text-muted-foreground">
          Exercises reset as completed at this hour each day
        </p>
        <select 
          value={settings.resetTimeHour}
          onChange={(e) => updateSettings({ resetTimeHour: parseInt(e.target.value) })}
          className="w-full p-2 border rounded-md"
        >
          {Array.from({length: 24}, (_, i) => (
            <option key={i} value={i}>
              {i === 0 ? '12 AM (Midnight)' : 
               i < 12 ? `${i} AM` : 
               i === 12 ? '12 PM (Noon)' : 
               `${i-12} PM`}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="flex space-x-2">
          <Button 
            variant={settings.theme === 'light' ? 'default' : 'outline'}
            onClick={() => updateSettings({ theme: 'light' })}
            className="flex-1"
          >
            Light
          </Button>
          <Button 
            variant={settings.theme === 'dark' ? 'default' : 'outline'}
            onClick={() => updateSettings({ theme: 'dark' })}
            className="flex-1"
          >
            Dark
          </Button>
          <Button 
            variant={settings.theme === 'system' ? 'default' : 'outline'}
            onClick={() => updateSettings({ theme: 'system' })}
            className="flex-1"
          >
            System
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExerciseDisplayTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Sort Exercises By</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={settings.sortBy === 'alphabetical' ? 'default' : 'outline'}
            onClick={() => updateSettings({ sortBy: 'alphabetical' })}
            className="w-full"
          >
            Name
          </Button>
          <Button 
            variant={settings.sortBy === 'category' ? 'default' : 'outline'}
            onClick={() => updateSettings({ sortBy: 'category' })}
            className="w-full"
          >
            Category
          </Button>
          <Button 
            variant={settings.sortBy === 'lastCompleted' ? 'default' : 'outline'}
            onClick={() => updateSettings({ sortBy: 'lastCompleted' })}
            className="w-full"
          >
            Completed
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Hide Completed</h3>
          <p className="text-sm text-muted-foreground">Only show exercises you haven't completed today</p>
        </div>
        <div className="form-control">
          <input 
            type="checkbox" 
            checked={settings.hideCompleted}
            onChange={(e) => updateSettings({ hideCompleted: e.target.checked })}
            className="w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
};

const TimerSettingsTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Default Rest Period</h3>
        <p className="text-sm text-muted-foreground">
          Seconds to rest between sets
        </p>
        <div className="flex items-center space-x-2">
          <input 
            type="range" 
            min="0" 
            max="120" 
            value={settings.defaultRestPeriod}
            onChange={(e) => updateSettings({ defaultRestPeriod: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="w-12 text-right">{settings.defaultRestPeriod}s</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Side Strategy</h3>
        <p className="text-sm text-muted-foreground">
          How to handle exercises with left/right sides
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant={settings.defaultSideStrategy === 'alternate' ? 'default' : 'outline'}
            onClick={() => updateSettings({ defaultSideStrategy: 'alternate' })}
          >
            Alternate Sides
          </Button>
          <Button 
            variant={settings.defaultSideStrategy === 'sequential' ? 'default' : 'outline'}
            onClick={() => updateSettings({ defaultSideStrategy: 'sequential' })}
          >
            Sequential
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Alternate:</strong> L→R→L→R (all sets)
          <br />
          <strong>Sequential:</strong> L→L→L→R→R→R
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sound Alerts</h3>
          <p className="text-sm text-muted-foreground">Play sounds during timer</p>
        </div>
        <div className="form-control">
          <input 
            type="checkbox" 
            checked={settings.soundAlerts}
            onChange={(e) => updateSettings({ soundAlerts: e.target.checked })}
            className="w-5 h-5"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Vibration</h3>
          <p className="text-sm text-muted-foreground">Vibrate phone during timer</p>
        </div>
        <div className="form-control">
          <input 
            type="checkbox" 
            checked={settings.vibrationFeedback}
            onChange={(e) => updateSettings({ vibrationFeedback: e.target.checked })}
            className="w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
};

const HistorySettingsTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Days to Show</h3>
        <p className="text-sm text-muted-foreground">
          Number of days to show in history
        </p>
        <div className="flex items-center space-x-2">
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={settings.historyDaysToShow}
            onChange={(e) => updateSettings({ historyDaysToShow: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="w-12 text-right">{settings.historyDaysToShow}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">History View</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={settings.historyView === 'daily' ? 'default' : 'outline'}
            onClick={() => updateSettings({ historyView: 'daily' })}
            className="w-full"
          >
            Daily
          </Button>
          <Button 
            variant={settings.historyView === 'weekly' ? 'default' : 'outline'}
            onClick={() => updateSettings({ historyView: 'weekly' })}
            className="w-full"
          >
            Weekly
          </Button>
          <Button 
            variant={settings.historyView === 'monthly' ? 'default' : 'outline'}
            onClick={() => updateSettings({ historyView: 'monthly' })}
            className="w-full"
          >
            Monthly
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className = '' }: SettingsPanelProps) {
  const { settings, resetSettings } = useSettings();
  
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
          
          <div className="mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="w-full"
            >
              Reset All Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}