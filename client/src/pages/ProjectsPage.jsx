import { useState, useEffect } from 'react';
import { projectsAPI } from '../api/projects';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.projects);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleEdit = (project) => { setEditProject(project); setShowModal(true); };
  const handleCreate = () => { setEditProject(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditProject(null); };
  const handleSuccess = () => { handleClose(); fetchProjects(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectsAPI.delete(deleteTarget._id);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button id="create-project-btn" onClick={handleCreate} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
            placeholder="Search projects..."
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <FolderOpenIcon className="w-12 h-12" />
          <p className="text-lg font-medium">No projects found</p>
          {isAdmin && <button onClick={handleCreate} className="btn-primary mt-2"><PlusIcon className="w-4 h-4" />Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleClose} title={editProject ? 'Edit Project' : 'New Project'}>
        <ProjectForm project={editProject} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>

      {/* Delete confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" size="sm">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete <strong className="text-white">"{deleteTarget?.title}"</strong>?
            This will also delete all associated tasks.
          </p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="btn-danger flex-1 justify-center" disabled={deleting}>
              {deleting ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
