import { useState, useEffect } from 'react';
import { tasksAPI } from '../api/tasks';
import { projectsAPI } from '../api/projects';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterProject)  params.project  = filterProject;
      if (filterPriority) params.priority = filterPriority;
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { projectsAPI.getAll().then(r => setProjects(r.data.projects)).catch(() => {}); }, []);
  useEffect(() => { fetchTasks(); }, [filterProject, filterPriority]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(taskId, status);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleSuccess = () => {
    setShowModal(false); setEditTask(null); fetchTasks();
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search tasks or projects..." />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="input-field sm:w-44">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field sm:w-36">
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <ClipboardDocumentListIcon className="w-12 h-12" />
          <p className="text-lg font-medium">No tasks found</p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary mt-2">
              <PlusIcon className="w-4 h-4" /> Create Task
            </button>
          )}
        </div>
      ) : (
        <KanbanBoard
          tasks={filtered}
          isAdmin={isAdmin}
          onEdit={(task) => { setEditTask(task); setShowModal(true); }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditTask(null); }} title={editTask ? 'Edit Task' : 'New Task'} size="lg">
        <TaskForm
          task={editTask}
          projects={projects}
          onSuccess={handleSuccess}
          onCancel={() => { setShowModal(false); setEditTask(null); }}
        />
      </Modal>
    </div>
  );
}
