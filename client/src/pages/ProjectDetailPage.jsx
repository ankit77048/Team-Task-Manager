import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { tasksAPI } from '../api/tasks';
import { usersAPI } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PlusIcon, ArrowLeftIcon, UserPlusIcon, XMarkIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal]   = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getById(id),
        tasksAPI.getByProject(id),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);
  useEffect(() => { if (isAdmin) usersAPI.getAll().then(r => setUsers(r.data.users)).catch(() => {}); }, [isAdmin]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(taskId, status);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    } catch { toast.error('Failed to update task status'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleTaskSuccess = () => {
    setShowTaskModal(false); setEditTask(null);
    tasksAPI.getByProject(id).then(r => setTasks(r.data.tasks)).catch(() => {});
  };

  const handleAddMember = async () => {
    if (!addMemberUserId) return;
    setAddingMember(true);
    try {
      const res = await projectsAPI.addMember(id, addMemberUserId);
      setProject(prev => ({ ...prev, members: res.data.project.members }));
      setAddMemberUserId('');
      toast.success('Member added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const res = await projectsAPI.removeMember(id, userId);
      setProject(prev => ({ ...prev, members: res.data.project.members }));
      toast.success('Member removed');
    } catch { toast.error('Failed to remove member'); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>;
  if (!project) return null;

  const availableUsers = users.filter(u => !project.members?.some(m => m._id === u._id) && u._id !== project.owner?._id);

  return (
    <div className="space-y-6 page-enter">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link to="/projects" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors mt-1">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <h1 className="text-2xl font-bold text-white truncate">{project.title}</h1>
            <Badge variant={project.status} />
            <Badge variant={project.priority} />
          </div>
          {project.description && <p className="text-slate-400 text-sm mt-2 ml-7">{project.description}</p>}
        </div>
        {isAdmin && (
          <button onClick={() => setShowTaskModal(true)} className="btn-primary flex-shrink-0">
            <PlusIcon className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Meta bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Tasks</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-emerald-400">{tasks.filter(t=>t.status==='done').length}</p>
          <p className="text-xs text-slate-400 mt-1">Completed</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-amber-400">{tasks.filter(t=>t.status==='inprogress').length}</p>
          <p className="text-xs text-slate-400 mt-1">In Progress</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-brand-400">{project.members?.length ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Members</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300 font-medium">Overall Progress</span>
          <span className="text-white font-bold">{project.progress ?? 0}%</span>
        </div>
        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${project.progress ?? 0}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        </div>
        {project.deadline && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Deadline: {format(new Date(project.deadline), 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Team Members</h2>
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-xs py-1.5">
              <UserPlusIcon className="w-3.5 h-3.5" /> Add Member
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Owner */}
          {project.owner && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                {project.owner.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{project.owner.name}</p>
                <p className="text-xs text-brand-400">Owner</p>
              </div>
            </div>
          )}
          {project.members?.map(m => (
            <div key={m._id} className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
              <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
                {m.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div>
                <p className="text-sm text-slate-200 font-medium">{m.name}</p>
                <p className="text-xs text-slate-500 capitalize">{m.role}</p>
              </div>
              {isAdmin && (
                <button onClick={() => handleRemoveMember(m._id)} className="ml-1 text-slate-500 hover:text-red-400 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Task Board</h2>
        <KanbanBoard
          tasks={tasks}
          isAdmin={isAdmin}
          onEdit={(task) => { setEditTask(task); setShowTaskModal(true); }}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onCreateInColumn={(status) => { setDefaultStatus(status); setEditTask(null); setShowTaskModal(true); }}
        />
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setEditTask(null); }} title={editTask ? 'Edit Task' : 'New Task'} size="lg">
        <TaskForm
          task={editTask ? { ...editTask, status: editTask.status || defaultStatus } : { status: defaultStatus }}
          projectId={id}
          onSuccess={handleTaskSuccess}
          onCancel={() => { setShowTaskModal(false); setEditTask(null); }}
        />
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member" size="sm">
        <div className="space-y-4">
          <select value={addMemberUserId} onChange={e => setAddMemberUserId(e.target.value)} className="input-field">
            <option value="">Select a user</option>
            {availableUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
          <div className="flex gap-3">
            <button onClick={handleAddMember} className="btn-primary flex-1 justify-center" disabled={addingMember || !addMemberUserId}>
              {addingMember ? <LoadingSpinner size="sm" /> : 'Add Member'}
            </button>
            <button onClick={() => setShowMemberModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
