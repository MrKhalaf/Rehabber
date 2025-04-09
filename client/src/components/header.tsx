import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { TabType } from '@/types';
import { Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (location === '/progress') return 'progress';
    if (location === '/notes') return 'notes';
    return 'exercises';
  });

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary-700">RehabRoutine</h1>
        <Button
          variant="ghost" 
          size="icon" 
          className="rounded-full text-secondary-500 hover:bg-secondary-100"
          onClick={onOpenSettings}
        >
          <Cog className="h-5 w-5" />
        </Button>
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
        <Link href="/notes">
          <a 
            className={`flex-1 py-3 text-center ${
              activeTab === 'notes' 
                ? 'text-primary-700 border-b-2 border-primary-600 font-medium' 
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </a>
        </Link>
      </nav>
    </header>
  );
}
