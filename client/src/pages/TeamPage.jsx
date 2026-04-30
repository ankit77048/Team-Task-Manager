import { useState, useEffect } from 'react';
import { usersAPI } from '../api/dashboard';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { EnvelopeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function TeamPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      // Fetch stats for each user
      const withStats = await Promise.all(
        res.data.users.map(async (u) => {
          try {
            const s = await usersAPI.getStats(u._id);
            return { ...u, stats: s.data.stats };
          } catch { return { ...u, stats: {} }; }
        })
      );
      setUsers(withStats);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await usersAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''} in your workspace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user._id} className="card glass-hover flex flex-col gap-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                {user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <EnvelopeIcon className="w-3 h-3" />{user.email}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Assigned', value: user.stats?.totalTasks ?? 0, color: 'text-white' },
                { label: 'Done', value: user.stats?.doneTasks ?? 0, color: 'text-emerald-400' },
                { label: 'Overdue', value: user.stats?.overdueTasks ?? 0, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-xl bg-white/3">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Completion bar */}
            {user.stats?.totalTasks > 0 && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Completion</span>
                  <span>{Math.round(((user.stats?.doneTasks??0)/(user.stats?.totalTasks||1))*100)}%</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{width:`${Math.round(((user.stats?.doneTasks??0)/(user.stats?.totalTasks||1))*100)}%`}} />
                </div>
              </div>
            )}

            {/* Role badge + change */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <Badge variant={user.role} />
              <select
                value={user.role}
                onChange={e => handleRoleChange(user._id, e.target.value)}
                className="text-xs bg-surface-800 border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
