import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, FileText, BarChart2, User } from 'lucide-react';

interface TabBarProps {
  className?: string;
}

export function TabBar({ className }: TabBarProps) {
  const [location] = useLocation();

  const tabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/history', label: 'History', icon: FileText },
    { path: '/progress', label: 'Progress', icon: BarChart2 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className={`bg-white dark:bg-slate-800 fixed bottom-0 left-0 right-0 shadow-lg border-t border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="safe-area">
        <div className="grid grid-cols-4 h-[70px]">
          {tabs.map(tab => (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex flex-col items-center justify-center pt-2 pb-1 relative ${
                location === tab.path 
                  ? 'text-primary dark:text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="w-6 h-6 mb-1">
                <tab.icon className="h-6 w-6" />
              </div>
              <span className="text-xs">{tab.label}</span>
              {location === tab.path && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t-full tab-indicator"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
