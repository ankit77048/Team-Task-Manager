import { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/projects';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#22d3ee','#10b981','#f59e0b','#ef4444','#3b82f6'];

export default function ProjectForm({ project, onSuccess, onCancel }) {
  const isEdit = !!project;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title:       project?.title       || '',
    description: project?.description || '',
    status:      project?.status      || 'active',
    priority:    project?.priority    || 'medium',
    deadline:    project?.deadline ? project.deadline.split('T')[0] : '',
    color:       project?.color       || '#6366f1',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = { ...form, deadline: form.deadline || undefined };
      if (isEdit) {
        await projectsAPI.update(project._id, payload);
        toast.success('Project updated!');
      } else {
        await projectsAPI.create(payload);
        toast.success('Project created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Project name" required maxLength={100} />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="What is this project about?" maxLength={500} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Deadline</label>
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="form-label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setForm(f => ({ ...f, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : (isEdit ? 'Update Project' : 'Create Project')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
