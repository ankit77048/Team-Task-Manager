import { useState } from 'react';
import { format, isPast } from 'date-fns';
import { CalendarIcon, TrashIcon, PencilIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Badge from '../common/Badge';

export default function TaskCard({ task, isAdmin, onEdit, onDelete, onStatusChange, provided, snapshot }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  const nextStatus = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
  const nextLabel  = { todo: '▶ Start',    inprogress: '✓ Complete', done: '↺ Reopen' };

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className={`glass rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 ${
        snapshot?.isDragging ? 'shadow-2xl border-brand-500/50 scale-105' : 'hover:border-white/15'
      } ${isOverdue ? 'border-red-500/30' : ''}`}
    >
      {/* Top row: priority + tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={task.priority} size="xs" />
        {isOverdue && <Badge variant="overdue" size="xs">Overdue</Badge>}
        {task.tags?.slice(0,2).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">{tag}</span>
        ))}
      </div>

      {/* Title */}
      <p className={`font-medium leading-snug ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-white/5">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {task.assignee.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <span className="text-xs text-slate-400 truncate">{task.assignee.name}</span>
            </>
          ) : (
            <span className="text-xs text-slate-500 flex items-center gap-1"><UserCircleIcon className="w-4 h-4"/>Unassigned</span>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onStatusChange(task._id, nextStatus[task.status])}
          className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-brand-600/15 text-brand-300 hover:bg-brand-600/30 transition-colors font-medium"
        >
          {nextLabel[task.status]}
        </button>
        {isAdmin && (
          <>
            <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
