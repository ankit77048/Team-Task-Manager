import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  ClipboardDocumentListIcon, CheckCircleIcon,
  ClockIcon, ExclamationTriangleIcon, FolderIcon
} from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } },
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>;
  if (!data) return null;

  const { stats, recentTasks, overdueTaskList, projectProgress, teamStats } = data;

  const doughnutData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [stats.todoTasks, stats.inProgressTasks, stats.doneTasks],
      backgroundColor: ['rgba(100,116,139,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)'],
      borderColor: ['#64748b', '#f59e0b', '#10b981'],
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: projectProgress.map(p => p.title.length > 14 ? p.title.slice(0,14)+'…' : p.title),
    datasets: [
      {
        label: 'Completed',
        data: projectProgress.map(p => p.done),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Total',
        data: projectProgress.map(p => p.total),
        backgroundColor: 'rgba(99,102,241,0.15)',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    ...chartDefaults,
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin ? 'Team overview across all projects' : 'Your personal task overview'}
        </p>
      </div>

      {/* Overdue alert */}
      {stats.overdueTasks > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span><strong>{stats.overdueTasks}</strong> overdue {stats.overdueTasks === 1 ? 'task' : 'tasks'} — take action now!</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks"   value={stats.totalTasks}    icon={ClipboardDocumentListIcon} color="brand"  />
        <StatCard title="Completed"     value={stats.doneTasks}     icon={CheckCircleIcon}          color="green"  />
        <StatCard title="In Progress"   value={stats.inProgressTasks} icon={ClockIcon}              color="yellow" />
        <StatCard title="Overdue"       value={stats.overdueTasks}  icon={ExclamationTriangleIcon}  color="red"    />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Doughnut */}
        <div className="card">
          <h2 className="section-title text-base mb-4">Task Status</h2>
          <div className="h-48">
            {stats.totalTasks > 0
              ? <Doughnut data={doughnutData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }} />
              : <div className="flex items-center justify-center h-full text-slate-500 text-sm">No tasks yet</div>
            }
          </div>
        </div>

        {/* Bar chart */}
        <div className="card lg:col-span-2">
          <h2 className="section-title text-base mb-4">Project Progress</h2>
          <div className="h-48">
            {projectProgress.length > 0
              ? <Bar data={barData} options={barOptions} />
              : <div className="flex items-center justify-center h-full text-slate-500 text-sm">No projects yet</div>
            }
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-base">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentTasks.length === 0 && <p className="text-slate-500 text-sm">No tasks yet</p>}
            {recentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor: task.project?.color || '#6366f1'}} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</p>
                  <p className="text-xs text-slate-500 truncate">{task.project?.title}</p>
                </div>
                <Badge variant={task.status} size="xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Overdue or Team stats */}
        {isAdmin && teamStats.length > 0 ? (
          <div className="card">
            <h2 className="section-title text-base mb-4">Team Performance</h2>
            <div className="space-y-3">
              {teamStats.slice(0,5).map(member => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {member.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-200 font-medium truncate">{member.name}</span>
                      <span className="text-slate-400 text-xs flex-shrink-0 ml-2">{member.completed}/{member.assigned}</span>
                    </div>
                    <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${member.completionRate}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{member.completionRate}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-base">Overdue Tasks</h2>
            </div>
            <div className="space-y-2">
              {overdueTaskList.length === 0 && <p className="text-slate-500 text-sm">🎉 No overdue tasks!</p>}
              {overdueTaskList.map(task => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-200 font-medium truncate">{task.title}</p>
                    <p className="text-xs text-red-400/70">{task.project?.title} · Due {format(new Date(task.dueDate), 'MMM d')}</p>
                  </div>
                  <Badge variant={task.priority} size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
