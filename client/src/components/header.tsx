import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { TabType } from '@/types';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (location === '/progress') return 'progress';
    if (location === '/history') return 'history';
    return 'exercises';
  });

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary-700">RehabRoutine</h1>
        <SettingsPanel />
      </div>
      <nav className="flex border-b border-secondary-200">
        <Link href="/">
          <a 
            className={`flex-1 py-3 text-center ${
              activeTab === 'exercises' 
                ? 'text-primary-700 border-b-2 border-primary-600 font-medium' 
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('exercises')}
          >
            Exercises
          </a>
        </Link>
        <Link href="/progress">
          <a 
            className={`flex-1 py-3 text-center ${
              activeTab === 'progress' 
                ? 'text-primary-700 border-b-2 border-primary-600 font-medium' 
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </a>
        </Link>
        <Link href="/history">
          <a 
            className={`flex-1 py-3 text-center ${
              activeTab === 'history' 
                ? 'text-primary-700 border-b-2 border-primary-600 font-medium' 
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </a>
        </Link>
      </nav>
    </header>
  );
}
