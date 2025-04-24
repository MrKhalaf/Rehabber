import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HistorySettingsTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">History Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize how workout history is displayed.
        </p>
      </div>
      
      {/* Days to Show */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Days in History</Label>
          <p className="text-sm text-muted-foreground mb-6">
            Show {settings.historyDaysToShow} days of workout history
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">3</span>
            <Slider 
              value={[settings.historyDaysToShow]} 
              min={3}
              max={30}
              step={1}
              onValueChange={([value]) => updateSettings({ historyDaysToShow: value })}
              className="flex-1"
            />
            <span className="text-sm">30</span>
          </div>
        </div>
      </div>
      
      {/* History View */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="history-view" className="text-base">History Display</Label>
          <p className="text-sm text-muted-foreground">
            How to group and display history data
          </p>
        </div>
        <Select 
          value={settings.historyView}
          onValueChange={(value) => updateSettings({ 
            historyView: value as 'daily' | 'weekly' | 'monthly'
          })}
        >
          <SelectTrigger id="history-view" className="w-[140px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Export History */}
      <div className="pt-4">
        <button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => {
            // In a real app, this would trigger a download of history data
            alert('Export functionality would download history data as CSV.');
          }}
        >
          Export History as CSV
        </button>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Export your workout history for analysis
        </p>
      </div>
    </div>
  );
};

export default HistorySettingsTab;