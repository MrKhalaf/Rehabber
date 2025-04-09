import { Link, useLocation } from 'wouter';
import { Plus, Dumbbell, BarChart2, ClipboardList, User } from 'lucide-react';
import { NavigationTab } from '@/types';

interface BottomNavigationProps {
  onOpenUploadModal: () => void;
}

export function BottomNavigation({ onOpenUploadModal }: BottomNavigationProps) {
  const [location] = useLocation();
  
  const isActive = (path: string): boolean => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg fixed bottom-0 w-full px-4 py-2 flex justify-between items-center border-t border-secondary-200">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs mt-1">Exercises</span>
        </a>
      </Link>
      
      <Link href="/progress">
        <a className={`flex flex-col items-center p-2 ${isActive('/progress') ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>
          <BarChart2 className="h-5 w-5" />
          <span className="text-xs mt-1">Progress</span>
        </a>
      </Link>
      
      <div className="relative -mt-5">
        <button 
          className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg hover:bg-primary-600"
          onClick={onOpenUploadModal}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      
      <Link href="/routines">
        <a className={`flex flex-col items-center p-2 ${isActive('/routines') ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs mt-1">Routines</span>
        </a>
      </Link>
      
      <Link href="/profile">
        <a className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </Link>
    </nav>
  );
}
