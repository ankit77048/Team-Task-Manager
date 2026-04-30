import { useState, useEffect } from 'react';
import { tasksAPI } from '../../api/tasks';
import { usersAPI } from '../../api/dashboard';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TaskForm({ task, projectId, projects, onSuccess, onCancel }) {
  const isEdit = !!task;
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    dueDate:     task?.dueDate ? task.dueDate.split('T')[0] : '',
    project:     task?.project?._id || task?.project || projectId || '',
    assignee:    task?.assignee?._id || task?.assignee || '',
    tags:        task?.tags?.join(', ') || '',
  });

  useEffect(() => {
    usersAPI.getAll().then(r => setMembers(r.data.users)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.project) return toast.error('Project is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate:  form.dueDate  || undefined,
        assignee: form.assignee || undefined,
        tags:     form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await tasksAPI.update(task._id, payload);
        toast.success('Task updated!');
      } else {
        await tasksAPI.create(payload);
        toast.success('Task created!');
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
        <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Task title" required maxLength={150} />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="Task details..." maxLength={1000} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
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
      {/* Project select (only show when creating from tasks page) */}
      {!projectId && (
        <div>
          <label className="form-label">Project *</label>
          <select name="project" value={form.project} onChange={handleChange} className="input-field" required>
            <option value="">Select project</option>
            {projects?.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="form-label">Assignee</label>
        <select name="assignee" value={form.assignee} onChange={handleChange} className="input-field">
          <option value="">Unassigned</option>
          {members.map(m => (
            <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Due Date</label>
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="form-label">Tags <span className="text-slate-500 text-xs">(comma-separated)</span></label>
        <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="e.g. backend, urgent, bug" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : (isEdit ? 'Update Task' : 'Create Task')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
