import { useState } from 'react';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, isAdmin } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-950/80 backdrop-blur-sm flex-shrink-0">
      {/* Left: hamburger + greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div>
          <p className="text-sm text-slate-400">{greeting()}, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span> 👋</p>
        </div>
      </div>

      {/* Right: badge + avatar */}
      <div className="flex items-center gap-2">
        {isAdmin && (
          <span className="hidden sm:inline-flex badge bg-brand-600/20 text-brand-400 border border-brand-500/30">
            Admin
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
        </div>
      </div>
    </header>
  );
}
