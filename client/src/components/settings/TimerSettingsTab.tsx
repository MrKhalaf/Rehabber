import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimerSettingsTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Timer Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize how exercise timers work.
        </p>
      </div>
      
      {/* Default Rest Period */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Default Rest Period</Label>
          <p className="text-sm text-muted-foreground mb-6">
            Time between sets: {settings.defaultRestPeriod} seconds
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">15s</span>
            <Slider 
              value={[settings.defaultRestPeriod]} 
              min={5}
              max={120}
              step={5}
              onValueChange={([value]) => updateSettings({ defaultRestPeriod: value })}
              className="flex-1"
            />
            <span className="text-sm">120s</span>
          </div>
        </div>
      </div>
      
      {/* Sound Alerts */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="sound-alerts" className="text-base">Sound Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Play sounds for timer events
          </p>
        </div>
        <Switch 
          id="sound-alerts"
          checked={settings.soundAlerts}
          onCheckedChange={(checked) => updateSettings({ soundAlerts: checked })}
        />
      </div>
      
      {/* Vibration Feedback */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="vibration" className="text-base">Vibration Feedback</Label>
          <p className="text-sm text-muted-foreground">
            Vibrate device on timer events
          </p>
        </div>
        <Switch 
          id="vibration"
          checked={settings.vibrationFeedback}
          onCheckedChange={(checked) => updateSettings({ vibrationFeedback: checked })}
        />
      </div>
      
      {/* Default Side Strategy */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="side-strategy" className="text-base">Default Side Strategy</Label>
          <p className="text-sm text-muted-foreground">
            How to handle exercises with left/right sides
          </p>
        </div>
        <Select 
          value={settings.defaultSideStrategy}
          onValueChange={(value) => updateSettings({ 
            defaultSideStrategy: value as 'alternate' | 'sequential'
          })}
        >
          <SelectTrigger id="side-strategy" className="w-[160px]">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alternate">
              Alternate Sides
            </SelectItem>
            <SelectItem value="sequential">
              Complete All Sets on One Side
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimerSettingsTab;