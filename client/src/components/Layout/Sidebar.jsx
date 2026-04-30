import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, FolderIcon, ClipboardDocumentListIcon,
  UsersIcon, UserCircleIcon, ArrowRightOnRectangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard',  Icon: HomeIcon },
  { to: '/projects',  label: 'Projects',   Icon: FolderIcon },
  { to: '/tasks',     label: 'My Tasks',   Icon: ClipboardDocumentListIcon },
];

const adminLinks = [
  { to: '/team', label: 'Team', Icon: UsersIcon },
];

export default function Sidebar({ onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`;

  return (
    <aside className="flex flex-col h-full bg-surface-950 border-r border-white/5 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <BoltIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">TaskFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</p>
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="px-4 mt-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
            {adminLinks.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <NavLink to="/profile" className={linkClass} onClick={onClose}>
          <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>

        {/* User card */}
        <div className="mt-3 px-4 py-3 glass rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
