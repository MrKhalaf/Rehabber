import React, { createContext, useContext, useState, useEffect } from 'react';

// Define all the settings types
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

// Default settings
const defaultSettings: UserSettings = {
  // User Preferences
  resetTimeHour: 4, // 4 AM by default
  theme: 'system',
  enableReminders: false,
  reminderTime: "09:00",
  
  // Exercise Display Settings
  filterCategory: null, // no filter
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

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('rehabber-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rehabber-settings', JSON.stringify(settings));
  }, [settings]);

  // Function to update individual settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Function to reset all settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for accessing settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};