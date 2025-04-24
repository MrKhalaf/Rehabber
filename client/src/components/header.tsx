import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsPanel } from './settings/SettingsPanel';

interface HeaderProps {
  onOpenSettings?: () => void;
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

export function Header({ 
  onOpenSettings, 
  title, 
  showBackButton = false, 
  className = '' 
}: HeaderProps) {
  const [location, setLocation] = useLocation();

  const handleBack = () => {
    if (location === '/') {
      return; // Already at home
    }
    
    // Handle special cases
    if (location.includes('/exercise/')) {
      setLocation('/exercises');
      return;
    }
    
    setLocation('/');
  };

  return (
    <header className={cn("flex items-center justify-between p-4 bg-card dark:bg-slate-800 sticky top-0 z-10 border-b shadow-sm", className)}>
      <div className="flex items-center">
        {showBackButton && (
          <button 
            onClick={handleBack}
            className="mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground dark:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </button>
        )}
        <h1 className="text-xl font-semibold text-foreground dark:text-white">
          {title || "Rehab Workouts"}
        </h1>
      </div>
      
      <div className="flex items-center">
        <SettingsPanel />
      </div>
    </header>
  );
}