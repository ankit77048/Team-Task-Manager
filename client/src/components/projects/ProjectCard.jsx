import { Link } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, ClipboardDocumentListIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format, isPast } from 'date-fns';
import Badge from '../common/Badge';

export default function ProjectCard({ project, isAdmin, onEdit, onDelete }) {
  const isOverdue = project.deadline && isPast(new Date(project.deadline)) && project.status !== 'completed';

  return (
    <div className="card glass-hover flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          <Link to={`/projects/${project._id}`} className="text-white font-semibold hover:text-brand-400 transition-colors truncate text-lg leading-tight">
            {project.title}
          </Link>
        </div>
        <Badge variant={project.status} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="font-medium text-slate-300">{project.progress ?? 0}%</span>
        </div>
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${project.progress ?? 0}%`,
              background: project.progress === 100 ? '#10b981' : `linear-gradient(90deg, ${project.color || '#6366f1'}, #8b5cf6)`,
            }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
          {project.taskCount ?? 0} tasks
        </span>
        <span className="flex items-center gap-1.5">
          <UserGroupIcon className="w-3.5 h-3.5" />
          {project.members?.length ?? 0} members
        </span>
        {project.deadline && (
          <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : ''}`}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {isOverdue ? '⚠ ' : ''}{format(new Date(project.deadline), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Member avatars */}
      {project.members?.length > 0 && (
        <div className="flex items-center gap-1">
          {project.members.slice(0, 5).map((m, i) => (
            <div
              key={m._id}
              className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white border-2 border-surface-900"
              style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 5 - i }}
              title={m.name}
            >
              {m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
            </div>
          ))}
          {project.members.length > 5 && (
            <span className="text-xs text-slate-400 ml-2">+{project.members.length - 5}</span>
          )}
        </div>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button onClick={() => onEdit(project)} className="btn-secondary text-xs py-1.5 px-3 flex-1">
            <PencilIcon className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(project)} className="btn-danger text-xs py-1.5 px-3">
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
