import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSettings {
  // User Preferences
  resetTimeHour: number; // Hour of day when workouts reset (0-23)
  theme: 'light' | 'dark' | 'system';
  enableReminders: boolean;
  reminderTime: string; // format: "HH:MM"
  
  // Exercise Display Settings
  filterCategory: string | null;
  sortBy: 'alphabetical' | 'category' | 'lastCompleted';
  hideCompleted: boolean;
  
  // Timer Settings
  defaultRestPeriod: number; // seconds
  soundAlerts: boolean;
  vibrationFeedback: boolean;
  defaultSideStrategy: 'alternate' | 'sequential';
  
  // History Settings
  historyDaysToShow: number;
  historyView: 'daily' | 'weekly' | 'monthly';
}

const defaultSettings: UserSettings = {
  // User Preferences
  resetTimeHour: 4, // 4 AM
  theme: 'system',
  enableReminders: false,
  reminderTime: "18:00", // 6 PM
  
  // Exercise Display Settings
  filterCategory: null,
  sortBy: 'category',
  hideCompleted: false,
  
  // Timer Settings
  defaultRestPeriod: 60, // 60 seconds
  soundAlerts: true,
  vibrationFeedback: true,
  defaultSideStrategy: 'alternate',
  
  // History Settings
  historyDaysToShow: 7,
  historyView: 'daily',
};

type SettingsContextType = {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'rehab-workout-settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Load settings from localStorage on initial render
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};