import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserPreferencesTab = () => {
  const { settings, updateSettings } = useSettings();
  
  // Generate hours for the reset time dropdown
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      value: hour.toString(),
      label: `${displayHour}:00 ${period}`
    };
  });
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">User Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Configure your personal preferences for the app.
        </p>
      </div>
      
      {/* Reset Time Setting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reset-time" className="text-base">Reset Time</Label>
            <p className="text-sm text-muted-foreground">
              When your daily workouts reset
            </p>
          </div>
          <Select 
            value={settings.resetTimeHour.toString()} 
            onValueChange={(value) => updateSettings({ resetTimeHour: parseInt(value) })}
          >
            <SelectTrigger id="reset-time" className="w-[140px]">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Theme Setting */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="theme" className="text-base">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Choose light or dark theme
            </p>
          </div>
          <Select 
            value={settings.theme} 
            onValueChange={(value) => updateSettings({ theme: value as 'light' | 'dark' | 'system' })}
          >
            <SelectTrigger id="theme" className="w-[140px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Reminder Setting */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-reminders" className="text-base">Workout Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get daily reminders for your workouts
              </p>
            </div>
            <Switch 
              id="enable-reminders"
              checked={settings.enableReminders}
              onCheckedChange={(checked) => updateSettings({ enableReminders: checked })}
            />
          </div>
          
          {settings.enableReminders && (
            <div className="flex items-center justify-between pl-8">
              <div>
                <Label htmlFor="reminder-time" className="text-base">Reminder Time</Label>
                <p className="text-sm text-muted-foreground">
                  When to send the reminder
                </p>
              </div>
              <input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesTab;